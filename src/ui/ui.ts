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

export const EXAMPLES_UI_STYLE_ID = "pokie-examples-ui-presentation";

// The examples used to load Bootstrap dynamically from this shared entrypoint. Keep the outer
// example controls self-contained instead: a package consumer should not need a CDN script merely
// to make Play, Win and Scenarios usable. Player-specific markup and styles remain exclusively in
// pokie/client/player.
const EXAMPLES_UI_CSS = `
.pokie-examples-ui { box-sizing: border-box; width: min(100% - 2rem, 600px); margin: 0 auto; color: #212529; font-family: system-ui, sans-serif; }
.pokie-examples-ui *, .pokie-examples-ui *::before, .pokie-examples-ui *::after { box-sizing: border-box; }
.pokie-examples-ui-header { display: flex; align-items: center; justify-content: space-between; gap: .5rem; padding: 1.5rem 0 .75rem; margin-bottom: .5rem; border-bottom: 1px solid #dee2e6; }
.pokie-examples-ui-header h1 { margin: 0; font-size: 1.25rem; }
.pokie-examples-ui a { color: #0d6efd; text-decoration: none; }
.pokie-examples-ui a:hover { text-decoration: underline; }
.pokie-examples-actions { display: flex; align-items: center; flex-wrap: wrap; gap: .5rem; padding-top: 1rem; }
.pokie-examples-ui-button { appearance: none; border: 1px solid transparent; border-radius: .375rem; padding: .5rem 1rem; font: inherit; font-weight: 600; line-height: 1.5; cursor: pointer; }
.pokie-examples-ui-button:focus-visible, .pokie-examples-scenarios-item:focus-visible { outline: 3px solid rgba(13, 110, 253, .35); outline-offset: 2px; }
.pokie-examples-ui-button:disabled { cursor: not-allowed; opacity: .65; }
.pokie-examples-play { color: #fff; background: #0d6efd; border-color: #0d6efd; }
.pokie-examples-play:hover:not(:disabled) { background: #0b5ed7; border-color: #0a58ca; }
.pokie-examples-scenarios { position: relative; margin-left: auto; }
.pokie-examples-scenarios-toggle { color: #fff; background: #6c757d; border-color: #6c757d; }
.pokie-examples-scenarios-toggle:hover { background: #5c636a; border-color: #565e64; }
.pokie-examples-scenarios-menu { position: absolute; z-index: 1; right: 0; min-width: 14rem; margin: .25rem 0 0; padding: .35rem 0; list-style: none; background: #fff; border: 1px solid rgba(0, 0, 0, .15); border-radius: .375rem; box-shadow: 0 .5rem 1rem rgba(0, 0, 0, .15); }
.pokie-examples-scenarios-menu[hidden] { display: none; }
.pokie-examples-scenarios-item { display: block; width: 100%; border: 0; padding: .35rem 1rem; color: #212529; background: transparent; text-align: left; font: inherit; cursor: pointer; }
.pokie-examples-scenarios-item:hover { background: #e9ecef; }
@media (max-width: 480px) { .pokie-examples-ui-header { align-items: flex-start; flex-direction: column; } .pokie-examples-scenarios { margin-left: 0; } }
`;

export function installExamplesUiStyles(doc: Document = document): void {
    if (doc.getElementById(EXAMPLES_UI_STYLE_ID) !== null) return;
    const style = doc.createElement("style");
    style.id = EXAMPLES_UI_STYLE_ID;
    style.textContent = EXAMPLES_UI_CSS;
    doc.head.appendChild(style);
}

export const initializeUi = async (div: HTMLDivElement, customScenarios?: [string, string][]) => {
    installExamplesUiStyles(div.ownerDocument);
    div.className = "pokie-examples-ui";
    div.innerHTML =
        '<header class="pokie-examples-ui-header">' +
        '<h1>' + document.title.replace(" with POKIE", "") + '</h1>' +
        '<a href="index.html">&larr; All examples</a></header>' +
        '<section data-player-root></section>' +
        '<div class="pokie-examples-actions"><button id="playButton" type="button" class="pokie-examples-ui-button pokie-examples-play">Play</button><button id="playWinButton" type="button" class="pokie-examples-ui-button pokie-examples-play">Win</button>' +
        '<div class="pokie-examples-scenarios"><button id="scenariosButton" class="pokie-examples-ui-button pokie-examples-scenarios-toggle" type="button" aria-expanded="false" aria-controls="dropDownList">Scenarios</button><ul id="dropDownList" class="pokie-examples-scenarios-menu" hidden></ul></div></div>';

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
            formatTotalWin: (value) => value.toFixed(2),
            formatPayoutMultiplier: (value) => value.toFixed(2),
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

    const playButton = div.querySelector<HTMLButtonElement>("#playButton")!;
    const playWinButton = div.querySelector<HTMLButtonElement>("#playWinButton")!;
    const scenariosButton = div.querySelector<HTMLButtonElement>("#scenariosButton")!;
    const list = div.querySelector<HTMLUListElement>("#dropDownList")!;
    playButton.onclick = () => void play();
    playWinButton.onclick = () => void getAnyWin();
    scenariosButton.onclick = () => {
        const expanded = scenariosButton.getAttribute("aria-expanded") === "true";
        scenariosButton.setAttribute("aria-expanded", String(!expanded));
        list.hidden = expanded;
    };
    const appendScenario = (label: string, onSelect: () => void) => {
        const item = document.createElement("li");
        const button = document.createElement("button");
        button.type = "button";
        button.className = "pokie-examples-scenarios-item";
        button.textContent = label;
        button.onclick = () => {
            list.hidden = true;
            scenariosButton.setAttribute("aria-expanded", "false");
            onSelect();
        };
        item.appendChild(button);
        list.appendChild(item);
    };
    Object.entries(initialData.paytable["10"] ?? {}).forEach(([symbolId, counts]) => {
        Object.keys(counts).forEach((times) => {
            appendScenario('Symbol "' + symbolId + '" x ' + times, () => void getSymbolWin(symbolId, Number(times)));
        });
    });
    customScenarios?.forEach(([id, label]) => {
        appendScenario(label, () => void getCustomScenario(id));
    });
};
