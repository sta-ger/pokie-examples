import {CustomLinesDefinitions, Paytable, SymbolsSequence, VideoSlotConfig} from "pokie";

export class MegawaysStyleConfig extends VideoSlotConfig {
    public static readonly REELS_NUMBER = 6;
    public static readonly SYMBOLS = ["A", "K", "Q", "J", "10", "9", "Wild"];
    // Weighted per-reel height pool shared by every reel: mostly 3-4 rows, occasionally as few as
    // 2 or as many as 6 - the more rows a reel draws, the more ways-to-win it contributes.
    public static readonly REEL_HEIGHT_WEIGHTS = new SymbolsSequence<number>().fromNumbersOfSymbols({
        2: 2,
        3: 4,
        4: 3,
        5: 2,
        6: 1,
    });

    constructor() {
        super();
        this.setCreditsAmount(10000);
        this.setReelsNumber(MegawaysStyleConfig.REELS_NUMBER);
        this.setAvailableSymbols(MegawaysStyleConfig.SYMBOLS);
        this.setWildSymbols(["Wild"]);
        // This game pays by ways, not paylines - an empty lines definitions set keeps the shared
        // UI's generic "Lines definitions" panel from listing (and letting a player hover) row
        // positions that may not exist on a given round's shorter reels.
        this.setLinesDefinitions(new CustomLinesDefinitions());

        this.setPaytable(
            new Paytable(this.getAvailableBets(), this.getAvailableSymbols(), this.getWildSymbols(), MegawaysStyleConfig.REELS_NUMBER),
        );

        const sequences = [];
        for (let i = 0; i < MegawaysStyleConfig.REELS_NUMBER; i++) {
            const sequence = new SymbolsSequence();
            sequence.fromNumbersOfSymbols({A: 4, K: 5, Q: 5, J: 6, "10": 6, "9": 6, Wild: 2});
            sequence.shuffle();
            sequences.push(sequence);
        }
        this.setSymbolsSequences(sequences);
    }
}
