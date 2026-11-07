import {
  BASE_MODIFIERS,
  FINANCIAL_ELEMENTS,
  MAX_FOOD,
  MARKET_SECONDS,
  TILES,
  getBadge,
  getLevel,
} from './constants';

const TAX_INTERVAL_MS = 45000;

const withModifiers = (overrides = {}) => ({ ...BASE_MODIFIERS, ...overrides });

/**
 * The whole simulation lives here, outside React. React only reads snapshots and
 * calls these methods, so state survives route changes between the board and the
 * results page.
 */
export class WealthEngine {
  constructor() {
    this.listener = null;
    this.loopId = null;
    this.reset();
  }

  reset() {
    this.stopLoop();
    this.snake = [{ x: 10, y: 10 }];
    this.food = [];
    this.dx = 1;
    this.dy = 0;
    this.score = 0;
    this.saved = 0;
    this.iul = 0;
    this.dividendBase = 0;
    this.status = 'idle';
    this.modifiers = withModifiers();
    this.playerName = 'Investor';
    this.months = 0;
    this.years = 0;
    this.marketTimer = MARKET_SECONDS;
    this.startedAt = 0;
    this.lastClockAt = 0;
    this.lastTaxAt = 0;
    this.feed = [];
    this.log = [];
    this.chart = [{ label: 'Start', active: 0.1, saved: 0.1, iul: 0.1 }];
    this.result = null;
    this.seq = 0;
    this.emit();
  }

  subscribe(listener) {
    this.listener = listener;
    listener(this.snapshot());
    return () => {
      if (this.listener === listener) this.listener = null;
    };
  }

  emit() {
    if (this.listener) this.listener(this.snapshot());
  }

  snapshot() {
    const total = this.score + this.saved + this.iul;
    return {
      status: this.status,
      playerName: this.playerName,
      strategy: this.modifiers.label,
      level: getLevel(total),
      years: this.years,
      months: this.months,
      timer: this.marketTimer,
      cycleLabel: this.years >= 1 ? 'Quarter' : 'Month',
      score: this.score,
      savedScore: this.saved,
      iulScore: this.iul,
      salary: this.modifiers.monthlySalary,
      dividendBase: this.dividendBase,
      total,
      chart: this.chart,
      feed: this.feed,
      log: this.log,
      result: this.result,
      canMove: this.score > 0,
      canRetire: total >= 0,
    };
  }

  // ---------------------------------------------------------------- lifecycle

  start({ playerName, modifiers, bonus = 0 } = {}) {
    this.reset();
    this.playerName = (playerName || '').trim() || 'Investor';
    this.modifiers = withModifiers(modifiers);
    this.score = bonus;
    this.spawnMarket();
    this.startedAt = Date.now();
    this.lastClockAt = this.startedAt;
    this.lastTaxAt = this.startedAt;
    this.score += this.modifiers.monthlySalary;
    this.pushNotification('Sign-on Bonus', this.modifiers.monthlySalary, 'positive');
    this.chart = [
      { label: 'Start', active: Math.max(this.score, 0.1), saved: 0.1, iul: 0.1 },
    ];
    this.status = 'playing';
    this.emit();
    this.scheduleStep();
  }

  togglePause() {
    if (this.status === 'playing') {
      this.status = 'paused';
      this.stopLoop();
    } else if (this.status === 'paused') {
      this.status = 'playing';
      this.lastClockAt = Date.now();
      this.scheduleStep();
    }
    this.emit();
  }

  retire() {
    if (this.status === 'playing' || this.status === 'paused') this.finish();
  }

  finish() {
    this.stopLoop();
    this.status = 'over';
    const total = Math.floor(this.score + this.saved + this.iul);
    this.result = {
      total,
      badge: getBadge(total),
      title: total < 0 ? 'Insolvency' : 'Final Results',
      playerName: this.playerName,
      strategy: this.modifiers.label,
      years: this.years,
      months: this.months,
      score: Math.floor(this.score),
      savedScore: Math.floor(this.saved),
      iulScore: Math.floor(this.iul),
      dividendBase: this.dividendBase,
    };
    this.emit();
  }

