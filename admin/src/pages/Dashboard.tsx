import { useExercises } from "@/services/exercises";
import { AlertTriangle } from "lucide-react";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const exercises = useExercises();
  const total = exercises.length;
  const active = exercises.filter((e) => e.status === "active").length;
  const draft = exercises.filter((e) => e.status === "draft").length;
  const needsReview = exercises.filter((e) => e.review_status === "needs_review").length;

  const today = new Date().toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const needsReviewList = exercises.filter((e) => e.review_status === "needs_review").slice(0, 5);

  return (
    <div>
      <div className="mb-6">
        <h1 className="mt-1 text-3xl font-bold">Dashboard</h1>
        <div className="mt-1 text-sm text-muted-foreground">{today}</div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Stat label="Total Exercises" value={total} />
        <Stat label="Active" value={active} />
        <Stat label="Draft" value={draft} />
        <Stat label="Needs Review" value={needsReview} />
      </div>

      {needsReview > 0 && (
        <div className="mt-6 rounded-lg border border-warning-foreground/30 bg-warning/40 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 text-warning-foreground" />
            <div className="text-sm">
              <div className="font-semibold text-warning-foreground">
                {needsReview} exercise{needsReview === 1 ? "" : "s"} need review
              </div>
              <div className="mt-0.5 text-warning-foreground/80">
                {needsReviewList.map((e) => e.name).join(", ")} {needsReviewList.length < needsReview ? "and others" : ""} are awaiting editorial review.
              </div>
              <Link
                to="/exercises?filter=needs_review"
                className="mt-2 inline-block text-sm font-semibold text-warning-foreground underline underline-offset-2"
              >
                Review now
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5">
      <div className="text-3xl font-bold">{value}</div>
      <div className="mt-2 text-xs text-muted-foreground">{label}</div>
    </div>
  );
}
