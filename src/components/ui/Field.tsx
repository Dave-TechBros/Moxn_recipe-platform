"use client";

import { forwardRef } from "react";

type FieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export const Field = forwardRef<HTMLInputElement, FieldProps>(function Field(
  { label, error, id, ...props },
  ref
) {
  const fieldId = id || props.name;
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
      </label>
      <input
        id={fieldId}
        ref={ref}
        aria-invalid={!!error}
        className="input"
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-medium text-red-600">{error}</p>}
    </div>
  );
});
