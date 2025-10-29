// Reusable Radio Field Component
export default function RadioField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  options,
  required = false,
}) {
  return (
    <div className="flex flex-col gap-2 group">
      <label className="text-light font-body text-xs font-medium tracking-wide transition-colors group-focus-within:text-gradient1">
        {label}
        {required && <span className="text-red-400 ml-1">*</span>}
      </label>
      <div className="flex flex-col gap-2.5">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2.5 cursor-pointer hover:bg-light/5 p-2 rounded transition-colors"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              onBlur={onBlur}
              className="w-4 h-4 border-2 border-gradient1/40 bg-light/10 text-gradient1 focus:ring-2 focus:ring-gradient1/30 cursor-pointer"
            />
            <span className="text-sm text-light">{option.label}</span>
          </label>
        ))}
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
