import type { JSX } from "preact";
import FormField from "./FormField";

interface NumberInputProps {
  id: string;
  value: string;
  onInput: (e: Event) => void;
  onBlur?: (e: Event) => void;
  onKeyDown?: (e: KeyboardEvent) => void;
  label: string;
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
  defaultValue?: string;
}

export default function NumberInput({
  id,
  value,
  onInput,
  onBlur,
  onKeyDown,
  label,
  min,
  max,
  unit,
  placeholder,
  disabled = false,
  required = false,
  error,
  helpText,
  className = "",
  defaultValue,
}: NumberInputProps) {
  // Handles character validation on every input event
  const handleInput = (e: Event) => {
    const input = e.target as HTMLInputElement;
    const newValue = input.value;

    // Test if the new value is valid (empty, or a valid number format)
    const isValid = newValue === '' || /^\d*\.?\d*$/.test(newValue);

    if (isValid) {
      // If the format is valid, propagate the change to the parent.
      onInput(e);
    } else {
      // If invalid, revert to the last valid state from props.
      input.value = value;
    }
  };

  // Handles validation and default value restoration when the user leaves the input field
  const handleBlurEvent = (e: Event) => {
    const input = e.target as HTMLInputElement;

    // 1. Handle empty value: restore default if provided
    if (input.value === '' && defaultValue !== undefined) {
      input.value = defaultValue;
      // Notify parent of the change so its state is updated
      onInput(e);
    }

    // 2. Handle min/max clamping (on the potentially updated value)
    if (input.value !== '') {
      const numValue = parseFloat(input.value);
      let finalValue = numValue;

      if (min !== undefined && numValue < min) {
        finalValue = min;
      } else if (max !== undefined && numValue > max) {
        finalValue = max;
      }

      if (finalValue !== numValue) {
        input.value = String(finalValue);
        // Notify parent of the clamped value
        onInput(e);
      }
    }

    // 3. Call parent's onBlur handler for any additional logic (like recalculating)
    if (onBlur) {
      onBlur(e);
    }
  };

  const inputElement = (
    <div class="relative">
      <input
        type="text"
        inputMode="decimal"
        id={id}
        value={value}
        onInput={handleInput}
        onBlur={handleBlurEvent}
        onKeyDown={onKeyDown}
        min={min}
        max={max}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        class={`w-full px-3 py-2 text-base sm:text-lg bg-white dark:bg-gray-700 border ${
          error
            ? "border-red-500 focus:ring-red-500 focus:border-red-500"
            : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
        } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent dark:text-white h-10 sm:h-11 ${className}`}
      />
      {unit && (
        <div class="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-500 dark:text-gray-400">
          {unit}
        </div>
      )}
    </div>
  );

  return (
    <FormField
      id={id}
      label={label}
      error={error}
      helpText={helpText}
      required={required}
    >
      {inputElement}
    </FormField>
  );
}