  // ------------------------------------------------------------------- input

  turn(direction) {
    if (this.status !== 'playing') return;
    const goingUp = this.dy === -1;
    const goingDown = this.dy === 1;
    const goingRight = this.dx === 1;
    const goingLeft = this.dx === -1;
    if (direction === 'left' && !goingRight) {
      this.dx = -1;
      this.dy = 0;
    }
    if (direction === 'up' && !goingDown) {
      this.dx = 0;
      this.dy = -1;
    }
    if (direction === 'right' && !goingLeft) {
      this.dx = 1;
      this.dy = 0;
    }
    if (direction === 'down' && !goingUp) {
      this.dx = 0;
      this.dy = 1;
    }
  }

  bank() {
    return this.transferTo('saved');
  }

  shield() {
    return this.transferTo('iul');
  }

  transferTo(kind) {
    if (this.status !== 'playing') return false;
    if (this.score <= 0) {
      this.pushNotification('No Portfolio', 0, 'neutral');
      this.emit();
      return false;
    }
    const amount = Math.floor(this.score);
    if (kind === 'saved') {
      this.saved += this.score;
      this.pushNotification('Banked!', amount, 'bank');
    } else {
      this.iul += this.score;
      this.pushNotification('Shielded!', amount, 'iul');
    }
    this.score = 0;
    this.snake = this.snake.slice(0, 3);
    this.emit();
    return true;
  }

  // -------------------------------------------------------------- simulation

  scheduleStep() {
    if (this.status !== 'playing') return;
    const ageMinutes = Math.floor((Date.now() - this.startedAt) / 60000);
    const stepMs = Math.max(this.modifiers.speed - ageMinutes * 2, 60);
    this.loopId = setTimeout(() => this.step(), stepMs);
  }

  stopLoop() {
    if (this.loopId) clearTimeout(this.loopId);
    this.loopId = null;
  }

  step() {
    if (this.status !== 'playing') return;
    const now = Date.now();
    this.advanceClock(now);
    if (this.status !== 'playing') return;
    this.applyEconomics(now);
    this.advanceSnake();
    if (this.hasCollided()) {
      this.finish();
      return;
    }
    this.emit();
    this.scheduleStep();
  }

  advanceClock(now) {
    let guard = 0;
    while (now - this.lastClockAt >= 1000 && guard < 5) {
      this.lastClockAt += 1000;
      this.marketTimer -= 1;
      guard += 1;
      if (this.marketTimer <= 0) this.runMarketCycle();
    }
  }

  runMarketCycle() {
    this.marketTimer = MARKET_SECONDS;
    const steps = this.years >= 1 ? 3 : 1;
    this.months += steps;

    if (this.months >= 12) {
      this.months = 0;
      this.years += 1;
      const raise = Math.floor(this.modifiers.monthlySalary * 0.15);
      this.modifiers = { ...this.modifiers, monthlySalary: this.modifiers.monthlySalary + raise };
      this.pushNotification('Annual raise', raise, 'positive');
    }

    const payday = this.modifiers.monthlySalary * steps;
    this.score += payday;
    let dividends = 0;
    if (this.dividendBase > 0) {
      dividends = Math.floor(this.dividendBase * 0.05 * steps);
      this.score += dividends;
    }
    this.pushNotification(steps === 3 ? 'Quarterly Payday' : 'Monthly Payday', payday + dividends, 'positive');
    this.spawnMarket();
    this.pushChartPoint();
  }

