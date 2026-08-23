/*
An example of a Megaways-style video slot: each of the 6 reels draws its own row count at random
every round (2 to 6 rows, weighted towards 3-4), so the grid shape is different every spin. Wins are
"ways to win" rather than paylines - for a symbol, how many matching (or wild-substitutable) cells
sit in reel 0, reel 1, and so on consecutively from the left; the ways count is the product of those
per-reel counts, so taller reels this round mean more ways and bigger potential wins.
*/

import {
    SelectedEvaluatorGroupWinAggregationPolicy,
    VariableHeightSymbolsCombinationsGenerator,
    VideoSlotSession,
    VideoSlotSessionSerializer,
    VideoSlotWinCalculator,
    WaysWinCalculator,
} from "pokie/browser";
import {MegawaysStyleConfig} from "./MegawaysStyleConfig.ts";

const config = new MegawaysStyleConfig();

const reelsHeightWeights = new Array(MegawaysStyleConfig.REELS_NUMBER).fill(MegawaysStyleConfig.REEL_HEIGHT_WEIGHTS);
const combinationsGenerator = new VariableHeightSymbolsCombinationsGenerator(config, reelsHeightWeights);

const winCalculator = new VideoSlotWinCalculator(
    config,
    undefined,
    undefined,
    undefined,
    undefined,
    new WaysWinCalculator(config),
    {aggregationPolicy: new SelectedEvaluatorGroupWinAggregationPolicy("ways")},
);

const session = new VideoSlotSession(config, combinationsGenerator, winCalculator);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];
