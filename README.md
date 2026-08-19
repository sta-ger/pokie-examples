# POKIE examples

Video slot game mechanics implemented with [POKIE](https://github.com/sta-ger/pokie), a server-side
video slot game logic framework for JavaScript and TypeScript.

**Live demo:** https://sta-ger.github.io/pokie-examples/

## Examples

- **Simple video slot game** [[Demo](https://sta-ger.github.io/pokie-examples/simple-slot.html)]
  [[Code](src/games/simple-slot)] — 5x4, 8 lines, right-to-left pays, a wild, and two scatter types.
- **Video slot with free spins** [[Demo](https://sta-ger.github.io/pokie-examples/slot-with-free-games.html)]
  [[Code](src/games/slot-with-free-games)] — 5x3 free-spins game with scattered line matching and a
  2x win multiplier during the bonus.
- **Video slot with sticky re-spin** [[Demo](https://sta-ger.github.io/pokie-examples/slot-with-sticky-respin.html)]
  [[Code](src/games/slot-with-sticky-respin)] — a win holds its symbols in place and triggers a
  re-spin, continuing as long as new wins land.
- **Cascading cluster pays** [[Demo](https://sta-ger.github.io/pokie-examples/cascading-cluster.html)]
  [[Code](src/games/cascading-cluster)] — 6x5 cluster-pay slot; winning clusters are removed, the
  grid collapses and refills, and evaluation repeats until nothing wins, with an escalating step
  multiplier.
- **Megaways-style ways-to-win** [[Demo](https://sta-ger.github.io/pokie-examples/megaways-style.html)]
  [[Code](src/games/megaways-style)] — each of 6 reels draws its own row count every round, paid as
  ways-to-win rather than fixed paylines.
- **Growing grid bonus** [[Demo](https://sta-ger.github.io/pokie-examples/growing-grid.html)]
  [[Code](src/games/growing-grid)] — the grid grows by a row on every win (up to a cap) and resets
  on a loss.
- **Value pay with multiplier wilds** [[Demo](https://sta-ger.github.io/pokie-examples/value-pay-multiplier.html)]
  [[Code](src/games/value-pay-multiplier)] — coin symbols pay independently of line wilds that
  multiply whatever line they end up part of.
- **Verifiable spin** [[Demo](https://sta-ger.github.io/pokie-examples/verifiable-spin.html)]
  [[Code](src/games/verifiable-spin)] — a seeded RNG plus a button that replays the session from
  scratch and verifies it reproduces the same outcome.
- **Mixed win evaluators** [[Demo](https://sta-ger.github.io/pokie-examples/mixed-evaluators.html)]
  [[Code](src/games/mixed-evaluators)] — the same grid evaluated as lines, ways, and clusters at
  once, paid by whichever wins the most.
- **Fixture Slot — deterministic Player round** [[Demo](https://sta-ger.github.io/pokie-examples/fixture-slot.html)]
  [[Code](src/games/fixture-slot)] — a compact seeded 3×3 game whose Play control renders through
  POKIE's public `client/player` surface. It is the shared parity fixture for generated-package,
  Studio Play, and Replay round presentation.

## Running locally

```
npm install
npm run dev
```

Opens a Vite dev server; `index.html` links to every example. Pass `--host` (or set it permanently
in `vite.config.js`, already done here) to reach it from another device on the network.

## Building

```
npm run build
```

Builds every example page into `dist/`. Pushes to `main` automatically build and publish `dist/` to
GitHub Pages via `.github/workflows/deploy-pages.yml`. `npm run pages` (publishing `dist/` to the
`gh-pages` branch by hand) still works too, but isn't needed for the live demo anymore.

## Project structure

Each example lives in `src/games/<name>/` (its own `VideoSlotConfig`/session/win-calculator setup)
plus a matching `<name>.html` entry point and `src/<name>.ts` bootstrap. `src/ui/` (`ui.ts`,
`utils.ts`) and `src/data.ts` are shared across every example — the generic reels/counters/winning-
lines rendering and the Play/Simulation plumbing — so an individual game only needs to describe its
own config and win logic, not reimplement the UI.
