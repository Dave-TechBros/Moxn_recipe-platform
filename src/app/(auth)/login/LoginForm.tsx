"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginSchema, firstErrors } from "@/lib/validation";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { Spinner } from "@/components/ui/Spinner";

export function LoginForm({ onSuccess, redirect }: { onSuccess?: () => void; redirect?: string }) {
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
      email: String(fd.get("email") || ""),
      password: String(fd.get("password") || ""),
    };
    const parsed = loginSchema.safeParse(values);
    if (!parsed.success) {
      setErrors(firstErrors(parsed));
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setFormError(data.error || "Could not log in.");
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
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} />
      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Password</span>
          <a href="/forgot-password" className="text-xs font-medium text-brand-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <PasswordField
          id="login-password"
          label=""
          name="password"
          autoComplete="current-password"
          placeholder="••••••••"
          error={errors.password}
        />
      </div>
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Spinner /> : "Log in"}
      </button>
    </form>
  );
}
