BEGIN;

ALTER TABLE IF EXISTS movement_families
  ADD COLUMN IF NOT EXISTS color TEXT NOT NULL DEFAULT '#6C63B8';

UPDATE movement_families
SET color = CASE lower(name)
  WHEN 'squat' THEN '#6C63B8'
  WHEN 'hinge' THEN '#2E7D8A'
  WHEN 'push' THEN '#D97745'
  WHEN 'horizontal push' THEN '#D97745'
  WHEN 'pull' THEN '#C65B5B'
  WHEN 'core' THEN '#5F9D76'
  WHEN 'balance' THEN '#8C6FB8'
  WHEN 'mobility' THEN '#69AFCB'
  WHEN 'conditioning' THEN '#D4B347'
  WHEN 'gait' THEN '#D4B347'
  WHEN 'carry and locomotion' THEN '#D4B347'
  WHEN 'mobility and control' THEN '#69AFCB'
  ELSE color
END;

COMMIT;
