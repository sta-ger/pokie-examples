import {
    deriveAvailableBetModeIds,
    deriveAvailableBets,
    deriveBetModeId,
    deriveFeatureCounters,
    deriveLineDefinitions,
    derivePaytableView,
    deriveTotalWin,
    deriveWinHighlights,
    renderPlayerRound,
    type PlayerRoundElements,
    type VideoSlotRoundResponse,
} from "pokie/client/player";
import {VideoSlotWithFreeGamesInitialNetworkData, type VideoSlotWithFreeGamesRoundNetworkData} from "pokie";
import {getInitialData} from "../data.ts";
import {getAnyWin, getCustomScenario, getSymbolWin, play, setRoundRenderer} from "./utils.ts";

function playerElements(root: HTMLElement): PlayerRoundElements {
    const required = <T extends HTMLElement>(selector: string): T => {
        const element = root.querySelector<T>(selector);
        if (element === null) {
            throw new Error("Missing canonical player element: " + selector);
        }
        return element;
    };
    return {
        credits: required("[data-player-credits]"),
        totalWin: required("[data-player-total-win]"),
        payoutMultiplier: required("[data-player-payout-multiplier]"),
        gridContainer: required("[data-player-grid]"),
        winsSection: required("[data-player-wins]"),
        winsList: required("[data-player-wins-list]"),
        linesList: required("[data-player-lines]"),
        features: required("[data-player-features]"),
        betInfo: required("[data-player-bets]"),
        modeInfo: required("[data-player-modes]"),
        paytableHead: required("[data-player-paytable-head]"),
        paytableBody: required("[data-player-paytable-body]"),
    };
}

export const initializeUi = async (div: HTMLDivElement, customScenarios?: [string, string][]) => {
    div.className = "container pokie-player";
    div.style.maxWidth = "600px";
    div.innerHTML =
        '<header class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-sm-between gap-1 pt-4 pb-3 mb-2 border-bottom">' +
        '<h1 class="h4 mb-0">' + document.title.replace(" with POKIE", "") + '</h1>' +
        '<a href="index.html" class="text-decoration-none">&larr; All examples</a></header>' +
        '<section aria-label="Game player"><div data-player-bets class="player-bet-info"></div><div data-player-modes class="player-mode-info"></div>' +
        '<div class="pokie-player-grid-scroll" data-player-grid></div>' +
        '<dl class="row" aria-label="Round totals"><dt class="col">Credits</dt><dd class="col" data-player-credits></dd><dt class="col">Win</dt><dd class="col" data-player-total-win></dd><dt class="col">Multiplier</dt><dd class="col" data-player-payout-multiplier></dd></dl>' +
        '<dl data-player-features hidden></dl><section data-player-wins hidden><h2 class="h5">Winning lines</h2><div data-player-wins-list></div></section>' +
        '<details><summary>Lines definitions</summary><div data-player-lines></div></details>' +
        '<details><summary>Paytable</summary><div class="player-paytable-scroll"><table class="player-paytable"><thead><tr data-player-paytable-head></tr></thead><tbody data-player-paytable-body></tbody></table></div></details></section>' +
        '<div class="d-flex align-items-center gap-2 pt-3"><button id="playButton" type="button" class="btn btn-primary btn-lg">Play</button><button id="playWinButton" type="button" class="btn btn-primary btn-lg">Win</button>' +
        '<div class="dropdown ms-auto"><button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Scenarios</button><ul id="dropDownList" class="dropdown-menu"></ul></div></div>';

    const initialData = (await getInitialData()) as VideoSlotWithFreeGamesInitialNetworkData;
    const elements = playerElements(div);
    const render = (round: VideoSlotRoundResponse) => {
        const totalWin = deriveTotalWin(round);
        const bet = typeof round.bet === "number" ? round.bet : undefined;
        renderPlayerRound(elements, {
            credits: typeof round.credits === "number" ? round.credits : undefined,
            totalWin,
            payoutMultiplier: totalWin !== undefined && bet !== undefined && bet !== 0 ? totalWin / bet : undefined,
            reelsSymbols: round.reelsSymbols ?? [],
            highlights: deriveWinHighlights(round),
            featureCounters: deriveFeatureCounters(round),
            lines: deriveLineDefinitions(round.linesDefinitions),
            paytable: derivePaytableView(round.paytable),
            availableBets: deriveAvailableBets(round.availableBets),
            currentBet: bet,
            availableModeIds: deriveAvailableBetModeIds(round.availableBetModeIds),
            currentModeId: deriveBetModeId(round.betModeId),
        });
    };
    setRoundRenderer((round: VideoSlotWithFreeGamesRoundNetworkData) => render(round));
    render(initialData);

    document.getElementById("playButton")!.onclick = () => void play();
    document.getElementById("playWinButton")!.onclick = () => void getAnyWin();
    const list = document.getElementById("dropDownList")!;
    Object.entries(initialData.paytable["10"] ?? {}).forEach(([symbolId, counts]) => {
        Object.keys(counts).forEach((times) => {
            const item = document.createElement("li");
            const button = document.createElement("button");
            button.type = "button";
            button.className = "dropdown-item";
            button.textContent = 'Symbol "' + symbolId + '" x ' + times;
            button.onclick = () => void getSymbolWin(symbolId, Number(times));
            item.appendChild(button);
            list.appendChild(item);
        });
    });
    customScenarios?.forEach(([id, label]) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "dropdown-item";
        button.textContent = label;
        button.onclick = () => void getCustomScenario(id);
        item.appendChild(button);
        list.appendChild(item);
    });
};
