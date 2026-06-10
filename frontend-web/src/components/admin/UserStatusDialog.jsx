import { useEffect } from 'react';

function UserStatusDialog({ user, isUpdating, error, onCancel, onConfirm }) {
  useEffect(() => {
    if (!user) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [user, onCancel]);

  if (!user) return null;

  const nextIsActive = !user.isActive;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink/40 px-4" role="dialog" aria-modal="true" aria-labelledby="user-status-dialog-title">
      <section className="w-full max-w-lg rounded-stitch border border-line bg-white p-6 shadow-stitch">
        <h2 id="user-status-dialog-title" className="text-xl font-black text-ink">
          {nextIsActive ? 'Reactiver ce compte ?' : 'Desactiver ce compte ?'}
        </h2>
        <p className="mt-3 text-sm leading-6 text-muted">
          {nextIsActive
            ? 'L utilisateur pourra de nouveau acceder a son espace.'
            : 'L utilisateur ne pourra plus utiliser normalement son espace tant que son compte restera desactive.'}
        </p>
        <div className="mt-4 rounded-lg bg-canvas p-4">
          <p className="font-black text-ink">{user.firstName} {user.lastName}</p>
          <p className="mt-1 break-all text-sm font-bold text-muted">{user.email}</p>
          <p className="mt-1 text-xs font-black text-primary">{user.roleLabel}</p>
        </div>
        {error ? <p className="mt-4 rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-danger" aria-live="polite">{error}</p> : null}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button className="rounded-lg border border-line bg-white px-4 py-3 text-sm font-black text-ink" type="button" disabled={isUpdating} onClick={onCancel}>Annuler</button>
          <button className="rounded-lg bg-primary px-4 py-3 text-sm font-black text-white" type="button" disabled={isUpdating} onClick={() => onConfirm(nextIsActive)}>
            {isUpdating ? 'Mise a jour...' : nextIsActive ? 'Reactiver' : 'Desactiver'}
          </button>
        </div>
      </section>
    </div>
  );
}

export default UserStatusDialog;
