# PlayMint — Play a Little. Earn Points.

PlayMint is a mobile-first multi-game web app prototype built with React, TypeScript and Vite. The interface and game content are in English.

## Run locally

```bash
npm install
npm run dev
```

## Production build

```bash
npm run build
npm run preview
```

## Included games and pages

- **Candy Match:** 8×8 match-three puzzle, adjacent swaps, gravity/refill, cascades, moves counter and local personal best.
- **Water Sort:** color-sorting puzzle with four colors and two empty tubes, move counter, restart and completion reward.
- **One More Move:** 5×5 arcade game, keyboard and on-screen controls, collectible Mints, streak bonuses, moving hazards and local personal best.
- **Rewards:** sample gift-card goals with progress toward each goal; claiming is disabled in this prototype.
- **Shared PlayMint balance:** gameplay adds points to a single balance displayed across the app. The balance and game-open count are stored in local storage.
- **Responsive home page and navigation** across the three games and Rewards.

## Prototype boundaries

This is a front-end prototype. Points and records are stored locally in the browser and are not verified or transferable. There is no account system, server leaderboard, secure rewards ledger, ad integration, payment system or anti-cheat backend yet. Reward cards are illustrative and cannot be redeemed.
