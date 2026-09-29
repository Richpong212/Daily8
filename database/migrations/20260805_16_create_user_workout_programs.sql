BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS user_workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE RESTRICT,
  status VARCHAR(20) NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed')),
  started_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, workout_program_id),
  CHECK (
    (status = 'active' AND completed_at IS NULL)
    OR (status = 'completed' AND completed_at IS NOT NULL)
  )
);

CREATE UNIQUE INDEX IF NOT EXISTS user_workout_programs_one_active_per_user
  ON user_workout_programs(user_id)
  WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_user_workout_programs_program
  ON user_workout_programs(workout_program_id);

CREATE INDEX IF NOT EXISTS idx_user_workout_programs_user_status
  ON user_workout_programs(user_id, status);

COMMIT;
