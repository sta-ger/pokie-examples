import {SymbolsCombinationDescribing, VideoSlotWinCalculator} from "pokie";
import {SymbolPosition} from "./SwsrCombinationsGenerator.ts";

export class SwsrWinCalculator extends VideoSlotWinCalculator {
    private static symbolsCombination: SymbolsCombinationDescribing;

    public calculateWin(bet: number, symbolsCombination: SymbolsCombinationDescribing) {
        SwsrWinCalculator.symbolsCombination = symbolsCombination;
        super.calculateWin(bet, symbolsCombination);
    }

    public getAllWinningSymbolsPositions(): SymbolPosition[] {
        const positions: SymbolPosition[] = [];
        Object.values(this.getWinningLines()).forEach((line) => {
            line.getPattern().forEach((flag, x) => {
                const y = line.getDefinition()[x];
                if (flag) {
                    const symbolId = SwsrWinCalculator.symbolsCombination.getSymbols(x)[y];
                    positions.push({
                        x,
                        y,
                        symbolId,
                    });
                }
            });
        });
        Object.values(this.getWinningScatters()).forEach((scatter) => {
            scatter.getSymbolsPositions().forEach(([x, y]) => {
                const symbolId = SwsrWinCalculator.symbolsCombination.getSymbols(x)[y];
                positions.push({
                    x,
                    y,
                    symbolId,
                });
            });
        });
        return positions;
    }
}
