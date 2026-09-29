import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CopyPlus,
  GripVertical,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import {
  createWorkoutProgramVersion,
  replaceWorkoutProgramItems,
  saveWorkoutProgram,
  updateWorkoutProgramDraft,
  useWorkoutProgram,
} from "@/services/workout-programs";
import { useWorkouts } from "@/services/workouts";
import type { Status } from "@/types";

const fieldClass =
  "w-full rounded-md border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring disabled:cursor-not-allowed disabled:opacity-60";

export default function ProgramEditor() {
  const { id } = useParams();
  const program = useWorkoutProgram(id);
  const workouts = useWorkouts();
  const navigate = useNavigate();
  const [selectedWorkoutId, setSelectedWorkoutId] = useState("");

  if (!program) {
    return (
      <div>
        <Link to="/programs" className="text-sm text-muted-foreground hover:underline">
          Back to Programs
        </Link>
        <div className="mt-6">Program not found.</div>
      </div>
    );
  }

  const locked = program.is_locked;
  const moveItem = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= program.items.length) return;
    const items = [...program.items];
    [items[index], items[target]] = [items[target], items[index]];
    replaceWorkoutProgramItems(program.id, items);
  };

  return (
    <div>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <Link
            to="/programs"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Programs
          </Link>
          <span className="text-muted-foreground">/</span>
          <span className="truncate text-sm font-medium">{program.name}</span>
          <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
            v{program.version_number}
          </span>
          <StatusBadge status={program.status} />
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {program.id !== "new" && (
            <button
              type="button"
              onClick={() => {
                void createWorkoutProgramVersion(program.id).then((version) =>
                  navigate(`/programs/${version.id}`),
                );
              }}
              className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm hover:bg-muted"
            >
              <CopyPlus className="h-4 w-4" />
              Create new version
            </button>
          )}
          <button
            type="button"
            disabled={locked}
            onClick={() => {
              void saveWorkoutProgram(program.id).then((saved) => {
                if (program.id === "new") navigate(`/programs/${saved.id}`, { replace: true });
              });
            }}
            className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save Program
          </button>
        </div>
      </div>

      {locked && (
        <div className="mb-5 flex items-start gap-3 border-l-4 border-amber-500 bg-amber-500/10 px-4 py-3 text-sm">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">This program version is locked</div>
            <div className="text-muted-foreground">
              {program.enrollment_count} enrolled user
              {program.enrollment_count === 1 ? " is" : "s are"} following this journey. Create a
              new version to make changes for future users.
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
        <section className="border-b border-border pb-6 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          <h2 className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Program Settings
          </h2>
          <label className="mt-4 block text-xs font-medium">
            Name
            <input
              value={program.name}
              disabled={locked}
              onChange={(event) =>
                updateWorkoutProgramDraft(program.id, { name: event.target.value })
              }
              className={`${fieldClass} mt-1`}
            />
          </label>
          <label className="mt-4 block text-xs font-medium">
            Status
            <select
              value={program.status}
              disabled={locked}
              onChange={(event) =>
                updateWorkoutProgramDraft(program.id, {
                  status: event.target.value as Status,
                })
              }
              className={`${fieldClass} mt-1`}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="retired">Retired</option>
            </select>
          </label>
          <label className="mt-4 block text-xs font-medium">
            Notes
            <textarea
              value={program.notes ?? ""}
              disabled={locked}
              rows={6}
              onChange={(event) =>
                updateWorkoutProgramDraft(program.id, { notes: event.target.value })
              }
              className={`${fieldClass} mt-1 resize-y`}
            />
          </label>
        </section>

        <section>
          <div className="mb-4 flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
            <div>
              <h1 className="text-xl font-semibold">Workout Journey</h1>
              <div className="mt-1 text-sm text-muted-foreground">
                {program.items.length} workout{program.items.length === 1 ? "" : "s"}
              </div>
            </div>
            {!locked && (
              <div className="flex w-full items-center gap-2 xl:w-auto">
                <select
                  value={selectedWorkoutId}
                  onChange={(event) => setSelectedWorkoutId(event.target.value)}
                  className="min-w-0 flex-1 rounded-md border border-border bg-card px-3 py-2 text-sm xl:min-w-64"
                >
                  <option value="">Select a workout...</option>
                  {workouts.map((workout) => (
                    <option key={workout.id} value={workout.id}>
                      {workout.name} (v{workout.version_number})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  title="Add workout"
                  disabled={!selectedWorkoutId}
                  onClick={() => {
                    if (!selectedWorkoutId) return;
                    replaceWorkoutProgramItems(program.id, [
                      ...program.items,
                      {
                        workout_id: selectedWorkoutId,
                        program_order: program.items.length + 1,
                        notes: null,
                      },
                    ]);
                    setSelectedWorkoutId("");
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>

          <div className="border-y border-border">
            {program.items.length === 0 && (
              <div className="py-12 text-center text-sm text-muted-foreground">
                No workouts in this program yet.
              </div>
            )}
            {program.items.map((item, index) => {
              const workout = workouts.find((candidate) => candidate.id === item.workout_id);
              const name = item.workout?.name ?? workout?.name ?? "Unavailable workout";
              const version = item.workout?.version_number ?? workout?.version_number;

              return (
                <div
                  key={item.id ?? `${item.workout_id}-${index}`}
                  className="grid grid-cols-[28px_minmax(0,1fr)_104px] items-center gap-3 border-b border-border py-3 last:border-b-0 md:grid-cols-[32px_minmax(180px,1fr)_minmax(220px,1.5fr)_104px]"
                >
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <GripVertical className="h-4 w-4" />
                    <span className="font-mono text-xs">{index + 1}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{name}</div>
                    {version && (
                      <div className="text-xs text-muted-foreground">Version {version}</div>
                    )}
                  </div>
                  <input
                    value={item.notes ?? ""}
                    disabled={locked}
                    placeholder="Optional item notes"
                    onChange={(event) =>
                      replaceWorkoutProgramItems(
                        program.id,
                        program.items.map((candidate, itemIndex) =>
                          itemIndex === index
                            ? { ...candidate, notes: event.target.value }
                            : candidate,
                        ),
                      )
                    }
                    className={`${fieldClass} col-span-2 col-start-2 md:col-span-1 md:col-start-auto`}
                  />
                  <div className="flex justify-end gap-1">
                    <button
                      type="button"
                      title="Move up"
                      disabled={locked || index === 0}
                      onClick={() => moveItem(index, -1)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Move down"
                      disabled={locked || index === program.items.length - 1}
                      onClick={() => moveItem(index, 1)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-30"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      title="Remove workout"
                      disabled={locked}
                      onClick={() =>
                        replaceWorkoutProgramItems(
                          program.id,
                          program.items.filter((_, itemIndex) => itemIndex !== index),
                        )
                      }
                      className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
