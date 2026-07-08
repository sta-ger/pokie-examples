/*
An example combining two independent win styles on the same 5x3 grid:

- "Coin1"/"Coin5"/"Coin10" are value-pay symbols (ValueWinCalculator): every occurrence anywhere on
  the grid pays its own value independently of position or line - there's no count-tiered lookup,
  the win is simply occurrences x value x bet.
- "WildX2"/"WildX3"/"WildX5" are ordinary line wilds that also carry a multiplier value
  (MultiplierResolver). Landing one on a winning payline multiplies that line's win by its value -
  the multiplier is scoped to line wins only, so it has no effect on the coin values above.

Line wins and value wins are two "exclusive groups" as far as the win-evaluation pipeline is
concerned, so combining them needs an explicit aggregation policy - SumAllEnabledWinAggregationPolicy
just adds both together instead of picking one or the other.
*/

import {
    MultiplierResolver,
    SumAllEnabledWinAggregationPolicy,
    SymbolsCombinationsGenerator,
    ValueWinCalculator,
    VideoSlotSession,
    VideoSlotSessionSerializer,
    VideoSlotWinCalculator,
} from "pokie";
import {ValuePayMultiplierConfig} from "./ValuePayMultiplierConfig.ts";

const config = new ValuePayMultiplierConfig();
const combinationsGenerator = new SymbolsCombinationsGenerator(config);

const winCalculator = new VideoSlotWinCalculator(
    config,
    undefined,
    undefined,
    undefined,
    new ValueWinCalculator(ValuePayMultiplierConfig.COIN_VALUES),
    undefined,
    {
        aggregationPolicy: new SumAllEnabledWinAggregationPolicy(),
        multiplierResolver: new MultiplierResolver(ValuePayMultiplierConfig.MULTIPLIER_WILDS, {
            supportedComponentTypes: ["line"],
        }),
    },
);

const session = new VideoSlotSession(config, combinationsGenerator, winCalculator);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];
