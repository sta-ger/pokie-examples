import {
    PlayUntilAnyWinStrategy,
    PlayUntilSymbolWinStrategy,
    Simulation,
    SimulationConfig,
    VideoSlotInitialNetworkData,
    VideoSlotRoundNetworkData,
    VideoSlotSession,
    VideoSlotSessionSerializer,
    VideoSlotWithFreeGamesInitialNetworkData,
    VideoSlotWithFreeGamesRoundNetworkData,
    VideoSlotWithFreeGamesSession,
    VideoSlotWithFreeGamesSessionSerializer,
    VideoSlotWithResizableGridSession,
    type BetModeSelecting,
} from "pokie/browser";

export type AnyVideoSlotSession = VideoSlotSession | VideoSlotWithFreeGamesSession | VideoSlotWithResizableGridSession;

let localSession: AnyVideoSlotSession;
let localSerializer: VideoSlotSessionSerializer | VideoSlotWithFreeGamesSessionSerializer;
let localCustomScenarios: [string, string, SimulationConfig][] | undefined;
// Lets a game's own index.ts render round state the generic serializer doesn't know about
// (e.g. cascade step history, RNG audit info) without every game forking data.ts/utils.ts.
let onAfterRoundPlayed: ((session: AnyVideoSlotSession) => void) | undefined;

export const initializeData = (
    session: AnyVideoSlotSession,
    serializer: VideoSlotSessionSerializer | VideoSlotWithFreeGamesSessionSerializer,
    customScenarios?: [string, string, SimulationConfig][],
    afterRoundPlayed?: (session: AnyVideoSlotSession) => void,
) => {
    localSession = session;
    localSerializer = serializer;
    localCustomScenarios = customScenarios;
    onAfterRoundPlayed = afterRoundPlayed;
};

export const getInitialData = async (): Promise<
    VideoSlotInitialNetworkData | VideoSlotWithFreeGamesInitialNetworkData
> => {
    return new Promise((res) => {
        res(localSerializer.getInitialData(localSession as VideoSlotWithFreeGamesSession));
    });
};

export const getRoundData = async (): Promise<VideoSlotRoundNetworkData | VideoSlotWithFreeGamesRoundNetworkData> => {
    return new Promise((res) => {
        localSession.play();
        onAfterRoundPlayed?.(localSession);
        res(localSerializer.getRoundData(localSession as VideoSlotWithFreeGamesSession));
    });
};

// The package Player reports raw choice values through its callbacks.  Examples apply those choices
// to the same live local session that Play/scenario actions consume, then return the serializer's
// authoritative current view so a control never becomes a cosmetic selection.
export function selectBet(bet: number): VideoSlotInitialNetworkData | VideoSlotWithFreeGamesInitialNetworkData {
    localSession.setBet(bet);
    return localSerializer.getInitialData(localSession as VideoSlotWithFreeGamesSession);
}

export function selectBetMode(modeId: string): VideoSlotInitialNetworkData | VideoSlotWithFreeGamesInitialNetworkData | undefined {
    const modeSelecting = localSession as Partial<BetModeSelecting>;
    if (typeof modeSelecting.setBetMode !== "function") {
        return undefined;
    }
    modeSelecting.setBetMode(modeId);
    return localSerializer.getInitialData(localSession as VideoSlotWithFreeGamesSession);
}

export const getSymbolWinData = async (itemId: string, times: number) => {
    return new Promise((res) => {
        localSession.play();
        const simulationConfig = new SimulationConfig();
        simulationConfig.setNumberOfRounds(Infinity);
        const playStrategy = new PlayUntilSymbolWinStrategy(itemId);
        playStrategy.setExactNumberOfWinningSymbols(times);
        simulationConfig.setPlayStrategy(playStrategy);
        res(runSimulation(simulationConfig));
    });
};

export const getAnyWinData = async () => {
    return new Promise((res) => {
        localSession.play();
        const simulationConfig = new SimulationConfig();
        simulationConfig.setNumberOfRounds(Infinity);
        const playStrategy = new PlayUntilAnyWinStrategy();
        simulationConfig.setPlayStrategy(playStrategy);
        res(runSimulation(simulationConfig));
    });
};

export const getCustomScenarioData = async (scenarioId: string) => {
    // PC-12's shared fixture must use the same one-spin-at-a-time feature search as Studio's public
    // Find free games action. Simulation normally makes an initial setup spin before its own loop,
    // which is appropriate for instructional examples but would make the seeded parity round differ.
    if (scenarioId === "fg" && localSession instanceof VideoSlotWithFreeGamesSession) {
        for (let attempt = 0; attempt < 100000; attempt++) {
            localSession.play();
            if (localSession.getWonFreeGamesNumber() > 0) {
                onAfterRoundPlayed?.(localSession);
                return localSerializer.getRoundData(localSession);
            }
        }
        throw new Error("No free-games round was found within 100000 spins.");
    }
    return new Promise((res) => {
        const simulationConfig = localCustomScenarios?.find((entry) => entry[0] === scenarioId)!;
        res(runSimulation(simulationConfig[2]));
    });
};

const runSimulation = (simulationConfig: SimulationConfig) => {
    const simulation = new Simulation(localSession, simulationConfig);
    localSession.play();
    simulation.run();
    onAfterRoundPlayed?.(localSession);
    return localSerializer.getRoundData(localSession as VideoSlotWithFreeGamesSession);
};
