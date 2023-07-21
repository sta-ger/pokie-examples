import {SwfgConfig} from "./SwfgConfig.ts";
import {
    SymbolsCombinationDescribing,
    VideoSlotWinCalculator,
    WinningLine,
    WinningLineDescribing,
    WinningScatter,
    WinningScatterDescribing,
} from "pokie";

export class SwfgSessionWinCalculator extends VideoSlotWinCalculator {
    private static config: SwfgConfig;
    private multipliedLines?: Record<string, WinningLineDescribing>;
    private multipliedScatters?: Record<string, WinningScatterDescribing>;

    constructor(config: SwfgConfig) {
        super(config);
        SwfgSessionWinCalculator.config = config;
    }

    public calculateWin(bet: number, symbolsCombination: SymbolsCombinationDescribing) {
        super.calculateWin(bet, symbolsCombination);
        if (SwfgSessionWinCalculator.config.isFreeGamesMode()) {
            const originalScatters = super.getWinningScatters();
            this.multipliedScatters = {};
            Object.values(originalScatters).forEach(
                (scatter) =>
                    (this.multipliedScatters![scatter.getSymbolId()] = new WinningScatter(
                        scatter.getSymbolId(),
                        scatter.getSymbolsPositions(),
                        scatter.getWinAmount() * 2,
                    )),
            );
            const originalLines = super.getWinningLines();
            this.multipliedLines = {};
            Object.values(originalLines).forEach(
                (line) =>
                    (this.multipliedLines![line.getLineId()] = new WinningLine(
                        line.getWinAmount() * 2,
                        line.getDefinition(),
                        line.getPattern(),
                        line.getLineId(),
                        line.getSymbolsPositions(),
                        line.getWildSymbolsPositions(),
                        line.getSymbolId(),
                    )),
            );
        } else {
            this.multipliedScatters = undefined;
            this.multipliedLines = undefined;
        }
    }

    public getWinningLines(): Record<string, WinningLineDescribing> {
        return this.multipliedLines ? this.multipliedLines : super.getWinningLines();
    }

    public getWinningScatters(): Record<string, WinningScatterDescribing> {
        return this.multipliedScatters ? this.multipliedScatters : super.getWinningScatters();
    }
}
