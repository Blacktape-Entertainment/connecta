// Reusable Checkbox Group Field Component with conditional "Other" text input
import { useState } from "react";

export default function CheckboxGroupField({
  label,
  name,
  value = [],
  onChange,
  onBlur,
  error,
  options,
  required = false,
  hasOther = false,
  otherValue = "",
  onOtherChange,
}) {
  const [showOtherInput, setShowOtherInput] = useState(
    hasOther && value.includes("Other")
  );

  const handleToggle = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];

    // Show/hide other input when "Other" is toggled
    if (optionValue === "Other" && hasOther) {
      setShowOtherInput(!currentValues.includes("Other"));
      if (currentValues.includes("Other") && onOtherChange) {
        // Clear other input when unchecked
        onOtherChange({ target: { name: `${name}Other`, value: "" } });
      }
    }

    onChange({
      target: {
        name,
        value: newValues,
      },
    });
  };

  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-light font-body text-xs font-medium tracking-wide transition-colors group-focus-within:text-gradient1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const isChecked = Array.isArray(value) && value.includes(option.value);
          return (
            <div key={option.value} className="flex flex-col gap-2">
              <label className="flex items-center gap-2.5 cursor-pointer hover:bg-light/5 p-2 rounded transition-colors">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleToggle(option.value)}
                  onBlur={onBlur}
                  className="w-4 h-4 rounded border-gradient1/40 bg-light/10 checked:bg-gradient1 checked:border-gradient1 focus:ring-1 focus:ring-gradient1/30 cursor-pointer"
                />
                <span className="text-sm text-light">{option.label}</span>
              </label>

              {/* Conditional "Other" text input */}
              {option.value === "Other" && showOtherInput && hasOther && (
                <input
                  type="text"
                  name={`${name}Other`}
                  value={otherValue}
                  onChange={onOtherChange}
                  placeholder="Please specify..."
                  className="ml-6 bg-light/10 border border-gradient1/40 rounded-lg px-3 py-2 text-light font-body text-sm outline-none transition-all duration-300 placeholder:text-light/50 focus:border-gradient1 focus:bg-light/15 focus:ring-1 focus:ring-gradient1/30"
                />
              )}
            </div>
          );
        })}
      </div>
      {error && (
        <span className="text-red-400 text-xs font-body flex items-center gap-1.5 mt-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          {error}
        </span>
      )}
    </div>
  );
}
