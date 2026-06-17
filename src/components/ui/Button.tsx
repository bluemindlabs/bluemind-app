// src/components/ui/Button.tsx
"use client";
import { Spinner } from "./Spinner";

type Variant = "primary" | "ghost" | "outline";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  loading?: boolean;
}

const styles: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white hover:bg-brand-600 shadow-lg shadow-brand-500/20",
  outline:
    "border border-brand-300 text-brand-700 bg-white/70 hover:bg-brand-50",
  ghost: "text-brand-700 hover:bg-brand-50",
};

export function Button({
  variant = "primary",
  loading,
  children,
  className = "",
  disabled,
  ...rest
}: Props) {
  return (
    <button
      {...rest}
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 ${styles[variant]} ${className}`}
    >
      {loading && <Spinner className="h-4 w-4 border-white/40 border-t-white" />}
      {children}
    </button>
  );
}
