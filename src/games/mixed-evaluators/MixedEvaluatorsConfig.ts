import {LinesDefinitionsFor5x4, Paytable, SymbolsSequence, VideoSlotConfig} from "pokie";

// Lines, ways, and clusters all read from the exact same bet->symbol->count-of-matches paytable
// map (see docs/paytable-and-wins.md) - there's no separate data shape per win style. The default
// auto-generated paytable already covers what lines/ways need (counts 3..reelsNumber); cluster
// sizes can run all the way up to the whole grid, so that range needs extending by hand.
const bigClusterMultiplier = (size: number): number => {
    if (size <= 8) return 4;
    if (size <= 12) return 6;
    if (size <= 16) return 10;
    return 15;
};

export class MixedEvaluatorsConfig extends VideoSlotConfig {
    public static readonly REELS_NUMBER = 5;
    public static readonly ROWS_NUMBER = 4;
    public static readonly MINIMUM_CLUSTER_SIZE = 5;
    public static readonly SYMBOLS = ["A", "K", "Q", "J", "10", "9", "Wild"];

    constructor() {
        super();
        this.setCreditsAmount(10000);
        this.setReelsNumber(MixedEvaluatorsConfig.REELS_NUMBER);
        this.setReelsSymbolsNumber(MixedEvaluatorsConfig.ROWS_NUMBER);
        this.setAvailableSymbols(MixedEvaluatorsConfig.SYMBOLS);
        this.setWildSymbols(["Wild"]);
        this.setLinesDefinitions(new LinesDefinitionsFor5x4());

        const paytable = new Paytable(
            this.getAvailableBets(),
            this.getAvailableSymbols(),
            this.getWildSymbols(),
            MixedEvaluatorsConfig.REELS_NUMBER,
        );
        const maxClusterSize = MixedEvaluatorsConfig.REELS_NUMBER * MixedEvaluatorsConfig.ROWS_NUMBER;
        this.getAvailableSymbols()
            .filter((symbol) => !this.isSymbolWild(symbol))
            .forEach((symbol) => {
                for (let size = MixedEvaluatorsConfig.REELS_NUMBER + 1; size <= maxClusterSize; size++) {
                    paytable.setPayoutForSymbol(symbol, size, bigClusterMultiplier(size));
                }
            });
        this.setPaytable(paytable);

        const sequences = [];
        for (let i = 0; i < MixedEvaluatorsConfig.REELS_NUMBER; i++) {
            const sequence = new SymbolsSequence();
            sequence.fromNumbersOfSymbols({A: 4, K: 5, Q: 5, J: 6, "10": 6, "9": 6, Wild: 2});
            sequence.shuffle();
            sequences.push(sequence);
        }
        this.setSymbolsSequences(sequences);
    }
}
