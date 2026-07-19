"use client";

import { useAuth } from "@/components/auth/AuthProvider";
import { cn } from "@/lib/utils";

export function OpenAuthButton({
  tab = "signup",
  message,
  className,
  children,
}: {
  tab?: "login" | "signup";
  message?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { openAuth } = useAuth();
  return (
    <button type="button" className={className} onClick={() => openAuth({ tab, message })}>
      {children}
    </button>
  );
}
