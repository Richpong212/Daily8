import { useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import {
  getAuthErrorMessage,
  getCurrentUser,
  loginUser,
  logoutUser,
  registerUser,
  type AuthUser,
} from "@/services/auth";
import { AuthContext, type AuthContextValue } from "@/services/auth-context";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const response = await getCurrentUser();
        setUser(response.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      login: async (email, password) => {
        const response = await loginUser({ email, password });
        setUser(response.user);
        toast.success(response.message);
      },
      register: async (name, email, password) => {
        const response = await registerUser({ name, email, password });
        setUser(response.user);
        toast.success(response.message);
      },
      logout: async () => {
        try {
          const response = await logoutUser();
          toast.success(response.message);
        } catch (error) {
          toast.error(getAuthErrorMessage(error));
        } finally {
          setUser(null);
        }
      },
    }),
    [loading, user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
