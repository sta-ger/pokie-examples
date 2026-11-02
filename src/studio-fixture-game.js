import {
    createPc12FreeGamesFixtureSession,
    PC_12_FEATURED_ROUND_SEED,
    VideoSlotWithFreeGamesSessionSerializer,
} from "pokie/browser";

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
        return createPc12FreeGamesFixtureSession(context.seed ?? PC_12_FEATURED_ROUND_SEED);
    },
    getSessionSerializer() {
        return new VideoSlotWithFreeGamesSessionSerializer();
    },
};

export default game;
