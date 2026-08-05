BEGIN;

CREATE TABLE IF NOT EXISTS variant_ladder_items (
  variant_ladder_id UUID NOT NULL REFERENCES variant_ladders(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  position INTEGER NOT NULL,
  is_default_anchor BOOLEAN NOT NULL DEFAULT FALSE,
  editor_notes TEXT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (variant_ladder_id, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_variant_ladder_items_exercise_id
  ON variant_ladder_items(exercise_id);

CREATE INDEX IF NOT EXISTS idx_variant_ladder_items_position
  ON variant_ladder_items(variant_ladder_id, position);

COMMIT;
