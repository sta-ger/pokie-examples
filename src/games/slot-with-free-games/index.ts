/*
An example of a 5x3 video slot game with free spins.

Features:
- A minimum of 2 winning symbols on a winning line or scattered across all reels pays out.
- During free spins, symbols on a winning line are counted not only from left to right but can also be scattered across
  the winning line definition.
- During free spins, symbol sequences are different from the base game's ones. Sequences during free spins do not
  contain scatter symbols, so free spins cannot be re-triggered.
- During free spins, all wins are multiplied by x2.
- This example also demonstrates the usage of Simulation to obtain the desired game outcomes.
*/

import {
    PlayFreeGamesStrategy,
    SimulationConfig,
    SymbolsCombinationsGenerator,
    VideoSlotSession,
    VideoSlotWithFreeGamesSessionSerializer,
} from "pokie";
import {SwfgConfig} from "./SwfgConfig.ts";
import {SwfgSession} from "./SwfgSession.ts";
import {SwfgSessionWinCalculator} from "./SwfgSessionWinCalculator.ts";

/*
Let's create the game configuration.

In this example, we will use a custom config class that inherits from VideoSlotWithFreeGamesConfig to provide different
symbol sequences and line patterns during free spins.
*/
const config = new SwfgConfig();

/*
The Combinations Generator is an object responsible for generating the reel symbols matrix for each game round. The
generateSymbolsCombination() method of this class is triggered every time the session is played. For this example, we
will use the default combinations generator.
*/
const combinationsGenerator = new SymbolsCombinationsGenerator(config);

/*
As the name suggests, the Win Calculator is responsible for calculating the outcome of each game round. The
calculateWin() method of this class is triggered every time the session is played, defining the winning lines and
winning scatters based on the symbols combination provided for this method. The information about winning lines,
scatters, and other round-winning data can be retrieved through dedicated methods.

For this example, we will use an instance of our custom win calculator, which inherits from VideoSlotWinCalculator, to
ensure that the winnings during free spins are multiplied by x2.
*/
const winCalculator = new SwfgSessionWinCalculator(config);

/*
In this example, we will use our custom session class, which overrides the play() method. This override allows us to
define whether we are in free spins mode or not and sets the appropriate flag in the game configuration.
 */
const session = new SwfgSession(config, combinationsGenerator, winCalculator);

/*
Now it's time for simulations. The simulation class uses strategies to determine if the simulation should be stopped
after a certain game round. Before every simulation round, the canPlayNextSimulationRound() method of the strategy
provided to the simulation's config gets triggered. If this method returns false, then the simulation stops, and we can
assume that the criteria of the game round we are waiting for are met.
 */

/*
Let's create the config for a simulation that should stop if the free spins are triggered. We'll set the number of
simulation rounds to Infinity so that the simulation can be played until the strategy determines the round with free
spins. The default class PlayFreeGamesStrategy can be used for that.
 */
const fgConfig = new SimulationConfig();
fgConfig.setNumberOfRounds(Infinity);
fgConfig.setPlayStrategy(new PlayFreeGamesStrategy());

/*
Another simulation config will be used to stop the simulation on the last free spins round if any amount of free bank
was collected during free spins.
 */
const lastFgConfig = new SimulationConfig();
lastFgConfig.setNumberOfRounds(Infinity);
const lastFgStrategy = new PlayFreeGamesStrategy();
lastFgStrategy.setLastFreeGame(true);
lastFgStrategy.setShouldHaveFreeBankAtEnd(true);
lastFgConfig.setPlayStrategy(lastFgStrategy);

/*
One more similar simulation config, but this time for the last free spins round without any free bank.
 */
const lastFgNoBankConfig = new SimulationConfig();
lastFgNoBankConfig.setNumberOfRounds(Infinity);
const lastFgNoBankStrategy = new PlayFreeGamesStrategy();
lastFgNoBankStrategy.setLastFreeGame(true);
lastFgNoBankStrategy.setShouldHaveFreeBankAtEnd(false);
lastFgNoBankConfig.setPlayStrategy(lastFgNoBankStrategy);

/*
And one more config with our custom strategy that determines if the current round has both winning lines and scatters.
 */
const linesAndScattersConfig = new SimulationConfig();
linesAndScattersConfig.setNumberOfRounds(Infinity);
linesAndScattersConfig.setPlayStrategy({
    canPlayNextSimulationRound: (session: VideoSlotSession) =>
        !(Object.keys(session.getWinningLines()).length > 0 && Object.keys(session.getWinningScatters()).length > 0),
});

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotWithFreeGamesSessionSerializer();
export const customScenarios = [
    ["fg", "Free games", fgConfig],
    ["fgBank", "Last free game with free bank", lastFgConfig],
    ["fgNoBank", "Last free game without free bank", lastFgNoBankConfig],
    ["scLines", "Lines and scatters", linesAndScattersConfig],
] as [string, string, SimulationConfig][];
