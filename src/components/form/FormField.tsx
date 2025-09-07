import type { JSX } from "preact";

interface FormFieldProps {
  id: string;
  label: string;
  children: JSX.Element;
  error?: string;
  helpText?: string;
  required?: boolean;
  className?: string;
}

export default function FormField({
  id,
  label,
  children,
  error,
  helpText,
  required = false,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`form-field ${className}`}>
      <label 
        htmlFor={id} 
        className="block text-base sm:text-lg font-medium text-gray-700 dark:text-gray-300 mb-2"
      >
        {label}
        {required && <span class="text-red-500 ml-1">*</span>}
      </label>
      {children}
      {error && (
        <div class="mt-1 text-sm text-red-600 dark:text-red-400">
          {error}
        </div>
      )}
      {helpText && !error && (
        <div class="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {helpText}
        </div>
      )}
    </div>
  );
}