import { cn } from "@/lib/utils";

export function ExerciseTile({
  name,
  color,
  size = "md",
}: {
  name: string;
  color: string;
  size?: "sm" | "md" | "lg";
}) {
  const letter = name.charAt(0).toUpperCase();
  const sizes = {
    sm: "h-8 w-8 text-xs rounded",
    md: "h-10 w-10 text-sm rounded-md",
    lg: "h-20 w-20 text-2xl rounded-lg",
  };
  return (
    <div
      className={cn("flex items-center justify-center font-semibold text-white", sizes[size])}
      style={{ backgroundColor: color }}
    >
      {letter}
    </div>
  );
}
