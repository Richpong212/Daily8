import { useEffect, useSyncExternalStore } from "react";
import axios from "axios";
import { toast } from "sonner";
import { apiBaseUrl, isRecord } from "@/services/api";
import type { ExerciseInstructionGroup, Workout, WorkoutGroup, WorkoutSlot } from "@/types";

type WorkoutResponse = {
  message: string;
  data: Workout;
};

type WorkoutsResponse = {
  message: string;
  data: Workout[];
};

const GROUP_COLORS = ["#d5a34d", "#2f7a54", "#3a5da8", "#7a4ea8", "#c1663d"];
const draftWorkoutId = "new";

const workoutApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let workouts: Workout[] = [];
let loadPromise: Promise<Workout[]> | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setWorkouts = (next: Workout[]) => {
  workouts = next;
  notify();
};

const upsertWorkout = (workout: Workout) => {
  const exists = workouts.some((item) => item.id === workout.id);
  setWorkouts(
    exists
      ? workouts.map((item) => (item.id === workout.id ? workout : item))
      : [workout, ...workouts],
  );
};

const removeWorkout = (id: string) => {
  setWorkouts(workouts.filter((workout) => workout.id !== id));
};

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "API request failed";
};

const isDraftWorkoutId = (id: string) => id === draftWorkoutId;

const loadWorkouts = async (): Promise<Workout[]> => {
  if (!loadPromise) {
    loadPromise = workoutApi
      .get<WorkoutsResponse>("/workouts")
      .then((response) => {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setWorkouts(data);
        return data;
      })
      .catch((error) => {
        loadPromise = null;
        throw new Error(getApiErrorMessage(error));
      });
  }

  return loadPromise;
};

export const useWorkouts = (): Workout[] => {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => workouts,
    () => workouts,
  );

  useEffect(() => {
    void loadWorkouts().catch((error) => {
      console.error(error);
    });
  }, []);

  return snapshot;
};

export const useWorkout = (id: string | undefined): Workout | undefined => {
  const list = useSyncExternalStore(
    subscribe,
    () => workouts,
    () => workouts,
  );
  const workout = id ? list.find((item) => item.id === id) : undefined;

  useEffect(() => {
    if (!id || workout || isDraftWorkoutId(id)) return;

    void workoutApi
      .get<WorkoutResponse>(`/workouts/${id}`)
      .then((response) => {
        if (isRecord(response.data.data)) {
          upsertWorkout(response.data.data as Workout);
        }
      })
      .catch((error) => console.error(getApiErrorMessage(error)));
  }, [id, workout]);

  return workout;
};

export const getWorkout = (id: string): Workout | undefined => {
  return workouts.find((workout) => workout.id === id);
};

export const createWorkout = (): Workout => {
  const nowIso = new Date().toISOString();
  const workout: Workout = {
    id: draftWorkoutId,
    slug: "",
    version_number: 1,
    previous_version_id: null,
    name: "New Workout",
    status: "draft",
    description: "",
    transition_seconds: 10,
    is_new_user_friendly: false,
    difficulty_band: "standard",
    review_notes: "",
    published_at: null,
    created_at: nowIso,
    updated_at: nowIso,
    groups: [
      {
        id: "new-group-1",
        group_order: 1,
        name: "Warm Up",
        repeat_count: 1,
        color: GROUP_COLORS[0],
        slots: [],
      },
    ],
  };

  upsertWorkout(workout);
  return workout;
};

