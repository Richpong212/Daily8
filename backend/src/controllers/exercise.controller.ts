import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import { db } from "../config/connectDb";
import Exercises from "../models/exercises.model";
import ExerciseMuscles from "../models/exerciseMuscles.model";
import ExerciseEquipment from "../models/exerciseEquipment.model";
import ExerciseConstraints from "../models/exerciseConstraints.model";
import ExerciseMedia from "../models/exerciseMedia.model";
import VariantLadderItems from "../models/variantLadderItems.model";
import ExerciseVariants from "../models/exerciseVariants.model";
import { logger } from "../utils/logger.utils";
import { deleteCacheByPattern } from "../utils/cache.utils";

type ExerciseRelations = {
  muscles?: unknown[];
  equipment?: unknown[];
  constraints?: unknown[];
  media?: unknown[];
  variantLadderItems?: unknown[];
  variants?: unknown[];
};

const toClientExercise = (
  exercise: Exercises,
  relations: ExerciseRelations = {},
) => {
  const data = exercise.get({ plain: true }) as Record<string, any>;

  return {
    ...data,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    muscles: relations.muscles ?? [],
    equipment: relations.equipment ?? [],
    constraints: relations.constraints ?? [],
    variant_ladder_ids: (relations.variantLadderItems ?? [])
      .map((item) => (item as Record<string, any>).variant_ladder_id)
      .filter(Boolean),
    variants: relations.variants ?? [],
    media: relations.media ?? [],
    createdAt: undefined,
    updatedAt: undefined,
  };
};

const getExerciseRelations = async (exerciseId: string): Promise<ExerciseRelations> => {
  const [muscles, equipment, constraints, media, variantLadderItems, variants] = await Promise.all([
    ExerciseMuscles.findAll({
      where: { exercise_id: exerciseId },
      attributes: ["muscle_id", "role"],
    }),
    ExerciseEquipment.findAll({
      where: { exercise_id: exerciseId },
      attributes: ["equipment_id", "requirement_type"],
    }),
    ExerciseConstraints.findAll({
      where: { exercise_id: exerciseId },
      attributes: ["constraint_id", "level", "editor_notes"],
    }),
    ExerciseMedia.findAll({
      where: { exercise_id: exerciseId },
      attributes: [
        "id",
        "media_type",
        "url",
        "version",
        "view_angle",
        "is_primary",
        "source",
        "rights_status",
        "external_media_id",
        "notes",
      ],
    }),
    VariantLadderItems.findAll({
      where: { exercise_id: exerciseId },
      attributes: ["variant_ladder_id"],
    }),
    ExerciseVariants.findAll({
      where: { from_exercise_id: exerciseId },
      attributes: [
        "id",
        "to_exercise_id",
        "variant_type",
        "sort_order",
        "notes",
      ],
      order: [
        ["variant_type", "ASC"],
        ["sort_order", "ASC"],
      ],
    }),
  ]);

  return {
    muscles: muscles.map((row) => row.get({ plain: true })),
    equipment: equipment.map((row) => row.get({ plain: true })),
    constraints: constraints.map((row) => row.get({ plain: true })),
    media: media.map((row) => row.get({ plain: true })),
    variantLadderItems: variantLadderItems.map((row) => row.get({ plain: true })),
    variants: variants.map((row) => row.get({ plain: true })),
  };
};

const buildVariantLadderRows = (
  exerciseId: string,
  variantLadderIds: string[] = [],
) => {
  return [...new Set(variantLadderIds)]
    .filter(Boolean)
    .map((variantLadderId, index) => ({
      exercise_id: exerciseId,
      variant_ladder_id: variantLadderId,
      position: index + 1,
      is_default_anchor: false,
      editor_notes: null,
    }));
};

const buildExerciseVariantRows = (
  exerciseId: string,
  variants: Array<Record<string, any>> = [],
) => {
  return variants
    .filter((variant) => variant.to_exercise_id)
    .map((variant, index) => ({
      from_exercise_id: exerciseId,
      to_exercise_id: variant.to_exercise_id,
      variant_type: variant.variant_type ?? "related",
      sort_order: variant.sort_order ?? index + 1,
      notes: variant.notes ?? null,
    }));
};

