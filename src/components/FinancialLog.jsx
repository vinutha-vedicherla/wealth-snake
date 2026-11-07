import { useGame } from '../game/GameProvider';
import { formatMoney } from '../game/constants';

const TONE = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  critical: 'text-red-400',
  bank: 'text-blue-400',
  iul: 'text-yellow-400',
  neutral: 'text-neutral-400',
};

export default function FinancialLog() {
  const { state } = useGame();

  return (
    <aside className="panel hidden w-64 shrink-0 flex-col lg:flex">
      <h2 className="mb-4 border-b border-neutral-800 pb-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
        Financial Log
      </h2>
      <div className="space-y-2 overflow-y-auto text-[11px]">
        {state.log.length === 0 && <p className="italic text-neutral-600">Market pulse active...</p>}
        {state.log.map((entry) => (
          <p key={entry.id} className={TONE[entry.type] || TONE.neutral}>
            <span className="text-neutral-600">{entry.time}</span> {entry.label}
            {Math.round(entry.amount) !== 0 && (
              <span className="text-neutral-500"> {formatMoney(entry.amount)}</span>
            )}
          </p>
        ))}
      </div>
    </aside>
  );
}
