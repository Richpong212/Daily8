BEGIN;

ALTER TABLE IF EXISTS exercise_purposes
  RENAME TO exercise_benefits;

ALTER TABLE IF EXISTS exercises
  RENAME COLUMN exercise_purpose_id TO required_benefit_id;

ALTER TABLE IF EXISTS workout_slots
  RENAME COLUMN exercise_purpose_id TO required_benefit_id;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exercise_purposes_pkey'
  ) THEN
    ALTER TABLE exercise_benefits
      RENAME CONSTRAINT exercise_purposes_pkey TO exercise_benefits_pkey;
  END IF;
END $$;

ALTER INDEX IF EXISTS exercise_purposes_slug_key
  RENAME TO exercise_benefits_slug_key;

COMMIT;
