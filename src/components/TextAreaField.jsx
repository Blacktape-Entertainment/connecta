// Reusable TextArea Field Component with character count
export default function TextAreaField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
  maxLength,
  rows = 4,
  required = false,
}) {
  const charCount = value ? value.length : 0;
  const wordCount = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;

  return (
    <div className="flex flex-col gap-2 group">
      <div className="flex items-center justify-between">
        <label
          htmlFor={name}
          className="text-light font-body text-sm font-semibold tracking-wide transition-colors group-focus-within:text-gradient1"
        >
          {label}
          {required && <span className="text-red-400 ml-1">*</span>}
        </label>
        {maxLength && (
          <span className="text-xs text-light/50">
            {wordCount} words {charCount > 0 && `(${charCount}/${maxLength} chars)`}
          </span>
        )}
      </div>
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        maxLength={maxLength}
        rows={rows}
        className={`bg-light/10 border ${
          error ? "border-red-400" : "border-gradient1/40"
        } rounded-lg px-3 py-2 text-light font-body text-sm outline-none transition-all duration-300 placeholder:text-light/50 focus:border-gradient1 focus:bg-light/15 focus:ring-1 focus:ring-gradient1/30 hover:border-gradient1/60 hover:bg-light/12 resize-y`}
      />
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
