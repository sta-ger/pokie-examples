/*
An example of a 5x3 video slot game with sticky re-spin feature. Every winning combination triggers the re-spin
during which all the winning symbols are held on their places. The re-spins continue as long as there are new wins.
*/

import {LinesDefinitionsFor5x3, VideoSlotWithFreeGamesConfig, VideoSlotWithFreeGamesSessionSerializer} from "pokie";
import {SwsrWinCalculator} from "./SwsrWinCalculator.ts";
import {SwsrSession} from "./SwsrSession.ts";
import {SwsrCombinationsGenerator} from "./SwsrCombinationsGenerator.ts";

/*
Let's create a simple video slot config. By default, the scatter symbol "S" triggers free spins. We don't want this
functionality at our game, so we need to re-define the number of awarded free spins for this symbol.
 */
const config = new VideoSlotWithFreeGamesConfig();
config.setLinesDefinitions(new LinesDefinitionsFor5x3());
config.setFreeGamesForScatters("S", 3, 0);
config.setFreeGamesForScatters("S", 4, 0);
config.setFreeGamesForScatters("S", 5, 0);

/*
The Combinations Generator is an object responsible for generating the reel symbols matrix for each game round. The
generateSymbolsCombination() method of this class is triggered every time the session is played. For this example, we
will create a custom combination generator, that will generate new combinations merged with sticky symbols.
*/
const combinationsGenerator = new SwsrCombinationsGenerator(config);

/*
As the name suggests, the Win Calculator is responsible for calculating the outcome of each game round. The
calculateWin() method of this class is triggered every time the session is played, defining the winning lines and
winning scatters based on the symbols combination provided for this method. The information about winning lines,
scatters, and other round-winning data can be retrieved through dedicated methods.

For this example, we will use an instance of our custom win calculator, which inherits from VideoSlotWinCalculator, to
add an extra functionality that determines an array of all winning symbols of the current round.
*/
const winCalculator = new SwsrWinCalculator(config);

/*
In this example, we will use our custom session class with play() method overridden to implement the re-spin logic.
 */
const session = new SwsrSession(config, combinationsGenerator, winCalculator);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotWithFreeGamesSessionSerializer();
export const customScenarios = [];
