"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { AvatarUploader } from "@/components/settings/AvatarUploader";
import { Field } from "@/components/ui/Field";
import { Spinner } from "@/components/ui/Spinner";
import { passwordSchema, emailSchema } from "@/lib/validation";
import type { Profile } from "@/lib/types";
import { cn } from "@/lib/utils";

const TABS = [
  { id: "profile", label: "Profile" },
  { id: "account", label: "Account" },
  { id: "password", label: "Password" },
  { id: "notifications", label: "Notifications" },
  { id: "appearance", label: "Appearance" },
  { id: "privacy", label: "Privacy" },
] as const;

type TabId = (typeof TABS)[number]["id"];

async function patchProfile(payload: Record<string, unknown>) {
  return fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
}

export function SettingsClient({ initialProfile }: { initialProfile: Profile | null }) {
  const { profile: liveProfile } = useAuth();
  const profile = liveProfile ?? initialProfile;
  const [tab, setTab] = useState<TabId>("profile");
  const { signOut } = useAuth();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-slate-500">Manage your account, preferences and privacy.</p>

      <div className="mt-8 grid gap-8 md:grid-cols-[200px_1fr]">
        <nav className="flex gap-2 overflow-x-auto md:flex-col md:overflow-visible">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "shrink-0 rounded-lg px-4 py-2.5 text-left text-sm font-medium",
                tab === t.id ? "bg-brand-600 text-white" : "hover:bg-slate-100 dark:hover:bg-slate-800"
              )}
            >
              {t.label}
            </button>
          ))}
          <button
            onClick={signOut}
            className="mt-2 shrink-0 rounded-lg px-4 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40"
          >
            Log out
          </button>
        </nav>

        <div className="card p-6">
          {tab === "profile" && <ProfileTab profile={profile} />}
          {tab === "account" && <AccountTab profile={profile} />}
          {tab === "password" && <PasswordTab />}
          {tab === "notifications" && <NotificationsTab profile={profile} />}
          {tab === "appearance" && <AppearanceTab />}
          {tab === "privacy" && <PrivacyTab profile={profile} />}
        </div>
      </div>
    </div>
  );
}

