export type Status = "draft" | "active" | "retired";
export type ReviewStatus = "draft" | "needs_review" | "reviewed" | "approved" | "not_recommended";
export type Level = "none" | "low" | "moderate" | "high";
export type MuscleRole = "primary" | "secondary" | "stabilizer";
export type EquipmentRequirement = "required" | "optional" | "comfort_optional";
export type MediaType = "image" | "video" | "reference_link";
export type ViewAngle = "front" | "side" | "three_quarter" | "rear" | "unknown";
export type MediaVersion = "standard" | "gentler" | "progression" | "reference";
export type RightsStatus = "owned" | "licensed" | "reference_only" | "unknown";

export interface MovementFamily {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface BodyRegion {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface ExerciseBenefit {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface Muscle {
  id: string;
  slug: string;
  name: string;
  body_region_id: string;
  description?: string;
}

export interface Equipment {
  id: string;
  slug: string;
  name: string;
  description: string;
  sort_order: number;
}

export interface Constraint {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: "body_area" | "movement_demand" | "environment";
  sort_order: number;
}

export interface ExerciseMuscle {
  muscle_id: string;
  role: MuscleRole;
}

export interface ExerciseEquipment {
  equipment_id: string;
  requirement_type: EquipmentRequirement;
}

export interface ExerciseConstraint {
  constraint_id: string;
  level: Level;
  editor_notes?: string;
}

export interface ExerciseMedia {
  id: string;
  media_type: MediaType;
  url: string;
  version: MediaVersion;
  view_angle: ViewAngle;
  is_primary: boolean;
  source: string;
  rights_status: RightsStatus;
  external_media_id?: string;
  notes?: string;
}

export type ExerciseVariantType = "progression" | "regression" | "alternative" | "related";

export interface ExerciseVariant {
  id?: string;
  to_exercise_id: string;
  variant_type: ExerciseVariantType;
  sort_order: number;
  notes?: string | null;
}

export interface ExerciseInstructionGroup {
  heading: string;
  steps: string[];
}

export interface Exercise {
  id: string;
  slug: string;
  name: string;
  movement_family_id: string | null;
  body_region_id: string | null;
  required_benefit_id: string | null;
  category: "strength" | "mobility" | "conditioning" | "balance";
  position:
    | "standing"
    | "seated_chair"
    | "seated_floor"
    | "supine"
    | "prone"
    | "quadruped"
    | "kneeling"
    | "side_lying";
  impact_level: Level;
  space_need: "small" | "medium" | "large";
  complexity_level: Level;
  intensity_level: Level;
  balance_demand: Level;
  summary: string;
  instructions: string[];
  instruction_groups?: ExerciseInstructionGroup[];
  coaching_cues: { text: string; time_seconds?: number | null }[];
  safety_info: string | null;
  review_status: ReviewStatus;
  review_notes: string;
  status: Status;
  muscles: ExerciseMuscle[];
  constraints: ExerciseConstraint[];
  equipment: ExerciseEquipment[];
  variant_ladder_ids: string[];
  variants: ExerciseVariant[];
  media: ExerciseMedia[];
  created_at: string;
  updated_at: string;
  published_at: string | null;
  retired_at: string | null;
  /* Editorial visual color used in the swatch tile */
  color: string;
}

export interface VariantLadder {
  id: string;
  slug: string;
  movement_family_id: string | null;
  name: string;
  description: string;
  status: "draft" | "active" | "archived";
  review_notes?: string;
  items: VariantLadderItem[];
}

export interface VariantLadderItem {
  exercise_id: string;
  position: number;
  is_default_anchor: boolean;
  editor_notes?: string;
}

export interface WorkoutSlot {
  id: string;
  slot_order: number;
  exercise_id: string;
  required_benefit_id: string | null;
  duration_seconds: number;
  notes?: string;
}

export interface WorkoutGroup {
  id: string;
  group_order: number;
  name: string;
  repeat_count: number;
  notes?: string;
  slots: WorkoutSlot[];
  /* Visual color used for editor accents */
  color: string;
}

export interface Workout {
  id: string;
  slug: string;
  version_number: number;
  previous_version_id: string | null;
  name: string;
  status: Status;
  description: string;
  transition_seconds: number;
  is_new_user_friendly: boolean;
  difficulty_band: "gentle" | "standard" | "challenging";
  review_notes: string;
  groups: WorkoutGroup[];
  published_at: string | null;
  created_at: string;
  updated_at: string;
}
