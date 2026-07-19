"use client";

import { useState } from "react";
import { defaultAvatarUrl } from "@/lib/utils";
import { cn } from "@/lib/utils";

export function Avatar({
  src,
  seed,
  size = 40,
  className,
  alt = "avatar",
}: {
  src?: string | null;
  seed?: string;
  size?: number;
  className?: string;
  alt?: string;
}) {
  const fallback = defaultAvatarUrl(seed || alt);
  const [url, setUrl] = useState(src || fallback);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      onError={() => setUrl(fallback)}
      style={{ width: size, height: size }}
      className={cn(
        "rounded-full object-cover ring-2 ring-white dark:ring-slate-800 bg-slate-100 dark:bg-slate-800",
        className
      )}
    />
  );
}
