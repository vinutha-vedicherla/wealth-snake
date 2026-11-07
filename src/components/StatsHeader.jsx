import GrowthChart from './GrowthChart';
import { formatMoney } from '../game/constants';
import { useGame } from '../game/GameProvider';

function Stat({ label, value, tone }) {
  return (
    <div className="flex items-baseline justify-between border-b border-neutral-800 py-1.5 text-[11px]">
      <span className={`font-bold uppercase tracking-tight ${tone}`}>{label}</span>
      <span className="text-sm font-black text-white">{value}</span>
    </div>
  );
}

export default function StatsHeader({ onOpenManual, onReset }) {
  const { state, togglePause, bank, shield, retire } = useGame();
  const timerPercent = Math.max(0, Math.min(100, (state.timer / 30) * 100));

  return (
    <section className="panel flex flex-col gap-5 xl:flex-row xl:items-stretch">
      <div className="w-full shrink-0 xl:w-52">
        <p className="label mb-1">Portfolio assets</p>
        <Stat label="Active now" value={formatMoney(state.score)} tone="text-emerald-400" />
        <Stat label="Savings" value={formatMoney(state.savedScore)} tone="text-blue-400" />
        <Stat label="IUL shield" value={formatMoney(state.iulScore)} tone="text-yellow-500" />
        <Stat label="Net monthly" value={formatMoney(state.salary)} tone="text-neutral-400" />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={bank}
            disabled={!state.canMove}
            className="flex-1 rounded-md border border-blue-500/20 bg-blue-500/10 py-1.5 text-[9px] font-bold uppercase text-blue-400 transition-colors hover:bg-blue-500/20 disabled:opacity-30"
          >
            Bank now
          </button>
          <button
            type="button"
            onClick={shield}
            disabled={!state.canMove}
            className="flex-1 rounded-md border border-yellow-500/20 bg-yellow-500/10 py-1.5 text-[9px] font-bold uppercase text-yellow-400 transition-colors hover:bg-yellow-500/20 disabled:opacity-30"
          >
            Shield now
          </button>
        </div>
      </div>

      <div className="h-36 min-w-0 flex-1 overflow-hidden xl:h-auto">
        <GrowthChart points={state.chart} />
      </div>

      <div className="flex w-full shrink-0 flex-col justify-between gap-3 xl:w-56">
        <div className="text-right">
          <p className="truncate text-xs font-black uppercase text-emerald-500">Investor: {state.playerName}</p>
          <p className="mb-1 text-[9px] uppercase text-neutral-500">Strategy: {state.strategy}</p>
          <p className="text-sm font-black text-white">
            Tenure: {state.years}y {state.months}m
          </p>
          <span className="mt-1 inline-block rounded border border-emerald-500/20 px-3 py-0.5 text-[10px] font-bold uppercase text-emerald-500">
            Level: {state.level}
          </span>
        </div>

        <button
          type="button"
          onClick={onOpenManual}
          className="text-center text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-500 transition-colors hover:underline"
        >
          📖 Strategy Manual
        </button>

        <div>
          <div className="mb-1 flex items-center justify-between text-[9px] uppercase text-neutral-500">
            <span>
              {state.cycleLabel}: {state.timer}s
            </span>
            <span>{formatMoney(state.score + state.savedScore + state.iulScore)} net</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
            <div
              className={`h-full transition-[width] duration-1000 ease-linear ${state.timer < 5 ? 'bg-red-500' : 'bg-emerald-500'}`}
              style={{ width: `${timerPercent}%` }}
            />
          </div>
        </div>

        <div className="flex gap-1">
          <button
            type="button"
            onClick={togglePause}
            className="flex-1 rounded-md border border-blue-500/20 bg-blue-500/10 py-2 text-[10px] font-bold uppercase text-blue-400 transition-colors hover:bg-blue-500/20"
          >
            {state.status === 'paused' ? 'Resume' : 'Pause'}
          </button>
          <button
            type="button"
            onClick={onReset}
            className="flex-1 rounded-md border border-neutral-500/20 bg-neutral-500/10 py-2 text-[10px] font-bold uppercase text-neutral-400 transition-colors hover:bg-neutral-500/20"
          >
            Reset
          </button>
          <button
            type="button"
            onClick={retire}
            disabled={!state.canRetire}
            className="flex-1 rounded-md border border-red-500/20 bg-red-500/10 py-2 text-[10px] font-bold uppercase text-red-500 transition-colors hover:bg-red-500/20 disabled:opacity-30"
          >
            Retire
          </button>
        </div>
      </div>
    </section>
  );
}
