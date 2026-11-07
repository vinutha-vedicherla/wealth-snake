import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import GrowthChart from '../components/GrowthChart';
import { formatMoney } from '../game/constants';
import { useGame } from '../game/GameProvider';
import { getBadgeArtwork, getPerformanceReview, getSocialPost } from '../game/ai';

const LOG_TONE = {
  positive: 'text-emerald-400',
  negative: 'text-red-400',
  critical: 'text-red-400',
  bank: 'text-blue-400',
  iul: 'text-yellow-400',
  neutral: 'text-neutral-400',
};

const fallbackPost = (result) =>
  `${result.playerName} retired as "${result.badge.name}" with ${formatMoney(result.total)} net worth after ${
    result.years
  } years running a ${result.strategy.toLowerCase()} portfolio in Wealth Snake.`;

export default function ResultsPage() {
  const { state, reset } = useGame();
  const navigate = useNavigate();
  const result = state.result;

  const [review, setReview] = useState(null);
  const [artwork, setArtwork] = useState(null);
  const [artStatus, setArtStatus] = useState('loading');
  const [post, setPost] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!result) return;
    let active = true;

    getPerformanceReview({
      playerName: result.playerName,
      total: result.total,
      years: result.years,
      strategy: result.strategy,
    }).then((text) => active && setReview(text));

    getSocialPost({
      playerName: result.playerName,
      total: result.total,
      years: result.years,
      badgeName: result.badge.name,
    }).then((text) => active && setPost(text || fallbackPost(result)));

    getBadgeArtwork({
      playerName: result.playerName,
      badgeName: result.badge.name,
      total: result.total,
    }).then((url) => {
      if (!active) return;
      if (url) {
        setArtwork(url);
        setArtStatus('ready');
      } else {
        setArtStatus('offline');
      }
    });

    return () => {
      active = false;
    };
  }, [result]);

  if (!result) return <Navigate to="/" replace />;

  const share = (network) => {
    const text = encodeURIComponent(post || fallbackPost(result));
    const url =
      network === 'linkedin'
        ? `https://www.linkedin.com/feed/?shareActive=true&text=${text}`
        : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const copyPost = async () => {
    try {
      await navigator.clipboard.writeText(post || fallbackPost(result));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      setCopied(false);
    }
  };

  const startOver = () => {
    reset();
    navigate('/');
  };

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <header className="text-center">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-neutral-500">Portfolio results</p>
        <h1 className={`mt-2 text-4xl font-black uppercase tracking-tight sm:text-5xl ${result.total < 0 ? 'text-red-500' : 'text-emerald-400'}`}>
          {result.title}
        </h1>
        <p className="mt-3 text-sm italic text-neutral-300">
          {result.playerName}&apos;s net worth: {formatMoney(result.total)} over {result.years}y {result.months}m
        </p>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
            {result.strategy} strategy
          </span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
            Active {formatMoney(result.score)}
          </span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
            Saved {formatMoney(result.savedScore)}
          </span>
          <span className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400">
            IUL {formatMoney(result.iulScore)}
          </span>
        </div>
      </header>

      <section className="mt-8 grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)]">
        <div className="min-w-0 space-y-5">
          <div className="panel border-emerald-500/10 bg-emerald-500/5">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500">✨ AI performance audit</p>
            <p className="mt-2 text-xs italic leading-relaxed text-emerald-100">
              {review || 'AI audit offline — set VITE_GEMINI_API_KEY to turn the written review on.'}
            </p>
          </div>

          <div className="panel">
            <p className="label">Growth ledger</p>
            <div className="mt-3 h-44 min-w-0 overflow-hidden">
              <GrowthChart points={state.chart} />
            </div>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2 text-[11px] sm:grid-cols-4">
              {[
                ['Active', formatMoney(result.score), 'text-emerald-400'],
                ['Savings', formatMoney(result.savedScore), 'text-blue-400'],
                ['IUL shield', formatMoney(result.iulScore), 'text-yellow-500'],
                ['Dividend base', formatMoney(result.dividendBase), 'text-neutral-300'],
              ].map(([label, value, tone]) => (
                <div key={label}>
                  <p className={`font-bold uppercase tracking-tight ${tone}`}>{label}</p>
                  <p className="text-sm font-black text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="panel">
            <p className="label">Transaction history</p>
            <div className="mt-3 max-h-48 space-y-1.5 overflow-y-auto text-[11px]">
              {state.log.length === 0 && <p className="italic text-neutral-600">No activity recorded.</p>}
              {state.log.map((entry) => (
                <p key={entry.id} className={LOG_TONE[entry.type] || LOG_TONE.neutral}>
                  <span className="text-neutral-600">{entry.time}</span> {entry.label}
                  {Math.round(entry.amount) !== 0 && (
                    <span className="text-neutral-500"> {formatMoney(entry.amount)}</span>
                  )}
                </p>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="panel p-6 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-500/80">
              {result.playerName}&apos;s tenure milestone
            </p>
            <p className="mt-3 text-6xl leading-none">{result.badge.icon}</p>
            <h2 className="mt-3 text-2xl font-black uppercase tracking-tight text-white">{result.badge.name}</h2>

            <div className="mt-5 min-h-[150px] rounded-2xl border border-white/5 bg-black/40 p-4">
              {artStatus === 'loading' && (
                <div className="flex h-[118px] flex-col items-center justify-center gap-3">
                  <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-white/10 border-t-emerald-500" />
                  <p className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                    Minting achievement artwork...
                  </p>
                </div>
              )}
              {artStatus === 'offline' && (
                <p className="flex h-[118px] items-center justify-center text-xs text-neutral-500">
                  Artwork offline — set VITE_GEMINI_API_KEY to mint the badge image.
                </p>
              )}
              {artStatus === 'ready' && artwork && (
                <div>
                  <img
                    src={artwork}
                    alt={`${result.badge.name} badge artwork`}
                    className="mx-auto max-w-[240px] rounded-xl border-2 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                  />
                  <a
                    href={artwork}
                    download="wealth-badge.png"
                    className="mt-4 block rounded-lg bg-emerald-500/10 py-3 text-[11px] font-bold text-emerald-500 hover:underline"
                  >
                    Download high-res badge
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="panel p-6">
            <p className="label mb-4 text-center">Share achievement</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => share('linkedin')}
                className="rounded-xl bg-[#0077b5] py-4 text-xs font-bold text-white transition-all hover:brightness-125"
              >
                LinkedIn
              </button>
              <button
                type="button"
                onClick={() => share('whatsapp')}
                className="rounded-xl bg-[#25d366] py-4 text-xs font-bold text-white transition-all hover:brightness-125"
              >
                WhatsApp
              </button>
            </div>
            <button
              type="button"
              onClick={copyPost}
              className="mt-4 w-full text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 transition-colors hover:text-emerald-300"
            >
              {copied ? 'Copied!' : 'Copy post text'}
            </button>
          </div>

          <button
            type="button"
            onClick={startOver}
            className="w-full rounded-xl bg-white py-5 text-base font-black uppercase tracking-[0.18em] text-black transition-colors hover:bg-emerald-400"
          >
            New investment cycle
          </button>
        </div>
      </section>
    </main>
  );
}
