import {
    createStudioFixtureGameSession,
    STUDIO_FIXTURE_SEED,
    VideoSlotWithFreeGamesSession,
    VideoSlotWithFreeGamesSessionSerializer,
} from "@fromstan/pokie/browser";
import {
    customScenarios,
} from "../slot-with-free-games/index.ts";

// Studio's package fixture imports this exact public factory too.  Keep the consumer's
// seed visible here so the browser runner can attest one same-game, same-round contract.
export const FIXTURE_SEED = STUDIO_FIXTURE_SEED;

export function createFixtureSession(): VideoSlotWithFreeGamesSession {
    return createStudioFixtureGameSession(FIXTURE_SEED);
}

export const fixtureSessionSerializer = new VideoSlotWithFreeGamesSessionSerializer();
export const fixtureScenarios = customScenarios;
