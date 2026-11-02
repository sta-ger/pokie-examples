import {initializeData} from "./data.ts";
import {createFixtureSession, fixtureScenarios, fixtureSessionSerializer} from "./games/fixture-slot/index.ts";
import {initializeUi} from "./ui/ui.ts";

initializeData(createFixtureSession(), fixtureSessionSerializer, fixtureScenarios);
void initializeUi(document.getElementById("ui") as HTMLDivElement, fixtureScenarios.map(([id, label]) => [id, label]));
