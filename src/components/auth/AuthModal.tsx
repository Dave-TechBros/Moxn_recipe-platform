"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Modal } from "@/components/ui/Modal";
import { LogoMark } from "@/components/brand/Logo";
import { LoginForm } from "@/app/(auth)/login/LoginForm";
import { SignupForm } from "@/app/(auth)/signup/SignupForm";
import { useAuth } from "./AuthProvider";

export function AuthModal({
  open,
  onClose,
  message,
  redirect,
  initialTab = "login",
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
  redirect?: string;
  initialTab?: "login" | "signup";
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { refreshProfile } = useAuth();
  const [tab, setTab] = useState<"login" | "signup">(initialTab);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setSent(false);
    }
  }, [open, initialTab]);

  const onSuccess = () => {
    onClose();
    // Immediately refresh auth context so the UI reflects the logged-in
    // session without requiring a manual browser refresh.
    refreshProfile();
    const target = redirect && redirect !== "/" ? redirect : "/dashboard";
    if (target !== pathname) router.push(target);
    router.refresh();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-600">
          <LogoMark size={34} className="text-white" />
        </div>
        <h2 className="text-xl font-bold">Welcome to MOXN Pantry</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          {message ?? "Sign in or create a free account to save recipes, rate dishes and follow creators."}
        </p>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 text-sm font-semibold dark:bg-slate-800">
        <button
          onClick={() => setTab("login")}
          className={`rounded-lg py-2 transition-colors ${
            tab === "login" ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300" : "text-slate-500"
          }`}
        >
          Sign in
        </button>
        <button
          onClick={() => setTab("signup")}
          className={`rounded-lg py-2 transition-colors ${
            tab === "signup" ? "bg-white text-brand-700 shadow-sm dark:bg-slate-900 dark:text-brand-300" : "text-slate-500"
          }`}
        >
          Sign up
        </button>
      </div>

      <div className="mt-4">
        {tab === "login" ? (
          <>
            <LoginForm
              onSuccess={onSuccess}
            />
            <p className="mt-4 text-center text-sm text-slate-500">
              No account?{" "}
              <button onClick={() => setTab("signup")} className="font-semibold text-brand-600 hover:underline">
                Create one
              </button>
            </p>
          </>
        ) : (
          <>
            <SignupForm onSuccess={onSuccess} />
            <p className="mt-4 text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button onClick={() => setTab("login")} className="font-semibold text-brand-600 hover:underline">
                Sign in
              </button>
            </p>
          </>
        )}
      </div>

      <button onClick={onClose} className="btn-ghost mt-2 w-full text-slate-500">
        Maybe later
      </button>
    </Modal>
  );
}
