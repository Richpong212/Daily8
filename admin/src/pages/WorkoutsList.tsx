import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import {
  createWorkout,
  estimateWorkoutSeconds,
  totalSlots,
  useWorkouts,
} from "@/services/workouts";
import { StatusBadge } from "@/components/StatusBadge";

export default function WorkoutsList() {
  const workouts = useWorkouts();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [userType, setUserType] = useState("all");
  const nav = useNavigate();

  const filtered = useMemo(
    () =>
      workouts.filter((w) => {
        if (q && !w.name.toLowerCase().includes(q.toLowerCase())) return false;
        if (status !== "all" && w.status !== status) return false;
        if (difficulty !== "all" && w.difficulty_band !== difficulty) return false;
        if (userType === "new" && !w.is_new_user_friendly) return false;
        return true;
      }),
    [workouts, q, status, difficulty, userType],
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Content Library
          </div>
          <h1 className="mt-1 text-3xl font-bold">Workouts</h1>
        </div>
        <button
          onClick={() => {
            const w = createWorkout();
            nav(`/workouts/${w.id}`);
          }}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Workout
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search workouts..."
            className="w-full rounded-md border border-border bg-card px-9 py-2 text-sm outline-none focus:border-ring"
          />
        </div>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="draft">Draft</option>
          <option value="retired">Retired</option>
        </select>
        <select
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">Any Difficulty</option>
          <option value="gentle">Gentle</option>
          <option value="standard">Standard</option>
          <option value="challenging">Challenging</option>
        </select>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">Any User Type</option>
          <option value="new">New User Friendly</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-12 gap-4 border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-5">Name</div>
          <div className="col-span-2">Difficulty</div>
          <div className="col-span-2">Groups</div>
          <div className="col-span-1">Status</div>
          <div className="col-span-1">Updated</div>
          <div className="col-span-1 text-right">Version</div>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No workouts match your filters.
          </div>
        )}
        {filtered.map((w) => (
          <Link
            key={w.id}
            to={`/workouts/${w.id}`}
            className="grid grid-cols-12 items-center gap-4 border-b border-border px-5 py-4 transition last:border-0 hover:bg-muted/50"
          >
            <div className="col-span-5">
              <div className="font-semibold">{w.name}</div>
              <div className="mt-1 flex items-center gap-2">
                {w.is_new_user_friendly && (
                  <span className="rounded bg-success px-1.5 py-0.5 text-[10px] font-medium text-success-foreground">
                    New User Friendly
                  </span>
                )}
                <span className="text-xs text-muted-foreground">{w.description}</span>
              </div>
            </div>
            <div className="col-span-2 text-sm capitalize">{w.difficulty_band}</div>
            <div className="col-span-2 text-sm text-muted-foreground">
              {w.groups.length} groups · {totalSlots(w)} slots · ~
              {Math.round(estimateWorkoutSeconds(w) / 60)}m
            </div>
            <div className="col-span-1">
              <StatusBadge status={w.status} />
            </div>
            <div className="col-span-1 font-mono text-xs text-muted-foreground">
              {new Date(w.updated_at).toISOString().slice(0, 10)}
            </div>
            <div className="col-span-1 text-right">
              <span className="rounded bg-muted px-2 py-0.5 font-mono text-xs">
                v{w.version_number}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
