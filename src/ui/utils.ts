import type {VideoSlotWithFreeGamesRoundNetworkData} from "pokie/browser";
import {getAnyWinData, getCustomScenarioData, getRoundData, getSymbolWinData} from "../data.ts";

// Examples obtain real rounds locally, but only the package Player renders them.
let renderRound: ((round: VideoSlotWithFreeGamesRoundNetworkData) => void) | undefined;

export function setRoundRenderer(renderer: (round: VideoSlotWithFreeGamesRoundNetworkData) => void): void {
    renderRound = renderer;
}

function present(round: VideoSlotWithFreeGamesRoundNetworkData): void {
    if (renderRound === undefined) {
        throw new Error("The canonical POKIE player has not been initialized.");
    }
    renderRound(round);
}

export async function play(): Promise<void> {
    const button = document.getElementById("playButton") as HTMLButtonElement;
    button.disabled = true;
    try {
        present((await getRoundData()) as VideoSlotWithFreeGamesRoundNetworkData);
    } finally {
        button.disabled = false;
    }
}

export async function getAnyWin(): Promise<void> {
    present((await getAnyWinData()) as VideoSlotWithFreeGamesRoundNetworkData);
}

export async function getSymbolWin(itemId: string, times: number): Promise<void> {
    present((await getSymbolWinData(itemId, times)) as VideoSlotWithFreeGamesRoundNetworkData);
}

export async function getCustomScenario(scenarioId: string): Promise<void> {
    present((await getCustomScenarioData(scenarioId)) as VideoSlotWithFreeGamesRoundNetworkData);
}