const clearExerciseCaches = async () => {
  await Promise.all([
    deleteCacheByPattern("exercises:*"),
    deleteCacheByPattern("supporting-data:*"),
  ]);
};

const databaseNow = () => db.literal("CURRENT_TIMESTAMP");

const normalizeExerciseData = (body: Record<string, any>) => {
  const status = body.status ?? "draft";
  const data: Record<string, any> = {
    slug:
      body.slug ??
      `${(body.name ?? "new-exercise").toString().trim().toLowerCase().replace(/\s+/g, "-")}-${Date.now()}`,
    name: body.name ?? "New Exercise",
    movement_family_id: body.movement_family_id ?? null,
    body_region_id: body.body_region_id ?? null,
    exercise_purpose_id: body.exercise_purpose_id ?? null,
    category: body.category ?? "strength",
    position: body.position ?? "standing",
    impact_level: body.impact_level ?? "low",
    complexity_level: body.complexity_level ?? "low",
    intensity_level: body.intensity_level ?? "low",
    balance_demand: body.balance_demand ?? "low",
    space_need: body.space_need ?? "small",
    summary: body.summary ?? "",
    instructions: body.instructions ?? [],
    coaching_cues: body.coaching_cues ?? [],
    safety_info: body.safety_info ?? null,
    review_status: body.review_status ?? "draft",
    review_notes: body.review_notes ?? null,
    status,
    color: body.color ?? "#2f7a54",
  };

  if (status === "active") {
    data.published_at = databaseNow();
  }

  if (status === "retired") {
    data.retired_at = databaseNow();
  }

  return data;
};

const prepareExerciseUpdateData = (
  body: Record<string, any>,
  currentExercise: Exercises,
) => {
  const exerciseData = { ...body };
  delete exerciseData.muscles;
  delete exerciseData.equipment;
  delete exerciseData.constraints;
  delete exerciseData.media;
  delete exerciseData.variant_ladder_ids;
  delete exerciseData.variants;
  delete exerciseData.created_at;
  delete exerciseData.updated_at;
  delete exerciseData.createdAt;
  delete exerciseData.updatedAt;
  delete exerciseData.published_at;
  delete exerciseData.retired_at;
  delete exerciseData.id;

  if (exerciseData.status === "active" && !currentExercise.published_at) {
    exerciseData.published_at = databaseNow();
  }

  if (exerciseData.status === "retired" && !currentExercise.retired_at) {
    exerciseData.retired_at = databaseNow();
  }

  return exerciseData;
};

