"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { usePathname } from "next/navigation";
import type { Profile } from "@/lib/types";
import { AuthModal } from "./AuthModal";

type AuthContextValue = {
  loading: boolean;
  userId: string | null;
  profile: Profile | null;
  isAuthed: boolean;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Record<string, unknown>) => Promise<{ ok: boolean; profile?: Profile }>;
  signOut: () => Promise<void>;
  requireAuth: (action: () => void, message?: string) => void;
  openAuth: (opts?: { tab?: "login" | "signup"; message?: string; redirect?: string }) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

export function AuthProvider({
  initialProfile,
  initialUserId,
  children,
}: {
  initialProfile: Profile | null;
  initialUserId: string | null;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [userId, setUserId] = useState<string | null>(initialUserId);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"login" | "signup">("login");
  const [modalMessage, setModalMessage] = useState<string | undefined>();
  const [modalRedirect, setModalRedirect] = useState<string | undefined>();

  // Keep client state in sync with server-provided session after
  // router.refresh() re-renders the layout with a new initialUserId.
  useEffect(() => {
    setUserId(initialUserId);
  }, [initialUserId]);
  useEffect(() => {
    setProfile(initialProfile);
  }, [initialProfile]);

  const refreshProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      const data = await res.json();
      setProfile(data.profile ?? null);
      setUserId(data.profile?.id ?? null);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    if (!initialProfile) refreshProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    setLoading(true);
    await fetch("/api/auth/logout", { method: "POST" });
    setUserId(null);
    setProfile(null);
    setLoading(false);
    window.location.href = "/";
  }, []);

  const openAuth = useCallback(
    (opts?: { tab?: "login" | "signup"; message?: string; redirect?: string }) => {
      setModalTab(opts?.tab ?? "login");
      setModalMessage(opts?.message);
      setModalRedirect(opts?.redirect ?? pathname);
      setModalOpen(true);
    },
    [pathname]
  );

  const requireAuth = useCallback(
    (action: () => void, message?: string) => {
      if (userId) {
        action();
      } else {
        openAuth({ message, redirect: pathname });
      }
    },
    [userId, openAuth, pathname]
  );

  // Patch the current user's profile and immediately update the global
  // context state with the server's response, so every consumer reflects
  // the change without a page refresh.
  const updateProfile = useCallback(
    async (updates: Record<string, unknown>) => {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || "Could not save profile");
      const data = await res.json();
      if (data.profile) {
        setProfile(data.profile);
        setUserId(data.profile.id);
      }
      return data;
    },
    []
  );

  const value: AuthContextValue = {
    loading,
    userId,
    profile,
    isAuthed: !!userId,
    refreshProfile,
    updateProfile,
    signOut,
    requireAuth,
    openAuth,
  };

  return (
    <AuthContext.Provider value={value}>
      <div
        className={`transition-[filter] duration-300 ${
          modalOpen ? "pointer-events-none select-none blur-sm saturate-50" : ""
        }`}
        aria-hidden={modalOpen}
      >
        {children}
      </div>
      <AuthModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        message={modalMessage}
        redirect={modalRedirect}
        initialTab={modalTab}
      />
    </AuthContext.Provider>
  );
}
