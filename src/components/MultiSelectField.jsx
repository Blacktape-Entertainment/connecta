// Reusable Multi-Select Field Component
export default function MultiSelectField({
  label,
  name,
  value = [],
  onChange,
  onBlur,
  error,
  options,
  placeholder = "Select options...",
}) {
  const handleToggle = (optionValue) => {
    const currentValues = Array.isArray(value) ? value : [];
    const newValues = currentValues.includes(optionValue)
      ? currentValues.filter((v) => v !== optionValue)
      : [...currentValues, optionValue];

    // Create synthetic event to match expected onChange signature
    onChange({
      target: {
        name,
        value: newValues,
      },
    });
  };

  const selectedLabels = options
    .filter((opt) => Array.isArray(value) && value.includes(opt.value))
    .map((opt) => opt.label);

  return (
    <div className="flex flex-col gap-1.5 group">
      <label
        htmlFor={name}
        className="text-light font-body text-xs font-medium tracking-wide transition-colors group-focus-within:text-gradient1"
      >
        {label}
      </label>
      <div
        className={`bg-light/10 border ${
          error ? "border-red-400" : "border-gradient1/40"
        } rounded-lg px-3 py-2 text-light font-body text-sm outline-none transition-all duration-300 focus-within:border-gradient1 focus-within:bg-light/15 focus-within:ring-1 focus-within:ring-gradient1/30 hover:border-gradient1/60 hover:bg-light/12`}
      >
        {/* Selected Values Display */}
        <div className="min-h-6 mb-2">
          {selectedLabels.length === 0 ? (
            <span className="text-light/40 text-sm">{placeholder}</span>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {selectedLabels.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient1/20 border border-gradient1/30 rounded text-xs text-light"
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Options Checkboxes */}
        <div className="flex flex-col gap-2 max-h-48 overflow-y-auto">
          {options
            .filter((opt) => opt.value !== "") // Filter out placeholder options
            .map((option) => {
              const isChecked =
                Array.isArray(value) && value.includes(option.value);
              return (
                <label
                  key={option.value}
                  className="flex items-center gap-2 cursor-pointer hover:bg-light/5 p-1.5 rounded transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggle(option.value)}
                    onBlur={onBlur}
                    className="w-4 h-4 rounded border-gradient1/40 bg-light/10 checked:bg-gradient1 checked:border-gradient1 focus:ring-1 focus:ring-gradient1/30 cursor-pointer"
                  />
                  <span className="text-sm text-light">{option.label}</span>
                </label>
              );
            })}
        </div>
      </div>
      {error && (
        <span className="text-red-400 text-xs font-body flex items-center gap-1.5">
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
