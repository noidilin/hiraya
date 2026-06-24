import { Link } from "@tanstack/react-router";
import { Check, Loader2, LogIn, UserPlus } from "lucide-react";
import { useReducedMotion } from "motion/react";
import { type FormEvent, useMemo, useState } from "react";
import { z } from "zod";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TransitionPanel } from "@/components/ui/transition-panel";
import { useAuth } from "@/hooks/use-auth";

type AuthMode = "login" | "signup";
type FieldErrors = Partial<Record<"email" | "password" | "firstName" | "lastName", string>>;

const loginSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password."),
});

const signupSchema = loginSchema.extend({
  firstName: z.string().trim().min(1, "Enter your first name."),
  lastName: z.string().trim().min(1, "Enter your last name."),
  password: z.string().min(8, "Use at least 8 characters."),
});

const authModePanelVariants = {
  enter: { height: 0, opacity: 0, y: -4 },
  center: { height: "auto", opacity: 1, y: 0 },
  exit: { height: 0, opacity: 0, y: -4 },
};

const reducedAuthModePanelVariants = {
  enter: { height: "auto", opacity: 1, y: 0 },
  center: { height: "auto", opacity: 1, y: 0 },
  exit: { height: 0, opacity: 1, y: 0 },
};

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "The request could not be completed.";
}

function isAuthMode(value: string): value is AuthMode {
  return value === "login" || value === "signup";
}