const persistWorkout = async (workout: Workout): Promise<Workout> => {
  try {
    const response = isDraftWorkoutId(workout.id)
      ? await workoutApi.post<WorkoutResponse>("/workouts", workout)
      : await workoutApi.patch<WorkoutResponse>(`/workouts/${workout.id}`, workout);

    if (isDraftWorkoutId(workout.id)) {
      removeWorkout(draftWorkoutId);
    }

    if (!isRecord(response.data.data)) {
      throw new Error("API returned an invalid workout payload");
    }

    const saved = response.data.data as Workout;
    upsertWorkout(saved);
    toast.success(response.data.message);
    return saved;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const saveWorkoutDraft = async (id: string): Promise<Workout> => {
  const workout = getWorkout(id);

  if (!workout) {
    throw new Error("Workout not found");
  }

  return persistWorkout({ ...workout, status: "draft" });
};

export const updateWorkout = async (id: string, patch: Partial<Workout>): Promise<void> => {
  const current = getWorkout(id);

  if (!current) return;

  upsertWorkout({
    ...current,
    ...patch,
    updated_at: new Date().toISOString(),
  });

  if (isDraftWorkoutId(id)) return;

  try {
    const response = await workoutApi.patch<WorkoutResponse>(`/workouts/${id}`, patch);
    if (isRecord(response.data.data)) {
      upsertWorkout(response.data.data as Workout);
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const deleteWorkout = async (id: string): Promise<void> => {
  if (isDraftWorkoutId(id)) {
    removeWorkout(id);
    return;
  }

  try {
    const response = await workoutApi.delete<{ message: string }>(`/workouts/${id}`);
    removeWorkout(id);
    toast.success(response.data.message);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

const mutateWorkout = (id: string, fn: (workout: Workout) => Workout) => {
  const workout = getWorkout(id);

  if (!workout) return;

  void updateWorkout(id, fn(workout));
};

export const addGroup = (workoutId: string): void => {
  mutateWorkout(workoutId, (workout) => {
    const nextOrder = workout.groups.length + 1;
    const color = GROUP_COLORS[(nextOrder - 1) % GROUP_COLORS.length];

    return {
      ...workout,
      groups: [
        ...workout.groups,
        {
          id: `new-group-${Date.now()}`,
          group_order: nextOrder,
          name: `Group ${nextOrder}`,
          repeat_count: 1,
          slots: [],
          color,
        },
      ],
    };
  });
};

export const updateGroup = (
  workoutId: string,
  groupId: string,
  patch: Partial<WorkoutGroup>,
): void => {
  mutateWorkout(workoutId, (workout) => ({
    ...workout,
    groups: workout.groups.map((group) => (group.id === groupId ? { ...group, ...patch } : group)),
  }));
};

export const deleteGroup = (workoutId: string, groupId: string): void => {
  mutateWorkout(workoutId, (workout) => ({
    ...workout,
    groups: workout.groups
      .filter((group) => group.id !== groupId)
      .map((group, index) => ({ ...group, group_order: index + 1 })),
  }));
};

export const moveGroup = (workoutId: string, groupId: string, direction: -1 | 1): void => {
  mutateWorkout(workoutId, (workout) => {
    const index = workout.groups.findIndex((group) => group.id === groupId);
    const target = index + direction;

    if (index < 0 || target < 0 || target >= workout.groups.length) {
      return workout;
    }

    const groups = [...workout.groups];
    [groups[index], groups[target]] = [groups[target], groups[index]];

    return {
      ...workout,
      groups: groups.map((group, groupIndex) => ({
        ...group,
        group_order: groupIndex + 1,
      })),
    };
  });
};

export const addSlot = (
  workoutId: string,
  groupId: string,
  exerciseId: string,
  requiredBenefitId: string | null = null,
  instructionGroups: ExerciseInstructionGroup[] = [],
): void => {
  mutateWorkout(workoutId, (workout) => ({
    ...workout,
    groups: workout.groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            slots: [
              ...group.slots,
              {
                id: `new-slot-${Date.now()}`,
                slot_order: group.slots.length + 1,
                exercise_id: exerciseId,
                required_benefit_id: requiredBenefitId,
                duration_seconds: 30,
                instruction_groups: instructionGroups,
              },
            ],
          }
        : group,
    ),
  }));
};

export const updateSlot = (
  workoutId: string,
  groupId: string,
  slotId: string,
  patch: Partial<WorkoutSlot>,
): void => {
  mutateWorkout(workoutId, (workout) => ({
    ...workout,
    groups: workout.groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            slots: group.slots.map((slot) => (slot.id === slotId ? { ...slot, ...patch } : slot)),
          }
        : group,
    ),
  }));
};

export const deleteSlot = (workoutId: string, groupId: string, slotId: string): void => {
  mutateWorkout(workoutId, (workout) => ({
    ...workout,
    groups: workout.groups.map((group) =>
      group.id === groupId
        ? {
            ...group,
            slots: group.slots
              .filter((slot) => slot.id !== slotId)
              .map((slot, index) => ({ ...slot, slot_order: index + 1 })),
          }
        : group,
    ),
  }));
};

export const estimateWorkoutSeconds = (workout: Workout): number => {
  let total = 0;

  for (const group of workout.groups) {
    const slotSeconds = group.slots.reduce(
      (sum, slot) => sum + slot.duration_seconds + workout.transition_seconds,
      0,
    );
    total += slotSeconds * group.repeat_count;
  }

  return total;
};

export const totalSlots = (workout: Workout): number => {
  return workout.groups.reduce((sum, group) => sum + group.slots.length * group.repeat_count, 0);
};

export const publishWorkout = async (id: string): Promise<Workout | undefined> => {
  const workout = getWorkout(id);

  if (!workout) return undefined;

  const saved = isDraftWorkoutId(id)
    ? await persistWorkout({ ...workout, status: "active" })
    : await workoutApi
        .patch<WorkoutResponse>(`/workouts/${id}`, { status: "active" })
        .then((response) => {
          toast.success(response.data.message);
          return response.data.data;
        })
        .catch((error) => {
          throw new Error(getApiErrorMessage(error));
        });

  upsertWorkout(saved);
  return saved;
};
