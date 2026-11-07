import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AdvisorPanel from '../components/AdvisorPanel';
import FinancialLog from '../components/FinancialLog';
import GameCanvas from '../components/GameCanvas';
import ManualModal from '../components/ManualModal';
import NotificationFeed from '../components/NotificationFeed';
import StatsHeader from '../components/StatsHeader';
import { useGame } from '../game/GameProvider';

const KEY_DIRECTIONS = {
  ArrowLeft: 'left',
  ArrowUp: 'up',
  ArrowRight: 'right',
  ArrowDown: 'down',
  a: 'left',
  w: 'up',
  d: 'right',
  s: 'down',
  A: 'left',
  W: 'up',
  D: 'right',
  S: 'down',
};

export default function GamePage() {
  const { state, turn, togglePause, retire, reset } = useGame();
  const navigate = useNavigate();
  const [manualOpen, setManualOpen] = useState(false);

  useEffect(() => {
    if (state.status === 'idle') navigate('/', { replace: true });
    if (state.status === 'over') navigate('/results');
  }, [state.status, navigate]);

  useEffect(() => {
    const onKeyDown = (event) => {
      if (manualOpen) return;
      if (KEY_DIRECTIONS[event.key]) {
        event.preventDefault();
        turn(KEY_DIRECTIONS[event.key]);
      } else if (event.key === 'p' || event.key === 'P') {
        togglePause();
      } else if (event.key === 'Escape') {
        retire();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [turn, togglePause, retire, manualOpen]);

  const handleReset = () => {
    reset();
    navigate('/');
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col gap-5 px-4 py-5">
      <NotificationFeed />
      <StatsHeader onOpenManual={() => setManualOpen(true)} onReset={handleReset} />

      <div className="flex items-stretch justify-center gap-5">
        <AdvisorPanel onOpenManual={() => setManualOpen(true)} />

        <div className="relative w-full max-w-[800px]">
          <GameCanvas />
          {state.status === 'paused' && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="rounded-3xl bg-emerald-500/95 px-10 py-6 text-3xl font-black uppercase text-black shadow-[0_0_50px_rgba(16,185,129,0.4)]">
                Paused
              </span>
            </div>
          )}
          <p className="mt-2 text-center text-[10px] uppercase tracking-[0.18em] text-neutral-600">
            Arrows / WASD to steer · P pause · Esc retire
          </p>
        </div>

        <FinancialLog />
      </div>

      {manualOpen && <ManualModal onClose={() => setManualOpen(false)} />}
    </main>
  );
}
