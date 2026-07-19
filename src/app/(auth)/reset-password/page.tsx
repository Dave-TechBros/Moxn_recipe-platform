import { ResetForm } from "./ResetForm";

export const metadata = { title: "Set new password" };

export default function ResetPasswordPage() {
  return (
    <div className="card p-8 shadow-sm">
      <h1 className="text-center text-2xl font-bold">Set a new password</h1>
      <p className="mt-1 text-center text-sm text-slate-500">
        Choose a strong password for your account
      </p>
      <ResetForm />
    </div>
  );
}
