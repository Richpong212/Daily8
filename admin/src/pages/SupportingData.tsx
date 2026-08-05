import { NavLink, Outlet } from "react-router-dom";
import { Plus, Pencil, Trash2, X, Check } from "lucide-react";
import { useState } from "react";
import type { ReactNode } from "react";
import {
  useMovementFamilies,
  useBodyRegions,
  useExerciseBenefits,
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
  createBenefit,
  updateBenefit,
  deleteBenefit,
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
  { to: "/supporting-data/exercise-benefits", label: "Exercise Purposes" },
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

type Column<T extends Row> = {
  key: keyof T | "actions";
  label: string;
  className?: string;
  render?: (row: T) => ReactNode;
  edit?: (row: T, draft: Partial<T>, setDraft: (patch: Partial<T>) => void) => ReactNode;
};

function EditableTable<T extends Row>({
  columns,
  rows,
  onCreate,
  onUpdate,
  onDelete,
  createLabel = "Create New",
  gridTemplateColumns = "1.2fr 1fr 2fr 100px",
}: {
  columns: Column<T>[];
  rows: T[];
  onCreate: () => T | Promise<T>;
  onUpdate: (id: string, patch: Partial<T>) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  createLabel?: string;
  gridTemplateColumns?: string;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Partial<T>>({});
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getErrorMessage = (caught: unknown) => {
    return caught instanceof Error ? caught.message : "Could not save supporting data";
  };

  const updateDraft = (patch: Partial<T>) => setDraft((current) => ({ ...current, ...patch }));

  const handleCreate = async () => {
    setError(null);
    setPendingAction("create");
    try {
      const created = await onCreate();
      setEditingId(created.id);
      setDraft({});
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPendingAction(null);
    }
  };

  const handleUpdate = async (id: string) => {
    setError(null);
    setPendingAction(`update:${id}`);
    try {
      await onUpdate(id, draft);
      setEditingId(null);
      setDraft({});
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPendingAction(null);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    setPendingAction(`delete:${id}`);
    try {
      await onDelete(id);
    } catch (caught) {
      setError(getErrorMessage(caught));
    } finally {
      setPendingAction(null);
    }
  };

  return (
    <div>
      <div className="mb-3 flex justify-end">
        <button
          onClick={() => void handleCreate()}
          disabled={pendingAction === "create"}
          className="inline-flex items-center gap-2 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Plus className="h-4 w-4" />
          {pendingAction === "create" ? "Creating..." : createLabel}
        </button>
      </div>
      {error && (
        <div className="mb-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <div
          className="grid gap-4 border-b border-border px-5 py-2.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground"
          style={{ gridTemplateColumns }}
        >
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
              className="grid items-center gap-4 border-b border-border px-5 py-3 last:border-0 hover:bg-muted/40"
              style={{ gridTemplateColumns }}
            >
              {columns.map((column) => {
                if (column.key === "actions") {
                  return (
                    <div key="actions" className="flex items-center justify-end gap-1">
                      {isEditing ? (
                        <>
                          <button
                            disabled={pendingAction === `update:${r.id}`}
                            onClick={() => void handleUpdate(r.id)}
                            className="rounded p-1 text-success-foreground hover:bg-success/40 disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                          <button
                            disabled={pendingAction === `update:${r.id}`}
                            onClick={() => {
                              setEditingId(null);
                              setDraft({});
                              setError(null);
                            }}
                            className="rounded p-1 text-muted-foreground hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"
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
                              setError(null);
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
                                  disabled={pendingAction === `delete:${r.id}`}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => void handleDelete(r.id)}
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </>
                      )}
                    </div>
                  );
                }

                const value = r[column.key];
                const fallback =
                  column.key === "slug" ? (
                    <span className="font-mono text-xs text-muted-foreground">
                      {String(value ?? "")}
                    </span>
                  ) : column.key === "name" ? (
                    <span className="font-medium">{String(value ?? "")}</span>
                  ) : (
                    <span className="text-sm text-muted-foreground">{String(value ?? "")}</span>
                  );

                return (
                  <div key={String(column.key)} className={column.className}>
                    {isEditing
                      ? (column.edit?.(r, draft, updateDraft) ??
                        (column.key === "name" || column.key === "description" ? (
                          <input
                            autoFocus={column.key === "name"}
                            value={String(draft[column.key] ?? value ?? "")}
                            onChange={(e) =>
                              updateDraft({ [column.key]: e.target.value } as Partial<T>)
                            }
                            className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
                          />
                        ) : (
                          fallback
                        )))
                      : (column.render?.(r) ?? fallback)}
                  </div>
                );
              })}
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
        {
          key: "color",
          label: "Color",
          render: (row) => (
            <div className="flex items-center gap-2">
              <span
                className="h-5 w-5 rounded border border-border"
                style={{ backgroundColor: row.color }}
              />
              <span>{row.color}</span>
            </div>
          ),
          edit: (row, draft, setDraft) => (
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={(draft.color as string | undefined) ?? row.color}
                onChange={(event) => setDraft({ color: event.target.value })}
                className="h-8 w-10 rounded border border-border bg-card p-1"
              />
              <input
                value={(draft.color as string | undefined) ?? row.color}
                onChange={(event) => setDraft({ color: event.target.value })}
                className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
              />
            </div>
          ),
        },
        { key: "description", label: "Description" },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      onCreate={() =>
        createMovementFamily({
          name: "New Family",
          description: "",
          color: "#6C63B8",
          sort_order: rows.length + 1,
        })
      }
      onUpdate={updateMovementFamily}
      onDelete={deleteMovementFamily}
      gridTemplateColumns="1fr 1fr 140px 2fr 100px"
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

export function ExerciseBenefitsPage() {
  const rows = useExerciseBenefits();
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
        createBenefit({ name: "New Benefit", description: "", sort_order: rows.length + 1 })
      }
      onUpdate={updateBenefit}
      onDelete={deleteBenefit}
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
        { key: "description", label: "Description" },
        {
          key: "body_region_id",
          label: "Body Region",
          render: (muscle) => (
            <span className="text-sm text-muted-foreground">
              {bodyRegions.find((region) => region.id === muscle.body_region_id)?.name ?? "—"}
            </span>
          ),
          edit: (muscle, draft, setDraft) => (
            <select
              value={String(draft.body_region_id ?? muscle.body_region_id ?? "")}
              onChange={(event) =>
                setDraft({ body_region_id: event.target.value } as Partial<typeof muscle>)
              }
              className="w-full rounded border border-border bg-card px-2 py-1 text-sm"
            >
              <option value="">Select body region</option>
              {bodyRegions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          ),
        },
        { key: "actions", label: "Actions" },
      ]}
      rows={rows}
      onCreate={() =>
        createMuscle({
          name: "New Muscle",
          body_region_id: bodyRegions[0]?.id ?? "",
          description: "",
        })
      }
      onUpdate={updateMuscle}
      onDelete={deleteMuscle}
      gridTemplateColumns="1.1fr 1fr 1.8fr 1.2fr 100px"
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
