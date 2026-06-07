import { Building2, GraduationCap } from 'lucide-react';

const roles = [
  {
    value: 'STUDENT',
    title: 'Etudiant',
    text: 'Je cherche un stage adapte a mon profil.',
    icon: GraduationCap,
  },
  {
    value: 'COMPANY',
    title: 'Entreprise',
    text: 'Je publie des offres et recherche des candidats.',
    icon: Building2,
  },
];

function RoleSelector({ error, onChange, value }) {
  return (
    <fieldset>
      <legend className="text-xs font-bold text-ink">Type de compte</legend>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {roles.map(({ icon: Icon, text, title, value: roleValue }) => {
          const selected = value === roleValue;

          return (
            <label
              key={roleValue}
              className={`cursor-pointer rounded-stitch border p-4 transition focus-within:outline focus-within:outline-2 focus-within:outline-primary ${selected ? 'border-primary bg-primarySoft shadow-panel' : 'border-line bg-white hover:border-primary/60'}`}
            >
              <input
                className="sr-only"
                type="radio"
                name="role"
                value={roleValue}
                checked={selected}
                onChange={() => onChange(roleValue)}
              />
              <span className="flex items-start gap-3">
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${selected ? 'bg-primary text-white' : 'bg-canvas text-primary'}`}>
                  <Icon size={19} aria-hidden="true" />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-ink">{title}</span>
                  <span className="mt-1 block text-xs leading-5 text-muted">{text}</span>
                </span>
              </span>
            </label>
          );
        })}
      </div>
      {error ? <p className="mt-2 text-xs font-semibold text-danger">{error}</p> : null}
    </fieldset>
  );
}

export default RoleSelector;