const createRelationRows = async (
  exerciseId: string,
  body: Record<string, any>,
  transaction: any,
) => {
  const {
    muscles = [],
    equipment = [],
    constraints = [],
    media = [],
    variant_ladder_ids = [],
    variants = [],
  } = body;

  const muscleRows = muscles.map(
    (item: { muscle_id: string; role?: string }) => ({
      exercise_id: exerciseId,
      muscle_id: item.muscle_id,
      role: item.role ?? "secondary",
    }),
  );

  const equipmentRows = equipment.map(
    (item: { equipment_id: string; requirement_type?: string }) => ({
      exercise_id: exerciseId,
      equipment_id: item.equipment_id,
      requirement_type: item.requirement_type ?? "required",
    }),
  );

  const constraintRows = constraints.map(
    (item: { constraint_id: string; level?: string; editor_notes?: string }) => ({
      exercise_id: exerciseId,
      constraint_id: item.constraint_id,
      level: item.level ?? "low",
      editor_notes: item.editor_notes ?? null,
    }),
  );

  const mediaRows = media.map(
    (item: {
      media_type: string;
      url: string;
      version?: string;
      view_angle?: string;
      is_primary?: boolean;
      source?: string;
      rights_status?: string;
      external_media_id?: string | null;
      notes?: string | null;
    }) => ({
      exercise_id: exerciseId,
      media_type: item.media_type,
      url: item.url,
      version: item.version ?? "standard",
      view_angle: item.view_angle ?? "unknown",
      is_primary: item.is_primary ?? false,
      source: item.source ?? "admin",
      rights_status: item.rights_status ?? "unknown",
      external_media_id: item.external_media_id ?? null,
      notes: item.notes ?? null,
    }),
  );
  const variantLadderRows = buildVariantLadderRows(exerciseId, variant_ladder_ids);
  const exerciseVariantRows = buildExerciseVariantRows(exerciseId, variants);

  await Promise.all([
    muscleRows.length
      ? ExerciseMuscles.bulkCreate(muscleRows, { transaction })
      : Promise.resolve(),
    equipmentRows.length
      ? ExerciseEquipment.bulkCreate(equipmentRows, { transaction })
      : Promise.resolve(),
    constraintRows.length
      ? ExerciseConstraints.bulkCreate(constraintRows, { transaction })
      : Promise.resolve(),
    mediaRows.length
      ? ExerciseMedia.bulkCreate(mediaRows, { transaction })
      : Promise.resolve(),
    variantLadderRows.length
      ? VariantLadderItems.bulkCreate(variantLadderRows, { transaction })
      : Promise.resolve(),
    exerciseVariantRows.length
      ? ExerciseVariants.bulkCreate(exerciseVariantRows, { transaction })
      : Promise.resolve(),
  ]);

  return {
    muscles: muscleRows,
    equipment: equipmentRows,
    constraints: constraintRows,
    media: mediaRows,
    variantLadderItems: variantLadderRows,
    variants: exerciseVariantRows,
  };
};

