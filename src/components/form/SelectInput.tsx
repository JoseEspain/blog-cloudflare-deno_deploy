import FormField from "./FormField";

interface SelectOption {
  value: string;
  label: string;
  group?: string;
}

interface SelectInputProps {
  id: string;
  value: string;
  onChange: (e: Event) => void;
  label: string;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  helpText?: string;
  className?: string;
}

export default function SelectInput({
  id,
  value,
  onChange,
  label,
  options,
  placeholder,
  disabled = false,
  required = false,
  error,
  helpText,
  className = "",
}: SelectInputProps) {
  // 按组分类选项
  const groupedOptions = options.reduce((acc, option) => {
    const group = option.group || "default";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(option);
    return acc;
  }, {} as Record<string, SelectOption[]>);

  const selectElement = (
    <select
      id={id}
      value={value}
      onChange={onChange}
      disabled={disabled}
      required={required}
      class={`w-full px-3 py-2 text-base sm:text-lg bg-white dark:bg-gray-700 border appearance-none ${
        error 
          ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
          : "border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
      } rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:border-transparent dark:text-white h-10 sm:h-11 ${className}`}
    >
      {placeholder && (
        <option value="" disabled>
          {placeholder}
        </option>
      )}
      {Object.entries(groupedOptions).map(([group, groupOptions]) => (
        group === "default" ? (
          groupOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))
        ) : (
          <optgroup label={group} key={group}>
            {groupOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </optgroup>
        )
      ))}
    </select>
  );

  return (
    <FormField
      id={id}
      label={label}
      error={error}
      helpText={helpText}
      required={required}
    >
      {selectElement}
    </FormField>
  );
}