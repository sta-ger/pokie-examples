import {
    createStudioFixtureGameSession,
    STUDIO_FIXTURE_SEED,
    VideoSlotWithFreeGamesSessionSerializer,
} from "@fromstan/pokie/browser";

const game = {
    getManifest() {
        return {
            id: "pokie-examples-fixture-slot",
            name: "POKIE Examples Fixture Slot",
            version: "1.0.0",
            description: "The deterministic Fixture Slot used by the POKIE examples and Studio workflows.",
        };
    },
    createSession(context = {}) {
        return createStudioFixtureGameSession(context.seed ?? STUDIO_FIXTURE_SEED);
    },
    getSessionSerializer() {
        return new VideoSlotWithFreeGamesSessionSerializer();
    },
};

export default game;
