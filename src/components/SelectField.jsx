// Reusable Select Field Component
export default function SelectField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  options,
}) {
  return (
    <div className="flex flex-col gap-2 group">
      <label
        htmlFor={name}
        className="text-light font-body text-sm font-semibold tracking-wide transition-colors group-focus-within:text-gradient1"
      >
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`bg-light/10 border ${
          error ? "border-red-400" : "border-gradient1/40"
        } rounded-lg px-3 py-2 pr-8 text-light font-body text-sm outline-none transition-all duration-300 cursor-pointer appearance-none focus:border-gradient1 focus:bg-light/15 focus:ring-1 focus:ring-gradient1/30 bg-size-[10px_10px] bg-position-[right_0.75rem_center] bg-no-repeat hover:border-gradient1/60 hover:bg-light/12`}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23ffffff' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
        }}
      >
        {options.map((option) => (
          <option
            key={option.value}
            value={option.value}
            className="bg-dark text-light"
          >
            {option.label}
          </option>
        ))}
      </select>
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
