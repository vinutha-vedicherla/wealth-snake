# Wealth Snake — Wealth Ledger Edition

A financial-literacy arcade game: steer a portfolio around the board, collect dividends and real
estate, dodge subscriptions and emergencies, bank or shield your cash, then retire with the highest
net worth you can build.

## Pages

| Route      | Screen                                                                            |
| ---------- | --------------------------------------------------------------------------------- |
| `/`        | Start: name entry, six-question risk profile, how to play, board legend.           |
| `/play`    | Game board with live stats header, growth chart, advisor hub and financial log.    |
| `/results` | Results, achievement badge, growth ledger, transaction history and sharing.        |

## Stack

Vite + React 18 + React Router + Tailwind CSS + Chart.js. The simulation lives in
`src/game/engine.js` and is shared across routes through `src/game/GameProvider.jsx`.

## Development

```bash
npm install
npm run dev     # http://localhost:3000
npm run build   # production bundle in dist/
```

## Optional AI extras

The advisor tip, performance audit, badge artwork and social post call the Google Gemini API. They
need `VITE_GEMINI_API_KEY` at dev/build time; without it every one of them falls back to an offline
message and the game stays fully playable. A Vite-exposed key ships to the browser, so only use a
demo key.