function ProfileTab({ profile }: { profile: Profile | null }) {
  const { profile: liveProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const source = liveProfile ?? profile;
  const [displayName, setDisplayName] = useState(source?.display_name ?? "");
  const [bio, setBio] = useState(source?.bio ?? "");
  const [saving, setSaving] = useState(false);

  // Keep inputs in sync when the live profile changes (after save or refresh).
  useEffect(() => {
    setDisplayName(source?.display_name ?? "");
    setBio(source?.bio ?? "");
  }, [source?.display_name, source?.bio]);

  async function save() {
    if (displayName.trim().length < 2) {
      toast("Display name must be at least 2 characters", "error");
      return;
    }
    setSaving(true);
    try {
      await updateProfile({ display_name: displayName.trim(), bio });
      toast("Profile updated!", "success");
    } catch (e) {
      toast(e instanceof Error ? e.message : "Could not save profile", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Edit profile</h2>
      <AvatarUploader />
      <div className="h-px bg-slate-200 dark:bg-slate-800" />
      <div>
        <label className="label">Display name</label>
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="input" />
      </div>
      <div>
        <label className="label">Bio</label>
        <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={3} className="input resize-none" placeholder="Tell people about your cooking…" />
      </div>
      <p className="text-sm text-slate-500">Username: <strong>@{profile?.username}</strong></p>
      <button onClick={save} disabled={saving} className="btn-primary">
        {saving ? <Spinner /> : "Save changes"}
      </button>
    </div>
  );
}

function AccountTab({ profile }: { profile: Profile | null }) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function changeEmail() {
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setError("");
    setSaving(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: parsed.data }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) toast(data.error || "Could not update email", "error");
    else toast("Email updated!", "success");
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Account</h2>
      <p className="text-sm text-slate-500">Change the email address used to sign in.</p>
      <Field label="New email" value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="new@example.com" error={error} />
      <button onClick={changeEmail} disabled={saving} className="btn-primary">
        {saving ? <Spinner /> : "Update email"}
      </button>
      <div className="h-px bg-slate-200 dark:bg-slate-800" />
      <p className="text-sm text-slate-500">Signed in as <strong>@{profile?.username}</strong> ({profile?.role}).</p>
    </div>
  );
}

function PasswordTab() {
  const { toast } = useToast();
  const [pw, setPw] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  async function change() {
    const parsed = passwordSchema.safeParse(pw);
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    if (pw !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setSaving(true);
    const res = await fetch("/api/account", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) toast(data.error || "Could not change password", "error");
    else {
      toast("Password changed!", "success");
      setPw("");
      setConfirm("");
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold">Change password</h2>
      <Field label="New password" value={pw} onChange={(e) => setPw(e.target.value)} type="password" placeholder="At least 8 characters" error={error} />
      <Field label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} type="password" />
      <button onClick={change} disabled={saving} className="btn-primary">
        {saving ? <Spinner /> : "Update password"}
      </button>
    </div>
  );
}

function NotificationsTab({ profile }: { profile: Profile | null }) {
  const { profile: liveProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const source = liveProfile ?? profile;
  const [prefs, setPrefs] = useState({
    notify_email: source?.notify_email ?? true,
    notify_new_follower: source?.notify_new_follower ?? true,
    notify_new_review: source?.notify_new_review ?? true,
  });

  async function toggle(key: keyof typeof prefs) {
    const next = { ...prefs, [key]: !prefs[key] };
    setPrefs(next);
    try {
      await updateProfile({ [key]: next[key] });
      toast("Preferences updated", "success");
    } catch {
      setPrefs(prefs);
      toast("Could not save preference", "error");
    }
  }

  const rows: { key: keyof typeof prefs; label: string; desc: string }[] = [
    { key: "notify_email", label: "Email notifications", desc: "Receive important updates by email" },
    { key: "notify_new_follower", label: "New followers", desc: "When someone follows you" },
    { key: "notify_new_review", label: "New reviews", desc: "When someone reviews your recipe" },
  ];

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Notification preferences</h2>
      {rows.map((r) => (
        <div key={r.key} className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
          <div>
            <p className="font-medium">{r.label}</p>
            <p className="text-sm text-slate-500">{r.desc}</p>
          </div>
          <Toggle on={prefs[r.key]} onClick={() => toggle(r.key)} />
        </div>
      ))}
    </div>
  );
}

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  const options = [
    { id: "light", label: "Light", icon: "☀️" },
    { id: "dark", label: "Dark", icon: "🌙" },
    { id: "system", label: "System", icon: "💻" },
  ];
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Appearance</h2>
      <p className="text-sm text-slate-500">Choose how MOXN Pantry looks on this device.</p>
      <div className="grid grid-cols-3 gap-3">
        {options.map((o) => (
          <button
            key={o.id}
            onClick={() => setTheme(o.id)}
            className={cn(
              "flex flex-col items-center gap-2 rounded-xl border p-5",
              theme === o.id ? "border-brand-500 bg-brand-50 dark:bg-brand-950/40" : "border-slate-200 dark:border-slate-700"
            )}
          >
            <span className="text-2xl">{o.icon}</span>
            <span className="text-sm font-medium">{o.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PrivacyTab({ profile }: { profile: Profile | null }) {
  const { profile: liveProfile, updateProfile } = useAuth();
  const { toast } = useToast();
  const source = liveProfile ?? profile;
  const [isPrivate, setIsPrivate] = useState(source?.is_private ?? false);

  async function toggle() {
    const next = !isPrivate;
    setIsPrivate(next);
    try {
      await updateProfile({ is_private: next });
      toast("Privacy updated", "success");
    } catch {
      setIsPrivate(!next);
      toast("Could not update privacy", "error");
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold">Privacy</h2>
      <div className="flex items-center justify-between gap-4 rounded-lg border border-slate-200 p-4 dark:border-slate-800">
        <div>
          <p className="font-medium">Private profile</p>
          <p className="text-sm text-slate-500">Hide your collections and activity from others.</p>
        </div>
        <Toggle on={isPrivate} onClick={toggle} />
      </div>
    </div>
  );
}

function Toggle({ on, onClick }: { on: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      role="switch"
      aria-checked={on}
      className={cn("relative h-6 w-11 shrink-0 rounded-full transition-colors", on ? "bg-brand-600" : "bg-slate-300 dark:bg-slate-600")}
    >
      <span className={cn("absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform", on ? "translate-x-[22px]" : "translate-x-0.5")} />
    </button>
  );
}
