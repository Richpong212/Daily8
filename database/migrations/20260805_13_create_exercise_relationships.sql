BEGIN;

CREATE TABLE IF NOT EXISTS exercise_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  to_exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (
    relationship_type IN ('progression', 'regression', 'alternative', 'related')
  ),
  sort_order INTEGER NOT NULL DEFAULT 0,
  notes TEXT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT exercise_relationships_no_self_link
    CHECK (from_exercise_id <> to_exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_exercise_relationships_from_exercise_id
  ON exercise_relationships(from_exercise_id);

CREATE INDEX IF NOT EXISTS idx_exercise_relationships_to_exercise_id
  ON exercise_relationships(to_exercise_id);

CREATE INDEX IF NOT EXISTS idx_exercise_relationships_type_order
  ON exercise_relationships(from_exercise_id, relationship_type, sort_order);

DO $$
BEGIN
  IF to_regclass('public.exercise_variants') IS NOT NULL THEN
    INSERT INTO exercise_relationships (
      id,
      from_exercise_id,
      to_exercise_id,
      relationship_type,
      sort_order,
      notes,
      "createdAt",
      "updatedAt"
    )
    SELECT
      id,
      from_exercise_id,
      to_exercise_id,
      variant_type,
      sort_order,
      notes,
      "createdAt",
      "updatedAt"
    FROM exercise_variants
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

COMMIT;