  applyEconomics(now) {
    const multiplier = this.years >= 1 ? 3 : 1;

    if (now - this.lastTaxAt >= TAX_INTERVAL_MS) {
      if (this.score > 0 || this.saved > 0) {
        const rate = this.modifiers.taxRate * multiplier;
        const activeTax = this.score > 0 ? this.score * rate : 0;
        const savingsTax = this.saved > 0 ? this.saved * rate * 0.5 : 0;
        this.score -= activeTax;
        this.saved -= savingsTax;
        this.pushNotification('Tax Audit', -(activeTax + savingsTax), 'critical');
      }
      this.lastTaxAt = now;
    }

    if (this.saved > 0) this.saved += this.saved * (this.modifiers.savingsApy / 2000) * multiplier;
    if (this.iul > 0) this.iul += this.iul * (this.modifiers.iulApy / 2000) * multiplier;

    const trigger =
      (this.score < 0 ? this.modifiers.inflationRate * 1.5 : this.modifiers.inflationRate) * multiplier;
    if (Math.random() < trigger && this.snake.length > 3) this.snake.pop();
  }

  spawnMarket() {
    this.food = [];
    for (let i = 0; i < MAX_FOOD; i += 1) this.spawnFood();
  }

  spawnFood() {
    const element = FINANCIAL_ELEMENTS[Math.floor(Math.random() * FINANCIAL_ELEMENTS.length)];
    let x;
    let y;
    let occupied = true;
    while (occupied) {
      x = Math.floor(Math.random() * TILES);
      y = Math.floor(Math.random() * TILES);
      occupied =
        this.snake.some((part) => part.x === x && part.y === y) ||
        this.food.some((item) => item.x === x && item.y === y);
    }
    this.food.push({ x, y, ...element });
  }

  advanceSnake() {
    let headX = this.snake[0].x + this.dx;
    let headY = this.snake[0].y + this.dy;
    if (headX < 0) headX = TILES - 1;
    else if (headX >= TILES) headX = 0;
    if (headY < 0) headY = TILES - 1;
    else if (headY >= TILES) headY = 0;

    const head = { x: headX, y: headY };
    this.snake.unshift(head);

    const eatenIndex = this.food.findIndex((item) => item.x === headX && item.y === headY);
    if (eatenIndex === -1) {
      this.snake.pop();
      return;
    }

    const item = this.food[eatenIndex];
    if (item.type === 'bank') {
      this.transferTo('saved');
    } else if (item.type === 'iul') {
      this.transferTo('iul');
    } else if (item.type === 'positive' && item.icon === '💰') {
      this.dividendBase += 2000;
      this.pushNotification('Dividend Base Up', 2000, 'positive');
    } else {
      let value = item.value;
      let type = item.type;
      let label = item.label;

      if (item.type === 'neutral') {
        const threshold = 0.5 - this.modifiers.aggressiveness * 0.05;
        const isGain = Math.random() > threshold;
        value = isGain ? 400 * this.modifiers.aggressiveness : -300 * this.modifiers.aggressiveness;
        type = isGain ? 'positive' : 'negative';
        label = isGain ? 'Alpha Gain' : 'Volatility';
      }

      const impact =
        type === 'critical' ? item.value * this.modifiers.emergencyResilience : value * this.modifiers.growth;
      this.score += impact;
      this.pushNotification(label, impact, type);
    }

    this.food.splice(eatenIndex, 1);
    this.spawnFood();
  }

  hasCollided() {
    if (this.snake.length === 0) return true;
    for (let i = 4; i < this.snake.length; i += 1) {
      if (this.snake[i].x === this.snake[0].x && this.snake[i].y === this.snake[0].y) return true;
    }
    return false;
  }

  pushChartPoint() {
    const negative = this.score < 0 || this.saved < 0 || this.iul < 0;
    const epsilon = negative ? 0 : 0.1;
    const point = {
      label: `${this.years}y ${this.months}m`,
      active: this.score + epsilon,
      saved: this.saved + epsilon,
      iul: this.iul + epsilon,
    };
    this.chart = [...this.chart, point].slice(-48);
  }

  pushNotification(label, amount, type) {
    this.seq += 1;
    const id = this.seq;
    this.feed = [...this.feed, { id, label, amount, type }];
    this.log = [
      {
        id,
        label,
        amount,
        type,
        time: new Date().toLocaleTimeString([], { second: '2-digit' }),
      },
      ...this.log,
    ].slice(0, 15);

    setTimeout(() => {
      this.feed = this.feed.filter((entry) => entry.id !== id);
      this.emit();
    }, 3500);
  }
}
