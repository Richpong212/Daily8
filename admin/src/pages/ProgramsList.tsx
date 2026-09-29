import { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Search } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { createWorkoutProgramDraft, useWorkoutPrograms } from "@/services/workout-programs";

export default function ProgramsList() {
  const programs = useWorkoutPrograms();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(
    () =>
      programs.filter(
        (program) =>
          (!query || program.name.toLowerCase().includes(query.toLowerCase())) &&
          (status === "all" || program.status === status),
      ),
    [programs, query, status],
  );

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Curated Journeys
          </div>
          <h1 className="mt-1 text-3xl font-bold">Programs</h1>
        </div>
        <button
          type="button"
          onClick={() => navigate(`/programs/${createWorkoutProgramDraft().id}`)}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          New Program
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search programs..."
            className="w-full rounded-md border border-border bg-card px-9 py-2 text-sm outline-none focus:border-ring"
          />
        </div>
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-md border border-border bg-card px-3 py-2 text-sm"
        >
          <option value="all">All Statuses</option>
          <option value="draft">Draft</option>
          <option value="active">Active</option>
          <option value="retired">Retired</option>
        </select>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border bg-card">
        <div className="grid min-w-[640px] grid-cols-12 gap-4 border-b border-border px-5 py-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          <div className="col-span-7">Name</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2">Workouts</div>
          <div className="col-span-1 text-right">Version</div>
        </div>
        {filtered.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No programs found.</div>
        )}
        {filtered.map((program) => (
          <Link
            key={program.id}
            to={`/programs/${program.id}`}
            className="grid min-w-[640px] grid-cols-12 items-center gap-4 border-b border-border px-5 py-4 transition last:border-0 hover:bg-muted/50"
          >
            <div className="col-span-7 font-semibold">{program.name}</div>
            <div className="col-span-2">
              <StatusBadge status={program.status} />
            </div>
            <div className="col-span-2 text-sm text-muted-foreground">
              {program.workout_count} workout{program.workout_count === 1 ? "" : "s"}
            </div>
            <div className="col-span-1 text-right font-mono text-xs">v{program.version_number}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
