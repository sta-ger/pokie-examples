import {
    SymbolsCombination,
    SymbolsCombinationDescribing,
    SymbolsCombinationsAnalyzer,
    SymbolsCombinationsGenerator,
} from "pokie";

export type SymbolPosition = {
    x: number;
    y: number;
    symbolId: string;
};

export class SwsrCombinationsGenerator extends SymbolsCombinationsGenerator {
    private stickySymbolsPositions: SymbolPosition[] = [];

    public setStickySymbols(value: SymbolPosition[]): void {
        this.stickySymbolsPositions = value;
    }

    public getStickySymbols(): SymbolPosition[] {
        return this.stickySymbolsPositions;
    }

    public generateSymbolsCombination(): SymbolsCombinationDescribing {
        const symbolsMatrix = super.generateSymbolsCombination().toMatrix();

        const symbolsMatrixWithStickySymbols = SymbolsCombinationsAnalyzer.overlaySymbols(
            symbolsMatrix,
            this.stickySymbolsPositions.map((pos) => ({position: [pos.x, pos.y], symbolId: pos.symbolId})),
        );

        return new SymbolsCombination().fromMatrix(symbolsMatrixWithStickySymbols);
    }
}
