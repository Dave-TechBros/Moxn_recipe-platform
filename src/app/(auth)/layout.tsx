import Link from "next/link";
import { LogoMark } from "@/components/brand/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-8rem)] max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mx-auto mb-8 flex flex-col items-center gap-3">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 dark:bg-slate-800">
          <LogoMark size={34} className="text-white" />
        </span>
        <span className="text-2xl font-bold tracking-tight">MOXN Pantry</span>
      </Link>
      {children}
    </div>
  );
}
