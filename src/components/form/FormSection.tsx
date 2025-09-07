import type { JSX } from "preact";

interface FormSectionProps {
  title?: string;
  description?: string;
  children: JSX.Element | JSX.Element[];
  className?: string;
}

export default function FormSection({
  title,
  description,
  children,
  className = "",
}: FormSectionProps) {
  return (
    <div class={`form-section ${className}`}>
      {(title || description) && (
        <div class="mb-6">
          {title && (
            <h3 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          )}
          {description && (
            <p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
      )}
      <div class="space-y-4">
        {children}
      </div>
    </div>
  );
}