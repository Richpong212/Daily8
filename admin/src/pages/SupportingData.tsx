import { NavLink, Outlet } from "react-router-dom";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useState } from "react";
import {
  useMovementFamilies,
  useBodyRegions,
  useExercisePurposes,
  useMuscles,
  useEquipment,
  useConstraints,
  useVariantLadders,
  createMovementFamily,
  updateMovementFamily,
  deleteMovementFamily,
  createBodyRegion,
  updateBodyRegion,
  deleteBodyRegion,
  createPurpose,
  updatePurpose,
  deletePurpose,
  createMuscle,
  updateMuscle,
  deleteMuscle,
  createEquipment,
  updateEquipment,
  deleteEquipment,
  createConstraint,
  updateConstraint,
  deleteConstraint,
  createVariantLadder,
  updateVariantLadder,
  deleteVariantLadder,
} from "@/services/supporting-data";
import { useExercises } from "@/services/exercises";
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

const TABS = [
  { to: "/supporting-data/movement-families", label: "Movement Families" },
  { to: "/supporting-data/body-regions", label: "Body Regions" },
  { to: "/supporting-data/exercise-purposes", label: "Exercise Purposes" },
  { to: "/supporting-data/muscles", label: "Muscles" },
  { to: "/supporting-data/equipment", label: "Equipment" },
  { to: "/supporting-data/constraints", label: "Constraints" },
  { to: "/supporting-data/variant-ladders", label: "Variant Ladders" },
];

export default function SupportingDataLayout() {
  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
            Reference Data
          </div>
          <h1 className="mt-1 text-3xl font-bold">Supporting Data</h1>
        </div>
      </div>

      <div className="mb-6 flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              `px-3 py-2 text-sm transition ${
                isActive
                  ? "border-b-2 border-primary font-medium text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`
            }
          >
            {t.label}
          </NavLink>
        ))}
      </div>

      <Outlet />
    </div>
  );
}

interface Row {
  id: string;
  name: string;
  slug?: string;
  description?: string;
}

function EditableTable<T extends Row>({
  columns,
  rows,
  onCreate,
  onUpdate,
  onDelete,
  createLabel = "Create New",
}: {
  columns: { key: keyof T | "actions"; label: string; width?: string; mono?: boolean }[];
  rows: T[];
  onCreate: () => void;
  onUpdate: (id: string, patch: Partial<T>) => void;
  onDelete: (id: string) => void;
  createLabel?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<T>>({});

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          onClick={onCreate}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          {createLabel}
        </button>
      </div>
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div className="grid grid-cols-[1.2fr_1fr_2fr_100px] gap-4 border-b border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {columns.map((c) => (
            <div key={String(c.key)} className={c.key === "actions" ? "text-right" : ""}>
              {c.label}
            </div>
          ))}
        </div>
        {rows.map((r) => {
          const isEditing = editingId === r.id;
          return (
            <div
              key={r.id}
              className="grid grid-cols-[1.2fr_1fr_2fr_100px] items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-muted/40"
            >
              <div>
                {isEditing ? (
                  <input
                    value={(draft.name as string) ?? r.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value as T["name"] })}
                    className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
                  />
                ) : (
                  <span className="font-medium">{r.name}</span>
                )}
              </div>
              <div className="font-mono text-xs text-muted-foreground">{r.slug}</div>
              <div className="text-sm text-muted-foreground">
                {isEditing ? (
                  <input
                    value={(draft.description as string) ?? r.description ?? ""}
                    onChange={(e) =>
                      setDraft({ ...draft, description: e.target.value as T["description"] })
                    }
                    className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
                  />
                ) : (
                  r.description
                )}
              </div>
              <div className="flex items-center justify-end gap-1">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => {
                        onUpdate(r.id, draft);
                        setEditingId(null);
                        setDraft({});
                      }}
                      className="rounded p-1 text-success-foreground hover:bg-success/40"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setDraft({});
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-muted"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => {
                        setEditingId(r.id);
                        setDraft({});
                      }}
                      className="rounded p-1 text-muted-foreground hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button className="rounded p-1 text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete item?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will remove {r.name || "this item"} from supporting data.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => void onDelete(r.id)}
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
                )}
              </div>
            </div>
          );
        })}
        {rows.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">No entries yet.</div>
        )}
      </div>
    </div>
  );
}

export function MovementFamiliesPage() {
  const rows = useMovementFamilies();
  return (
    <EditableTable
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "description", label: "Description" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      onCreate={() =>
        createMovementFamily({ name: "New Family", description: "", sort_order: rows.length + 1 })
      }
      onUpdate={updateMovementFamily}
      onDelete={deleteMovementFamily}
    />
  );
}

export function BodyRegionsPage() {
  const rows = useBodyRegions();
  return (
    <EditableTable
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "description", label: "Description" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      onCreate={() =>
        createBodyRegion({ name: "New Region", description: "", sort_order: rows.length + 1 })
      }
      onUpdate={updateBodyRegion}
      onDelete={deleteBodyRegion}
    />
  );
}

