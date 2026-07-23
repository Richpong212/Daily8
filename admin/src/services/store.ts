/**
 * In-memory data store simulating a backend API.
 * Provides a subscription mechanism so React components can re-render
 * when the underlying data changes.
 */
import { useSyncExternalStore } from "react";
import {
  bodyRegions as seedBodyRegions,
  constraints as seedConstraints,
  equipment as seedEquipment,
  exercisePurposes as seedPurposes,
  exercises as seedExercises,
  movementFamilies as seedFamilies,
  muscles as seedMuscles,
  variantLadders as seedLadders,
  workouts as seedWorkouts,
} from "@/data/seed";
import type {
  BodyRegion,
  Constraint,
  Equipment,
  Exercise,
  ExercisePurpose,
  MovementFamily,
  Muscle,
  VariantLadder,
  Workout,
} from "@/types";

export interface Store {
  exercises: Exercise[];
  workouts: Workout[];
  movementFamilies: MovementFamily[];
  bodyRegions: BodyRegion[];
  exercisePurposes: ExercisePurpose[];
  muscles: Muscle[];
  equipment: Equipment[];
  constraints: Constraint[];
  variantLadders: VariantLadder[];
}

let store: Store = {
  exercises: seedExercises,
  workouts: seedWorkouts,
  movementFamilies: seedFamilies,
  bodyRegions: seedBodyRegions,
  exercisePurposes: seedPurposes,
  muscles: seedMuscles,
  equipment: seedEquipment,
  constraints: seedConstraints,
  variantLadders: seedLadders,
};

const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

export function getStore(): Store {
  return store;
}

export function setStore(updater: (prev: Store) => Store) {
  store = updater(store);
  notify();
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Selects a slice from the store and re-renders when the store updates. */
export function useStore<T>(selector: (s: Store) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(store),
    () => selector(store),
  );
}

/** Simple id generator suitable for demo purposes. */
export function uid(prefix = "id"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 9)}`;
}
