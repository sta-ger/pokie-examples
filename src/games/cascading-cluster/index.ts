/*
An example of a cascading (a.k.a. tumbling/avalanche) cluster-pay video slot on a 6x5 grid.

Features:
- Wins are groups of 5+ orthogonally-adjacent same-symbol cells (cluster pays), not paylines.
- Winning clusters are removed, the grid collapses with gravity and refills from the top, and the
  new grid is evaluated again - this repeats until no cluster wins remain (CascadingSpinResolver).
- Each cascade step's win is multiplied by an escalating step multiplier (x1, x2, x3, ...), so long
  cascade chains pay disproportionately more than the sum of their individual steps.
- The reels shown after Play are the initial, pre-cascade grid, with the first winning cluster(s)
  highlighted. A collapsed-by-default accordion below lists each cascade step; expanding one shows
  the grid that step produced, with whatever it led to (the next step's winning cluster, if any)
  highlighted on it.
*/

import {SymbolsCombinationsGenerator, VideoSlotSession, VideoSlotSessionSerializer} from "pokie";
import {AnyVideoSlotSession} from "../../data.ts";
import {CascadingClusterConfig} from "./CascadingClusterConfig.ts";
import {CascadingClusterWinCalculator} from "./CascadingClusterWinCalculator.ts";

const config = new CascadingClusterConfig();
const combinationsGenerator = new SymbolsCombinationsGenerator(config);
const winCalculator = new CascadingClusterWinCalculator(config);
const session = new VideoSlotSession(config, combinationsGenerator, winCalculator);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];

const buildMiniGridTable = (grid: string[][], highlightedPositions: number[][]): HTMLTableElement => {
    const highlighted = new Set(highlightedPositions.map(([reelId, rowId]) => `${reelId}:${rowId}`));
    const table = document.createElement("table");
    table.style.width = "100%";
    table.style.tableLayout = "fixed";
    const row = document.createElement("tr");
    grid.forEach((reelSymbols, reelId) => {
        const cell = document.createElement("td");
        cell.style.verticalAlign = "top";
        reelSymbols.forEach((symbol, rowId) => {
            const symbolCell = document.createElement("div");
            symbolCell.className = "reels-item";
            symbolCell.innerText = symbol;
            if (highlighted.has(`${reelId}:${rowId}`)) {
                symbolCell.style.backgroundColor = "#4dc9ff";
            }
            cell.appendChild(symbolCell);
        });
        row.appendChild(cell);
    });
    table.appendChild(row);
    return table;
};

/*
The generic serializer has no idea cascades happened at all - it only sees the pre-cascade grid and
the combined win amount. This renders the per-step breakdown directly from the win calculator's own
CascadeResult, via data.ts's generic afterRoundPlayed hook.
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
    if (!cascadeResult || steps.length === 0) {
        return;
    }

    const heading = document.createElement("h4");
    heading.innerText = "Cascade steps";
    container.appendChild(heading);

    const accordionId = "cascadeStepsAccordion";
    const accordion = document.createElement("div");
    accordion.className = "accordion";
    accordion.id = accordionId;

    steps.forEach((step, index) => {
        const stepMultiplier = index + 1;
        const stepWin = step.getWinEvaluationResult().getTotalWin();
        const headerText =
            `Step ${index + 1}: ${step.getRemovedPositions().length} symbols removed, ` +
            `win ${stepWin} x${stepMultiplier} = ${stepWin * stepMultiplier}`;

        // The grid this step actually produced (after its removal+refill) is the next step's
        // starting screen, or the final settled screen if this was the last step - and whatever
        // new cluster that next step found (if any) is the win to highlight on it.
        const nextStep = steps[index + 1];
        const screenAfterStep = nextStep ? nextStep.getScreen() : cascadeResult.getFinalScreen();
        const newWinningPositions = nextStep
            ? nextStep
                  .getWinEvaluationResult()
                  .getClusterWins()
                  .flatMap((component) => component.getWinningCluster().getSymbolsPositions())
            : [];

        const itemId = `cascadeStep${index}`;
        const headerId = `heading-${itemId}`;
        const collapseId = `collapse-${itemId}`;

        const item = document.createElement("div");
        item.className = "accordion-item";

        const h2 = document.createElement("h2");
        h2.className = "accordion-header";
        h2.id = headerId;
        const button = document.createElement("button");
        button.className = "accordion-button collapsed";
        button.type = "button";
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", `#${collapseId}`);
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", collapseId);
        button.innerText = headerText;
        h2.appendChild(button);
        item.appendChild(h2);

        const collapseDiv = document.createElement("div");
        collapseDiv.id = collapseId;
        collapseDiv.className = "accordion-collapse collapse";
        collapseDiv.setAttribute("aria-labelledby", headerId);
        collapseDiv.setAttribute("data-bs-parent", `#${accordionId}`);

        const body = document.createElement("div");
        body.className = "accordion-body";
        body.appendChild(buildMiniGridTable(screenAfterStep, newWinningPositions));
        collapseDiv.appendChild(body);

        item.appendChild(collapseDiv);
        accordion.appendChild(item);
    });

    container.appendChild(accordion);
};
