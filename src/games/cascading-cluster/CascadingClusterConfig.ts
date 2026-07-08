import {Paytable, SymbolsSequence, VideoSlotConfig} from "pokie";

/*
Cluster-pay symbol multiplier tiers, applied to every symbol across the whole possible cluster-size
range (5..reelsNumber*reelsSymbolsNumber). ClusterWinCalculator looks up an exact size in the
paytable and pays 0 (i.e. treats it as no win at all) for any size that isn't registered, so every
reachable size has to be covered explicitly - there's no default fill like the line/count-based
paytable constructor provides.
*/
const clusterSizeMultiplier = (size: number): number => {
    if (size <= 6) return 0.5;
    if (size <= 8) return 1;
    if (size <= 10) return 2;
    if (size <= 14) return 4;
    if (size <= 19) return 8;
    if (size <= 24) return 15;
    return 30;
};

export class CascadingClusterConfig extends VideoSlotConfig {
    public static readonly REELS_NUMBER = 6;
    public static readonly ROWS_NUMBER = 5;
    public static readonly MINIMUM_CLUSTER_SIZE = 5;
    public static readonly SYMBOLS = ["Red", "Blue", "Green", "Yellow", "Purple", "Wild"];

    constructor() {
        super();
        this.setCreditsAmount(10000);
        this.setReelsNumber(CascadingClusterConfig.REELS_NUMBER);
        this.setReelsSymbolsNumber(CascadingClusterConfig.ROWS_NUMBER);
        this.setAvailableSymbols(CascadingClusterConfig.SYMBOLS);
        this.setWildSymbols(["Wild"]);

        const paytable = new Paytable(this.getAvailableBets());
        const maxClusterSize = CascadingClusterConfig.REELS_NUMBER * CascadingClusterConfig.ROWS_NUMBER;
        this.getAvailableSymbols()
            .filter((symbol) => !this.isSymbolWild(symbol))
            .forEach((symbol) => {
                for (let size = CascadingClusterConfig.MINIMUM_CLUSTER_SIZE; size <= maxClusterSize; size++) {
                    paytable.setPayoutForSymbol(symbol, size, clusterSizeMultiplier(size));
                }
            });
        this.setPaytable(paytable);

        const sequences = [];
        for (let i = 0; i < CascadingClusterConfig.REELS_NUMBER; i++) {
            const sequence = new SymbolsSequence();
            sequence.fromNumbersOfSymbols({Red: 10, Blue: 10, Green: 10, Yellow: 10, Purple: 10, Wild: 2});
            sequence.shuffle();
            sequences.push(sequence);
        }
        this.setSymbolsSequences(sequences);
    }
}
