# PlayMint — One More Move

A mobile-first arcade prototype for PlayMint, built with React, TypeScript and Vite.

## Play the prototype locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Current gameplay

- 5×5 grid with keyboard, on-screen D-pad and swipe controls.
- Collect glowing Mints for points and streak bonuses.
- Red hazards move every three turns.
- A run ends when the player moves onto a hazard.
- Personal best is stored in the browser's local storage.
- Share action uses the device share sheet when available, or copies a challenge message.

## Prototype boundaries

This is a front-end game prototype. Scores and personal bests are local to the device; there is no account system, server leaderboard, verified rewards ledger, ad integration, or anti-cheat backend yet. Those should be added only after the core loop is validated.
