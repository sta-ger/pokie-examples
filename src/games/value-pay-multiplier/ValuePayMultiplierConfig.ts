import {LinesDefinitionsFor5x3, LeftToRightLinesPatterns, Paytable, SymbolsSequence, VideoSlotConfig} from "pokie";

export class ValuePayMultiplierConfig extends VideoSlotConfig {
    public static readonly REELS_NUMBER = 5;
    public static readonly ROWS_NUMBER = 3;
    // Regular line-pay symbols.
    public static readonly LINE_SYMBOLS = ["A", "K", "Q", "J"];
    // Multiplier wilds: substitute into lines like any other wild, and multiply whatever line win
    // they end up part of. Kept separate from the "Coin" value-pay symbols below on purpose - the
    // multiplier is scoped to line wins only (see MultiplierResolver in index.ts), so it has
    // nothing to do with the coins.
    public static readonly MULTIPLIER_WILDS: Record<string, number> = {WildX2: 2, WildX3: 3, WildX5: 5};
    // Value-pay symbols: each occurrence anywhere on the grid pays its own value independently,
    // no line/adjacency requirement and no interaction with the multiplier wilds above.
    public static readonly COIN_VALUES: Record<string, number> = {Coin1: 1, Coin5: 5, Coin10: 10};

    constructor() {
        super();
        this.setCreditsAmount(10000);
        this.setReelsNumber(ValuePayMultiplierConfig.REELS_NUMBER);
        this.setReelsSymbolsNumber(ValuePayMultiplierConfig.ROWS_NUMBER);
        this.setAvailableSymbols([
            ...ValuePayMultiplierConfig.LINE_SYMBOLS,
            ...Object.keys(ValuePayMultiplierConfig.MULTIPLIER_WILDS),
            ...Object.keys(ValuePayMultiplierConfig.COIN_VALUES),
        ]);
        this.setWildSymbols(Object.keys(ValuePayMultiplierConfig.MULTIPLIER_WILDS));
        this.setLinesDefinitions(new LinesDefinitionsFor5x3());
        this.setLinesPatterns(new LeftToRightLinesPatterns(ValuePayMultiplierConfig.REELS_NUMBER));

        // Built manually (no auto-fill) so the "Coin" symbols never accidentally get a line payout
        // entry - they're a value-pay-only symbol, not a line symbol that happens to also have a
        // count-tiered price.
        const paytable = new Paytable(this.getAvailableBets());
        const lineTiers: Record<string, [number, number, number]> = {
            A: [2, 5, 10],
            K: [1.5, 4, 8],
            Q: [1, 3, 6],
            J: [0.5, 2, 4],
        };
        Object.entries(lineTiers).forEach(([symbol, [three, four, five]]) => {
            paytable.setPayoutForSymbol(symbol, 3, three);
            paytable.setPayoutForSymbol(symbol, 4, four);
            paytable.setPayoutForSymbol(symbol, 5, five);
        });
        this.setPaytable(paytable);

        const sequences = [];
        for (let i = 0; i < ValuePayMultiplierConfig.REELS_NUMBER; i++) {
            const sequence = new SymbolsSequence();
            sequence.fromNumbersOfSymbols({
                A: 4,
                K: 5,
                Q: 5,
                J: 6,
                WildX2: 2,
                WildX3: 1,
                WildX5: 1,
                Coin1: 3,
                Coin5: 2,
                Coin10: 1,
            });
            sequence.shuffle();
            sequences.push(sequence);
        }
        this.setSymbolsSequences(sequences);
    }
}