export function AuthRoute() {
  const { user, status, login, register, logout, error: storeError, clearError } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [values, setValues] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const isLoading = status === "loading";
  const shouldReduceMotion = useReducedMotion();
  const title = mode === "login" ? "Welcome back" : "Create an account";

  const fullName = useMemo(() => [user?.firstName, user?.lastName].filter(Boolean).join(" "), [user]);

  function updateField(field: keyof typeof values, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => ({ ...current, [field]: undefined }));
    setFormError(null);
    setFormMessage(null);
    clearError();
  }

  function switchMode(nextMode: AuthMode) {
    setMode(nextMode);
    setFieldErrors({});
    setFormError(null);
    setFormMessage(null);
    clearError();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setFormError(null);
    setFormMessage(null);
    clearError();

    try {
      if (mode === "login") {
        const parsed = loginSchema.safeParse(values);

        if (!parsed.success) {
          const flattened = parsed.error.flatten().fieldErrors;
          setFieldErrors({
            email: flattened.email?.[0],
            password: flattened.password?.[0],
          });
          return;
        }

        await login({
          email: parsed.data.email,
          password: parsed.data.password,
        });
        setFormMessage("Signed in. Your cart is still waiting.");
      } else {
        const parsed = signupSchema.safeParse(values);

        if (!parsed.success) {
          const flattened = parsed.error.flatten().fieldErrors;
          setFieldErrors({
            email: flattened.email?.[0],
            password: flattened.password?.[0],
            firstName: flattened.firstName?.[0],
            lastName: flattened.lastName?.[0],
          });
          return;
        }

        await register({
          email: parsed.data.email,
          password: parsed.data.password,
          firstName: parsed.data.firstName,
          lastName: parsed.data.lastName,
        });
        setFormMessage("Account created. Your archive is ready.");
      }
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-10 px-5 py-12 pb-24 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:py-16">
      <section className="border-b border-border pb-8 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-muted-foreground">Account</p>
        <h1 className="mt-4 max-w-xl font-heading text-5xl font-semibold leading-none tracking-normal sm:text-7xl">
          {title}
        </h1>
        <p className="mt-6 max-w-lg text-base leading-7 text-muted-foreground">
          Sign in before checkout to attach your order to an account while keeping your selected pieces in the cart.
        </p>

        {user ? (
          <div className="mt-10 border-y border-border py-6">
            <p className="text-sm font-semibold text-foreground">Signed in as {fullName || user.email}</p>
            <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Button asChild className="h-11 rounded-none px-4">
                <Link to="/cart">Return to cart</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-none px-4">
                <Link to="/orders">View orders</Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-11 rounded-none px-4"
                disabled={isLoading}
                onClick={() => void logout()}
              >
                {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                Sign out
              </Button>
            </div>
          </div>
        ) : null}
      </section>

      <section className="w-full" aria-labelledby="auth-form-title">
        <Tabs
          value={mode}
          onValueChange={(nextMode) => {
            if (isAuthMode(nextMode)) {
              switchMode(nextMode);
            }
          }}
          className="gap-0"
        >
          <TabsList
            aria-label="Account mode"
            className="grid h-auto w-full grid-cols-2 rounded-none border border-border bg-transparent p-0 text-foreground"
          >
            <TabsTrigger
              value="login"
              className="h-12 rounded-none border-0 border-r border-border text-sm font-semibold transition data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
              onClick={() => {
                if (mode === "login") {
                  switchMode("login");
                }
              }}
            >
              <LogIn className="size-4" aria-hidden="true" />
              Login
            </TabsTrigger>
            <TabsTrigger
              value="signup"
              className="h-12 rounded-none border-0 text-sm font-semibold transition data-active:bg-primary data-active:text-primary-foreground data-active:shadow-none"
              onClick={() => {
                if (mode === "signup") {
                  switchMode("signup");
                }
              }}
            >
              <UserPlus className="size-4" aria-hidden="true" />
              Signup
            </TabsTrigger>
          </TabsList>
        </Tabs>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit} noValidate>
          <h2 id="auth-form-title" className="sr-only">
            {mode === "login" ? "Login form" : "Signup form"}
          </h2>

          <TransitionPanel
            activeIndex={mode === "signup" ? 1 : 0}
            className={mode === "login" ? "hidden" : "overflow-hidden"}
            transition={{ duration: shouldReduceMotion ? 0 : 0.18, ease: "easeOut" }}
            variants={shouldReduceMotion ? reducedAuthModePanelVariants : authModePanelVariants}
          >
            {null}
            <div className="grid gap-5 sm:grid-cols-2">
              <AuthField
                id="firstName"
                label="First name"
                value={values.firstName}
                error={fieldErrors.firstName}
                autoComplete="given-name"
                onChange={(value) => updateField("firstName", value)}
              />
              <AuthField
                id="lastName"
                label="Last name"
                value={values.lastName}
                error={fieldErrors.lastName}
                autoComplete="family-name"
                onChange={(value) => updateField("lastName", value)}
              />
            </div>
          </TransitionPanel>

          <AuthField
            id="email"
            label="Email"
            type="email"
            value={values.email}
            error={fieldErrors.email}
            autoComplete="email"
            onChange={(value) => updateField("email", value)}
          />
          <AuthField
            id="password"
            label="Password"
            type="password"
            value={values.password}
            error={fieldErrors.password}
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            onChange={(value) => updateField("password", value)}
          />

          {formError || storeError ? (
            <Alert variant="destructive" className="rounded-none border-destructive/40 bg-destructive/10 px-3 py-2">
              <AlertDescription>{formError || storeError}</AlertDescription>
            </Alert>
          ) : null}

          {formMessage ? (
            <Alert role="status" className="rounded-none border-accent bg-accent/10 px-3 py-2 text-foreground">
              <Check className="size-4" aria-hidden="true" />
              <AlertDescription className="text-foreground">{formMessage}</AlertDescription>
            </Alert>
          ) : null}

          <Button type="submit" className="h-11 w-full rounded-none" disabled={isLoading}>
            {isLoading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
            {mode === "login" ? "Sign in" : "Create account"}
          </Button>
        </form>
      </section>
    </div>
  );
}

type FieldProps = {
  id: keyof FieldErrors;
  label: string;
  value: string;
  error?: string;
  type?: string;
  autoComplete?: string;
  onChange: (value: string) => void;
};

function AuthField({ id, label, value, error, type = "text", autoComplete, onChange }: FieldProps) {
  const errorId = `${id}-error`;

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel className="text-sm font-semibold text-foreground" htmlFor={id}>
        {label}
      </FieldLabel>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className="h-11 rounded-none bg-background px-3 text-sm"
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? (
        <FieldError id={errorId}>
          {error}
        </FieldError>
      ) : null}
    </Field>
  );
}
