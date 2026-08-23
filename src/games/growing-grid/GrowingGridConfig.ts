import {LinesDefinitionsFor5x3, Paytable, SymbolsSequence, VideoSlotConfig} from "pokie/browser";

const gemCountMultiplier = (count: number): number => {
    if (count <= 4) return 1;
    if (count <= 6) return 2;
    if (count <= 9) return 4;
    if (count <= 14) return 8;
    if (count <= 20) return 15;
    return 30;
};

export class GrowingGridConfig extends VideoSlotConfig {
    public static readonly REELS_NUMBER = 5;
    public static readonly BASE_ROWS = 3;
    public static readonly MAX_ROWS = 6;
    public static readonly SYMBOLS = ["A", "K", "Q", "J", "10", "9", "Wild", "Gem"];

    constructor() {
        super();
        this.setCreditsAmount(10000);
        this.setReelsNumber(GrowingGridConfig.REELS_NUMBER);
        this.setReelsSymbolsNumber(GrowingGridConfig.BASE_ROWS);
        this.setAvailableSymbols(GrowingGridConfig.SYMBOLS);
        this.setWildSymbols(["Wild"]);
        this.setScatterSymbols(["Gem"]);
        this.setLinesDefinitions(new LinesDefinitionsFor5x3());

        // Line pays only ever look at the base 3 rows, so the default paytable's line tiers are
        // fine as-is. "Gem" is a scatter counted anywhere on the grid, so its payout has to cover
        // every count reachable once the grid has grown to its maximum size (5 reels x 6 rows).
        const paytable = new Paytable(
            this.getAvailableBets(),
            this.getAvailableSymbols(),
            this.getWildSymbols(),
            GrowingGridConfig.REELS_NUMBER,
        );
        const maxGemCount = GrowingGridConfig.REELS_NUMBER * GrowingGridConfig.MAX_ROWS;
        for (let count = 3; count <= maxGemCount; count++) {
            paytable.setPayoutForSymbol("Gem", count, gemCountMultiplier(count));
        }
        this.setPaytable(paytable);

        const sequences = [];
        for (let i = 0; i < GrowingGridConfig.REELS_NUMBER; i++) {
            const sequence = new SymbolsSequence();
            sequence.fromNumbersOfSymbols({A: 3, K: 4, Q: 4, J: 5, "10": 5, "9": 5, Wild: 2, Gem: 3});
            sequence.shuffle();
            sequences.push(sequence);
        }
        this.setSymbolsSequences(sequences);
    }
}
