// Board geometry: a fixed 32x32 grid keeps the play field identical on every
// screen; the canvas is scaled down with CSS on narrow viewports.
export const TILE = 25;
export const TILES = 32;
export const BOARD_PX = TILE * TILES;
export const MAX_FOOD = 7;
export const MARKET_SECONDS = 30;

export const FINANCIAL_ELEMENTS = [
  { type: 'positive', label: 'Dividend Asset', icon: '💰', value: 100 },
  { type: 'positive', label: 'Real Estate', icon: '🏠', value: 500 },
  { type: 'neutral', label: 'Stock Market', icon: '📈', value: 0 },
  { type: 'negative', label: 'Subscription', icon: '📺', value: -150 },
  { type: 'negative', label: 'Impulse Buy', icon: '🛍️', value: -300 },
  { type: 'critical', label: 'Emergency', icon: '🚨', value: -800 },
  { type: 'bank', label: 'Secure Savings', icon: '🏦', value: 0 },
  { type: 'iul', label: 'Shield Wealth (IUL)', icon: '🛡️', value: 0 },
];

export const SURVEY_QUESTIONS = [
  {
    q: 'Monthly savings rate?',
    choices: [
      { t: '< 10%', r: { burn: 0.1, score: -100 } },
      { t: '10-30%', r: { burn: 0.05, score: 0 } },
      { t: '> 50%', r: { burn: 0.01, score: 200 } },
    ],
  },
  {
    q: 'Choose your career path:',
    choices: [
      { t: 'Generalist ($500 base)', r: { monthlySalary: 500, taxRate: 0.15 } },
      { t: 'Specialist ($1,200 base)', r: { monthlySalary: 1200, taxRate: 0.22 } },
      { t: 'Entrepreneur ($0 base)', r: { monthlySalary: 0, growth: 2.0, aggressiveness: 2.0 } },
    ],
  },
  {
    q: 'Portfolio aggressiveness?',
    choices: [
      { t: 'Conservative', r: { aggressiveness: 0.6, growth: 0.8, speed: 120, label: 'Conservative' } },
      { t: 'Balanced', r: { aggressiveness: 1.0, growth: 1.3, speed: 100, label: 'Balanced' } },
      { t: 'Aggressive', r: { aggressiveness: 2.0, growth: 2.5, speed: 85, label: 'Aggressive' } },
    ],
  },
  {
    q: 'Emergency fund?',
    choices: [
      { t: 'None', r: { emergencyResilience: 2.5 } },
      { t: 'Partial', r: { emergencyResilience: 1.2 } },
      { t: 'Full', r: { emergencyResilience: 0.5 } },
    ],
  },
  {
    q: 'Tax planning?',
    choices: [
      { t: 'Reactive', r: { taxRate: 0.25 } },
      { t: 'Proactive', r: { taxRate: 0.15 } },
      { t: 'Strategic', r: { taxRate: 0.08 } },
    ],
  },
  {
    q: 'Core motivation?',
    choices: [
      { t: 'Retire Early', r: { inflationRate: 0.1, growth: 1.2 } },
      { t: 'Legacy', r: { inflationRate: 0.05, growth: 1.0 } },
      { t: 'Power', r: { inflationRate: 0.15, growth: 1.8 } },
    ],
  },
];

export const BASE_MODIFIERS = {
  growth: 1.0,
  burn: 0.02,
  speed: 100,
  label: 'Balanced',
  taxRate: 0.15,
  inflationRate: 0.05,
  emergencyResilience: 1.0,
  aggressiveness: 1.0,
  savingsApy: 0.02,
  iulApy: 0.06,
  monthlySalary: 500,
};

export const DEFAULT_PLAYER_NAME = 'Investor';

export const PLAY_GUIDE = [
  {
    icon: '💼',
    title: 'Salary & income',
    body: 'Monthly deposits in year one, then quarterly. Raises land every year you stay invested.',
    tone: 'text-emerald-400',
  },
  {
    icon: '🛡️',
    title: 'IUL shielding',
    body: 'Skips taxes and compounds at ~6% a year. Best for retirement and emergency money.',
    tone: 'text-yellow-400',
  },
  {
    icon: '💰',
    title: 'Auto-dividends',
    body: 'Every dividend asset you collect permanently grows your passive payout each cycle.',
    tone: 'text-emerald-400',
  },
  {
    icon: '🏦',
    title: 'Secure savings',
    body: 'Bank active cash to protect it. It also shortens your snake and resets your collision risk.',
    tone: 'text-blue-400',
  },
  {
    icon: '⏱️',
    title: 'Time acceleration',
    body: 'After year one cycles jump to quarterly: paychecks, dividends and returns scale 3x.',
    tone: 'text-emerald-500',
  },
];

export const CONTROLS_GUIDE = [
  { keys: '↑ ↓ ← → / W A S D', action: 'Steer the portfolio' },
  { keys: 'P', action: 'Pause or resume' },
  { keys: 'Esc', action: 'Retire and see results' },
];

export function getLevel(wealth) {
  if (wealth < 1000) return 'Entry';
  if (wealth < 10000) return 'Starter ($1k+)';
  if (wealth < 100000) return 'Builder ($10k+)';
  if (wealth < 1000000) return 'Professional ($100k+)';
  if (wealth < 10000000) return 'Millionaire ($1M+)';
  return 'Cent-Millionaire ($100M+)';
}

export function getBadge(totalWealth) {
  if (totalWealth < 0) return { name: 'Debt Burdened', icon: '💸' };
  if (totalWealth >= 50000) return { name: 'FIRE Legend', icon: '🔥' };
  if (totalWealth >= 20000) return { name: 'Prosperity Architect', icon: '🏗️' };
  if (totalWealth >= 5000) return { name: 'Wealth Builder', icon: '📈' };
  return { name: 'Disciplined Saver', icon: '🛡️' };
}

export function formatMoney(value) {
  const rounded = Math.floor(Math.abs(value));
  return `${value < 0 ? '-$' : '$'}${rounded.toLocaleString()}`;
}
