import {initializeUi} from "./ui/ui.ts";
import {initializeData} from "./data.ts";
import {
    afterRoundPlayed,
    customGameSession as session,
    customGameSessionSerializer as serializer,
    customScenarios as scenarios,
} from "./games/verifiable-spin";

initializeData(session, serializer, scenarios, afterRoundPlayed);
initializeUi(document.getElementById("ui") as HTMLTableElement, scenarios as unknown as [string, string][]);
