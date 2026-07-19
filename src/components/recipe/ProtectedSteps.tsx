"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { OpenAuthButton } from "@/components/auth/OpenAuthButton";

export function ProtectedSteps({
  steps,
  ingredients,
}: {
  steps: string[];
  ingredients: string[];
}) {
  const { isAuthed } = useAuth();
  const pathname = usePathname();

  if (!isAuthed) {
    return (
      <div className="relative">
        {/* Blurred teaser of the first few items */}
        <div className="pointer-events-none select-none blur-sm">
          <h2 className="text-xl font-bold">Ingredients</h2>
          <ul className="mt-3 space-y-2">
            {(ingredients.slice(0, 3).length ? ingredients.slice(0, 3) : ["Fresh ingredients", "A pinch of love", "…and more"]).map((i, n) => (
              <li key={n} className="flex gap-2"><span className="text-brand-500">•</span>{i}</li>
            ))}
          </ul>
          <h2 className="mt-6 text-xl font-bold">Method</h2>
          <ol className="mt-3 space-y-3">
            {(steps.slice(0, 2).length ? steps.slice(0, 2) : ["Prepare your ingredients.", "Follow the chef's steps."]).map((s, n) => (
              <li key={n} className="flex gap-3"><span className="font-bold text-brand-500">{n + 1}.</span>{s}</li>
            ))}
          </ol>
        </div>

        {/* Overlay CTA */}
        <div className="absolute inset-x-0 bottom-0 top-16 flex flex-col items-center justify-center rounded-xl bg-gradient-to-t from-white via-white/95 to-transparent p-6 text-center dark:from-slate-950 dark:via-slate-950/95">
          <div className="max-w-sm rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
            <span className="text-3xl">🔒</span>
            <h3 className="mt-2 text-lg font-bold">Unlock the full recipe</h3>
            <p className="mt-1 text-sm text-slate-500">
              Sign in or create a free MOXN account to view all ingredients and
              step-by-step instructions.
            </p>
             <div className="mt-4 flex flex-col gap-2">
               <OpenAuthButton tab="login" className="btn-primary w-full">Sign in</OpenAuthButton>
               <OpenAuthButton tab="signup" className="btn-secondary w-full">Create free account</OpenAuthButton>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold">Ingredients</h2>
      {ingredients.length ? (
        <ul className="mt-3 space-y-2">
          {ingredients.map((i, n) => (
            <li key={n} className="flex gap-2"><span className="text-brand-500">•</span>{i}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-slate-500">No ingredients listed.</p>
      )}

      <h2 className="mt-8 text-xl font-bold">Method</h2>
      {steps.length ? (
        <ol className="mt-3 space-y-4">
          {steps.map((s, n) => (
            <li key={n} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 dark:bg-brand-900 dark:text-brand-200">{n + 1}</span>
              <p className="pt-0.5">{s}</p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-slate-500">No steps listed.</p>
      )}
    </div>
  );
}
