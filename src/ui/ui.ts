import {
    deriveAvailableBetModeIds,
    deriveAvailableBets,
    deriveBetModeId,
    deriveFeatureCounters,
    deriveLineDefinitions,
    derivePaytableView,
    deriveTotalWin,
    deriveWinHighlights,
    createPlayerRoundElements,
    renderPlayerRound,
    type VideoSlotRoundResponse,
} from "pokie/client/player";
import {VideoSlotWithFreeGamesInitialNetworkData, type VideoSlotWithFreeGamesRoundNetworkData} from "pokie";
import {getInitialData, selectBet, selectBetMode} from "../data.ts";
import {getAnyWin, getCustomScenario, getSymbolWin, play, setRoundRenderer} from "./utils.ts";

export const initializeUi = async (div: HTMLDivElement, customScenarios?: [string, string][]) => {
    div.className = "container";
    div.style.maxWidth = "600px";
    div.innerHTML =
        '<header class="d-flex flex-column flex-sm-row align-items-start align-items-sm-center justify-content-sm-between gap-1 pt-4 pb-3 mb-2 border-bottom">' +
        '<h1 class="h4 mb-0">' + document.title.replace(" with POKIE", "") + '</h1>' +
        '<a href="index.html" class="text-decoration-none">&larr; All examples</a></header>' +
        '<section data-player-root></section>' +
        '<div class="d-flex align-items-center gap-2 pt-3"><button id="playButton" type="button" class="btn btn-primary btn-lg">Play</button><button id="playWinButton" type="button" class="btn btn-primary btn-lg">Win</button>' +
        '<div class="dropdown ms-auto"><button class="btn btn-secondary dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">Scenarios</button><ul id="dropDownList" class="dropdown-menu"></ul></div></div>';

    const initialData = (await getInitialData()) as VideoSlotWithFreeGamesInitialNetworkData;
    const playerRoot = div.querySelector<HTMLElement>("[data-player-root]");
    if (playerRoot === null) {
        throw new Error("Missing canonical player mount point.");
    }
    const elements = createPlayerRoundElements(playerRoot);
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
            onSelectBet: (nextBet) => render(selectBet(nextBet)),
            availableModeIds: deriveAvailableBetModeIds(round.availableBetModeIds),
            currentModeId: deriveBetModeId(round.betModeId),
            onSelectMode: (nextModeId) => {
                const selected = selectBetMode(nextModeId);
                if (selected !== undefined) {
                    render(selected);
                }
            },
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
