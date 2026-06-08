const inputBase = 'mt-2 w-full rounded-lg border bg-white px-4 py-3 text-sm font-bold text-ink shadow-sm outline-none transition focus:border-primary focus:ring-4 focus:ring-primary/10';

function FieldError({ id, message }) {
  if (!message) {
    return null;
  }

  return <p id={id} className="mt-2 text-sm font-bold text-danger">{message}</p>;
}

function TextInput({ id, label, value, error, disabled, onChange, maxLength, autoComplete, type = 'text', help }) {
  return (
    <div>
      <label className="text-sm font-black text-ink" htmlFor={id}>{label}</label>
      <input
        id={id}
        className={`${inputBase} ${error ? 'border-danger' : 'border-line'}`}
        type={type}
        value={value}
        disabled={disabled}
        maxLength={maxLength}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(id, event.target.value)}
      />
      {help ? <p className="mt-2 text-xs font-bold text-muted">{help}</p> : null}
      <FieldError id={`${id}-error`} message={error} />
    </div>
  );
}

function ReadOnlyField({ label, value }) {
  return (
    <div className="rounded-lg border border-line bg-canvas px-4 py-3">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-bold text-ink">{value || 'Non renseigne'}</p>
    </div>
  );
}

function ProfileForm({
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
    <form className="rounded-stitch border border-line bg-white p-6 shadow-panel" onSubmit={onSubmit}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-muted">Informations</p>
          <h2 className="mt-2 text-xl font-black text-ink">Modifier mon profil</h2>
          <p className="mt-2 text-sm leading-6 text-muted">Les informations de compte restent protegees et non modifiables ici.</p>
        </div>
        {isDirty ? (
          <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-black text-amber-700">
            Modifications non enregistrees
          </span>
        ) : null}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <ReadOnlyField label="Prenom" value={values.firstName} />
        <ReadOnlyField label="Nom" value={values.lastName} />
        <ReadOnlyField label="Email" value={values.email} />
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <TextInput
          id="phone"
          label="Telephone"
          value={values.phone}
          error={errors.phone}
          disabled={isSaving}
          autoComplete="tel"
          onChange={onChange}
        />
        <TextInput
          id="location"
          label="Localisation"
          value={values.location}
          error={errors.location}
          disabled={isSaving}
          maxLength={120}
          autoComplete="address-level2"
          onChange={onChange}
        />
        <TextInput
          id="educationLevel"
          label="Niveau d'etudes"
          value={values.educationLevel}
          error={errors.educationLevel}
          disabled={isSaving}
          maxLength={120}
          onChange={onChange}
        />
        <TextInput
          id="targetJob"
          label="Objectif metier"
          value={values.targetJob}
          error={errors.targetJob}
          disabled={isSaving}
          maxLength={120}
          onChange={onChange}
        />
        <TextInput
          id="availabilityDate"
          label="Date de disponibilite"
          value={values.availabilityDate}
          error={errors.availabilityDate}
          disabled={isSaving}
          type="date"
          onChange={onChange}
        />
      </div>

      <div className="mt-5">
        <label className="text-sm font-black text-ink" htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          className={`${inputBase} min-h-36 resize-y ${errors.bio ? 'border-danger' : 'border-line'}`}
          value={values.bio}
          disabled={isSaving}
          maxLength={500}
          aria-invalid={Boolean(errors.bio)}
          aria-describedby={errors.bio ? 'bio-error' : 'bio-help'}
          onChange={(event) => onChange('bio', event.target.value)}
        />
        <div className="mt-2 flex flex-col gap-1 text-xs font-bold text-muted sm:flex-row sm:items-center sm:justify-between">
          <p id="bio-help">Maximum 500 caracteres. Restez concret sur votre parcours et vos objectifs.</p>
          <p>{values.bio.length}/500</p>
        </div>
        <FieldError id="bio-error" message={errors.bio} />
      </div>

      <div className="mt-6" aria-live="polite">
        {globalMessage ? <p className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-success">{globalMessage}</p> : null}
        {apiError ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger">{apiError}</p> : null}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button
          className="inline-flex justify-center rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={isSaving || !isDirty}
        >
          {isSaving ? 'Enregistrement...' : 'Enregistrer'}
        </button>
        {isDirty ? (
          <button
            className="inline-flex justify-center rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel transition hover:-translate-y-0.5"
            type="button"
            disabled={isSaving}
            onClick={onCancel}
          >
            Annuler les modifications
          </button>
        ) : null}
      </div>
    </form>
  );
}

export default ProfileForm;
