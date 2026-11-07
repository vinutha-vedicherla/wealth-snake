import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CONTROLS_GUIDE,
  FINANCIAL_ELEMENTS,
  PLAY_GUIDE,
  SURVEY_QUESTIONS,
} from '../game/constants';
import { useGame } from '../game/GameProvider';

export default function StartPage() {
  const { state, start } = useGame();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [quizStep, setQuizStep] = useState(null);
  const [draft, setDraft] = useState({});
  const [bonus, setBonus] = useState(0);

  const inProgress = state.status === 'playing' || state.status === 'paused';

  const launch = (modifiers, scoreBonus) => {
    start({ playerName: name, modifiers, bonus: scoreBonus });
    navigate('/play');
  };

  const answer = (choice) => {
    const nextDraft = { ...draft, ...choice.r };
    const nextBonus = bonus + (choice.r.score || 0);
    if (quizStep + 1 < SURVEY_QUESTIONS.length) {
      setDraft(nextDraft);
      setBonus(nextBonus);
      setQuizStep(quizStep + 1);
      return;
    }
    launch(nextDraft, nextBonus);
  };

  const question = quizStep === null ? null : SURVEY_QUESTIONS[quizStep];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
      <header className="mb-10 flex items-center justify-between">
        <p className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">🐍 Wealth Snake</p>
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">Wealth Ledger Edition</p>
      </header>

      <section className="grid items-start gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl">
            Grow your net worth.
            <br />
            <span className="text-emerald-400">Don&apos;t eat the expenses.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-neutral-400">
            Steer a portfolio through the market. Collect dividends and real estate, dodge subscriptions and
            emergencies, and bank your gains before taxes and inflation catch up. Retire with the highest net
            worth you can.
          </p>

          <div className="mt-6 flex flex-wrap gap-2">
            {['6-question risk profile', '30s market cycles', 'AI performance audit'].map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-neutral-800 bg-neutral-900 px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400"
              >
                {chip}
              </span>
            ))}
          </div>

          {inProgress && (
            <Link
              to="/play"
              className="mt-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-emerald-400 hover:underline"
            >
              Resume your portfolio ({state.playerName}) →
            </Link>
          )}
        </div>

        <div className="panel p-6">
          {quizStep === null ? (
            <>
              <p className="label">Private wealth portal</p>
              <h2 className="mt-1 text-lg font-black">Open your account</h2>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">
                Enter your name and answer six quick questions to set your salary, tax rate and risk profile.
              </p>
              <input
                className="field mt-5"
                type="text"
                value={name}
                maxLength={20}
                placeholder="Investor name"
                aria-label="Investor name"
                onChange={(event) => setName(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') setQuizStep(0);
                }}
              />
              <button type="button" className="btn-primary mt-3 py-4 text-base" onClick={() => setQuizStep(0)}>
                Start Assessment
              </button>
              <button
                type="button"
                className="mt-4 w-full text-[11px] font-bold uppercase tracking-[0.18em] text-neutral-500 transition-colors hover:text-white"
                onClick={() => launch({}, 0)}
              >
                Skip to default profile
              </button>
            </>
          ) : (
            <>
              <div className="mb-6 flex gap-1.5">
                {SURVEY_QUESTIONS.map((entry, index) => (
                  <span
                    key={entry.q}
                    className={`h-1 flex-1 rounded-sm transition-colors ${
                      index <= quizStep ? 'bg-emerald-500' : 'bg-neutral-800'
                    }`}
                  />
                ))}
              </div>
              <p className="label">
                Step {quizStep + 1} of {SURVEY_QUESTIONS.length}
              </p>
              <h2 className="mt-1 mb-5 text-lg font-black">{question.q}</h2>
              <div className="space-y-2.5">
                {question.choices.map((choice) => (
                  <button
                    key={choice.t}
                    type="button"
                    className="btn-ghost justify-between py-3 text-left"
                    onClick={() => answer(choice)}
                  >
                    <span>{choice.t}</span>
                    <span className="text-neutral-600">→</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      <section id="how-to-play" className="mt-14">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">How to play</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLAY_GUIDE.map((item) => (
            <article key={item.title} className="panel">
              <p className={`text-sm font-black uppercase tracking-tight ${item.tone}`}>
                {item.icon} {item.title}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-neutral-400">{item.body}</p>
            </article>
          ))}
          <article className="panel">
            <p className="text-sm font-black uppercase tracking-tight text-white">🎮 Controls</p>
            <ul className="mt-2 space-y-1.5 text-xs text-neutral-400">
              {CONTROLS_GUIDE.map((entry) => (
                <li key={entry.keys} className="flex justify-between gap-3">
                  <span className="font-bold text-neutral-300">{entry.keys}</span>
                  <span className="text-right">{entry.action}</span>
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] text-neutral-500">What&apos;s on the board</h2>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {FINANCIAL_ELEMENTS.map((item) => (
            <div
              key={item.label}
              className="flex items-center gap-2 rounded-xl border border-neutral-800 bg-neutral-900/60 px-3 py-2"
            >
              <span className="text-lg leading-none">{item.icon}</span>
              <div className="min-w-0">
                <p className="truncate text-[11px] font-bold text-neutral-200">{item.label}</p>
                <p className="text-[9px] uppercase tracking-tight text-neutral-500">{item.type}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <footer className="mt-12 border-t border-neutral-900 pt-6 text-[10px] uppercase tracking-[0.18em] text-neutral-600">
        Wealth Snake is a game about saving, not financial advice.
      </footer>
    </main>
  );
}
