/*
An example of a growing-grid bonus feature. The grid starts at the normal 5x3 size; every winning
round grows every reel by one row (up to 6 rows), so wins on a bigger grid also come with more room
for the "Gem" scatter symbol to land - the grid getting bigger is what makes bigger wins more
likely, not a separate multiplier bolted on top. A losing round resets the grid back down to its
starting size.

Payline wins are still evaluated from the base 5x3 layout regardless of the current height (a
LinesDefinitions set is fixed at construction), so lines behave exactly like a normal video slot;
it's the scatter pays that scale with the grid.
*/

import {
    GridResizeHandling,
    ResizableSymbolsCombinationsGenerator,
    VideoSlotSession,
    VideoSlotSessionSerializer,
    VideoSlotWinCalculator,
    VideoSlotWithResizableGridSession,
} from "pokie";
import {GrowingGridConfig} from "./GrowingGridConfig.ts";

const config = new GrowingGridConfig();

const initialHeights = new Array(GrowingGridConfig.REELS_NUMBER).fill(GrowingGridConfig.BASE_ROWS);
const combinationsGenerator = new ResizableSymbolsCombinationsGenerator(config, initialHeights);
const baseSession = new VideoSlotSession(config, combinationsGenerator, new VideoSlotWinCalculator(config));

const growOnWinResetOnLoss: GridResizeHandling = {
    getNextReelsHeights: (session, currentHeights) =>
        session.getWinAmount() > 0
            ? currentHeights.map((height) => Math.min(height + 1, GrowingGridConfig.MAX_ROWS))
            : currentHeights.map(() => GrowingGridConfig.BASE_ROWS),
};

const session = new VideoSlotWithResizableGridSession(baseSession, combinationsGenerator, growOnWinResetOnLoss);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];

export const afterRoundPlayed = () => {
    const container = document.getElementById("customInfo");
    if (!container) {
        return;
    }
    while (container.children.length > 0) {
        container.removeChild(container.children[0]);
    }
    const heights = session.getReelsHeights();
    const line = document.createElement("div");
    line.innerText = `Current grid height: ${heights[0]} rows (max ${GrowingGridConfig.MAX_ROWS})`;
    container.appendChild(line);
};
