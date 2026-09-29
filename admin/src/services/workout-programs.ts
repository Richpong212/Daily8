import { useEffect, useSyncExternalStore } from "react";
import axios from "axios";
import { toast } from "sonner";
import { apiBaseUrl, isRecord } from "@/services/api";
import type { WorkoutProgram, WorkoutProgramItem } from "@/types";

type ProgramResponse = { message: string; data: WorkoutProgram };
type ProgramsResponse = { message: string; data: WorkoutProgram[] };

const draftId = "new";
const programApi = axios.create({
  baseURL: apiBaseUrl,
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
});

let programs: WorkoutProgram[] = [];
let loadPromise: Promise<WorkoutProgram[]> | null = null;
const listeners = new Set<() => void>();

const notify = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};
const setPrograms = (next: WorkoutProgram[]) => {
  programs = next;
  notify();
};
const upsertProgram = (program: WorkoutProgram) => {
  setPrograms(
    programs.some((item) => item.id === program.id)
      ? programs.map((item) => (item.id === program.id ? program : item))
      : [program, ...programs],
  );
};
const getErrorMessage = (error: unknown) => {
  if (axios.isAxiosError(error)) {
    return (error.response?.data as { message?: string } | undefined)?.message ?? error.message;
  }
  return error instanceof Error ? error.message : "API request failed";
};

const loadPrograms = async () => {
  if (!loadPromise) {
    loadPromise = programApi
      .get<ProgramsResponse>("/workout-programs")
      .then((response) => {
        const loaded = Array.isArray(response.data.data) ? response.data.data : [];
        const draft = programs.find((program) => program.id === draftId);
        setPrograms(draft ? [draft, ...loaded] : loaded);
        return loaded;
      })
      .catch((error) => {
        loadPromise = null;
        throw new Error(getErrorMessage(error));
      });
  }
  return loadPromise;
};

export const useWorkoutPrograms = () => {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => programs,
    () => programs,
  );
  useEffect(() => {
    void loadPrograms().catch((error) => console.error(error));
  }, []);
  return snapshot;
};

export const useWorkoutProgram = (id: string | undefined) => {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => programs,
    () => programs,
  );
  const program = id ? snapshot.find((item) => item.id === id) : undefined;

  useEffect(() => {
    if (!id || program || id === draftId) return;
    void programApi
      .get<ProgramResponse>(`/workout-programs/${id}`)
      .then((response) => {
        if (isRecord(response.data.data)) upsertProgram(response.data.data as WorkoutProgram);
      })
      .catch((error) => console.error(getErrorMessage(error)));
  }, [id, program]);

  return program;
};

export const createWorkoutProgramDraft = () => {
  const now = new Date().toISOString();
  const program: WorkoutProgram = {
    id: draftId,
    slug: "",
    name: "New Program",
    version_number: 1,
    previous_version_id: null,
    status: "draft",
    notes: null,
    published_at: null,
    items: [],
    workout_count: 0,
    enrollment_count: 0,
    is_locked: false,
    created_at: now,
    updated_at: now,
  };
  upsertProgram(program);
  return program;
};

export const updateWorkoutProgramDraft = (id: string, patch: Partial<WorkoutProgram>) => {
  const current = programs.find((program) => program.id === id);
  if (!current || current.is_locked) return;
  upsertProgram({ ...current, ...patch, updated_at: new Date().toISOString() });
};

export const replaceWorkoutProgramItems = (id: string, items: WorkoutProgramItem[]) => {
  updateWorkoutProgramDraft(id, {
    items: items.map((item, index) => ({ ...item, program_order: index + 1 })),
    workout_count: items.length,
  });
};

export const saveWorkoutProgram = async (id: string) => {
  const program = programs.find((item) => item.id === id);
  if (!program) throw new Error("Program not found");

  try {
    const payload = {
      name: program.name,
      status: program.status,
      notes: program.notes,
      items: program.items.map(({ workout_id, notes }) => ({ workout_id, notes })),
    };
    const response =
      id === draftId
        ? await programApi.post<ProgramResponse>("/workout-programs", payload)
        : await programApi.patch<ProgramResponse>(`/workout-programs/${id}`, payload);
    if (!isRecord(response.data.data)) throw new Error("API returned an invalid program");

    if (id === draftId) setPrograms(programs.filter((item) => item.id !== draftId));
    const saved = response.data.data as WorkoutProgram;
    upsertProgram(saved);
    toast.success(response.data.message);
    return saved;
  } catch (error) {
    const message = getErrorMessage(error);
    toast.error(message);
    throw new Error(message);
  }
};

export const createWorkoutProgramVersion = async (id: string) => {
  try {
    const response = await programApi.post<ProgramResponse>(`/workout-programs/${id}/versions`);
    if (!isRecord(response.data.data)) throw new Error("API returned an invalid program");
    const program = response.data.data as WorkoutProgram;
    upsertProgram(program);
    toast.success(response.data.message);
    return program;
  } catch (error) {
    const message = getErrorMessage(error);
    toast.error(message);
    throw new Error(message);
  }
};
