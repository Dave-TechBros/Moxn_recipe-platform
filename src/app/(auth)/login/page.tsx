import { Suspense } from "react";
import Link from "next/link";
import { LoginForm } from "./LoginForm";

export const metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <div className="card p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold">Welcome back</h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        Log in to continue to MOXN Pantry
      </p>
      <Suspense fallback={<div className="mt-6 h-40" />}>
        <LoginForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-brand-600 hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
