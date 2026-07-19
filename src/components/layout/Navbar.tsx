"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Avatar } from "@/components/ui/Avatar";
import { useAuth } from "@/components/auth/AuthProvider";

export function Navbar() {
  const { isAuthed, profile, signOut, requireAuth, openAuth } = useAuth();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/recipes?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80">
      <nav className="mx-auto flex max-w-7xl items-center gap-4 px-4 py-3 sm:px-6">
        <Link href="/" aria-label="MOXN home">
          <Logo size={30} />
        </Link>

        <div className="hidden md:flex items-center gap-1 text-sm font-medium">
          <Link href="/recipes" className="btn-ghost">Recipes</Link>
          <Link href="/categories" className="btn-ghost">Categories</Link>
          <Link href="/creators" className="btn-ghost">Creators</Link>
        </div>

        <form onSubmit={onSearch} className="ml-auto hidden sm:block flex-1 max-w-xs">
          <div className="relative">
            <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" /></svg>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search recipes…"
              className="input pl-9"
              aria-label="Search recipes"
            />
          </div>
        </form>

        <div className="ml-auto sm:ml-0 flex items-center gap-1">
          <ThemeToggle />

          <button
            onClick={() =>
              requireAuth(() => router.push("/create"), "Sign in to share your own recipe.")
            }
            className="btn-primary hidden sm:inline-flex"
          >
            Upload
          </button>

          {isAuthed ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="ml-1 rounded-full"
                aria-label="Account menu"
              >
                <Avatar src={profile?.avatar_url} seed={profile?.username} size={36} />
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-52 animate-scale-in card p-1.5 shadow-xl">
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold">{profile?.display_name}</p>
                    <p className="truncate text-xs text-slate-500">@{profile?.username}</p>
                  </div>
                  <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <MenuLink href={`/creators/${profile?.username}`} onClick={() => setMenuOpen(false)}>My profile</MenuLink>
                  <MenuLink href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</MenuLink>
                  <MenuLink href="/collections" onClick={() => setMenuOpen(false)}>Collections</MenuLink>
                  <MenuLink href="/saved" onClick={() => setMenuOpen(false)}>Saved recipes</MenuLink>
                  {profile?.role === "admin" && (
                    <MenuLink href="/admin" onClick={() => setMenuOpen(false)}>Admin</MenuLink>
                  )}
                  <MenuLink href="/settings" onClick={() => setMenuOpen(false)}>Settings</MenuLink>
                  <div className="my-1 h-px bg-slate-200 dark:bg-slate-800" />
                  <button
                    onClick={() => { setMenuOpen(false); signOut(); }}
                    className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <button onClick={() => openAuth({ tab: "login" })} className="btn-ghost">Log in</button>
              <button onClick={() => openAuth({ tab: "signup" })} className="btn-primary hidden sm:inline-flex">Sign up</button>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function MenuLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800"
    >
      {children}
    </Link>
  );
}
