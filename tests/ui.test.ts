import {readFileSync} from "node:fs";
import {resolve} from "node:path";

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
