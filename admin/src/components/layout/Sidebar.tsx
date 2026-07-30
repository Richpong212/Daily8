import { NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutGrid,
  Dumbbell,
  CalendarDays,
  Database,
  Image as ImageIcon,
  ChevronDown,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

const primaryNav = [
  { to: "/", label: "Dashboard", icon: LayoutGrid, end: true },
  { to: "/exercises", label: "Exercises", icon: Dumbbell },
  { to: "/workouts", label: "Workouts", icon: CalendarDays },
];

const supportingSub = [
  { to: "/supporting-data/movement-families", label: "Movement Families" },
  { to: "/supporting-data/body-regions", label: "Body Regions" },
  { to: "/supporting-data/exercise-benefits", label: "Exercise Benefits" },
  { to: "/supporting-data/muscles", label: "Muscles" },
  { to: "/supporting-data/equipment", label: "Equipment" },
  { to: "/supporting-data/constraints", label: "Constraints" },
  { to: "/supporting-data/variant-ladders", label: "Variant Ladders" },
];

export function Sidebar() {
  const location = useLocation();
  const [open, setOpen] = useState(location.pathname.startsWith("/supporting-data"));

  return (
    <aside className="flex h-screen w-64 flex-col bg-sidebar text-sidebar-foreground">
      <div className="flex items-center gap-3 px-5 py-5">
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
          <Activity className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold">Daily 8</div>
          <div className="font-mono text-[10px] uppercase tracking-wider text-sidebar-foreground/60">
            CMS v1
          </div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {primaryNav.map((item) => (
          <NavItem
            key={item.to}
            to={item.to}
            icon={<item.icon className="h-4 w-4" />}
            label={item.label}
            end={item.end}
          />
        ))}

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm transition",
            location.pathname.startsWith("/supporting-data")
              ? "bg-sidebar-primary text-sidebar-primary-foreground"
              : "text-sidebar-foreground/85 hover:bg-sidebar-accent",
          )}
        >
          <Database className="h-4 w-4" />
          <span className="flex-1 text-left">Supporting Data</span>
          <ChevronDown className={cn("h-4 w-4 transition", open ? "rotate-180" : "")} />
        </button>
        {open && (
          <div className="ml-8 mt-1 space-y-1 border-l border-sidebar-border pl-3">
            {supportingSub.map((s) => (
              <NavLink
                key={s.to}
                to={s.to}
                className={({ isActive }) =>
                  cn(
                    "block rounded px-2 py-1.5 text-xs transition",
                    isActive
                      ? "text-sidebar-primary-foreground"
                      : "text-sidebar-foreground/60 hover:text-sidebar-foreground",
                  )
                }
              >
                {s.label}
              </NavLink>
            ))}
          </div>
        )}

        <NavItem to="/media" icon={<ImageIcon className="h-4 w-4" />} label="Media" />
      </nav>

      <div className="border-t border-sidebar-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sidebar-accent text-xs font-semibold">
            JM
          </div>
          <div className="leading-tight">
            <div className="text-sm">Jamie M.</div>
            <div className="text-[10px] text-sidebar-foreground/60">Content Editor</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  to,
  icon,
  label,
  end,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
          isActive
            ? "bg-sidebar-primary text-sidebar-primary-foreground"
            : "text-sidebar-foreground/85 hover:bg-sidebar-accent",
        )
      }
    >
      {icon}
      <span>{label}</span>
    </NavLink>
  );
}
