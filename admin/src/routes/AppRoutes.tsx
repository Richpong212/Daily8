import { Route, Routes, Navigate } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import Auth from "@/pages/Auth";
import ExercisesList from "@/pages/ExercisesList";
import ExerciseEditor from "@/pages/ExerciseEditor";
import WorkoutsList from "@/pages/WorkoutsList";
import WorkoutEditor from "@/pages/WorkoutEditor";
import Media from "@/pages/Media";
import ResetPassword from "@/pages/ResetPassword";
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
import { useAuth } from "@/services/auth-context";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="login" element={<PublicOnlyRoute element={<Auth />} />} />
      <Route
        path="reset-password/:token"
        element={<PublicOnlyRoute element={<ResetPassword />} />}
      />
      <Route element={<ProtectedRoute />}>
        <Route index element={<Navigate to="workouts" replace />} />
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

function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  return user ? <AppLayout /> : <Navigate to="/login" replace />;
}

function PublicOnlyRoute({ element }: { element: React.ReactElement }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background text-sm text-muted-foreground">
        Loading session...
      </div>
    );
  }

  return user ? <Navigate to="/workouts" replace /> : element;
}
