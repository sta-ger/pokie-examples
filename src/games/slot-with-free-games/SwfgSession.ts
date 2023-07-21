import {SymbolsCombinationsGenerating, VideoSlotWinCalculating, VideoSlotWithFreeGamesSession} from "pokie";
import {SwfgConfig} from "./SwfgConfig.ts";

export class SwfgSession extends VideoSlotWithFreeGamesSession {
    private static config: SwfgConfig;

    constructor(
        config: SwfgConfig,
        combinationsGenerator: SymbolsCombinationsGenerating,
        winCalculator: VideoSlotWinCalculating,
    ) {
        super(config, combinationsGenerator, winCalculator);
        SwfgSession.config = config;
    }

    public play() {
        super.play();
        if (this.getFreeGamesSum() > 0 && this.getFreeGamesNum() !== this.getFreeGamesSum()) {
            SwfgSession.config.setFreeGamesMode(true);
        } else {
            SwfgSession.config.setFreeGamesMode(false);
        }
    }
}
