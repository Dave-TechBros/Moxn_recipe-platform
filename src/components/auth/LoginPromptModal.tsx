"use client";

import Link from "next/link";
import { Modal } from "@/components/ui/Modal";
import { LogoMark } from "@/components/brand/Logo";

export function LoginPromptModal({
  open,
  onClose,
  message,
  redirect,
}: {
  open: boolean;
  onClose: () => void;
  message?: string;
  redirect?: string;
}) {
  const q = redirect ? `?redirect=${encodeURIComponent(redirect)}` : "";
  return (
    <Modal open={open} onClose={onClose}>
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800">
          <LogoMark size={34} className="text-white" />
        </div>
        <h2 className="text-xl font-bold">Sign in to continue</h2>
        <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {message ??
            "Create a free MOXN account to save recipes, rate dishes, follow creators and more."}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Link href={`/login${q}`} className="btn-primary w-full" onClick={onClose}>
            Sign in
          </Link>
          <Link
            href={`/signup${q}`}
            className="btn-secondary w-full"
            onClick={onClose}
          >
            Create free account
          </Link>
          <button onClick={onClose} className="btn-ghost mt-1 w-full text-slate-500">
            Maybe later
          </button>
        </div>
      </div>
    </Modal>
  );
}
