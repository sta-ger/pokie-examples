import {initializeUi} from "./ui/ui.ts";
import {initializeData} from "./data.ts";
import {
    customGameSession as session,
    customGameSessionSerializer as serializer,
    customScenarios as scenarios,
} from "./games/slot-with-sticky-respin";

await initializeData(session, serializer, scenarios);
await initializeUi(document.getElementById("ui") as HTMLTableElement, scenarios as unknown as [string, string][]);
