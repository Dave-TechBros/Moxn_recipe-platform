"use client";

import { useRef, useState } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { useToast } from "@/components/ui/Toast";
import { Avatar } from "@/components/ui/Avatar";
import { Spinner } from "@/components/ui/Spinner";
import { defaultAvatarUrl } from "@/lib/utils";

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function AvatarUploader() {
  const { profile, updateProfile } = useAuth();
  const { toast } = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  const pick = () => inputRef.current?.click();

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    if (!ALLOWED.includes(file.type)) {
      toast("Please choose a JPG, PNG, WEBP or GIF image.", "error");
      return;
    }
    if (file.size > MAX_BYTES) {
      toast("Image must be smaller than 5 MB.", "error");
      return;
    }

    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    setUploading(true);
    setProgress(10);

    try {
      const url = await uploadWithProgress(file, "avatars", setProgress);
      await updateProfile({ avatar_url: url });
      setProgress(100);
      toast("Profile photo updated!", "success");
    } catch {
      toast("Upload failed. Please try again.", "error");
      setPreview(null);
    } finally {
      setUploading(false);
      setTimeout(() => setProgress(0), 800);
    }
  }

  async function resetToDefault() {
    const url = defaultAvatarUrl(profile?.username || "moxn");
    try {
      await updateProfile({ avatar_url: url });
      setPreview(null);
      toast("Reset to default avatar", "success");
    } catch {
      toast("Could not reset avatar", "error");
    }
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
      <div className="relative">
        <Avatar src={preview || profile?.avatar_url} seed={profile?.username} size={96} />
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 text-white">
            <Spinner />
          </div>
        )}
      </div>

      <div className="flex-1">
        <p className="font-semibold">Profile photo</p>
        <p className="text-sm text-slate-500">Upload from your device — JPG, PNG, WEBP or GIF, up to 5 MB.</p>

        {progress > 0 && (
          <div className="mt-3 h-2 w-full max-w-xs overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div className="h-full bg-brand-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}

        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={pick} disabled={uploading} className="btn-primary">
            {uploading ? "Uploading…" : "Upload photo"}
          </button>
          <button onClick={resetToDefault} disabled={uploading} className="btn-secondary">
            Use default avatar
          </button>
        </div>
        <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={onFile} />
      </div>
    </div>
  );
}

function uploadWithProgress(
  file: File,
  folder: string,
  onProgress: (p: number) => void
): Promise<string> {
  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append("file", file);
    form.append("folder", folder);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/upload");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(10 + Math.round((e.loaded / e.total) * 80));
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText).url);
        } catch {
          reject(new Error("bad response"));
        }
      } else reject(new Error("upload failed"));
    };
    xhr.onerror = () => reject(new Error("network error"));
    xhr.send(form);
  });
}
