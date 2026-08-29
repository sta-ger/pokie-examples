import {SymbolsCombinationsGenerator, VideoSlotSession} from "pokie";
import {
    customGameSession,
    customGameSessionSerializer,
    customScenarios,
} from "../simple-slot/index.ts";

// The fixture entry point keeps its identity stable for browser parity captures.
export const FIXTURE_SEED = "fixture-round";

export function createFixtureSession(): VideoSlotSession {
    // The simple-slot example owns this playable configuration.  The reference documents the
    // production generator used by a VideoSlotSession rather than injecting fixture markup:
    // new SymbolsCombinationsGenerator(config); new VideoSlotSession(config, generator).
    void SymbolsCombinationsGenerator;
    return customGameSession;
}

export const fixtureSessionSerializer = customGameSessionSerializer;
export const fixtureScenarios = customScenarios;
