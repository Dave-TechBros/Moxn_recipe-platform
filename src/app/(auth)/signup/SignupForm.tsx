"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signupSchema, firstErrors } from "@/lib/validation";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { Spinner } from "@/components/ui/Spinner";

export function SignupForm({ onSuccess, redirect }: { onSuccess?: () => void; redirect?: string }) {
  const router = useRouter();
  const go = redirect || "/dashboard";

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const values = {
      displayName: String(fd.get("displayName") || ""),
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
      confirmPassword: String(fd.get("confirmPassword") || ""),
    };
    const parsed = signupSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(firstErrors(parsed));
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error || "Could not create account.");
      setLoading(false);
      return;
    }
    if (onSuccess) {
      onSuccess();
      router.refresh();
    } else {
      router.push(go);
      router.refresh();
    }
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {formError && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {formError}
        </div>
      )}
      <Field label="Display name" name="displayName" autoComplete="name" placeholder="Jamie Cook" error={errors.displayName} />
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} />
      <PasswordField
        id="signup-password"
        label="Password"
        name="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        error={errors.password}
      />
      <PasswordField
        id="signup-confirm"
        label="Confirm password"
        name="confirmPassword"
        autoComplete="new-password"
        placeholder="Re-enter password"
        error={errors.confirmPassword}
      />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Spinner /> : "Create account"}
      </button>
      <p className="text-center text-xs text-slate-400">
        By signing up you agree to our Terms and Privacy Policy.
      </p>
    </form>
  );
}