export function ExercisePurposesPage() {
  const rows = useExercisePurposes();
  return (
    <EditableTable
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "description", label: "Description" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      onCreate={() =>
        createPurpose({ name: "New Purpose", description: "", sort_order: rows.length + 1 })
      }
      onUpdate={updatePurpose}
      onDelete={deletePurpose}
    />
  );
}

export function MusclesPage() {
  const rows = useMuscles();
  const bodyRegions = useBodyRegions();
  return (
    <EditableTable
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "description", label: "Body Region" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows.map((m) => ({
        ...m,
        description: bodyRegions.find((region) => region.id === m.body_region_id)?.name ?? "",
      }))}
      onCreate={() =>
        createMuscle({ name: "New Muscle", body_region_id: bodyRegions[0]?.id ?? "" })
      }
      onUpdate={updateMuscle}
      onDelete={deleteMuscle}
    />
  );
}

export function EquipmentPage() {
  const rows = useEquipment();
  return (
    <EditableTable
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "description", label: "Description" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      onCreate={() =>
        createEquipment({ name: "New Equipment", description: "", sort_order: rows.length + 1 })
      }
      onUpdate={updateEquipment}
      onDelete={deleteEquipment}
    />
  );
}

export function ConstraintsPage() {
  const rows = useConstraints();
  return (
    <EditableTable
      columns={[
        { key: "name", label: "Name" },
        { key: "slug", label: "Slug" },
        { key: "description", label: "Description" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      onCreate={() =>
        createConstraint({
          name: "New Constraint",
          description: "",
          category: "body_area",
          sort_order: rows.length + 1,
        })
      }
      onUpdate={updateConstraint}
      onDelete={deleteConstraint}
    />
  );
}

export function VariantLaddersPage() {
  const rows = useVariantLadders();
  const exercises = useExercises();
  const movementFamilies = useMovementFamilies();
  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          onClick={() =>
            createVariantLadder({
              movement_family_id: movementFamilies[0]?.id ?? null,
              name: "New Ladder",
              description: "",
              status: "draft",
              items: [],
            })
          }
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90"
        >
          <Plus className="h-4 w-4" />
          Create New
        </button>
      </div>
      <div className="space-y-3">
        {rows.map((l) => (
          <div key={l.id} className="rounded-lg border border-border bg-card p-5">
            <div className="flex items-start justify-between">
              <div>
                <input
                  value={l.name}
                  onChange={(e) => updateVariantLadder(l.id, { name: e.target.value })}
                  className="border-none bg-transparent text-lg font-semibold outline-none"
                />
                <div className="font-mono text-xs text-muted-foreground">{l.slug}</div>
                <input
                  value={l.description}
                  onChange={(e) => updateVariantLadder(l.id, { description: e.target.value })}
                  className="mt-1 w-full border-none bg-transparent text-sm text-muted-foreground outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={l.status}
                  onChange={(e) =>
                    updateVariantLadder(l.id, { status: e.target.value as typeof l.status })
                  }
                  className="rounded border border-border bg-card px-2 py-1 text-xs"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                </select>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <button className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete ladder?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove {l.name || "this ladder"} and its ordered exercise items.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        onClick={() => void deleteVariantLadder(l.id)}
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <div className="mt-4 space-y-1">
              {l.items
                .slice()
                .sort((a, b) => a.position - b.position)
                .map((item, idx) => {
                  const ex = exercises.find((e) => e.id === item.exercise_id);
                  return (
                    <div
                      key={item.exercise_id}
                      className="flex items-center gap-3 rounded-md border border-border bg-background px-3 py-2"
                    >
                      <span className="font-mono text-xs text-muted-foreground">{idx + 1}</span>
                      <span className="flex-1 text-sm">{ex?.name ?? "Unknown"}</span>
                      <label className="flex items-center gap-1 text-xs text-muted-foreground">
                        <input
                          type="checkbox"
                          checked={item.is_default_anchor}
                          onChange={(e) => {
                            updateVariantLadder(l.id, {
                              items: l.items.map((x) => ({
                                ...x,
                                is_default_anchor:
                                  x.exercise_id === item.exercise_id ? e.target.checked : false,
                              })),
                            });
                          }}
                        />
                        Default
                      </label>
                      <button
                        onClick={() =>
                          updateVariantLadder(l.id, {
                            items: l.items
                              .filter((x) => x.exercise_id !== item.exercise_id)
                              .map((x, i) => ({ ...x, position: i + 1 })),
                          })
                        }
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              <select
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    updateVariantLadder(l.id, {
                      items: [
                        ...l.items,
                        {
                          exercise_id: e.target.value,
                          position: l.items.length + 1,
                          is_default_anchor: false,
                        },
                      ],
                    });
                  }
                }}
                className="w-full rounded border border-dashed border-border bg-card px-3 py-1.5 text-xs text-muted-foreground"
              >
                <option value="">+ Add exercise to ladder</option>
                {exercises
                  .filter((e) => !l.items.some((i) => i.exercise_id === e.id))
                  .map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
