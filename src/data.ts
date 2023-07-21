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
} from "pokie";

let localSession: VideoSlotSession | VideoSlotWithFreeGamesSession;
let localSerializer: VideoSlotSessionSerializer | VideoSlotWithFreeGamesSessionSerializer;
let localCustomScenarios: [string, string, SimulationConfig][] | undefined;

export const initializeData = (
    session: VideoSlotSession | VideoSlotWithFreeGamesSession,
    serializer: VideoSlotSessionSerializer | VideoSlotWithFreeGamesSessionSerializer,
    customScenarios?: [string, string, SimulationConfig][],
) => {
    localSession = session;
    localSerializer = serializer;
    localCustomScenarios = customScenarios;
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
        res(localSerializer.getRoundData(localSession as VideoSlotWithFreeGamesSession));
    });
};

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
    return new Promise((res) => {
        const simulationConfig = localCustomScenarios?.find((entry) => entry[0] === scenarioId)!;
        res(runSimulation(simulationConfig[2]));
    });
};

const runSimulation = (simulationConfig: SimulationConfig) => {
    const simulation = new Simulation(localSession, simulationConfig);
    localSession.play();
    simulation.run();
    return localSerializer.getRoundData(localSession as VideoSlotWithFreeGamesSession);
};
