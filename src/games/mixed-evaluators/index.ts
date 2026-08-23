/*
An example evaluating the very same 5x4 grid three different ways every round - fixed paylines,
243-style ways-to-win, and 5+-adjacent-cell clusters - and paying out whichever style wins the most
that round (HighestWinOnlyAggregationPolicy). Lines, ways, and clusters are "exclusive groups" in
the win-evaluation pipeline (see docs/paytable-and-wins.md), so combining more than one requires an
explicit aggregation policy; "highest only" means the same grid effectively gets evaluated by three
different rulesets in parallel and the player is always paid by whichever one likes that grid best.
*/

import {
    ClusterWinCalculator,
    HighestWinOnlyAggregationPolicy,
    SymbolsCombinationsGenerator,
    VideoSlotSession,
    VideoSlotSessionSerializer,
    VideoSlotWinCalculator,
    WaysWinCalculator,
} from "pokie/browser";
import {MixedEvaluatorsConfig} from "./MixedEvaluatorsConfig.ts";

const config = new MixedEvaluatorsConfig();
const combinationsGenerator = new SymbolsCombinationsGenerator(config);

const winCalculator = new VideoSlotWinCalculator(
    config,
    undefined,
    undefined,
    new ClusterWinCalculator(config, MixedEvaluatorsConfig.MINIMUM_CLUSTER_SIZE),
    undefined,
    new WaysWinCalculator(config),
    {aggregationPolicy: new HighestWinOnlyAggregationPolicy()},
);

const session = new VideoSlotSession(config, combinationsGenerator, winCalculator);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];
