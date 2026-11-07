import { useState } from 'react';
import { FINANCIAL_ELEMENTS } from '../game/constants';
import { useGame } from '../game/GameProvider';
import { getAdviceTip } from '../game/ai';

const TONE = {
  positive: 'text-emerald-400',
  critical: 'text-red-500',
  bank: 'text-blue-400',
  iul: 'text-yellow-400',
  neutral: 'text-neutral-300',
  negative: 'text-neutral-300',
};

const SUBTITLE = { bank: 'Taxable bank', iul: 'Tax-free growth' };

export default function AdvisorPanel({ onOpenManual }) {
  const { state } = useGame();
  const [tip, setTip] = useState('');
  const [loading, setLoading] = useState(false);

  const requestTip = async () => {
    setLoading(true);
    const result = await getAdviceTip(state);
    setTip(result || 'Audit lag.');
    setLoading(false);
  };

  return (
    <aside className="panel hidden w-64 shrink-0 flex-col lg:flex">
      <h2 className="mb-4 border-b border-neutral-800 pb-2 text-center text-[11px] font-black uppercase tracking-[0.18em] text-neutral-500">
        Advisor Hub
      </h2>

      <div className="space-y-3.5 text-[11px]">
        {FINANCIAL_ELEMENTS.map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="rounded bg-neutral-800 p-1 text-sm leading-none">{item.icon}</span>
            <div className="min-w-0">
              <p className={`truncate font-bold ${TONE[item.type] || TONE.neutral}`}>{item.label}</p>
              <p className="text-[9px] uppercase tracking-tight text-neutral-500">
                {SUBTITLE[item.type] || 'Market flow'}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-auto space-y-3 pt-4">
        {tip && (
          <p className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-[11px] leading-relaxed text-neutral-200">
            {tip}
          </p>
        )}
        <button
          type="button"
          onClick={requestTip}
          disabled={loading}
          className="btn border-emerald-600/30 bg-emerald-600/10 text-emerald-400 hover:bg-emerald-600/20"
        >
          {loading ? '✨ Analyzing...' : '✨ AI Strategy Tip'}
        </button>
        <button
          type="button"
          onClick={onOpenManual}
          className="w-full pt-1 text-[10px] font-black uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-emerald-400"
        >
          📖 Strategy Manual
        </button>
      </div>
    </aside>
  );
}
