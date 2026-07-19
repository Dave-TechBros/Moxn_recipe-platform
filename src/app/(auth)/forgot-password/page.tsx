import Link from "next/link";
import { ForgotForm } from "./ForgotForm";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <div className="card p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold">Reset your password</h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        Enter your email and we&apos;ll send you a reset link
      </p>
      <ForgotForm />
      <p className="mt-6 text-center text-sm text-slate-500">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-brand-600 hover:underline">
          Back to login
        </Link>
      </p>
    </div>
  );
}