export const listExercises: any = async (_req: Request, res: Response) => {
  try {
    const exercises = await Exercises.findAll({ order: [["updatedAt", "DESC"]] });
    const data = await Promise.all(
      exercises.map(async (exercise) =>
        toClientExercise(exercise, await getExerciseRelations(exercise.id)),
      ),
    );

    return res.status(200).json({ message: "Exercises retrieved successfully", data });
  } catch (error) {
    logger.error("Error listing exercises:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getExercise: any = async (req: Request, res: Response) => {
  try {
    const exercise = await Exercises.findByPk(req.params.id);

    if (!exercise) {
      return res.status(404).json({ message: "Exercise not found" });
    }

    return res.status(200).json({
      message: "Exercise retrieved successfully",
      data: toClientExercise(exercise, await getExerciseRelations(exercise.id)),
    });
  } catch (error) {
    logger.error("Error retrieving exercise:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createExercise: any = async (req: Request, res: Response) => {
  const transaction = await db.transaction();

  try {
    const exerciseData = normalizeExerciseData(req.body);
    const exercise = await Exercises.create(exerciseData, { transaction });
    const relations = await createRelationRows(
      exercise.id,
      req.body,
      transaction,
    );

    await transaction.commit();
    await clearExerciseCaches();

    return res.status(201).json({
      message: "Exercise created successfully",
      data: toClientExercise(exercise, relations),
    });
  } catch (error) {
    await transaction.rollback();

    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({
        message: "Exercise already exists with this slug",
      });
    }

    logger.error("Error creating exercise:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateExercise: any = async (req: Request, res: Response) => {
  const transaction = await db.transaction();

  try {
    const exercise = await Exercises.findByPk(req.params.id, { transaction });

    if (!exercise) {
      await transaction.rollback();
      return res.status(404).json({ message: "Exercise not found" });
    }

    const { muscles, equipment, constraints, media, variant_ladder_ids, variants } = req.body;
    const exerciseData = prepareExerciseUpdateData(req.body, exercise);

    await exercise.update(exerciseData, { transaction });

    if (muscles) {
      await ExerciseMuscles.destroy({ where: { exercise_id: exercise.id }, transaction });
      await ExerciseMuscles.bulkCreate(
        muscles.map((item: { muscle_id: string; role?: string }) => ({
          exercise_id: exercise.id,
          muscle_id: item.muscle_id,
          role: item.role ?? "secondary",
        })),
        { transaction },
      );
    }

    if (equipment) {
      await ExerciseEquipment.destroy({ where: { exercise_id: exercise.id }, transaction });
      await ExerciseEquipment.bulkCreate(
        equipment.map((item: { equipment_id: string; requirement_type?: string }) => ({
          exercise_id: exercise.id,
          equipment_id: item.equipment_id,
          requirement_type: item.requirement_type ?? "required",
        })),
        { transaction },
      );
    }

    if (constraints) {
      await ExerciseConstraints.destroy({ where: { exercise_id: exercise.id }, transaction });
      await ExerciseConstraints.bulkCreate(
        constraints.map((item: { constraint_id: string; level?: string; editor_notes?: string }) => ({
          exercise_id: exercise.id,
          constraint_id: item.constraint_id,
          level: item.level ?? "low",
          editor_notes: item.editor_notes ?? null,
        })),
        { transaction },
      );
    }

    if (media) {
      await ExerciseMedia.destroy({ where: { exercise_id: exercise.id }, transaction });
      await ExerciseMedia.bulkCreate(
        media.map((item: any) => ({
          exercise_id: exercise.id,
          media_type: item.media_type,
          url: item.url,
          version: item.version ?? "standard",
          view_angle: item.view_angle ?? "unknown",
          is_primary: item.is_primary ?? false,
          source: item.source ?? "admin",
          rights_status: item.rights_status ?? "unknown",
          external_media_id: item.external_media_id ?? null,
          notes: item.notes ?? null,
        })),
        { transaction },
      );
    }

    if (Array.isArray(variant_ladder_ids)) {
      await VariantLadderItems.destroy({ where: { exercise_id: exercise.id }, transaction });
      const variantLadderRows = buildVariantLadderRows(exercise.id, variant_ladder_ids);

      if (variantLadderRows.length) {
        await VariantLadderItems.bulkCreate(variantLadderRows, { transaction });
      }
    }

    if (Array.isArray(variants)) {
      await ExerciseVariants.destroy({
        where: { from_exercise_id: exercise.id },
        transaction,
      });
      const exerciseVariantRows = buildExerciseVariantRows(exercise.id, variants);

      if (exerciseVariantRows.length) {
        await ExerciseVariants.bulkCreate(exerciseVariantRows, { transaction });
      }
    }

    await transaction.commit();
    await clearExerciseCaches();

    const updated = await Exercises.findByPk(req.params.id);

    return res.status(200).json({
      message: "Exercise updated successfully",
      data: toClientExercise(updated!, await getExerciseRelations(req.params.id)),
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error updating exercise:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteExercise: any = async (req: Request, res: Response) => {
  const transaction = await db.transaction();

  try {
    const exercise = await Exercises.findByPk(req.params.id, { transaction });

    if (!exercise) {
      await transaction.rollback();
      return res.status(404).json({ message: "Exercise not found" });
    }

    await Promise.all([
      ExerciseMuscles.destroy({ where: { exercise_id: exercise.id }, transaction }),
      ExerciseEquipment.destroy({ where: { exercise_id: exercise.id }, transaction }),
      ExerciseConstraints.destroy({ where: { exercise_id: exercise.id }, transaction }),
      ExerciseMedia.destroy({ where: { exercise_id: exercise.id }, transaction }),
      VariantLadderItems.destroy({ where: { exercise_id: exercise.id }, transaction }),
      ExerciseVariants.destroy({
        where: {
          [Op.or]: [
            { from_exercise_id: exercise.id },
            { to_exercise_id: exercise.id },
          ],
        },
        transaction,
      }),
    ]);
    await exercise.destroy({ transaction });
    await transaction.commit();
    await clearExerciseCaches();

    return res.status(200).json({ message: "Exercise deleted successfully" });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error deleting exercise:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
