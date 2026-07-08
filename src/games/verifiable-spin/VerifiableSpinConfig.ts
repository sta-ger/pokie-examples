import {LinesDefinitionsFor5x3, Paytable, SymbolsSequence, VideoSlotConfig} from "pokie";

export class VerifiableSpinConfig extends VideoSlotConfig {
    public static readonly REELS_NUMBER = 5;
    public static readonly ROWS_NUMBER = 3;
    public static readonly SYMBOLS = ["A", "K", "Q", "J", "10", "9", "Wild"];

    constructor() {
        super();
        this.setCreditsAmount(10000);
        this.setReelsNumber(VerifiableSpinConfig.REELS_NUMBER);
        this.setReelsSymbolsNumber(VerifiableSpinConfig.ROWS_NUMBER);
        this.setAvailableSymbols(VerifiableSpinConfig.SYMBOLS);
        this.setWildSymbols(["Wild"]);
        this.setLinesDefinitions(new LinesDefinitionsFor5x3());
        this.setPaytable(
            new Paytable(this.getAvailableBets(), this.getAvailableSymbols(), this.getWildSymbols(), VerifiableSpinConfig.REELS_NUMBER),
        );

        // Reel strips need to be long enough that "replay the same seed and land on the same stop
        // position" is a meaningful check rather than a coincidence of a tiny strip.
        const sequences = [];
        for (let i = 0; i < VerifiableSpinConfig.REELS_NUMBER; i++) {
            const sequence = new SymbolsSequence();
            sequence.fromNumbersOfSymbols({A: 4, K: 5, Q: 5, J: 6, "10": 6, "9": 6, Wild: 2});
            sequence.shuffle();
            sequences.push(sequence);
        }
        this.setSymbolsSequences(sequences);
    }
}
