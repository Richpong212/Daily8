import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { toast } from "sonner";
import { getAuthErrorMessage, requestPasswordReset } from "@/services/auth";
import { useAuth } from "@/services/auth-context";

type AuthMode = "login" | "register" | "forgot";

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      if (mode === "login") {
        await login(email, password);
        navigate("/workouts", { replace: true });
      } else if (mode === "register") {
        await register(name, email, password);
        navigate("/workouts", { replace: true });
      } else {
        const response = await requestPasswordReset({ email });
        toast.success(response.message);
        setMode("login");
      }
    } catch (error) {
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 shadow-sm">
        <div className="mb-6">
          <div className="text-sm font-semibold text-primary">Daily 8 CMS</div>
          <h1 className="mt-2 text-2xl font-bold">
            {mode === "login"
              ? "Sign in"
              : mode === "register"
                ? "Create account"
                : "Reset password"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {mode === "forgot"
              ? "Enter your email and we will send a reset link."
              : "Access the internal editorial workspace."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "register" && (
            <AuthField icon={<User className="h-4 w-4" />} label="Name">
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                className={inputCls}
                autoComplete="name"
                required
              />
            </AuthField>
          )}

          <AuthField icon={<Mail className="h-4 w-4" />} label="Email">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={inputCls}
              autoComplete="email"
              required
            />
          </AuthField>

          {mode !== "forgot" && (
            <AuthField icon={<Lock className="h-4 w-4" />} label="Password">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className={`${inputCls} pr-10`}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  onClick={() => setShowPassword((value) => !value)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </AuthField>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="h-10 w-full rounded-md bg-primary text-sm font-medium text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting
              ? "Please wait..."
              : mode === "login"
                ? "Sign in"
                : mode === "register"
                  ? "Create account"
                  : "Send reset link"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <button
            type="button"
            onClick={() => setMode(mode === "register" ? "login" : "register")}
            className="text-muted-foreground hover:text-foreground"
          >
            {mode === "register" ? "Already have an account?" : "Create an account"}
          </button>
          <button
            type="button"
            onClick={() => setMode(mode === "forgot" ? "login" : "forgot")}
            className="text-muted-foreground hover:text-foreground"
          >
            {mode === "forgot" ? "Back to sign in" : "Forgot password?"}
          </button>
        </div>

        {mode === "forgot" && (
          <div className="mt-4 text-xs text-muted-foreground">
            <Link to="/login" onClick={() => setMode("login")} className="hover:text-foreground">
              Return to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

function AuthField({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-2 text-sm font-medium">
        <span className="text-muted-foreground">{icon}</span>
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "h-10 w-full rounded-md border border-border bg-card px-3 text-sm outline-none focus:border-ring";
