import type { JSX } from "preact";

interface FormGridProps {
  children: JSX.Element | JSX.Element[];
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export default function FormGrid({
  children,
  columns = 2,
  className = "",
}: FormGridProps) {
  // 根据列数生成 Tailwind 类
  const gridClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 md:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <div class={`grid ${gridClasses} gap-4 ${className}`}>
      {children}
    </div>
  );
}