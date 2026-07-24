import { useEffect, useSyncExternalStore } from "react";
import axios from "axios";
import { apiBaseUrl, isRecord } from "@/services/api";
import type { Exercise } from "@/types";

type ExerciseResponse = {
  message: string;
  data: Exercise;
};

type ExercisesResponse = {
  message: string;
  data: Exercise[];
};

const exerciseApi = axios.create({
  baseURL: apiBaseUrl,
  headers: {
    "Content-Type": "application/json",
  },
});

let exercises: Exercise[] = [];
let loadPromise: Promise<Exercise[]> | null = null;
const listeners = new Set<() => void>();
const draftExerciseId = "new";

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setExercises = (next: Exercise[]) => {
  exercises = next;
  notify();
};

const upsertExercise = (exercise: Exercise) => {
  const exists = exercises.some((item) => item.id === exercise.id);
  setExercises(
    exists
      ? exercises.map((item) => (item.id === exercise.id ? exercise : item))
      : [exercise, ...exercises],
  );
};

const removeExercise = (id: string) => {
  setExercises(exercises.filter((exercise) => exercise.id !== id));
};

const isDraftExerciseId = (id: string) => id === draftExerciseId;

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "API request failed";
};

const loadExercises = async (): Promise<Exercise[]> => {
  if (!loadPromise) {
    loadPromise = exerciseApi
      .get<ExercisesResponse>("/exercises")
      .then((response) => {
        const data = Array.isArray(response.data.data) ? response.data.data : [];
        setExercises(data);
        return data;
      })
      .catch((error) => {
        loadPromise = null;
        throw new Error(getApiErrorMessage(error));
      });
  }

  return loadPromise;
};

export const useExercises = (): Exercise[] => {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => exercises,
    () => exercises,
  );

  useEffect(() => {
    void loadExercises().catch((error) => {
      console.error(error);
    });
  }, []);

  return snapshot;
};

export const getExercise = (id: string): Exercise | undefined => {
  return exercises.find((exercise) => exercise.id === id);
};

export const useExercise = (id: string | undefined): Exercise | undefined => {
  const list = useSyncExternalStore(
    subscribe,
    () => exercises,
    () => exercises,
  );
  const exercise = id ? list.find((item) => item.id === id) : undefined;

  useEffect(() => {
    if (!id || exercise || isDraftExerciseId(id)) return;

    void exerciseApi.get<ExerciseResponse>(`/exercises/${id}`).then((response) => {
      if (isRecord(response.data.data)) {
        upsertExercise(response.data.data as Exercise);
      }
    });
  }, [id, exercise]);

  return exercise;
};

export const createExerciseDraft = (): Exercise => {
  const nowIso = new Date().toISOString();
  const draft: Exercise = {
    id: draftExerciseId,
    slug: "",
    name: "",
    movement_family_id: null,
    body_region_id: null,
    exercise_purpose_id: null,
    category: "strength",
    position: "standing",
    impact_level: "low",
    space_need: "small",
    complexity_level: "low",
    intensity_level: "low",
    balance_demand: "low",
    summary: "",
    instructions: [],
    coaching_cues: [],
    safety_info: null,
    review_status: "draft",
    review_notes: "",
    status: "draft",
    muscles: [],
    constraints: [],
    equipment: [],
    variant_ladder_ids: [],
    variants: [],
    media: [],
    created_at: nowIso,
    updated_at: nowIso,
    published_at: null,
    retired_at: null,
    color: "#2f7a54",
  };

  upsertExercise(draft);
  return draft;
};

const postExercise = async (exercise: Partial<Exercise> = {}): Promise<Exercise> => {
  try {
    const response = await exerciseApi.post<ExerciseResponse>("/exercises", {
      ...exercise,
      name: exercise.name?.trim() || "New Exercise",
      slug: exercise.slug?.trim() || undefined,
    });
    if (!isRecord(response.data.data)) {
      throw new Error("API returned an invalid exercise payload");
    }

    const saved = response.data.data as Exercise;
    removeExercise(draftExerciseId);
    upsertExercise(saved);
    return saved;
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const updateExercise = async (id: string, patch: Partial<Exercise>): Promise<void> => {
  const current = getExercise(id);

  if (current) {
    upsertExercise({
      ...current,
      ...patch,
      updated_at: new Date().toISOString(),
    });
  }

  if (isDraftExerciseId(id)) return;

  try {
    const response = await exerciseApi.patch<ExerciseResponse>(`/exercises/${id}`, patch);
    if (isRecord(response.data.data)) {
      upsertExercise(response.data.data as Exercise);
    }
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const saveExerciseDraft = async (exercise: Exercise): Promise<Exercise> => {
  return isDraftExerciseId(exercise.id)
    ? postExercise(exercise)
    : exerciseApi
        .patch<ExerciseResponse>(`/exercises/${exercise.id}`, exercise)
        .then((response) => {
          if (!isRecord(response.data.data)) {
            throw new Error("API returned an invalid exercise payload");
          }

          const saved = response.data.data as Exercise;
          upsertExercise(saved);
          return saved;
        })
        .catch((error) => {
          throw new Error(getApiErrorMessage(error));
        });
};

export const deleteExercise = async (id: string): Promise<void> => {
  if (isDraftExerciseId(id)) {
    removeExercise(id);
    return;
  }

  try {
    await exerciseApi.delete(`/exercises/${id}`);
    removeExercise(id);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const publishExercise = async (id: string): Promise<void> => {
  await updateExercise(id, {
    status: "active",
    review_status: "approved",
  });
};

export const sendForReview = async (id: string): Promise<void> => {
  await updateExercise(id, { review_status: "needs_review" });
};
