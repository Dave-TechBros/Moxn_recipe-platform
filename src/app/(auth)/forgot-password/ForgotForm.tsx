"use client";

import { useState } from "react";
import Link from "next/link";
import { forgotSchema, firstErrors } from "@/lib/validation";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";

export function ForgotForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devUrl, setDevUrl] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormError("");
    const fd = new FormData(e.currentTarget);
    const parsed = forgotSchema.safeParse({ email: String(fd.get("email") || "") });
    if (!parsed.success) {
      setErrors(firstErrors(parsed));
      return;
    }
    setErrors({});
    setLoading(true);
    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed.data),
    });
    const data = await res.json().catch(() => ({}));
    setLoading(false);
    if (!res.ok) {
      setFormError(data.error || "Something went wrong.");
      return;
    }
    setDevUrl(data.devResetUrl ?? null);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-lg bg-brand-50 p-6 text-center dark:bg-brand-950/40">
        <h2 className="font-semibold text-brand-800 dark:text-brand-200">Check your email</h2>
        <p className="mt-1 text-sm text-brand-700 dark:text-brand-300">
          If an account exists for that email, a password reset link is on its way.
        </p>
        {devUrl && (
          <div className="mt-4 rounded-md bg-white p-3 text-left text-xs dark:bg-slate-900">
            <p className="font-semibold text-slate-500">Dev mode — no email provider configured:</p>
            <Link href={devUrl} className="break-all font-medium text-brand-600 hover:underline">
              {devUrl}
            </Link>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
      {formError && (
        <div className="rounded-lg bg-red-50 px-3 py-2.5 text-sm font-medium text-red-700 dark:bg-red-950/40 dark:text-red-300">
          {formError}
        </div>
      )}
      <Field label="Email" name="email" type="email" autoComplete="email" placeholder="you@example.com" error={errors.email} />
      <button type="submit" disabled={loading} className="btn-primary w-full">
        {loading ? <Spinner /> : "Send reset link"}
      </button>
    </form>
  );
}
