import {SymbolsCombination, SymbolsCombinationDescribing, SymbolsCombinationsGenerator} from "pokie";

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

        this.stickySymbolsPositions.forEach((pos) => {
            symbolsMatrix[pos.x][pos.y] = pos.symbolId;
        });

        return new SymbolsCombination().fromMatrix(symbolsMatrix);
    }
}
