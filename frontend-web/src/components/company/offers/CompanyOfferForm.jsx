import OfferFormSection from './OfferFormSection.jsx';
import OfferStatusSelector from './OfferStatusSelector.jsx';
import SkillsInput from './SkillsInput.jsx';
import OfferQualityPanel from '../../ai/OfferQualityPanel.jsx';

function Field({ id, label, value, error, onChange, maxLength, placeholder, type = 'text' }) {
  return (
    <div>
      <label className="text-sm font-black text-ink" htmlFor={id}>{label}</label>
      <input
        id={id}
        className="mt-2 w-full rounded-lg border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        type={type}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(event) => onChange(event.target.value)}
      />
      {error ? <p id={`${id}-error`} className="mt-2 text-xs font-bold text-danger">{error}</p> : null}
    </div>
  );
}

function CompanyOfferForm({
  values,
  errors,
  mode,
  isSaving,
  isDirty,
  apiError,
  successMessage,
  onChange,
  onSubmit,
  onCancel,
}) {
  return (
    <form className="space-y-5" onSubmit={(event) => event.preventDefault()}>
      <OfferFormSection eyebrow="01" title="Informations generales" description="Ces informations structurent la presentation de l offre.">
        <div className="grid gap-4 md:grid-cols-2">
          <Field id="title" label="Titre de l offre" value={values.title} error={errors.title} placeholder="Stage Developpeur Fullstack" onChange={(value) => onChange('title', value)} />
          <Field id="location" label="Localisation" value={values.location} error={errors.location} maxLength={160} placeholder="Tunis, Paris, Remote..." onChange={(value) => onChange('location', value)} />
          <Field id="duration" label="Duree" value={values.duration} error={errors.duration} maxLength={120} placeholder="6 mois" onChange={(value) => onChange('duration', value)} />
          <Field id="startDate" label="Date de debut" type="date" value={values.startDate} error={errors.startDate} onChange={(value) => onChange('startDate', value)} />
        </div>
      </OfferFormSection>

      <OfferFormSection eyebrow="02" title="Description du stage" description="Expliquez les missions, le contexte et ce que l etudiant pourra apprendre.">
        <div>
          <label className="text-sm font-black text-ink" htmlFor="description">Description</label>
          <textarea
            id="description"
            className="mt-2 min-h-44 w-full resize-y rounded-lg border border-line bg-white px-4 py-3 text-sm leading-7 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            value={values.description}
            maxLength={2000}
            placeholder="Decrivez le stage, les missions principales et le profil recherche."
            aria-invalid={Boolean(errors.description)}
            onChange={(event) => onChange('description', event.target.value)}
          />
          <div className="mt-2 flex justify-between gap-3 text-xs font-bold text-muted">
            {errors.description ? <p className="text-danger">{errors.description}</p> : <span />}
            <p>{values.description.length}/2000</p>
          </div>
        </div>
      </OfferFormSection>

      <OfferFormSection eyebrow="03" title="Competences recherchees" description="Ajoutez uniquement les competences reellement utiles au stage.">
        <SkillsInput id="requiredSkills" label="Competences requises" value={values.requiredSkills} error={errors.requiredSkills} help="Entrer ou virgule pour ajouter une competence." onChange={(skills) => onChange('requiredSkills', skills)} />
        <SkillsInput id="optionalSkills" label="Competences appreciees" value={values.optionalSkills} error={errors.optionalSkills} help="Ces competences ameliorent le matching mais restent optionnelles." onChange={(skills) => onChange('optionalSkills', skills)} />
      </OfferFormSection>

      <OfferQualityPanel
        offer={{
          title: values.title,
          description: values.description,
          location: values.location,
          duration: values.duration,
          requiredSkills: values.requiredSkills,
          optionalSkills: values.optionalSkills,
        }}
      />

      <OfferFormSection eyebrow="04" title="Publication" description="Le backend accepte les statuts DRAFT, PUBLISHED, CLOSED et ARCHIVED.">
        <OfferStatusSelector value={values.status} error={errors.status} onChange={(status) => onChange('status', status)} />
        <div aria-live="polite">
          {successMessage ? <p className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-bold text-success">{successMessage}</p> : null}
          {apiError ? <p className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger">{apiError}</p> : null}
          {isDirty ? <p className="mt-3 text-xs font-black text-amber-700">Modifications non enregistrees</p> : null}
        </div>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {mode === 'edit' ? (
            <button className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel disabled:opacity-60" type="button" disabled={!isDirty || isSaving} onClick={onCancel}>
              Annuler les modifications
            </button>
          ) : null}
          <button className="rounded-lg border border-line bg-white px-5 py-3 text-sm font-black text-ink shadow-panel disabled:opacity-60" type="button" disabled={isSaving || (mode === 'edit' && !isDirty)} onClick={() => onSubmit('DRAFT')}>
            {isSaving ? 'Enregistrement...' : 'Enregistrer en brouillon'}
          </button>
          <button className="rounded-lg bg-primary px-5 py-3 text-sm font-black text-white shadow-panel disabled:opacity-60" type="button" disabled={isSaving || (mode === 'edit' && !isDirty && values.status === 'PUBLISHED')} onClick={() => onSubmit('PUBLISHED')}>
            {isSaving ? 'Publication...' : mode === 'edit' ? 'Enregistrer et publier' : 'Publier l offre'}
          </button>
          {mode === 'edit' ? (
            <button className="rounded-lg bg-ai px-5 py-3 text-sm font-black text-white shadow-panel disabled:opacity-60" type="button" disabled={isSaving || !isDirty} onClick={() => onSubmit()}>
              Enregistrer
            </button>
          ) : null}
        </div>
      </OfferFormSection>
    </form>
  );
}

export default CompanyOfferForm;
