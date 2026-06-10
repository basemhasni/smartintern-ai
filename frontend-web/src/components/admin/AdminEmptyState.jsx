import { Inbox } from 'lucide-react';

function AdminEmptyState({ title, message, action }) {
  return (
    <section className="rounded-stitch border border-dashed border-line bg-canvas/80 p-8 text-center">
      <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white text-primary shadow-panel">
        <Inbox className="h-5 w-5" aria-hidden="true" />
      </span>
      <h2 className="mt-4 text-xl font-black text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-7 text-muted">{message}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </section>
  );
}

export default AdminEmptyState;
