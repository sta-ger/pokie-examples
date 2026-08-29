import {readFileSync} from "node:fs";
import {resolve} from "node:path";
import {jest} from "@jest/globals";

const play = jest.fn();
const getAnyWin = jest.fn();
const getCustomScenario = jest.fn();
const getSymbolWin = jest.fn();

jest.mock("pokie/client/player", () => ({
    createPlayerRoundElements: jest.fn((root: HTMLElement) => {
        root.dataset.pokiePlayer = "canonical-v1";
        return {gridContainer: document.createElement("div")};
    }),
    renderPlayerRound: jest.fn(),
    deriveAvailableBetModeIds: jest.fn(() => []),
    deriveAvailableBets: jest.fn(() => []),
    deriveBetModeId: jest.fn(() => undefined),
    deriveFeatureCounters: jest.fn(() => []),
    deriveLineDefinitions: jest.fn(() => []),
    derivePaytableView: jest.fn(() => undefined),
    deriveTotalWin: jest.fn(() => undefined),
    deriveWinHighlights: jest.fn(() => []),
}));

jest.mock("../src/data.ts", () => ({
    getInitialData: jest.fn(async () => ({paytable: {"10": {cherry: {3: 1}}}})),
    selectBet: jest.fn(),
    selectBetMode: jest.fn(),
}));

jest.mock("../src/ui/utils.ts", () => ({
    getAnyWin,
    getCustomScenario,
    getSymbolWin,
    play,
    setRoundRenderer: jest.fn(),
}));

import {EXAMPLES_UI_STYLE_ID, initializeUi} from "../src/ui/ui.ts";

describe("canonical POKIE player adoption", () => {
    it("uses only the installed public player export and its complete mount contract", () => {
        const source = readFileSync(resolve(__dirname, "../src/ui/ui.ts"), "utf8");

        expect(source).toContain('from "pokie/client/player"');
        expect(source).toContain("createPlayerRoundElements(playerRoot)");
        expect(source).toContain("renderPlayerRound(elements,");
        expect(source).toContain("formatTotalWin: (value) => value.toFixed(2)");
        expect(source).toContain("formatPayoutMultiplier: (value) => value.toFixed(2)");
        expect(source).not.toContain("drawReelsSymbols");
        expect(source).not.toContain("drawWinningLinesList");
    });
});

describe("initializeUi example controls", () => {
    beforeEach(() => {
        document.head.innerHTML = "";
        document.body.innerHTML = '<div id="ui"></div>';
        document.title = "Fixture slot with POKIE";
        play.mockClear();
        getAnyWin.mockClear();
        getCustomScenario.mockClear();
        getSymbolWin.mockClear();
    });

    it("keeps styled action controls and a functional scenario disclosure outside the canonical player", async () => {
        const root = document.getElementById("ui") as HTMLDivElement;
        await initializeUi(root, [["free-games", "Free games"]]);

        expect(document.getElementById(EXAMPLES_UI_STYLE_ID)?.textContent).toContain(".pokie-examples-ui-button");
        expect(root.dataset.pokiePlayer).toBeUndefined();
        expect(root.querySelector("[data-player-root]")).not.toBeNull();

        const playButton = root.querySelector<HTMLButtonElement>("#playButton")!;
        const winButton = root.querySelector<HTMLButtonElement>("#playWinButton")!;
        const scenariosButton = root.querySelector<HTMLButtonElement>("#scenariosButton")!;
        const menu = root.querySelector<HTMLUListElement>("#dropDownList")!;
        expect(playButton.classList).toContain("pokie-examples-ui-button");
        expect(winButton.classList).toContain("pokie-examples-ui-button");
        expect(menu.hidden).toBe(true);

        playButton.click();
        winButton.click();
        expect(play).toHaveBeenCalledTimes(1);
        expect(getAnyWin).toHaveBeenCalledTimes(1);

        scenariosButton.click();
        expect(scenariosButton.getAttribute("aria-expanded")).toBe("true");
        expect(menu.hidden).toBe(false);
        (root.querySelectorAll<HTMLButtonElement>(".pokie-examples-scenarios-item")[1]).click();
        expect(getCustomScenario).toHaveBeenCalledWith("free-games");
        expect(menu.hidden).toBe(true);
        expect(scenariosButton.getAttribute("aria-expanded")).toBe("false");
    });
});
