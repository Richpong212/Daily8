import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Archive, Copy, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react";
import { createExerciseDraft, useExercises } from "@/services/exercises";
import { useWorkouts } from "@/services/workouts";
import { useMovementFamilies, getBodyRegion, getMovementFamily } from "@/services/supporting-data";
import { StatusBadge, ReviewStatusIndicator } from "@/components/StatusBadge";
import { ExerciseTile } from "@/components/ExerciseTile";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Exercise, Workout } from "@/types";

export default function ExercisesList() {
  const exercises = useExercises();
  const workouts = useWorkouts();
  const families = useMovementFamilies();
  const [params] = useSearchParams();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<string>("all");
  const [family, setFamily] = useState<string>("all");
  const [review, setReview] = useState<string>(
    params.get("filter") === "needs_review" ? "needs_review" : "all",
  );
  const navigate = useNavigate();

  const filtered = useMemo(() => {
    return exercises.filter((e) => {
      if (q && !e.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (status !== "all" && e.status !== status) return false;
      if (family !== "all" && e.movement_family_id !== family) return false;
      if (review !== "all" && e.review_status !== review) return false;
      return true;
    });
  }, [exercises, q, status, family, review]);

  const usageCounts = useMemo(() => getExerciseUsageCounts(workouts), [workouts]);

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">Exercises</h1>
          <div className="mt-1 text-sm text-muted-foreground">{exercises.length} exercises</div>
        </div>
        <button
          onClick={() => {
            const ex = createExerciseDraft();
            navigate(`/exercises/${ex.id}`);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Exercise
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search exercises..."
            className={controlCls + " w-full px-9"}
          />
        </div>
        <Select value={family} onChange={setFamily}>
          <option value="all">All Movement Families</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </Select>
        <Select value={status} onChange={setStatus}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="retired">Retired</option>
        </Select>
        <Select value={review} onChange={setReview}>
          <option value="all">All Review Statuses</option>
          <option value="draft">Draft</option>
          <option value="needs_review">Needs Review</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved">Approved</option>
        </Select>
      </div>

      <div className="divide-y divide-border rounded-lg border border-border bg-card">
        <div className="px-4 py-2.5 text-xs text-muted-foreground">
          {filtered.length} of {exercises.length} exercises
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No exercises match your filters.
          </div>
        )}
        {filtered.map((e) => {
          const family = getMovementFamily(e.movement_family_id);
          const region = getBodyRegion(e.body_region_id);
          const familyColor = family?.color ?? e.color;
          const primaryImage = getPrimaryExerciseImage(e);
          const usageCount = usageCounts.get(e.id) ?? 0;
          return (
            <div
              key={e.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/exercises/${e.id}`)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  navigate(`/exercises/${e.id}`);
                }
              }}
              className="flex cursor-pointer items-center gap-4 p-4 transition hover:bg-muted/50 focus:bg-muted/50 focus:outline-none"
            >
              <ExerciseTile name={e.name} color={familyColor} imageUrl={primaryImage} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="truncate font-semibold">{e.name}</div>
                <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
                  <span>{family?.name ?? "No family"}</span>
                  <span aria-hidden="true">•</span>
                  <span>{region?.name ?? "No region"}</span>
                  <span aria-hidden="true">•</span>
                  <span>
                    {usageCount} workout{usageCount === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
              <div className="flex w-24 justify-start">
                <StatusBadge status={e.status} />
              </div>
              <div className="w-36">
                <ReviewStatusIndicator status={e.review_status} />
              </div>
              <div className="w-28 text-right text-xs text-muted-foreground">
                {formatUpdatedDate(e.updated_at)}
              </div>
              <div onClick={(event) => event.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      aria-label={`Actions for ${e.name}`}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem disabled>
                      <Copy className="h-4 w-4" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled>
                      <Archive className="h-4 w-4" />
                      Archive
                    </DropdownMenuItem>
                    <DropdownMenuItem disabled className="text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const controlCls =
  "h-10 rounded-md border border-border bg-card text-sm outline-none focus:border-ring";

function Select({
  value,
  onChange,
  children,
}: {
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={controlCls + " px-3"}
    >
      {children}
    </select>
  );
}

const getExerciseUsageCounts = (workouts: Workout[]) => {
  const counts = new Map<string, number>();

  for (const workout of workouts) {
    const exerciseIds = new Set<string>();
    workout.groups.forEach((group) => {
      group.slots.forEach((slot) => exerciseIds.add(slot.exercise_id));
    });
    exerciseIds.forEach((exerciseId) => {
      counts.set(exerciseId, (counts.get(exerciseId) ?? 0) + 1);
    });
  }

  return counts;
};

const getPrimaryExerciseImage = (exercise: Exercise) => {
  const image =
    exercise.media.find((item) => item.media_type === "image" && item.is_primary) ??
    exercise.media.find((item) => item.media_type === "image");

  return image?.url;
};

const formatUpdatedDate = (value: string) => {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};
