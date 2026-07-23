import { Image as ImageIcon } from "lucide-react";
import { useExercises } from "@/services/exercises";
import { ExerciseTile } from "@/components/ExerciseTile";

export default function Media() {
  const exercises = useExercises();

  return (
    <div>
      <div className="mb-6">
        <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">Library</div>
        <h1 className="mt-1 text-3xl font-bold">Media</h1>
        <div className="mt-1 text-sm text-muted-foreground">
          Images, videos and external references associated with exercises.
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {exercises.map((e) => (
          <div key={e.id} className="rounded-lg border border-border bg-card p-4">
            <div className="flex aspect-video items-center justify-center rounded-md bg-muted">
              {e.media.length > 0 ? (
                <span className="text-xs text-muted-foreground">{e.media.length} media items</span>
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                  <span className="text-xs">No media</span>
                </div>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              <ExerciseTile name={e.name} color={e.color} size="sm" />
              <div className="text-sm font-medium">{e.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
