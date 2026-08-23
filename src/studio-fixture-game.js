import {
    ReelsSymbolsSequencesGenerator,
    SeededRandomNumberGenerator,
    SymbolsCombinationsGenerator,
    VideoSlotConfig,
    VideoSlotSession,
    VideoSlotSessionSerializer,
} from "pokie/browser";

const DEFAULT_SEED = "fixture-round";

function createSession(seed) {
    const config = new VideoSlotConfig(undefined, new ReelsSymbolsSequencesGenerator(new SeededRandomNumberGenerator(seed)));
    config.setReelsNumber(3);
    config.setReelsSymbolsNumber(3);
    config.setWildSymbols([]);
    config.setScatterSymbols([]);
    config.setAvailableSymbols(["A", "B", "C"]);
    config.getPaytable().setPayoutForSymbol("A", 3, 5);
    config.getPaytable().setPayoutForSymbol("B", 3, 3);
    config.getPaytable().setPayoutForSymbol("C", 3, 1);

    return new VideoSlotSession(config, new SymbolsCombinationsGenerator(config, new SeededRandomNumberGenerator(seed)));
}

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
        return createSession(context.seed ?? DEFAULT_SEED);
    },
    getSessionSerializer() {
        return new VideoSlotSessionSerializer();
    },
};

export default game;
