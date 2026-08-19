import {initializeData} from "./data.ts";
import {createFixtureSession} from "./games/fixture-slot/index.ts";
import {initializeUi} from "./ui/ui.ts";

const {session, serializer} = createFixtureSession();
initializeData(session, serializer);
initializeUi(document.getElementById("ui") as HTMLDivElement);
