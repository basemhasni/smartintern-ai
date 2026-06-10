import { X } from 'lucide-react';

import AdminSidebar from './AdminSidebar.jsx';

function AdminMobileSidebar({ isOpen, user, onClose, onLogout }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
      <button className="absolute inset-0 bg-ink/35" type="button" aria-label="Fermer le menu administrateur" onClick={onClose} />
      <div className="relative h-full w-72 max-w-[86vw] shadow-stitch">
        <button
          className="absolute right-3 top-3 z-10 grid h-9 w-9 place-items-center rounded-lg bg-white text-ink shadow-panel"
          type="button"
          aria-label="Fermer la navigation administrateur"
          onClick={onClose}
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        <AdminSidebar user={user} onLogout={onLogout} onNavigate={onClose} />
      </div>
    </div>
  );
}

export default AdminMobileSidebar;
