import { Link, useNavigate, useParams } from "react-router-dom";
import { ChevronLeft, ChevronDown, ChevronUp, GripVertical, Plus, Trash2, X } from "lucide-react";
import {
  addGroup,
  addSlot,
  deleteWorkout,
  deleteGroup,
  deleteSlot,
  estimateWorkoutSeconds,
  moveGroup,
  publishWorkout,
  saveWorkoutDraft,
  totalSlots,
  updateGroup,
  updateSlot,
  updateWorkout,
  useWorkout,
} from "@/services/workouts";
import { useExercises } from "@/services/exercises";
import { useExercisePurposes, getBodyRegion, getMovementFamily } from "@/services/supporting-data";
import { StatusBadge } from "@/components/StatusBadge";
import { ExerciseTile } from "@/components/ExerciseTile";
import { getExercise } from "@/services/exercises";
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

export default function WorkoutEditor() {
  const { id } = useParams();
  const w = useWorkout(id);
  const purposes = useExercisePurposes();
  const exercises = useExercises();
  const nav = useNavigate();

  if (!w) {
    return (
      <div>
        <Link to="/workouts" className="text-sm text-muted-foreground hover:underline">
          ← Back to Workouts
        </Link>
        <div className="mt-6">Workout not found.</div>
      </div>
    );
  }

  const durationMin = Math.round(estimateWorkoutSeconds(w) / 60);

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/workouts"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Workouts
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="text-sm font-medium">{w.name}</span>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
            v{w.version_number}
          </span>
          <StatusBadge status={w.status} />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">~{durationMin}m</span>
          <button
            onClick={async () => {
              const saved = await saveWorkoutDraft(w.id);
              if (w.id === "new") nav(`/workouts/${saved.id}`, { replace: true });
            }}
            className="rounded-md border border-border bg-card px-3 py-1.5 text-sm hover:bg-muted"
          >
            Save Draft
          </button>
          <button
            onClick={async () => {
              const saved = await publishWorkout(w.id);
              if (w.id === "new" && saved) nav(`/workouts/${saved.id}`, { replace: true });
            }}
            className="rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
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
                <AlertDialogTitle>Delete workout?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove draft workouts. Published workouts are retired instead.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  onClick={() => {
                    void deleteWorkout(w.id);
                    nav("/workouts");
                  }}
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <div className="grid grid-cols-[300px_1fr] gap-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-5">
            <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Workout Settings
            </div>
            <div className="mt-4">
              <div className="mb-1 text-xs font-medium">Name</div>
              <input
                value={w.name}
                onChange={(e) => updateWorkout(w.id, { name: e.target.value })}
                className={inputCls}
              />
            </div>
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium">Description</div>
              <textarea
                value={w.description}
                onChange={(e) => updateWorkout(w.id, { description: e.target.value })}
                rows={3}
                className={inputCls}
              />
            </div>
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium">Transition (s)</div>
              <input
                type="number"
                value={w.transition_seconds}
                onChange={(e) =>
                  updateWorkout(w.id, { transition_seconds: Number(e.target.value) || 0 })
                }
                className={inputCls}
              />
            </div>
            <div className="mt-3">
              <div className="mb-1 text-xs font-medium">Difficulty</div>
              <select
                value={w.difficulty_band}
                onChange={(e) =>
                  updateWorkout(w.id, {
                    difficulty_band: e.target.value as typeof w.difficulty_band,
                  })
                }
                className={inputCls}
              >
                <option value="gentle">Gentle</option>
                <option value="standard">Standard</option>
                <option value="challenging">Challenging</option>
              </select>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={w.is_new_user_friendly}
                onChange={(e) => updateWorkout(w.id, { is_new_user_friendly: e.target.checked })}
              />
              New user friendly
            </label>
            <div className="mt-4 border-t border-border pt-3 text-xs text-muted-foreground">
              <div className="flex justify-between py-0.5">
                <span>Groups</span>
                <span>{w.groups.length}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Total slots</span>
                <span>{totalSlots(w)}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span>Est. duration</span>
                <span>~{durationMin}m</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          {w.groups.map((g, gi) => (
            <div
              key={g.id}
              className="overflow-hidden rounded-lg border border-border bg-card"
              style={{ borderLeft: `4px solid ${g.color}` }}
            >
              <div className="flex items-center justify-between px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: g.color }} />
                  <input
                    value={g.name}
                    onChange={(e) => updateGroup(w.id, g.id, { name: e.target.value })}
                    className="border-none bg-transparent text-sm font-semibold outline-none"
                  />
                  <span className="text-xs text-muted-foreground">
                    {g.slots.length} exercise{g.slots.length === 1 ? "" : "s"}
                  </span>
                  {g.repeat_count > 1 && (
                    <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                      x{g.repeat_count}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveGroup(w.id, g.id, -1)}
                    disabled={gi === 0}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => moveGroup(w.id, g.id, 1)}
                    disabled={gi === w.groups.length - 1}
                    className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Repeat</span>
                    <input
                      type="number"
                      min={1}
                      value={g.repeat_count}
                      onChange={(e) =>
                        updateGroup(w.id, g.id, {
                          repeat_count: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-14 rounded border border-border bg-card px-2 py-0.5 text-xs"
                    />
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <button className="p-1 text-muted-foreground hover:text-destructive">
                        <X className="h-4 w-4" />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Remove group?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will remove {g.name || "this group"} and its workout slots.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          onClick={() => deleteGroup(w.id, g.id)}
                        >
                          Remove
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>

              <div className="border-t border-border">
                {g.slots.map((s) => {
                  const ex = getExercise(s.exercise_id);
                  return (
                    <div
                      key={s.id}
                      className="flex items-center gap-3 border-b border-border px-4 py-2.5 last:border-0"
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground/50" />
                      <ExerciseTile name={ex?.name ?? "?"} color={ex?.color ?? "#666"} size="sm" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{ex?.name ?? "Missing exercise"}</div>
                        <div className="text-xs text-muted-foreground">
                          {ex
                            ? `${getMovementFamily(ex.movement_family_id)?.name} · ${getBodyRegion(ex.body_region_id)?.name}`
                            : ""}
                        </div>
                      </div>
                      <select
                        value={s.exercise_purpose_id ?? ""}
                        onChange={(e) =>
                          updateSlot(w.id, g.id, s.id, {
                            exercise_purpose_id: e.target.value || null,
                          })
                        }
                        className="rounded-md border border-border bg-card px-2 py-1 text-xs"
                      >
                        <option value="">— Purpose —</option>
                        {purposes.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          value={s.duration_seconds}
                          onChange={(e) =>
                            updateSlot(w.id, g.id, s.id, {
                              duration_seconds: Math.max(1, Number(e.target.value) || 1),
                            })
                          }
                          className="w-14 rounded border border-border bg-card px-2 py-1 text-xs"
                        />
                        <span className="text-xs text-muted-foreground">s</span>
                      </div>
                      <button
                        onClick={() => deleteSlot(w.id, g.id, s.id)}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}

                <div className="border-t border-dashed border-border px-4 py-2.5">
                  <select
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        const ex = getExercise(e.target.value);
                        addSlot(w.id, g.id, e.target.value, ex?.exercise_purpose_id ?? null);
                      }
                    }}
                    className="w-full rounded border border-dashed border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
                  >
                    <option value="">+ Add Exercise</option>
                    {exercises
                      .filter((x) => x.status !== "retired")
                      .map((x) => (
                        <option key={x.id} value={x.id}>
                          {x.name}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={() => addGroup(w.id)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-4 text-sm text-muted-foreground hover:bg-muted"
          >
            <Plus className="h-4 w-4" /> Add Group
          </button>
        </div>
      </div>
    </div>
  );
}

const inputCls =
  "w-full rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring";
