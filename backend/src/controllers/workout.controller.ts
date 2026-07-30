import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import { db } from "../config/connectDb";
import Workouts from "../models/workouts.model";
import WorkoutGroups from "../models/workoutGroups.model";
import WorkoutSlots from "../models/workoutSlots.model";
import { logger } from "../utils/logger.utils";
import { deleteCacheByPattern } from "../utils/cache.utils";
import {
  checkMuscleWikiAPIHealth,
  getMuscleWikiExercises,
} from "../utils/connectExternalAPI";

type IdParamRequest = Request<{ id: string }>;

const groupColors = ["#d5a34d", "#2f7a54", "#3a5da8", "#7a4ea8", "#c1663d"];

const databaseNow = () => db.literal("CURRENT_TIMESTAMP");

const slugify = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "workout";
};

const generateUniqueSlug = async (name: string, existingId?: string) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    await Workouts.findOne({
      where: {
        slug,
        ...(existingId ? { id: { [Op.ne]: existingId } } : {}),
      },
    })
  ) {
    slug = `${baseSlug}-${suffix}`;
    suffix += 1;
  }

  return slug;
};

const clearWorkoutCaches = async () => {
  await deleteCacheByPattern("workouts:*");
};

const toClientWorkout = (
  workout: Workouts,
  groups: Array<Record<string, any>> = [],
) => {
  const data = workout.get({ plain: true }) as Record<string, any>;

  return {
    ...data,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    groups,
    createdAt: undefined,
    updatedAt: undefined,
  };
};

const getWorkoutGroups = async (workoutId: string) => {
  const groups = await WorkoutGroups.findAll({
    where: { workout_id: workoutId },
    order: [["group_order", "ASC"]],
  });

  return Promise.all(
    groups.map(async (group, index) => {
      const data = group.get({ plain: true }) as Record<string, any>;
      const slots = await WorkoutSlots.findAll({
        where: { workout_group_id: group.id },
        order: [["slot_order", "ASC"]],
      });

      return {
        ...data,
        color: data.color ?? groupColors[index % groupColors.length],
        slots: slots.map((slot) => slot.get({ plain: true })),
        createdAt: undefined,
        updatedAt: undefined,
      };
    }),
  );
};

const normalizeWorkoutData = async (
  body: Record<string, any>,
  currentWorkout?: Workouts,
) => {
  const status = body.status ?? currentWorkout?.status ?? "draft";
  const name = body.name ?? currentWorkout?.name ?? "New Workout";
  const data: Record<string, any> = {
    slug: await generateUniqueSlug(name, currentWorkout?.id),
    name,
    description: body.description ?? currentWorkout?.description ?? "",
    transition_seconds:
      body.transition_seconds ?? currentWorkout?.transition_seconds ?? 10,
    is_new_user_friendly:
      body.is_new_user_friendly ??
      currentWorkout?.is_new_user_friendly ??
      false,
    difficulty_band:
      body.difficulty_band ?? currentWorkout?.difficulty_band ?? "standard",
    status,
    review_notes: body.review_notes ?? currentWorkout?.review_notes ?? null,
  };

  if (!currentWorkout) {
    data.version_number = body.version_number ?? 1;
    data.previous_version_id = body.previous_version_id ?? null;
  }

  if (status === "active" && !currentWorkout?.published_at) {
    data.published_at = databaseNow();
  }

  return data;
};

const replaceWorkoutStructure = async (
  workoutId: string,
  groups: Array<Record<string, any>> = [],
  transaction: any,
) => {
  const existingGroups = await WorkoutGroups.findAll({
    where: { workout_id: workoutId },
    attributes: ["id"],
    transaction,
  });
  const existingGroupIds = existingGroups.map((group) => group.id);

  if (existingGroupIds.length) {
    await WorkoutSlots.destroy({
      where: { workout_group_id: existingGroupIds },
      transaction,
    });
  }

  await WorkoutGroups.destroy({ where: { workout_id: workoutId }, transaction });

  const createdGroups: Array<Record<string, any>> = [];

  for (const [groupIndex, group] of groups.entries()) {
    const createdGroup = await WorkoutGroups.create(
      {
        workout_id: workoutId,
        group_order: group.group_order ?? groupIndex + 1,
        name: group.name ?? `Group ${groupIndex + 1}`,
        repeat_count: group.repeat_count ?? 1,
        notes: group.notes ?? null,
      },
      { transaction },
    );
    const slots = Array.isArray(group.slots) ? group.slots : [];
    const slotRows = slots.map((slot: Record<string, any>, slotIndex: number) => ({
      workout_group_id: createdGroup.id,
      slot_order: slot.slot_order ?? slotIndex + 1,
      exercise_id: slot.exercise_id,
      required_benefit_id: slot.required_benefit_id ?? null,
      duration_seconds: slot.duration_seconds ?? 30,
      notes: slot.notes ?? null,
    }));

    if (slotRows.length) {
      await WorkoutSlots.bulkCreate(slotRows, { transaction });
    }

    createdGroups.push({
      ...createdGroup.get({ plain: true }),
      color: group.color ?? groupColors[groupIndex % groupColors.length],
      slots: slotRows,
    });
  }

  return createdGroups;
};

