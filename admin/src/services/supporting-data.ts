import { useEffect, useSyncExternalStore } from "react";
import axios from "axios";
import { toast } from "sonner";
import { apiBaseUrl, isRecord } from "@/services/api";
import type {
  BodyRegion,
  Constraint,
  Equipment,
  ExerciseBenefit,
  MovementFamily,
  Muscle,
  VariantLadder,
} from "@/types";

type SupportingData = {
  movementFamilies: MovementFamily[];
  bodyRegions: BodyRegion[];
  exerciseBenefits: ExerciseBenefit[];
  muscles: Muscle[];
  equipment: Equipment[];
  constraints: Constraint[];
  variantLadders: VariantLadder[];
};

type SupportingDataResponse = {
  message: string;
  data: SupportingData;
};

type ItemResponse<T> = {
  message: string;
  data: T;
};

type SavedItem<T> = {
  item: T;
  message: string;
};

type CreatePayload<T> = Omit<T, "id" | "slug">;

const supportingDataApi = axios.create({
  baseURL: `${apiBaseUrl}/supporting-data`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

let supportingData: SupportingData = {
  movementFamilies: [],
  bodyRegions: [],
  exerciseBenefits: [],
  muscles: [],
  equipment: [],
  constraints: [],
  variantLadders: [],
};
let loadPromise: Promise<SupportingData> | null = null;
const listeners = new Set<() => void>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setSupportingData = (next: SupportingData) => {
  supportingData = {
    movementFamilies: Array.isArray(next.movementFamilies) ? next.movementFamilies : [],
    bodyRegions: Array.isArray(next.bodyRegions) ? next.bodyRegions : [],
    exerciseBenefits: Array.isArray(next.exerciseBenefits) ? next.exerciseBenefits : [],
    muscles: Array.isArray(next.muscles) ? next.muscles : [],
    equipment: Array.isArray(next.equipment) ? next.equipment : [],
    constraints: Array.isArray(next.constraints) ? next.constraints : [],
    variantLadders: Array.isArray(next.variantLadders) ? next.variantLadders : [],
  };
  notify();
};

const getApiErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? error.message;
  }

  return error instanceof Error ? error.message : "API request failed";
};

const loadSupportingData = async (): Promise<SupportingData> => {
  if (!loadPromise) {
    loadPromise = supportingDataApi
      .get<SupportingDataResponse>("/")
      .then((response) => {
        const next = isRecord(response.data.data)
          ? (response.data.data as SupportingData)
          : supportingData;
        setSupportingData(next);
        return next;
      })
      .catch((error) => {
        loadPromise = null;
        throw new Error(getApiErrorMessage(error));
      });
  }

  return loadPromise;
};

const useSupportingData = <T>(selector: (data: SupportingData) => T): T => {
  const snapshot = useSyncExternalStore(
    subscribe,
    () => selector(supportingData),
    () => selector(supportingData),
  );

  useEffect(() => {
    void loadSupportingData().catch((error) => {
      console.error(error);
    });
  }, []);

  return snapshot;
};

const upsertItem = <K extends keyof SupportingData>(key: K, item: SupportingData[K][number]) => {
  const rows = supportingData[key] as SupportingData[K][number][];
  const exists = rows.some((row) => row.id === item.id);
  setSupportingData({
    ...supportingData,
    [key]: exists ? rows.map((row) => (row.id === item.id ? item : row)) : [...rows, item],
  });
};

const removeItem = <K extends keyof SupportingData>(key: K, id: string) => {
  const rows = supportingData[key] as SupportingData[K][number][];
  setSupportingData({
    ...supportingData,
    [key]: rows.filter((row) => row.id !== id),
  });
};

