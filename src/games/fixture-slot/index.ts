import {
    ReelsSymbolsSequencesGenerator,
    SeededRandomNumberGenerator,
    SymbolsCombinationsGenerator,
    VideoSlotConfig,
    VideoSlotSession,
    VideoSlotSessionSerializer,
} from "pokie";

export const FIXTURE_SEED = "fixture-round";

// The same generated-game fixture POKIE uses for Player, Studio Play, and Replay parity.  Both
// the generated reel strips and first round consume its seed, exactly as a generated package's
// createSession({seed}) path does.
export function createFixtureSession(): {session: VideoSlotSession; serializer: VideoSlotSessionSerializer} {
    const config = new VideoSlotConfig(undefined, new ReelsSymbolsSequencesGenerator(new SeededRandomNumberGenerator(FIXTURE_SEED)));
    config.setReelsNumber(3);
    config.setReelsSymbolsNumber(3);
    config.setWildSymbols([]);
    config.setScatterSymbols([]);
    config.setAvailableSymbols(["A", "B", "C"]);
    config.getPaytable().setPayoutForSymbol("A", 3, 5);
    config.getPaytable().setPayoutForSymbol("B", 3, 3);
    config.getPaytable().setPayoutForSymbol("C", 3, 1);

    return {
        session: new VideoSlotSession(config, new SymbolsCombinationsGenerator(config, new SeededRandomNumberGenerator(FIXTURE_SEED))),
        serializer: new VideoSlotSessionSerializer(),
    };
}
