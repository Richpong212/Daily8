import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, Play, Plus, Trash2, X, Clock } from "lucide-react";
import {
  deleteExercise,
  publishExercise,
  saveExerciseDraft,
  sendForReview,
  updateExercise,
  useExercises,
  useExercise,
} from "@/services/exercises";
import {
  useBodyRegions,
  useConstraints,
  useEquipment,
  useExercisePurposes,
  useMovementFamilies,
  useMuscles,
  useVariantLadders,
  getMuscle,
  getConstraint,
  getPurpose,
  getEquipmentItem,
  getLadder,
} from "@/services/supporting-data";
import { ExerciseTile } from "@/components/ExerciseTile";
import { StatusBadge, ReviewBadge } from "@/components/StatusBadge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useState } from "react";
import type { ExerciseVariantType, Level, MuscleRole } from "@/types";

export default function ExerciseEditor() {
  const { id } = useParams();
  const nav = useNavigate();
  const ex = useExercise(id);
  const families = useMovementFamilies();
  const regions = useBodyRegions();
  const purposes = useExercisePurposes();
  const musclesList = useMuscles();
  const equipList = useEquipment();
  const constraintsList = useConstraints();
  const ladders = useVariantLadders();
  const exercises = useExercises();

  const [openMuscle, setOpenMuscle] = useState(false);
  const [openConstraint, setOpenConstraint] = useState(false);
  const [openLadder, setOpenLadder] = useState(false);
  const [openVariant, setOpenVariant] = useState(false);
  const [newVariantType, setNewVariantType] = useState<ExerciseVariantType>("progression");
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  if (!ex) {
    return (
      <div>
        <Link to="/exercises" className="text-sm text-muted-foreground hover:underline">
          ← Back to Exercises
        </Link>
        <div className="mt-6 text-lg">Exercise not found.</div>
      </div>
    );
  }

  const patch = (p: Parameters<typeof updateExercise>[1]) => updateExercise(ex.id, p);
  const isNewExercise = ex.id === "new";

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/exercises"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Exercises
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{ex.name}</span>
          <StatusBadge status={ex.status} />
          <ReviewBadge status={ex.review_status} />
        </div>
        <div className="flex items-center gap-2">
          <button
            disabled={isSaving}
            onClick={async () => {
              setSaveError(null);
              setIsSaving(true);
              try {
                const saved = await saveExerciseDraft({ ...ex, status: "draft" });
                if (isNewExercise) nav(`/exercises/${saved.id}`, { replace: true });
              } catch (error) {
                setSaveError(error instanceof Error ? error.message : "Failed to save exercise");
              } finally {
                setIsSaving(false);
              }
            }}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Draft"}
          </button>
          <button
            onClick={() => sendForReview(ex.id)}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            Send for Review
          </button>
          <button
            onClick={() => publishExercise(ex.id)}
            disabled={ex.review_status !== "approved" && ex.review_status !== "reviewed"}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground disabled:opacity-40"
          >
            Publish
          </button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="rounded-md border border-border bg-card p-1.5 text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete exercise?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove {ex.name || "this exercise"} from the exercise library.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    void deleteExercise(ex.id);
                    nav("/exercises");
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {saveError && (
        <div className="mb-4 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {saveError}
        </div>
      )}

      <div className="grid grid-cols-3 gap-6">
        {/* LEFT COLUMN */}
        <div className="col-span-2 space-y-6">
          <Card>
            <SectionLabel>General</SectionLabel>
            <Field label="Name">
              <input
                value={ex.name}
                onChange={(e) => patch({ name: e.target.value })}
                className={inputCls}
              />
            </Field>
            <Field label="Slug">
              <input
                value={ex.slug}
                onChange={(e) => patch({ slug: e.target.value.replace(/\s+/g, "_").toLowerCase() })}
                className={`${inputCls} font-mono`}
              />
            </Field>

            <div className="mt-4 grid grid-cols-2 gap-4">
              <Field label="Category">
                <select
                  className={selectCls}
                  value={ex.category}
                  onChange={(e) => patch({ category: e.target.value as typeof ex.category })}
                >
                  <option value="strength">Strength</option>
                  <option value="mobility">Mobility</option>
                  <option value="conditioning">Conditioning</option>
                  <option value="balance">Balance</option>
                </select>
              </Field>
              <Field label="Position">
                <select
                  className={selectCls}
                  value={ex.position}
                  onChange={(e) => patch({ position: e.target.value as typeof ex.position })}
                >
                  {[
                    "standing",
                    "seated_chair",
                    "seated_floor",
                    "supine",
                    "prone",
                    "quadruped",
                    "kneeling",
                    "side_lying",
                  ].map((p) => (
                    <option key={p} value={p}>
                      {p.replace(/_/g, " ")}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Impact Level">
                <LevelSelect value={ex.impact_level} onChange={(v) => patch({ impact_level: v })} />
              </Field>
              <Field label="Space Need">
                <select
                  className={selectCls}
                  value={ex.space_need}
                  onChange={(e) =>
                    patch({ space_need: e.target.value as "small" | "medium" | "large" })
                  }
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </select>
              </Field>
              <Field label="Complexity">
                <LevelSelect
                  value={ex.complexity_level}
                  onChange={(v) => patch({ complexity_level: v })}
                />
              </Field>
              <Field label="Intensity">
                <LevelSelect
                  value={ex.intensity_level}
                  onChange={(v) => patch({ intensity_level: v })}
                />
              </Field>
              <Field label="Balance Demand">
                <LevelSelect
                  value={ex.balance_demand}
                  onChange={(v) => patch({ balance_demand: v })}
                />
              </Field>
            </div>
          </Card>

          <Card>
            <SectionLabel>Summary</SectionLabel>
            <textarea
              value={ex.summary}
              onChange={(e) => patch({ summary: e.target.value })}
              rows={2}
              className={inputCls}
            />
          </Card>

          <Card>
            <SectionLabel>Instructions</SectionLabel>
            <div className="space-y-2">
              {ex.instructions.map((step, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                    {i + 1}
                  </span>
                  <input
                    className={inputCls}
                    value={step}
                    onChange={(e) => {
                      const next = [...ex.instructions];
                      next[i] = e.target.value;
                      patch({ instructions: next });
                    }}
                  />
                  <button
                    onClick={() =>
                      patch({ instructions: ex.instructions.filter((_, x) => x !== i) })
                    }
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() => patch({ instructions: [...ex.instructions, ""] })}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Step
              </button>
            </div>
          </Card>

          <Card>
            <SectionLabel>Safety Information</SectionLabel>
            <textarea
              value={ex.safety_info ?? ""}
              onChange={(e) => patch({ safety_info: e.target.value })}
              rows={2}
              className={inputCls}
            />
            <div className="mt-2 text-xs text-muted-foreground">
              Do not include medical advice, diagnoses or safety guarantees.
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between">
              <SectionLabel>Coaching Cues</SectionLabel>
              <span className="text-xs text-muted-foreground">
                <Clock className="mr-1 inline h-3 w-3" />
                Timed cues — coming soon
              </span>
            </div>
            <div className="mt-1 mb-3 text-xs text-muted-foreground">
              Set a playback time to trigger each cue during the exercise. Voice playback will be
              added later.
            </div>
            <div className="space-y-2">
              {ex.coaching_cues.map((cue, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-muted-foreground" />
                  <input
                    className={inputCls}
                    value={cue.text}
                    onChange={(e) => {
                      const next = [...ex.coaching_cues];
                      next[i] = { ...next[i], text: e.target.value };
                      patch({ coaching_cues: next });
                    }}
                  />
                  <div className="flex w-20 items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <input
                      type="number"
                      value={cue.time_seconds ?? ""}
                      placeholder="—"
                      onChange={(e) => {
                        const next = [...ex.coaching_cues];
                        next[i] = {
                          ...next[i],
                          time_seconds: e.target.value === "" ? null : Number(e.target.value),
                        };
                        patch({ coaching_cues: next });
                      }}
                      className="w-full bg-transparent outline-none"
                    />
                  </div>
                  <button
                    onClick={() =>
                      patch({ coaching_cues: ex.coaching_cues.filter((_, x) => x !== i) })
                    }
                    className="p-1.5 text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
              <button
                onClick={() =>
                  patch({ coaching_cues: [...ex.coaching_cues, { text: "", time_seconds: null }] })
                }
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus className="h-3.5 w-3.5" /> Add Cue
              </button>
            </div>
          </Card>

          <Card>
            <SectionLabel>Review Notes</SectionLabel>
            <textarea
              value={ex.review_notes}
              onChange={(e) => patch({ review_notes: e.target.value })}
              rows={3}
              className={inputCls}
              placeholder="Internal notes for content editors and reviewers..."
            />
          </Card>
        </div>

        {/* RIGHT COLUMN */}
        <div className="space-y-6">
          <Card>
            <SectionLabel>Media</SectionLabel>
            <div className="flex gap-3">
              <ExerciseTile name={ex.name} color={ex.color} size="lg" />
              <div className="flex flex-1 items-center justify-center rounded-md bg-muted">
                <Play className="h-6 w-6 text-muted-foreground" />
              </div>
            </div>
            <div className="mt-2 text-center text-xs text-muted-foreground">
              Side view · Primary
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {["Front Video", "Side Video", "Thumbnail"].map((label, i) => (
                <div
                  key={label}
                  className="relative flex h-16 items-center justify-center rounded-md bg-muted text-[10px] text-muted-foreground"
                >
                  {i === 1 || i === 2 ? (
                    <span className="absolute right-1 top-1 rounded-sm bg-primary px-1 py-0.5 text-[9px] font-semibold text-primary-foreground">
                      Primary
                    </span>
                  ) : null}
                  {label}
                </div>
              ))}
            </div>
            <button className="mt-3 flex items-center gap-1 text-xs text-primary hover:underline">
              <Plus className="h-3 w-3" /> Add Media
            </button>
          </Card>

          <Card>
            <SectionLabel>Classification</SectionLabel>
            <RelField label="Movement Family">
              <select
                className={selectCls}
                value={ex.movement_family_id ?? ""}
                onChange={(e) => patch({ movement_family_id: e.target.value || null })}
              >
                <option value="">- Select movement family -</option>
                {families.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            </RelField>
            <RelField label="Body Region">
              <select
                className={selectCls}
                value={ex.body_region_id ?? ""}
                onChange={(e) => patch({ body_region_id: e.target.value || null })}
              >
                <option value="">- Select body region -</option>
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </RelField>
            <RelField label="Primary Purpose">
              <select
                className={selectCls}
                value={ex.exercise_purpose_id ?? ""}
                onChange={(e) => patch({ exercise_purpose_id: e.target.value || null })}
              >
                <option value="">— None —</option>
                {purposes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </RelField>
          </Card>

          {/* Constraints */}
          <Card>
            <div className="flex items-center justify-between">
              <SectionLabel>
                Constraints{" "}
                <span className="ml-1 text-xs text-muted-foreground">{ex.constraints.length}</span>
              </SectionLabel>
            </div>
            <div className="mt-2 space-y-2">
              {ex.constraints.map((c) => {
                const meta = getConstraint(c.constraint_id);
                return (
                  <div key={c.constraint_id} className="flex items-center justify-between">
                    <span className="text-sm">{meta?.name}</span>
                    <div className="flex items-center gap-2">
                      <LevelSelect
                        value={c.level}
                        onChange={(lvl) =>
                          patch({
                            constraints: ex.constraints.map((x) =>
                              x.constraint_id === c.constraint_id ? { ...x, level: lvl } : x,
                            ),
                          })
                        }
                        compact
                      />
                      <button
                        onClick={() =>
                          patch({
                            constraints: ex.constraints.filter(
                              (x) => x.constraint_id !== c.constraint_id,
                            ),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              {openConstraint ? (
                <select
                  autoFocus
                  className={selectCls}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      patch({
                        constraints: [
                          ...ex.constraints,
                          { constraint_id: e.target.value, level: "low" },
                        ],
                      });
                    }
                    setOpenConstraint(false);
                  }}
                  onBlur={() => setOpenConstraint(false)}
                >
                  <option value="">Select constraint…</option>
                  {constraintsList
                    .filter((c) => !ex.constraints.some((x) => x.constraint_id === c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              ) : (
                <button
                  onClick={() => setOpenConstraint(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add Constraint
                </button>
              )}
            </div>
          </Card>

          {/* Muscles */}
          <Card>
            <SectionLabel>
              Muscles{" "}
              <span className="ml-1 text-xs text-muted-foreground">{ex.muscles.length}</span>
            </SectionLabel>
            <div className="mt-2 flex flex-wrap gap-2">
              {ex.muscles.map((m) => {
                const meta = getMuscle(m.muscle_id);
                const roleClass =
                  m.role === "primary"
                    ? "bg-primary text-primary-foreground"
                    : m.role === "secondary"
                      ? "bg-success text-success-foreground"
                      : "bg-muted text-muted-foreground";
                return (
                  <span
                    key={m.muscle_id}
                    className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-xs font-medium ${roleClass}`}
                  >
                    {meta?.name}
                    <select
                      value={m.role}
                      onChange={(e) =>
                        patch({
                          muscles: ex.muscles.map((x) =>
                            x.muscle_id === m.muscle_id
                              ? { ...x, role: e.target.value as MuscleRole }
                              : x,
                          ),
                        })
                      }
                      className="bg-transparent text-[10px] outline-none"
                    >
                      <option value="primary">primary</option>
                      <option value="secondary">secondary</option>
                      <option value="stabilizer">stabilizer</option>
                    </select>
                    <button
                      onClick={() =>
                        patch({ muscles: ex.muscles.filter((x) => x.muscle_id !== m.muscle_id) })
                      }
                      className="opacity-70 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                );
              })}
              {openMuscle ? (
                <select
                  autoFocus
                  className="rounded-md border border-dashed border-border bg-card px-2 py-1 text-xs"
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      patch({
                        muscles: [...ex.muscles, { muscle_id: e.target.value, role: "secondary" }],
                      });
                    }
                    setOpenMuscle(false);
                  }}
                  onBlur={() => setOpenMuscle(false)}
                >
                  <option value="">Select muscle…</option>
                  {musclesList
                    .filter((m) => !ex.muscles.some((x) => x.muscle_id === m.id))
                    .map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                </select>
              ) : (
                <button
                  onClick={() => setOpenMuscle(true)}
                  className="rounded-md border border-dashed border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  + Add
                </button>
              )}
            </div>
          </Card>

          {/* Equipment */}
          <Card>
            <SectionLabel>
              Equipment{" "}
              <span className="ml-1 text-xs text-muted-foreground">{ex.equipment.length}</span>
            </SectionLabel>
            <div className="mt-2 space-y-2">
              {ex.equipment.map((eq) => {
                const meta = getEquipmentItem(eq.equipment_id);
                return (
                  <div key={eq.equipment_id} className="flex items-center justify-between text-sm">
                    <span>{meta?.name}</span>
                    <div className="flex items-center gap-2">
                      <select
                        value={eq.requirement_type}
                        onChange={(e) =>
                          patch({
                            equipment: ex.equipment.map((x) =>
                              x.equipment_id === eq.equipment_id
                                ? {
                                    ...x,
                                    requirement_type: e.target.value as typeof eq.requirement_type,
                                  }
                                : x,
                            ),
                          })
                        }
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs"
                      >
                        <option value="required">Required</option>
                        <option value="optional">Optional</option>
                        <option value="comfort_optional">Comfort Optional</option>
                      </select>
                      <button
                        onClick={() =>
                          patch({
                            equipment: ex.equipment.filter(
                              (x) => x.equipment_id !== eq.equipment_id,
                            ),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
              <select
                className={selectCls}
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    patch({
                      equipment: [
                        ...ex.equipment,
                        { equipment_id: e.target.value, requirement_type: "required" },
                      ],
                    });
                  }
                }}
              >
                <option value="">+ Add Equipment</option>
                {equipList
                  .filter((eq) => !ex.equipment.some((x) => x.equipment_id === eq.id))
                  .map((eq) => (
                    <option key={eq.id} value={eq.id}>
                      {eq.name}
                    </option>
                  ))}
              </select>
            </div>
          </Card>

          {/* Variant Ladders */}
          <Card>
            <SectionLabel>
              Variant Ladders{" "}
              <span className="ml-1 text-xs text-muted-foreground">
                {ex.variant_ladder_ids.length}
              </span>
            </SectionLabel>
            <div className="mt-2 space-y-2">
              {ex.variant_ladder_ids.map((lid) => {
                const l = getLadder(lid);
                if (!l) return null;
                return (
                  <div
                    key={lid}
                    className="flex items-center justify-between rounded-md border border-border p-2 text-sm"
                  >
                    <div>
                      <div className="font-medium">{l.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {l.items.length} exercises
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        patch({
                          variant_ladder_ids: ex.variant_ladder_ids.filter((x) => x !== lid),
                        })
                      }
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              })}
              {openLadder ? (
                <select
                  autoFocus
                  className={selectCls}
                  defaultValue=""
                  onChange={(e) => {
                    if (e.target.value) {
                      patch({ variant_ladder_ids: [...ex.variant_ladder_ids, e.target.value] });
                    }
                    setOpenLadder(false);
                  }}
                  onBlur={() => setOpenLadder(false)}
                >
                  <option value="">Select ladder…</option>
                  {ladders
                    .filter((l) => !ex.variant_ladder_ids.includes(l.id))
                    .map((l) => (
                      <option key={l.id} value={l.id}>
                        {l.name}
                      </option>
                    ))}
                </select>
              ) : (
                <button
                  onClick={() => setOpenLadder(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add to Ladder
                </button>
              )}
            </div>
          </Card>

          {/* Exercise Variants */}
          <Card>
            <SectionLabel>
              Exercise Variants{" "}
              <span className="ml-1 text-xs text-muted-foreground">{ex.variants.length}</span>
            </SectionLabel>
            <div className="mt-2 space-y-2">
              {ex.variants
                .slice()
                .sort((a, b) => a.sort_order - b.sort_order)
                .map((variant, index) => {
                  const target = exercises.find((item) => item.id === variant.to_exercise_id);

                  return (
                    <div
                      key={`${variant.to_exercise_id}-${index}`}
                      className="rounded-md border border-border p-2 text-sm"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="font-medium">{target?.name ?? "Unknown exercise"}</div>
                          <div className="text-xs text-muted-foreground">
                            {variant.variant_type}
                          </div>
                        </div>
                        <button
                          onClick={() =>
                            patch({
                              variants: ex.variants
                                .filter((_, itemIndex) => itemIndex !== index)
                                .map((item, itemIndex) => ({
                                  ...item,
                                  sort_order: itemIndex + 1,
                                })),
                            })
                          }
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-[120px_1fr] gap-2">
                        <select
                          value={variant.variant_type}
                          onChange={(event) =>
                            patch({
                              variants: ex.variants.map((item, itemIndex) =>
                                itemIndex === index
                                  ? {
                                      ...item,
                                      variant_type: event.target.value as ExerciseVariantType,
                                    }
                                  : item,
                              ),
                            })
                          }
                          className="rounded-md border border-border bg-card px-2 py-1 text-xs"
                        >
                          <option value="progression">Progression</option>
                          <option value="regression">Regression</option>
                          <option value="alternative">Alternative</option>
                          <option value="related">Related</option>
                        </select>
                        <input
                          value={variant.notes ?? ""}
                          onChange={(event) =>
                            patch({
                              variants: ex.variants.map((item, itemIndex) =>
                                itemIndex === index ? { ...item, notes: event.target.value } : item,
                              ),
                            })
                          }
                          placeholder="Editor notes"
                          className="rounded-md border border-border bg-card px-2 py-1 text-xs outline-none focus:border-ring"
                        />
                      </div>
                    </div>
                  );
                })}
              {openVariant ? (
                <div className="space-y-2 rounded-md border border-dashed border-border p-2">
                  <select
                    value={newVariantType}
                    onChange={(event) =>
                      setNewVariantType(event.target.value as ExerciseVariantType)
                    }
                    className={selectCls}
                  >
                    <option value="progression">Progression</option>
                    <option value="regression">Regression</option>
                    <option value="alternative">Alternative</option>
                    <option value="related">Related</option>
                  </select>
                  <select
                    autoFocus
                    className={selectCls}
                    defaultValue=""
                    onChange={(event) => {
                      if (event.target.value) {
                        patch({
                          variants: [
                            ...ex.variants,
                            {
                              to_exercise_id: event.target.value,
                              variant_type: newVariantType,
                              sort_order: ex.variants.length + 1,
                              notes: null,
                            },
                          ],
                        });
                      }
                      setOpenVariant(false);
                    }}
                    onBlur={() => setOpenVariant(false)}
                  >
                    <option value="">Select exercise…</option>
                    {exercises
                      .filter((item) => item.id !== ex.id)
                      .filter(
                        (item) =>
                          !ex.variants.some((variant) => variant.to_exercise_id === item.id),
                      )
                      .map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                  </select>
                </div>
              ) : (
                <button
                  onClick={() => setOpenVariant(true)}
                  className="flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Plus className="h-3 w-3" /> Add Variant
                </button>
              )}
            </div>
          </Card>
        </div>
      </div>

      <div className="mt-6 text-right text-xs text-muted-foreground">
        Updated {new Date(ex.updated_at).toLocaleString()} · Purpose:{" "}
        {getPurpose(ex.exercise_purpose_id ?? "")?.name ?? "—"}
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring";
const selectCls =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring";

function Card({ children }: { children: React.ReactNode }) {
  return <div className="rounded-lg border border-border bg-card p-5">{children}</div>;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="mb-1 text-xs font-medium">{label}</div>
      {children}
    </div>
  );
}

function RelField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <div className="mb-1 text-xs font-medium">{label}</div>
      {children}
    </div>
  );
}

function LevelSelect({
  value,
  onChange,
  compact,
}: {
  value: Level;
  onChange: (v: Level) => void;
  compact?: boolean;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value as Level)}
      className={compact ? "rounded-md border border-border bg-card px-2 py-1 text-xs" : selectCls}
    >
      <option value="none">None</option>
      <option value="low">Low</option>
      <option value="moderate">Moderate</option>
      <option value="high">High</option>
    </select>
  );
}
