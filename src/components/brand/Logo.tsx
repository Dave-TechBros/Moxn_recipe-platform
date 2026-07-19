import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  showWordmark?: boolean;
  size?: number;
};

/**
 * MOXN brand logo.
 * The mark is the letter "M" whose right leg grows into a herb/basil leaf,
 * integrating the vegetable element naturally rather than beside it.
 * Uses currentColor so it adapts to light and dark themes automatically.
 */
export function LogoMark({ className, size = 32 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MOXN"
      className={className}
    >
      {/* The letter M formed from a single stroke path */}
      <path
        d="M8 40V12c0-1.1.9-2 2-2 .8 0 1.5.45 1.83 1.16L24 33 36.17 11.16A2 2 0 0 1 38 10c1.1 0 2 .9 2 2v28"
        stroke="currentColor"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Herb leaf growing from the right leg of the M */}
      <path
        d="M40 26c4.4-.6 8 1.2 8 5.4 0 4.2-3.4 6.6-8 6.6-.2-4.2 1.6-8 4.8-9.6"
        fill="#f97316"
        className="text-brand-500"
      />
      <path
        d="M40 26c4.4-.6 8 1.2 8 5.4 0 4.2-3.4 6.6-8 6.6"
        stroke="#ea580c"
        strokeWidth="1.2"
        fill="none"
      />
      {/* leaf vein */}
      <path
        d="M41 36c2-2.4 4.2-4.2 6.4-5.2"
        stroke="#c2410c"
        strokeWidth="1.1"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

export function Logo({ className, showWordmark = true, size = 32 }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <LogoMark size={size} className="text-slate-900 dark:text-white" />
      {showWordmark && (
        <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          MOXN Pantry
        </span>
      )}
    </span>
  );
}
