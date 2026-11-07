import { useEffect } from 'react';
import { PLAY_GUIDE } from '../game/constants';

export default function ManualModal({ onClose }) {
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Investment strategy manual"
      onClick={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-neutral-800 bg-neutral-900 p-6 shadow-2xl sm:p-8"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 className="mb-6 text-center text-2xl font-black uppercase tracking-tight text-emerald-400 sm:text-3xl">
          Investment Strategy Manual
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {PLAY_GUIDE.map((item) => (
            <div key={item.title} className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-4">
              <p className="mb-1 text-sm font-black text-white">
                {item.icon} {item.title.toUpperCase()}
              </p>
              <p className="text-xs leading-relaxed text-neutral-400">{item.body}</p>
            </div>
          ))}
          <div className="rounded-2xl border border-neutral-800 bg-neutral-800/40 p-4 sm:col-span-2">
            <p className="mb-1 text-sm font-black text-emerald-500">⏱️ CONTROLS</p>
            <p className="text-xs leading-relaxed text-neutral-400">
              Arrow keys or WASD steer, P pauses, Esc retires early. Bank or shield your active cash from the
              header at any time.
            </p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="btn mt-6 border-emerald-500 bg-emerald-500 py-4 text-black hover:bg-emerald-400">
          Back to Portfolio
        </button>
      </div>
    </div>
  );
}
