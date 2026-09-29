import { Transaction, UniqueConstraintError } from "sequelize";
import { db } from "../config/connectDb";
import UserWorkoutPrograms from "../models/userWorkoutPrograms.model";
import WorkoutPrograms from "../models/workoutPrograms.model";
import { deleteCacheByPattern } from "../utils/cache.utils";

const activeEnrollmentInclude = [
  {
    model: WorkoutPrograms,
    as: "workoutProgram",
  },
];

export const getActiveUserWorkoutProgram = async (
  userId: string,
  transaction?: Transaction,
) => {
  return UserWorkoutPrograms.findOne({
    where: { user_id: userId, status: "active" },
    include: activeEnrollmentInclude,
    transaction,
  });
};

export const enrollUserInActiveWorkoutProgram = async (userId: string) => {
  const transaction = await db.transaction();

  try {
    const existing = await getActiveUserWorkoutProgram(userId, transaction);
    if (existing) {
      await transaction.commit();
      return existing;
    }

    const program = await WorkoutPrograms.findOne({
      where: { status: "active" },
      order: [
        ["published_at", "DESC NULLS LAST"],
        ["updatedAt", "DESC"],
      ],
      transaction,
    });

    if (!program) {
      await transaction.commit();
      return null;
    }

    const enrollment = await UserWorkoutPrograms.create(
      {
        user_id: userId,
        workout_program_id: program.id,
        status: "active",
        started_at: db.literal("CURRENT_TIMESTAMP"),
        completed_at: null,
      },
      { transaction },
    );

    await transaction.commit();
    await deleteCacheByPattern("workout-programs:*");

    return UserWorkoutPrograms.findByPk(enrollment.id, {
      include: activeEnrollmentInclude,
    });
  } catch (error) {
    await transaction.rollback();

    if (error instanceof UniqueConstraintError) {
      return getActiveUserWorkoutProgram(userId);
    }

    throw error;
  }
};
