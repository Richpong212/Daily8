BEGIN;

CREATE TABLE IF NOT EXISTS exercise_relationships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  to_exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL CHECK (
    relationship_type IN ('constraint_based_swap', 'same_purpose_alternative')
  ),
  constraint_id UUID NULL REFERENCES constraints(id) ON DELETE SET NULL,
  rank INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  notes TEXT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT exercise_relationships_no_self_link
    CHECK (from_exercise_id <> to_exercise_id)
);

ALTER TABLE exercise_relationships
  ADD COLUMN IF NOT EXISTS constraint_id UUID NULL REFERENCES constraints(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS rank INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'draft';

DO $$
DECLARE
  constraint_name TEXT;
BEGIN
  FOR constraint_name IN
    SELECT con.conname
    FROM pg_constraint con
    JOIN pg_class rel ON rel.oid = con.conrelid
    JOIN pg_namespace nsp ON nsp.oid = rel.relnamespace
    WHERE nsp.nspname = 'public'
      AND rel.relname = 'exercise_relationships'
      AND con.contype = 'c'
      AND pg_get_constraintdef(con.oid) LIKE '%relationship_type%'
  LOOP
    EXECUTE format('ALTER TABLE public.exercise_relationships DROP CONSTRAINT %I', constraint_name);
  END LOOP;
END $$;

UPDATE exercise_relationships
SET relationship_type = CASE
  WHEN relationship_type IN ('progression', 'regression', 'alternative', 'related') THEN 'same_purpose_alternative'
  ELSE relationship_type
END;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'exercise_relationships'
      AND column_name = 'sort_order'
  ) THEN
    EXECUTE 'UPDATE public.exercise_relationships SET rank = sort_order WHERE sort_order IS NOT NULL';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exercise_relationships_type_check'
  ) THEN
    ALTER TABLE exercise_relationships
      ADD CONSTRAINT exercise_relationships_type_check
        CHECK (relationship_type IN ('constraint_based_swap', 'same_purpose_alternative'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'exercise_relationships_status_check'
  ) THEN
    ALTER TABLE exercise_relationships
      ADD CONSTRAINT exercise_relationships_status_check
        CHECK (status IN ('draft', 'active', 'retired'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_exercise_relationships_from_exercise_id
  ON exercise_relationships(from_exercise_id);

CREATE INDEX IF NOT EXISTS idx_exercise_relationships_to_exercise_id
  ON exercise_relationships(to_exercise_id);

DROP INDEX IF EXISTS idx_exercise_relationships_type_order;

CREATE INDEX IF NOT EXISTS idx_exercise_relationships_type_order
  ON exercise_relationships(from_exercise_id, relationship_type, rank);

DO $$
BEGIN
  IF to_regclass('public.exercise_variants') IS NOT NULL THEN
    INSERT INTO exercise_relationships (
      id,
      from_exercise_id,
      to_exercise_id,
      relationship_type,
      rank,
      status,
      notes,
      "createdAt",
      "updatedAt"
    )
    SELECT
      id,
      from_exercise_id,
      to_exercise_id,
      'same_purpose_alternative',
      sort_order,
      'draft',
      notes,
      "createdAt",
      "updatedAt"
    FROM exercise_variants
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

COMMIT;
