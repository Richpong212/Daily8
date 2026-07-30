import { Route, Routes, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Dashboard from "@/pages/Dashboard";
import ExercisesList from "@/pages/ExercisesList";
import ExerciseEditor from "@/pages/ExerciseEditor";
import WorkoutsList from "@/pages/WorkoutsList";
import WorkoutEditor from "@/pages/WorkoutEditor";
import Media from "@/pages/Media";
import SupportingDataLayout, {
  MovementFamiliesPage,
  BodyRegionsPage,
  ExerciseBenefitsPage,
  MusclesPage,
  EquipmentPage,
  ConstraintsPage,
  VariantLaddersPage,
} from "@/pages/SupportingData";
import NotFound from "@/pages/NotFound";

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="exercises" element={<ExercisesList />} />
        <Route path="exercises/:id" element={<ExerciseEditor />} />
        <Route path="workouts" element={<WorkoutsList />} />
        <Route path="workouts/:id" element={<WorkoutEditor />} />
        <Route path="media" element={<Media />} />
        <Route path="supporting-data" element={<SupportingDataLayout />}>
          <Route index element={<Navigate to="movement-families" replace />} />
          <Route path="movement-families" element={<MovementFamiliesPage />} />
          <Route path="body-regions" element={<BodyRegionsPage />} />
          <Route path="exercise-benefits" element={<ExerciseBenefitsPage />} />
          <Route path="muscles" element={<MusclesPage />} />
          <Route path="equipment" element={<EquipmentPage />} />
          <Route path="constraints" element={<ConstraintsPage />} />
          <Route path="variant-ladders" element={<VariantLaddersPage />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
