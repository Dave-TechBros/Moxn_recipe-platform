"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { resetSchema, firstErrors } from "@/lib/validation";
import { Field } from "@/components/ui/Field";
import { PasswordField } from "@/components/ui/PasswordField";
import { Spinner } from "@/components/ui/Spinner";

function ResetFormInner() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token") || "";

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const parsed = resetSchema.safeParse({
      password: String(fd.get("password") || ""),
      confirmPassword: String(fd.get("confirmPassword") || ""),
    });
    if (!parsed.success) {
      setErrors(firstErrors(parsed));
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: parsed.data.password }),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setFormError(data.error || "Could not reset password.");
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/dashboard");
      router.refresh();
    }, 1500);
  }

  if (success) {
    return (
      <div className="mt-6 rounded-lg bg-brand-50 p-6 text-center dark:bg-brand-950/40">
        <h2 className="font-semibold text-brand-800 dark:text-brand-200">Password updated</h2>
        <p className="mt-1 text-sm text-brand-700 dark:text-brand-300">Signing you in…</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {!token && (
        <div className="rounded-lg bg-amber-50 px-3 py-2.5 text-sm text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
          Open this page from the reset link in your email.{" "}
          <Link href="/forgot-password" className="font-semibold underline">Request a new link</Link>.
        </div>
      )}
      {formError && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {formError}
        </div>
      )}
      <PasswordField id="reset-password" label="New password" name="password" autoComplete="new-password" placeholder="At least 8 characters" error={errors.password} />
      <PasswordField id="reset-confirm" label="Confirm password" name="confirmPassword" autoComplete="new-password" placeholder="Re-enter password" error={errors.confirmPassword} />
      <button type="submit" disabled={loading || !token} className="btn-primary w-full">
        {loading ? <Spinner /> : "Update password"}
      </button>
    </form>
  );
}

export function ResetForm() {
  return (
    <Suspense fallback={<div className="mt-6 h-40" />}>
      <ResetFormInner />
    </Suspense>
  );
}
