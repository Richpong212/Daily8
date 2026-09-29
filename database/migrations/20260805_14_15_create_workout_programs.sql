BEGIN;

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS workout_programs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  version_number INTEGER NOT NULL DEFAULT 1 CHECK (version_number > 0),
  previous_version_id UUID REFERENCES workout_programs(id) ON DELETE SET NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'active', 'retired')),
  notes TEXT,
  published_at TIMESTAMPTZ,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_workout_programs_previous_version
  ON workout_programs(previous_version_id);
CREATE INDEX IF NOT EXISTS idx_workout_programs_status
  ON workout_programs(status);

CREATE TABLE IF NOT EXISTS workout_program_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_program_id UUID NOT NULL REFERENCES workout_programs(id) ON DELETE CASCADE,
  workout_id UUID NOT NULL REFERENCES workouts(id) ON DELETE RESTRICT,
  program_order INTEGER NOT NULL CHECK (program_order > 0),
  notes TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (workout_program_id, program_order)
);

CREATE INDEX IF NOT EXISTS idx_workout_program_items_workout
  ON workout_program_items(workout_id);

COMMIT;
