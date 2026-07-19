import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { OpenAuthButton } from "@/components/auth/OpenAuthButton";

export function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200/70 bg-gradient-to-b from-transparent to-orange-50/50 dark:border-slate-800 dark:to-slate-900/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <Logo size={28} />
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500 dark:text-slate-400">
            <Link href="/recipes" className="transition-colors hover:text-brand-600">Recipes</Link>
            <Link href="/categories" className="transition-colors hover:text-brand-600">Categories</Link>
            <Link href="/creators" className="transition-colors hover:text-brand-600">Creators</Link>
            <OpenAuthButton tab="signup" className="transition-colors hover:text-brand-600">Join</OpenAuthButton>
          </nav>
          <p className="text-sm text-slate-400">
            © {new Date().getFullYear()} MOXN Pantry
          </p>
        </div>
      </div>
    </footer>
  );
}
