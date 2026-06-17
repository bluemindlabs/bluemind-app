// src/components/ui/Card.tsx
export function Card({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-3xl p-5 sm:p-6 ${className}`}>{children}</div>
  );
}