const createItem = async <T>(resource: string, data: CreatePayload<T>): Promise<SavedItem<T>> => {
  try {
    const response = await supportingDataApi.post<ItemResponse<T>>(resource, data);
    if (!isRecord(response.data.data)) {
      throw new Error("API returned an invalid supporting data payload");
    }

    return { item: response.data.data, message: response.data.message };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

const updateItem = async <T>(
  resource: string,
  id: string,
  patch: Partial<T>,
): Promise<SavedItem<T>> => {
  try {
    const response = await supportingDataApi.patch<ItemResponse<T>>(`${resource}/${id}`, patch);
    if (!isRecord(response.data.data)) {
      throw new Error("API returned an invalid supporting data payload");
    }

    return { item: response.data.data, message: response.data.message };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

const deleteItem = async (resource: string, id: string): Promise<void> => {
  try {
    const response = await supportingDataApi.delete<{ message: string }>(`${resource}/${id}`);
    toast.success(response.data.message);
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const useMovementFamilies = () => useSupportingData((data) => data.movementFamilies);
export const useBodyRegions = () => useSupportingData((data) => data.bodyRegions);
export const useExerciseBenefits = () => useSupportingData((data) => data.exerciseBenefits);
export const useMuscles = () => useSupportingData((data) => data.muscles);
export const useEquipment = () => useSupportingData((data) => data.equipment);
export const useConstraints = () => useSupportingData((data) => data.constraints);
export const useVariantLadders = () => useSupportingData((data) => data.variantLadders);

export const getMovementFamily = (id: string | null | undefined) => {
  return id ? supportingData.movementFamilies.find((item) => item.id === id) : undefined;
};

export const getBodyRegion = (id: string | null | undefined) => {
  return id ? supportingData.bodyRegions.find((item) => item.id === id) : undefined;
};

export const getBenefit = (id: string | null | undefined) => {
  return id ? supportingData.exerciseBenefits.find((item) => item.id === id) : undefined;
};

export const getMuscle = (id: string | null | undefined) => {
  return id ? supportingData.muscles.find((item) => item.id === id) : undefined;
};

export const getEquipmentItem = (id: string | null | undefined) => {
  return id ? supportingData.equipment.find((item) => item.id === id) : undefined;
};

export const getConstraint = (id: string | null | undefined) => {
  return id ? supportingData.constraints.find((item) => item.id === id) : undefined;
};

export const getLadder = (id: string | null | undefined) => {
  return id ? supportingData.variantLadders.find((item) => item.id === id) : undefined;
};

export const createMovementFamily = async (data: CreatePayload<MovementFamily>) => {
  const { item, message } = await createItem<MovementFamily>("movement-families", data);
  upsertItem("movementFamilies", item);
  toast.success(message);
  return item;
};

export const updateMovementFamily = async (id: string, patch: Partial<MovementFamily>) => {
  const { item, message } = await updateItem<MovementFamily>("movement-families", id, patch);
  upsertItem("movementFamilies", item);
  toast.success(message);
};

export const deleteMovementFamily = async (id: string) => {
  await deleteItem("movement-families", id);
  removeItem("movementFamilies", id);
};

export const createBodyRegion = async (data: CreatePayload<BodyRegion>) => {
  const { item, message } = await createItem<BodyRegion>("body-regions", data);
  upsertItem("bodyRegions", item);
  toast.success(message);
  return item;
};

export const updateBodyRegion = async (id: string, patch: Partial<BodyRegion>) => {
  const { item, message } = await updateItem<BodyRegion>("body-regions", id, patch);
  upsertItem("bodyRegions", item);
  toast.success(message);
};

export const deleteBodyRegion = async (id: string) => {
  await deleteItem("body-regions", id);
  removeItem("bodyRegions", id);
};

export const createBenefit = async (data: CreatePayload<ExerciseBenefit>) => {
  const { item, message } = await createItem<ExerciseBenefit>("exercise-benefits", data);
  upsertItem("exerciseBenefits", item);
  toast.success(message);
  return item;
};

export const updateBenefit = async (id: string, patch: Partial<ExerciseBenefit>) => {
  const { item, message } = await updateItem<ExerciseBenefit>("exercise-benefits", id, patch);
  upsertItem("exerciseBenefits", item);
  toast.success(message);
};

export const deleteBenefit = async (id: string) => {
  await deleteItem("exercise-benefits", id);
  removeItem("exerciseBenefits", id);
};

export const createMuscle = async (data: CreatePayload<Muscle>) => {
  const { item, message } = await createItem<Muscle>("muscles", data);
  upsertItem("muscles", item);
  toast.success(message);
  return item;
};

export const updateMuscle = async (id: string, patch: Partial<Muscle>) => {
  const { item, message } = await updateItem<Muscle>("muscles", id, patch);
  upsertItem("muscles", item);
  toast.success(message);
};

export const deleteMuscle = async (id: string) => {
  await deleteItem("muscles", id);
  removeItem("muscles", id);
};

export const createEquipment = async (data: CreatePayload<Equipment>) => {
  const { item, message } = await createItem<Equipment>("equipment", data);
  upsertItem("equipment", item);
  toast.success(message);
  return item;
};

export const updateEquipment = async (id: string, patch: Partial<Equipment>) => {
  const { item, message } = await updateItem<Equipment>("equipment", id, patch);
  upsertItem("equipment", item);
  toast.success(message);
};

export const deleteEquipment = async (id: string) => {
  await deleteItem("equipment", id);
  removeItem("equipment", id);
};

export const createConstraint = async (data: CreatePayload<Constraint>) => {
  const { item, message } = await createItem<Constraint>("constraints", data);
  upsertItem("constraints", item);
  toast.success(message);
  return item;
};

export const updateConstraint = async (id: string, patch: Partial<Constraint>) => {
  const { item, message } = await updateItem<Constraint>("constraints", id, patch);
  upsertItem("constraints", item);
  toast.success(message);
};

export const deleteConstraint = async (id: string) => {
  await deleteItem("constraints", id);
  removeItem("constraints", id);
};

export const createVariantLadder = async (data: CreatePayload<VariantLadder>) => {
  const { item, message } = await createItem<VariantLadder>("variant-ladders", data);
  upsertItem("variantLadders", item);
  toast.success(message);
  return item;
};

export const updateVariantLadder = async (id: string, patch: Partial<VariantLadder>) => {
  const { item, message } = await updateItem<VariantLadder>("variant-ladders", id, patch);
  upsertItem("variantLadders", item);
  toast.success(message);
};

export const deleteVariantLadder = async (id: string) => {
  await deleteItem("variant-ladders", id);
  removeItem("variantLadders", id);
};
