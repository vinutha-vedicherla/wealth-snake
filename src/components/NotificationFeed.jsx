import { useGame } from '../game/GameProvider';

const TONES = {
  positive: 'bg-emerald-500 text-black',
  negative: 'bg-red-500 text-white',
  critical: 'bg-red-600 text-white',
  bank: 'bg-blue-600 text-white',
  iul: 'bg-yellow-500 text-black',
  neutral: 'bg-neutral-700 text-white',
};

function Notification({ entry }) {
  return (
    <div className={`notif mb-2 rounded-xl px-4 py-2.5 text-sm font-bold shadow-lg ${TONES[entry.type] || TONES.neutral}`}>
      {Math.round(entry.amount) !== 0 && (
        <span>
          {entry.amount < 0 ? '-' : '+'}${Math.abs(Math.round(entry.amount)).toLocaleString()}{' '}
        </span>
      )}
      {entry.label}
    </div>
  );
}

export default function NotificationFeed() {
  const { state } = useGame();
  const left = state.feed.filter((entry) => entry.type === 'negative' || entry.type === 'critical');
  const right = state.feed.filter((entry) => entry.type !== 'negative' && entry.type !== 'critical');

  return (
    <div className="pointer-events-none fixed inset-x-0 top-[22%] z-40 flex justify-between px-4 sm:px-10">
      <div className="max-w-[45vw]">
        {left.map((entry) => (
          <Notification key={entry.id} entry={entry} />
        ))}
      </div>
      <div className="max-w-[45vw] text-right">
        {right.map((entry) => (
          <Notification key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}
