import {
    createPc12FreeGamesFixtureSession,
    PC_12_FEATURED_ROUND_SEED,
    VideoSlotWithFreeGamesSession,
    VideoSlotWithFreeGamesSessionSerializer,
} from "pokie/browser";
import {
    customScenarios,
} from "../slot-with-free-games/index.ts";

// Studio's PC-12 package fixture imports this exact public factory too.  Keep the consumer's
// seed visible here so the browser runner can attest one same-game, same-round contract.
export const FIXTURE_SEED = PC_12_FEATURED_ROUND_SEED;

export function createFixtureSession(): VideoSlotWithFreeGamesSession {
    return createPc12FreeGamesFixtureSession(FIXTURE_SEED);
}

export const fixtureSessionSerializer = new VideoSlotWithFreeGamesSessionSerializer();
export const fixtureScenarios = customScenarios;
