import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { createExerciseDraft, useExercises } from "@/services/exercises";
import {
  useMovementFamilies,
  useBodyRegions,
  getBodyRegion,
  getMovementFamily,
} from "@/services/supporting-data";
import { StatusBadge, ReviewBadge } from "@/components/StatusBadge";
import { ExerciseTile } from "@/components/ExerciseTile";
import { useNavigate } from "react-router-dom";

export default function ExercisesList() {
  const exercises = useExercises();
  const families = useMovementFamilies();
  const bodyRegions = useBodyRegions();
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

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Content Library
          </div>
          <h1 className="mt-1 text-3xl font-bold">Exercises</h1>
          <div className="mt-1 text-sm text-muted-foreground">
            {exercises.length} exercises in library
          </div>
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
            className="w-full rounded-md border border-border bg-card px-9 py-2 text-sm outline-none focus:border-ring"
          />
        </div>
        <Select value={status} onChange={setStatus}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="retired">Retired</option>
        </Select>
        <Select value={family} onChange={setFamily}>
          <option value="all">All Families</option>
          {families.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
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
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No exercises match your filters.
          </div>
        )}
        {filtered.map((e) => {
          const family = getMovementFamily(e.movement_family_id);
          const region = getBodyRegion(e.body_region_id);
          return (
            <Link
              key={e.id}
              to={`/exercises/${e.id}`}
              className="flex items-center gap-4 p-4 transition hover:bg-muted/50"
            >
              <ExerciseTile name={e.name} color={e.color} />
              <div className="flex-1">
                <div className="font-semibold">{e.name}</div>
                <div className="text-xs text-muted-foreground">
                  {family?.name} · {region?.name}
                </div>
              </div>
              <StatusBadge status={e.status} />
              <ReviewBadge status={e.review_status} />
              <div className="font-mono text-xs text-muted-foreground w-24 text-right">
                {new Date(e.updated_at).toISOString().slice(0, 10)}
              </div>
            </Link>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-muted-foreground">
        {bodyRegions.length} body regions available
      </div>
    </div>
  );
}

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
      className="rounded-md border border-border bg-card px-3 py-2 text-sm outline-none focus:border-ring"
    >
      {children}
    </select>
  );
}
