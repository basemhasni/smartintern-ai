function FormField({
  autoComplete,
  autoFocus,
  error,
  icon: Icon,
  id,
  label,
  name,
  onBlur,
  onChange,
  placeholder,
  type = 'text',
  value,
}) {
  const errorId = `${id}-error`;

  return (
    <div>
      <label className="block text-xs font-bold text-ink" htmlFor={id}>
        {label}
      </label>
      <div className="relative mt-2">
        {Icon ? (
          <Icon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" size={17} aria-hidden="true" />
        ) : null}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? errorId : undefined}
          className={`h-12 w-full rounded-lg border bg-[#f7f9fd] px-4 text-sm font-medium text-ink shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] transition placeholder:text-muted/65 hover:border-primary/35 focus:border-primary focus:bg-white focus:outline focus:outline-2 focus:outline-primary/15 ${Icon ? 'pl-10' : ''} ${error ? 'border-danger' : 'border-[#d8deec]'}`}
        />
      </div>
      {error ? (
        <p className="mt-2 text-xs font-semibold text-danger" id={errorId}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

export default FormField;
