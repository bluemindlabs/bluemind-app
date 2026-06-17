// src/components/ui/Spinner.tsx
export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-brand-200 border-t-brand-600 ${className}`}
    />
  );
}
