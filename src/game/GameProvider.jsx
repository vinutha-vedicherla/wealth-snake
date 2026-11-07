import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { WealthEngine } from './engine';

const GameContext = createContext(null);

export function GameProvider({ children }) {
  const [engine] = useState(() => new WealthEngine());
  const [state, setState] = useState(() => engine.snapshot());

  useEffect(() => engine.subscribe(setState), [engine]);

  const actions = useMemo(
    () => ({
      start: (options) => engine.start(options),
      togglePause: () => engine.togglePause(),
      turn: (direction) => engine.turn(direction),
      bank: () => engine.bank(),
      shield: () => engine.shield(),
      retire: () => engine.retire(),
      reset: () => engine.reset(),
    }),
    [engine]
  );

  const value = useMemo(() => ({ engine, state, ...actions }), [engine, state, actions]);

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used inside a GameProvider');
  return context;
}
