import {
    LeftToRightLinesPatterns,
    LinesDefinitionsFor5x3,
    LinesPatternsDescribing,
    Paytable,
    ScatteredLinesPatterns,
    SymbolsSequence,
    SymbolsSequenceDescribing,
    VideoSlotWithFreeGamesConfig,
} from "pokie";

export class SwfgConfig extends VideoSlotWithFreeGamesConfig {
    private readonly normalSequences: SymbolsSequence[];
    private readonly freeGamesSequences: SymbolsSequence[];
    private readonly normalPatterns: LeftToRightLinesPatterns;
    private readonly freeGamesPatterns: ScatteredLinesPatterns;
    private freeGamesMode = false;

    constructor() {
        super();
        this.setCreditsAmount(10000);

        const pt = new Paytable(
            this.getAvailableBets(),
            this.getAvailableSymbols(),
            this.getWildSymbols(),
            this.getReelsNumber(),
        );
        this.getAvailableSymbols()
            .filter((symbol) => !this.isSymbolWild(symbol))
            .forEach((symbol) => {
                pt.setPayoutForSymbol(symbol, 2, 1);
                pt.setPayoutForSymbol(symbol, 3, 2);
                pt.setPayoutForSymbol(symbol, 4, 3);
                pt.setPayoutForSymbol(symbol, 5, 4);
            });
        this.setPaytable(pt);

        this.normalPatterns = new LeftToRightLinesPatterns(this.getReelsNumber(), 2);

        this.freeGamesPatterns = new ScatteredLinesPatterns(this.getReelsNumber(), 2);

        this.setLinesDefinitions(new LinesDefinitionsFor5x3());
        this.normalSequences = super
            .getSymbolsSequences()
            .map((sequence) => new SymbolsSequence().fromArray(sequence.toArray()));
        this.freeGamesSequences = super
            .getSymbolsSequences()
            .map((sequence) =>
                new SymbolsSequence().fromArray(sequence.toArray()).removeAllSymbols(this.getScatterSymbols()[0]),
            );
    }

    public setFreeGamesMode(value: boolean): void {
        this.freeGamesMode = value;
    }

    public isFreeGamesMode(): boolean {
        return this.freeGamesMode;
    }

    public getSymbolsSequences(): SymbolsSequenceDescribing[] {
        if (this.freeGamesMode) {
            return this.freeGamesSequences;
        } else {
            return this.normalSequences;
        }
    }

    public getLinesPatterns(): LinesPatternsDescribing {
        if (this.freeGamesMode) {
            return this.freeGamesPatterns;
        } else {
            return this.normalPatterns;
        }
    }
}
