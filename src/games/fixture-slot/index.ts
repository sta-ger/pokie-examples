import {
    SeededRandomNumberGenerator,
    SymbolsCombinationsGenerator,
    VideoSlotWithFreeGamesSession,
    VideoSlotWithFreeGamesSessionSerializer,
} from "pokie";
import {
    customScenarios,
} from "../slot-with-free-games/index.ts";
import {SwfgConfig} from "../slot-with-free-games/SwfgConfig.ts";
import {SwfgSession} from "../slot-with-free-games/SwfgSession.ts";
import {SwfgSessionWinCalculator} from "../slot-with-free-games/SwfgSessionWinCalculator.ts";

// The fixture entry point keeps its identity stable for browser parity captures.
export const FIXTURE_SEED = "fixture-round";

export function createFixtureSession(): VideoSlotWithFreeGamesSession {
    // The free-games example owns this playable configuration. It exposes the same real custom
    // scenario Studio's public Find free games control drives, so parity uses a featured round rather
    // than synthetic feature markup. Each page gets an isolated, seeded production session: its reels,
    // wins and scenario search are repeatable at either browser viewport.
    const config = new SwfgConfig();
    const generator = new SymbolsCombinationsGenerator(config, new SeededRandomNumberGenerator(0x5eedc0de));
    return new SwfgSession(config, generator, new SwfgSessionWinCalculator(config));
}

export const fixtureSessionSerializer = new VideoSlotWithFreeGamesSessionSerializer();
export const fixtureScenarios = customScenarios;
