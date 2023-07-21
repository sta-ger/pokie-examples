import {VideoSlotWithFreeGamesConfig, VideoSlotWithFreeGamesSession} from "pokie";
import {SwsrCombinationsGenerator} from "./SwsrCombinationsGenerator.ts";
import {SwsrWinCalculator} from "./SwsrWinCalculator.ts";

export class SwsrSession extends VideoSlotWithFreeGamesSession {
    private static combinationsGenerator: SwsrCombinationsGenerator;
    private static winCalculator: SwsrWinCalculator;

    constructor(
        config: VideoSlotWithFreeGamesConfig,
        combinationsGenerator: SwsrCombinationsGenerator,
        winCalculator: SwsrWinCalculator,
    ) {
        super(config, combinationsGenerator, winCalculator);
        SwsrSession.combinationsGenerator = combinationsGenerator;
        SwsrSession.winCalculator = winCalculator;
    }

    public play(): void {
        /*
        We need to save the amount of credits from the previous round in order to override the default slot with free
        spins functionality.
         */
        const creditsFromLastRound = this.getCreditsAmount();

        // Process the basic game round
        super.play();

        // Here we are retrieving an array of all winning symbols from our custom winning calculator.
        const winningSymbols = SwsrSession.winCalculator.getAllWinningSymbolsPositions();

        /*
        If the length of all winning symbols array is greater than before, then we put this array into the combinations
        generator as sticky symbols. Otherwise, we reset the sticky symbols by passing an empty array.
         */
        if (winningSymbols.length > SwsrSession.combinationsGenerator.getStickySymbols().length) {
            SwsrSession.combinationsGenerator.setStickySymbols(winningSymbols);

            // If there are sticky symbols we assume that the next round will be free of charge.
            this.setFreeGamesSum(this.getFreeGamesSum() + 1);
        } else {
            SwsrSession.combinationsGenerator.setStickySymbols([]);
        }

        // The super class play() method did the default slot game logic that we want to override.
        if (this.getFreeGamesSum() > 0) {
            // The bet shouldn't be subtracted from credits amount during the re-spin
            this.setCreditsAmount(creditsFromLastRound);

            // The free bank should always be equal to the current round winning amount
            this.setFreeGamesBank(this.getWinAmount());

            if (this.getFreeGamesNum() === 0) {
                /*
                If it is the first re-spin, we need to restore the credits amount from last round because the super
                class logic added the win amount to it.
                */
                this.setCreditsAmount(this.getCreditsAmount() - this.getWinAmount());
            } else if (this.getFreeGamesNum() === this.getFreeGamesSum()) {
                // If it is the last re-spin we can update the balance with the amount that was collected at the bank
                this.setCreditsAmount(creditsFromLastRound + this.getFreeGamesBank());
            }
        }
    }
}
