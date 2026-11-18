# POKIE examples

Video slot game mechanics implemented with [POKIE](https://github.com/sta-ger/pokie), an
ISC-licensed JavaScript/TypeScript framework for slot math, simulation and portable game artifacts.

**Live demo:** https://sta-ger.github.io/pokie-examples/

## POKIE 2.0 development branch

`develop` tracks POKIE 2.0. It imports the scoped package name
`@fromstan/pokie` and the public `@fromstan/pokie/client/player` presentation entrypoint.

Until `@fromstan/pokie@2.0.0` is published, this branch resolves POKIE from the sibling checkout at
`../pokie`:

```json
"dependencies": {
  "@fromstan/pokie": "file:../pokie"
}
```

When the package is published, change that dependency to `^2.0.0` and regenerate
`package-lock.json`.

The live GitHub Pages site is currently built from `main` (v1.2). The v2 branch and the
`fixture-slot` page are not deployed yet.

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
  [[Code](src/games/fixture-slot)] — a seeded free-games fixture whose Play control renders through
  POKIE's public `@fromstan/pokie/client/player` surface. It is the shared parity fixture for
  generated-package, Studio Play, and Replay round presentation.

## Running locally

POKIE 2.0 is not published yet, so keep the POKIE checkout next to this repository and build it
first:

```bash
git clone https://github.com/sta-ger/pokie.git ../pokie
cd ../pokie
npm ci
npm run build

cd ../pokie-examples
npm ci
npm start
```

`npm start` opens a Vite dev server; `index.html` links to every example. `npm run dev` is an
equivalent shortcut. Pass `--host` (or set it permanently in `vite.config.js`, already done here) to
reach it from another device on the network.

## POKIE Studio and the dev client

The repository root is also a runnable POKIE game package. Its entry is the deterministic Fixture
Slot, so the normal POKIE tools can load it without a separate build step:

```bash
npx pokie dev .
```

This opens the standalone dev client for the Fixture Slot. To start POKIE Studio's first-time
project workflow, run `npx pokie` with no project argument; create or open a project there, then
use its Play, Simulation, Replay, Build, Outcome, and Stake tabs.

## Building

```bash
npm run build
```

Builds every example page into `dist/`. Pushes to `main` automatically build and publish `dist/` to
GitHub Pages via `.github/workflows/deploy-pages.yml`. `npm run pages` (publishing `dist/` to the
`gh-pages` branch by hand) still works too, but isn't needed for the live demo anymore.

## Project structure

Each example lives in `src/games/<name>/` (its own `VideoSlotConfig`/session/win-calculator setup)
plus a matching `<name>.html` entry point and `src/<name>.ts` bootstrap. `src/ui/` (`ui.ts`,
`utils.ts`) and `src/data.ts` are shared across every example — the generic reels/counters/winning-
lines rendering and the Play/Simulation plumbing. `src/ui/ui.ts` now consumes the same
`@fromstan/pokie/client/player` renderer that Studio and the standalone dev client use, so an
individual game only needs to describe its own config and win logic, not reimplement the UI.
