/*
An example of a cascading (a.k.a. tumbling/avalanche) cluster-pay video slot on a 6x5 grid.

Features:
- Wins are groups of 5+ orthogonally-adjacent same-symbol cells (cluster pays), not paylines.
- Winning clusters are removed, the grid collapses with gravity and refills from the top, and the
  new grid is evaluated again - this repeats until no cluster wins remain (CascadingSpinResolver).
- Each cascade step's win is multiplied by an escalating step multiplier (x1, x2, x3, ...), so long
  cascade chains pay disproportionately more than the sum of their individual steps.
- The reels shown after Play are the final, settled grid - the "Cascade steps" panel below lists
  what happened at each intermediate step along the way.
*/

import {SymbolsCombinationsGenerator, VideoSlotSessionSerializer} from "pokie";
import {AnyVideoSlotSession} from "../../data.ts";
import {CascadingClusterConfig} from "./CascadingClusterConfig.ts";
import {CascadingClusterWinCalculator} from "./CascadingClusterWinCalculator.ts";
import {CascadingClusterSession} from "./CascadingClusterSession.ts";

const config = new CascadingClusterConfig();
const combinationsGenerator = new SymbolsCombinationsGenerator(config);
const winCalculator = new CascadingClusterWinCalculator(config);
const session = new CascadingClusterSession(config, combinationsGenerator, winCalculator);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];

/*
The generic serializer has no idea cascades happened at all - it only sees the final settled grid
and the combined win amount. This renders the per-step breakdown directly from the win calculator's
own CascadeResult, via data.ts's generic afterRoundPlayed hook.
*/
export const afterRoundPlayed = (_session: AnyVideoSlotSession) => {
    const container = document.getElementById("customInfo");
    if (!container) {
        return;
    }
    while (container.children.length > 0) {
        container.removeChild(container.children[0]);
    }

    const cascadeResult = winCalculator.getLastCascadeResult();
    const steps = cascadeResult?.getCascadeSteps() ?? [];
    if (steps.length === 0) {
        return;
    }

    const heading = document.createElement("h4");
    heading.innerText = "Cascade steps";
    container.appendChild(heading);

    steps.forEach((step, index) => {
        const stepMultiplier = index + 1;
        const stepWin = step.getWinEvaluationResult().getTotalWin();
        const line = document.createElement("div");
        line.innerText =
            `Step ${index + 1}: ${step.getRemovedPositions().length} symbols removed, ` +
            `win ${stepWin} x${stepMultiplier} = ${stepWin * stepMultiplier}`;
        container.appendChild(line);
    });
};
