import { Suspense } from "react";
import Link from "next/link";
import { SignupForm } from "./SignupForm";

export const metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <div className="card p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold">Create your account</h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        Join MOXN Pantry free and start cooking
      </p>
      <Suspense fallback={<div className="mt-6 h-60" />}>
        <SignupForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
