import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { getSessionProfile } from "@/lib/getSession";

export const metadata: Metadata = {
  title: {
    default: "MOXN Pantry — Discover & Share Great Recipes",
    template: "%s · MOXN Pantry",
  },
  description:
    "MOXN Pantry is a premium recipe platform to discover, save, and share delicious recipes from creators around the world.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, profile } = await getSessionProfile();

  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider initialUserId={userId} initialProfile={profile}>
              <div className="flex min-h-screen flex-col">
                <Navbar />
                <main className="flex-1">{children}</main>
                <Footer />
              </div>
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
