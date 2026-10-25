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
- **One More Move:** 5×5 arcade game with combo multipliers, score banking, power-ups (Shield, Freeze, Dash and Magnet), increasingly fast hazards, extra enemy spawns, a daily challenge, keyboard and on-screen controls, and a local personal best.
- **Rewards:** sample gift-card goals with progress toward each goal; claiming is disabled in this prototype.
- **Shared PlayMint balance:** points from all games share one balance. The balance and game-open count are stored in local storage.
- **Responsive home page and navigation** across the three games and Rewards.

## One More Move — current rules

- Collect Mints to build your combo and unbanked run score.
- Use **Bank Score** to convert run score into PlayMint demo points. If caught, unbanked score is lost; points already banked remain.
- Collect a ✧ power-up, then activate Shield, Freeze or Magnet from the power-up control. Dash is consumed by your next move and travels two tiles.
- Hazards move every three turns at first, every two turns after turn 15, and an additional hazard can appear later.
- The challenge target changes by calendar day. It is a local prototype challenge, not a server-verified competition.

## Prototype boundaries

This is a front-end prototype. Points, records and progress are stored locally in the browser and are not verified or transferable. There is no account system, server leaderboard, secure rewards ledger, ad integration, payment system or anti-cheat backend. Reward cards are illustrative and cannot be redeemed.
