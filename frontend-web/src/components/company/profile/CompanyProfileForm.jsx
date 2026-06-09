function FormField({
  id,
  label,
  value,
  error,
  onChange,
  maxLength,
  placeholder,
  type = 'text',
  autoComplete,
}) {
  return (
    <div>
      <label className="text-sm font-black text-ink" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p id={`${id}-error`} className="mt-2 text-xs font-bold text-danger">{error}</p> : null}
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-lg bg-canvas p-3">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{value || 'Non renseigne'}</p>
    </div>
  );
}

function CompanyProfileForm({
  values,
  errors,
  isSaving,
  isDirty,
  onChange,
  onSubmit,
  onCancel,
  globalMessage,
  apiError,
}) {
  return (
    <section className="rounded-stitch border border-line bg-white p-6 shadow-panel">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">Informations</p>
          <h2 className="mt-2 text-xl font-black text-ink">Modifier le profil entreprise</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Seules les informations publiques de l entreprise sont modifiables ici.</p>
        </div>
        {isDirty ? <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">Modifications non enregistrees</span> : null}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <ReadOnlyField label="Prenom" value={values.firstName} />
        <ReadOnlyField label="Nom" value={values.lastName} />
        <ReadOnlyField label="Email" value={values.email} />
        <ReadOnlyField label="Role" value={values.role} />
        <ReadOnlyField label="Statut" value={values.statusLabel} />
      </div>

      <form className="mt-6 space-y-5" onSubmit={onSubmit}>
        <FormField
          id="companyName"
          label="Nom de l entreprise"
          value={values.companyName}
          error={errors.companyName}
          placeholder="SmartTech"
          autoComplete="organization"
          onChange={(value) => onChange('companyName', value)}
        />
        <FormField
          id="sector"
          label="Secteur"
          value={values.sector}
          error={errors.sector}
          maxLength={120}
          placeholder="Informatique"
          autoComplete="organization-title"
          onChange={(value) => onChange('sector', value)}
        />
        <div>
          <label className="text-sm font-black text-ink" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="mt-2 min-h-40 w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={values.description}
            maxLength={1000}
            placeholder="Presentez votre activite, votre culture et les types de missions proposees."
            aria-invalid={Boolean(errors.description)}
            aria-describedby={errors.description ? 'description-error' : 'description-counter'}
            onChange={(event) => onChange('description', event.target.value)}
          />
          <div className="mt-2 flex flex-col gap-1 text-xs font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
            {errors.description ? <p id="description-error" className="text-danger">{errors.description}</p> : <span />}
            <p id="description-counter">{values.description.length}/1000</p>
          </div>
        </div>
        <FormField
          id="website"
          label="Site web"
          value={values.website}
          error={errors.website}
          placeholder="https://smarttech.com"
          autoComplete="url"
          onChange={(value) => onChange('website', value)}
        />
        <FormField
          id="address"
          label="Adresse"
          value={values.address}
          error={errors.address}
          maxLength={250}
          placeholder="Tunis, Tunisie"
          autoComplete="street-address"
          onChange={(value) => onChange('address', value)}
        />

        <div aria-live="polite">
          {globalMessage ? <p className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-success">{globalMessage}</p> : null}
          {apiError ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger">{apiError}</p> : null}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel disabled:cursor-not-allowed disabled:opacity-60"
            type="button"
            disabled={!isDirty || isSaving}
            onClick={onCancel}
          >
            Annuler les modifications
          </button>
          <button
            className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel disabled:cursor-not-allowed disabled:opacity-60"
            type="submit"
            disabled={!isDirty || isSaving}
          >
            {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
          </button>
        </div>
      </form>
    </section>
  );
}

export default CompanyProfileForm;
