import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-24 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800">
        <LogoMark size={40} className="text-white" />
      </span>
      <h1 className="mt-6 text-3xl font-bold">Page not found</h1>
      <p className="mt-2 text-slate-500">The recipe you&apos;re looking for may have been moved or removed.</p>
      <Link href="/" className="btn-primary mt-6">Back to home</Link>
    </div>
  );
}
