import { Request, Response } from "express";
import { Op, UniqueConstraintError } from "sequelize";
import { db } from "../config/connectDb";
import WorkoutProgramItems from "../models/workoutProgramItems.model";
import WorkoutPrograms from "../models/workoutPrograms.model";
import Workouts from "../models/workouts.model";
import { deleteCacheByPattern } from "../utils/cache.utils";
import { logger } from "../utils/logger.utils";

type IdParamRequest = Request<{ id: string }>;

const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "program";

const generateUniqueSlug = async (name: string, existingId?: string) => {
  const baseSlug = slugify(name);
  let slug = baseSlug;
  let suffix = 2;

  while (
    await WorkoutPrograms.findOne({
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

const clearProgramCaches = async () => {
  await deleteCacheByPattern("workout-programs:*");
};

const getEnrollmentCount = async (programId: string) => {
  const candidates = [
    "UserWorkoutPrograms",
    "WorkoutProgramEnrollments",
    "UserWorkoutProgramEnrollments",
    "ProgramEnrollments",
  ];
  const enrollmentModel = candidates
    .map((name) => db.models[name])
    .find(Boolean);

  if (!enrollmentModel) return 0;

  const foreignKey = enrollmentModel.rawAttributes.workout_program_id
    ? "workout_program_id"
    : enrollmentModel.rawAttributes.program_id
      ? "program_id"
      : null;

  if (!foreignKey) return 0;
  return enrollmentModel.count({ where: { [foreignKey]: programId } });
};

const getProgramItems = async (programId: string) => {
  const items = await WorkoutProgramItems.findAll({
    where: { workout_program_id: programId },
    include: [
      {
        model: Workouts,
        as: "workout",
        attributes: ["id", "name", "status", "version_number"],
      },
    ],
    order: [["program_order", "ASC"]],
  });

  return items.map((item) => {
    const data = item.get({ plain: true }) as Record<string, unknown>;
    return { ...data, createdAt: undefined, updatedAt: undefined };
  });
};

const toClientProgram = async (program: WorkoutPrograms, includeItems = true) => {
  const data = program.get({ plain: true }) as Record<string, unknown>;
  const [items, enrollmentCount] = await Promise.all([
    includeItems ? getProgramItems(program.id) : Promise.resolve([]),
    getEnrollmentCount(program.id),
  ]);

  return {
    ...data,
    items,
    workout_count: includeItems
      ? items.length
      : await WorkoutProgramItems.count({ where: { workout_program_id: program.id } }),
    enrollment_count: enrollmentCount,
    is_locked: enrollmentCount > 0,
    created_at: data.createdAt,
    updated_at: data.updatedAt,
    createdAt: undefined,
    updatedAt: undefined,
  };
};

const replaceProgramItems = async (
  programId: string,
  items: Array<Record<string, unknown>>,
  transaction: any,
) => {
  await WorkoutProgramItems.destroy({
    where: { workout_program_id: programId },
    transaction,
  });

  if (!items.length) return;

  await WorkoutProgramItems.bulkCreate(
    items.map((item, index) => ({
      workout_program_id: programId,
      workout_id: item.workout_id,
      program_order: index + 1,
      notes: item.notes ?? null,
    })),
    { transaction },
  );
};

export const listWorkoutPrograms: any = async (_req: Request, res: Response) => {
  try {
    const programs = await WorkoutPrograms.findAll({ order: [["updatedAt", "DESC"]] });
    const data = await Promise.all(programs.map((program) => toClientProgram(program)));
    return res.status(200).json({ message: "Programs retrieved successfully", data });
  } catch (error) {
    logger.error("Error listing workout programs:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getWorkoutProgramById: any = async (req: IdParamRequest, res: Response) => {
  try {
    const program = await WorkoutPrograms.findByPk(req.params.id);
    if (!program) return res.status(404).json({ message: "Program not found" });

    return res.status(200).json({
      message: "Program retrieved successfully",
      data: await toClientProgram(program),
    });
  } catch (error) {
    logger.error("Error retrieving workout program:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createWorkoutProgram: any = async (req: Request, res: Response) => {
  const transaction = await db.transaction();

  try {
    const name = req.body.name ?? "New Program";
    const program = await WorkoutPrograms.create(
      {
        slug: await generateUniqueSlug(name),
        name,
        version_number: 1,
        previous_version_id: null,
        status: req.body.status ?? "draft",
        notes: req.body.notes ?? null,
        published_at: req.body.status === "active" ? db.literal("CURRENT_TIMESTAMP") : null,
      },
      { transaction },
    );
    await replaceProgramItems(program.id, req.body.items ?? [], transaction);
    await transaction.commit();
    await clearProgramCaches();

    return res.status(201).json({
      message: "Program created successfully",
      data: await toClientProgram(program),
    });
  } catch (error) {
    await transaction.rollback();
    if (error instanceof UniqueConstraintError) {
      return res.status(409).json({ message: "Program already exists" });
    }
    logger.error("Error creating workout program:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateWorkoutProgram: any = async (req: IdParamRequest, res: Response) => {
  const transaction = await db.transaction();

  try {
    const program = await WorkoutPrograms.findByPk(req.params.id, { transaction });
    if (!program) {
      await transaction.rollback();
      return res.status(404).json({ message: "Program not found" });
    }

    if ((await getEnrollmentCount(program.id)) > 0) {
      await transaction.rollback();
      return res.status(409).json({
        message: "This program version has enrollments and cannot be edited",
      });
    }

    const name = req.body.name ?? program.name;
    const status = req.body.status ?? program.status;
    await program.update(
      {
        name,
        slug: name === program.name ? program.slug : await generateUniqueSlug(name, program.id),
        status,
        notes: req.body.notes ?? program.notes,
        published_at:
          status === "active" && !program.published_at
            ? db.literal("CURRENT_TIMESTAMP")
            : program.published_at,
      },
      { transaction },
    );

    if (Array.isArray(req.body.items)) {
      await replaceProgramItems(program.id, req.body.items, transaction);
    }

    await transaction.commit();
    await clearProgramCaches();
    return res.status(200).json({
      message: "Program updated successfully",
      data: await toClientProgram(program),
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error updating workout program:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const createWorkoutProgramVersion: any = async (
  req: IdParamRequest,
  res: Response,
) => {
  const transaction = await db.transaction();

  try {
    const source = await WorkoutPrograms.findByPk(req.params.id, { transaction });
    if (!source) {
      await transaction.rollback();
      return res.status(404).json({ message: "Program not found" });
    }

    const sourceItems = await WorkoutProgramItems.findAll({
      where: { workout_program_id: source.id },
      order: [["program_order", "ASC"]],
      transaction,
    });
    const version = await WorkoutPrograms.create(
      {
        slug: await generateUniqueSlug(`${source.name} v${source.version_number + 1}`),
        name: source.name,
        version_number: source.version_number + 1,
        previous_version_id: source.id,
        status: "draft",
        notes: source.notes,
        published_at: null,
      },
      { transaction },
    );
    await replaceProgramItems(
      version.id,
      sourceItems.map((item) => ({ workout_id: item.workout_id, notes: item.notes })),
      transaction,
    );

    await transaction.commit();
    await clearProgramCaches();
    return res.status(201).json({
      message: "New program version created successfully",
      data: await toClientProgram(version),
    });
  } catch (error) {
    await transaction.rollback();
    logger.error("Error creating workout program version:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
