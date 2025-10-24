export default function FormField({
  label,
  name,
  type,
  value,
  onChange,
  onBlur,
  error,
  placeholder,
}) {
  return (
    <div className="flex flex-col gap-3 group">
      <label
        htmlFor={name}
        className="text-light font-body text-sm font-medium tracking-wide transition-colors group-focus-within:text-gradient1"
      >
        {label}
      </label>
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`bg-light/10 border ${
          error ? "border-red-400" : "border-gradient1/40"
        } rounded-xl px-5 py-4 text-light font-body text-base outline-none transition-all duration-300 placeholder:text-light/50 focus:border-gradient1 focus:bg-light/15 focus:ring-2 focus:ring-gradient1/30 hover:border-gradient1/60 hover:bg-light/12`}
      />
      {error && (
        <span className="text-red-400 text-sm font-body flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
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
