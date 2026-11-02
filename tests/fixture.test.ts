import {createPc12FreeGamesFixtureSession, VideoSlotWithFreeGamesSessionSerializer} from "pokie/browser";
import {initializeData} from "../src/data.ts";
import {createFixtureSession, FIXTURE_SEED, fixtureScenarios, fixtureSessionSerializer} from "../src/games/fixture-slot/index.ts";
import {initializeUi} from "../src/ui/ui.ts";

it("reaches the shared featured round through the public Free games scenario", async () => {
    const reference = createPc12FreeGamesFixtureSession(FIXTURE_SEED);
    do {
        reference.play();
    } while (reference.getWonFreeGamesNumber() === 0);
    const expected = new VideoSlotWithFreeGamesSessionSerializer().getRoundData(reference);

    const session = createFixtureSession();
    initializeData(session, fixtureSessionSerializer, fixtureScenarios);
    const root = document.createElement("div");
    document.body.appendChild(root);
    try {
        await initializeUi(root, fixtureScenarios.map(([id, label]) => [id, label]));
        root.querySelector<HTMLButtonElement>("#scenariosButton")!.click();
        const scenario = Array.from(root.querySelectorAll<HTMLButtonElement>(".pokie-examples-scenarios-item"))
            .find(button => button.textContent === "Free games");
        expect(scenario).toBeDefined();
        scenario!.click();
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(fixtureSessionSerializer.getRoundData(session)).toEqual(expected);
        expect(session.getWonFreeGamesNumber()).toBeGreaterThan(0);
        expect(root.querySelector("#roundError")?.hasAttribute("hidden")).toBe(true);
        expect(root.querySelector("[data-pokie-player='canonical-v1']")).not.toBeNull();
        expect(root.querySelectorAll(".player-cell")).toHaveLength(expected.reelsSymbols.flat().length);
    } finally {
        root.remove();
    }
});