export const listWorkouts: any = async (_req: Request, res: Response) => {
  try {
    const workouts = await Workouts.findAll({ order: [["updatedAt", "DESC"]] });
    const data = await Promise.all(
      workouts.map(async (workout) =>
        toClientWorkout(workout, await getWorkoutGroups(workout.id)),
      ),
    );

    return res.status(200).json({ message: "Workouts retrieved successfully", data });
  } catch (error) {
    logger.error("Error listing workouts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkoutById: any = async (req: IdParamRequest, res: Response) => {
  try {
    const workout = await Workouts.findByPk(req.params.id);

    if (!workout) {
      return res.status(404).json({ message: "Workout not found" });
    }

    return res.status(200).json({
      message: "Workout retrieved successfully",
      data: toClientWorkout(workout, await getWorkoutGroups(workout.id)),
    });
  } catch (error) {
    logger.error("Error retrieving workout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createWorkout: any = async (req: Request, res: Response) => {
  const transaction = await db.transaction();

  try {
    const workoutData = await normalizeWorkoutData(req.body);
    const workout = await Workouts.create(workoutData, { transaction });
    const groups = await replaceWorkoutStructure(
      workout.id,
      req.body.groups ?? [],
      transaction,
    );

    await transaction.commit();
    await clearWorkoutCaches();

    return res.status(201).json({
      message: "Workout created successfully",
      data: toClientWorkout(workout, groups),
    });
  } catch (error) {
    await transaction.rollback();

    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: "Workout slug already exists" });
    }

    logger.error("Error creating workout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateWorkout: any = async (req: IdParamRequest, res: Response) => {
  const transaction = await db.transaction();

  try {
    const workout = await Workouts.findByPk(req.params.id, { transaction });

    if (!workout) {
      await transaction.rollback();
      return res.status(404).json({ message: "Workout not found" });
    }

    const isPublished = workout.status === "active" || Boolean(workout.published_at);
    const hasProtectedUpdate =
      Array.isArray(req.body.groups) || req.body.transition_seconds !== undefined;

    if (isPublished && hasProtectedUpdate) {
      await transaction.rollback();
      return res.status(409).json({
        message: "Published workout structure or playback settings cannot be edited in place",
      });
    }

    const workoutData = await normalizeWorkoutData(req.body, workout);
    await workout.update(workoutData, { transaction });

    if (Array.isArray(req.body.groups)) {
      await replaceWorkoutStructure(workout.id, req.body.groups, transaction);
    }

    await transaction.commit();
    await clearWorkoutCaches();

    const updated = await Workouts.findByPk(req.params.id);

    return res.status(200).json({
      message: "Workout updated successfully",
      data: toClientWorkout(updated!, await getWorkoutGroups(req.params.id)),
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error updating workout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteWorkout: any = async (req: IdParamRequest, res: Response) => {
  const transaction = await db.transaction();

  try {
    const workout = await Workouts.findByPk(req.params.id, { transaction });

    if (!workout) {
      await transaction.rollback();
      return res.status(404).json({ message: "Workout not found" });
    }

    if (workout.status === "active" || workout.published_at) {
      await workout.update({ status: "retired" }, { transaction });
      await transaction.commit();
      await clearWorkoutCaches();

      return res.status(200).json({ message: "Workout retired successfully" });
    }

    const groups = await WorkoutGroups.findAll({
      where: { workout_id: workout.id },
      attributes: ["id"],
      transaction,
    });
    const groupIds = groups.map((group) => group.id);

    if (groupIds.length) {
      await WorkoutSlots.destroy({
        where: { workout_group_id: groupIds },
        transaction,
      });
    }

    await WorkoutGroups.destroy({ where: { workout_id: workout.id }, transaction });
    await workout.destroy({ transaction });
    await transaction.commit();
    await clearWorkoutCaches();

    return res.status(200).json({ message: "Workout deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error deleting workout:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkout: any = async (_req: Request, res: Response) => {
  try {
    const workoutCheck = await checkMuscleWikiAPIHealth();
    const workoutData = await getMuscleWikiExercises();

    return res.status(200).json({
      message: "Workout retrieved successfully",
      workoutCheck,
      workoutData,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Failed to retrieve workout", error });
  }
};
