import { useEffect, useRef } from 'react';
import { BOARD_PX, TILE } from '../game/constants';
import { useGame } from '../game/GameProvider';

const FOOD_COLORS = {
  positive: '#10b981',
  negative: '#ef4444',
  critical: '#ff0000',
  neutral: '#3b82f6',
  bank: '#3b82f6',
  iul: '#eab308',
};

export default function GameCanvas() {
  const canvasRef = useRef(null);
  const { engine } = useGame();

  // The board is drawn straight from the engine's mutable state on every frame,
  // so React re-renders (which run at ~10fps) never make the snake stutter.
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let frame;

    const draw = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, BOARD_PX, BOARD_PX);

      ctx.strokeStyle = '#111';
      ctx.lineWidth = 1;
      for (let pos = 0; pos <= BOARD_PX; pos += TILE) {
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos, BOARD_PX);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(BOARD_PX, pos);
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.shadowBlur = 10;
      engine.food.forEach((item) => {
        ctx.shadowColor = FOOD_COLORS[item.type] || '#10b981';
        ctx.font = `${TILE - 4}px Arial`;
        ctx.fillStyle = '#fff';
        ctx.fillText(item.icon, item.x * TILE + TILE / 2, item.y * TILE + TILE / 2);
      });
      ctx.shadowBlur = 0;

      engine.snake.forEach((part, index) => {
        ctx.fillStyle = index === 0 ? '#10b981' : '#064e3b';
        ctx.beginPath();
        ctx.roundRect(part.x * TILE + 1, part.y * TILE + 1, TILE - 2, TILE - 2, 6);
        ctx.fill();
      });

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [engine]);

  return (
    <canvas
      ref={canvasRef}
      width={BOARD_PX}
      height={BOARD_PX}
      aria-label="Wealth Snake board"
      className="block h-auto w-full rounded-xl border border-neutral-800 bg-black shadow-[0_0_60px_-15px_rgba(16,185,129,0.45)]"
    />
  );
}
