/*
This is an example of a simple 5x4 video slot game with 8 winning lines.

Features:
- Winning lines are counted from right to left. A line of minimum 3 winning symbols pays out.

- "Wild" is a wild symbol that substitutes any other symbol on a winning line.

- "Scatter1" is a scatter symbol that pays out 10x, 20x, or 30x the bet if 3 or more symbols
  appear on any positions. Only one "Scatter1" can appear on any reel.

- "Scatter2" is a stacked scatter symbol that can appear on the 3 middle reels.
  If all 3 middle reels are covered with "Scatter2" symbols, the game pays 100x the bet.
*/

import {
    CustomLinesDefinitions,
    LinesDefinitionsFor5x4,
    Paytable,
    RightToLeftLinesPatterns,
    SymbolsSequence,
    VideoSlotConfig,
    VideoSlotSession,
    VideoSlotSessionSerializer,
} from "pokie";

/*
Let's create the game configuration.
We can define the bounds of the reels matrix, a list of available bets in the game,
and a list of all available symbols. We also need to define which symbols are wilds and scatters.
*/
const config = new VideoSlotConfig();
config.setReelsNumber(5);
config.setReelsSymbolsNumber(4);
config.setAvailableBets([10, 20, 30, 40, 50, 100, 200, 250, 500]);
config.setAvailableSymbols(["Ace", "King", "Queen", "Jack", "Ten", "Nine", "Wild", "Scatter1", "Scatter2"]);
config.setWildSymbols(["Wild"]);
config.setScatterSymbols(["Scatter1", "Scatter2"]);

/*
There are several default classes representing lines definitions.
Let's use the one for 5x4 reels as the base.
*/
const defaultLinesDefinitions = new LinesDefinitionsFor5x4();

/*
We want to use only first 8 lines from the default definitions.
Let's copy them to our own custom definitions object and put it into the game config.
*/
const customLinesDefinitions = new CustomLinesDefinitions();
customLinesDefinitions.setLineDefinition("0", defaultLinesDefinitions.getLineDefinition("0"));
customLinesDefinitions.setLineDefinition("1", defaultLinesDefinitions.getLineDefinition("1"));
customLinesDefinitions.setLineDefinition("2", defaultLinesDefinitions.getLineDefinition("2"));
customLinesDefinitions.setLineDefinition("3", defaultLinesDefinitions.getLineDefinition("3"));
customLinesDefinitions.setLineDefinition("4", defaultLinesDefinitions.getLineDefinition("4"));
customLinesDefinitions.setLineDefinition("5", defaultLinesDefinitions.getLineDefinition("5"));
customLinesDefinitions.setLineDefinition("6", defaultLinesDefinitions.getLineDefinition("6"));
customLinesDefinitions.setLineDefinition("7", defaultLinesDefinitions.getLineDefinition("7"));
config.setLinesDefinitions(customLinesDefinitions);

/*
Lines patterns define the direction of how the winning symbols are counted on the winning line.
In our case, lines should count from right to left, so let's instantiate the patterns we want
and put them into the config.
*/
const linesPatterns = new RightToLeftLinesPatterns(config.getReelsNumber());
config.setLinesPatterns(linesPatterns);

/*
Symbols sequences (also known as reels strips) are the long lists with all possible symbols combinations in the game.
When the round outcome combination is generated, the symbols are retrieved from these sequences.

Let's create an empty array where we will put the sequences for every reel and iterate over the number of reels.
*/
const sequences = [];
for (let i = 0; i < config.getReelsNumber(); i++) {
    /*
    Create a single sequence for the current reel. The sequence is empty by default.
     */
    const sequence = new SymbolsSequence();

    /*
    There are several ways of initializing the sequence with symbols.
    Here we will initialize it by defining a map of the number of each symbol on the sequence.
    Let's say we want to have 5 symbols "Nines" and "Tens", 4 "Jacks" and "Queens", 3 "Kings", 2 "Aces", 5 "Wilds",
    and only 1 "Scatter1".
     */
    sequence.fromNumbersOfSymbols({
        Nine: 5,
        Ten: 5,
        Jack: 4,
        Queen: 4,
        King: 3,
        Ace: 2,
        Wild: 5,
        Scatter1: 1,
    });

    /*
    The sequence we've just created will contain the stacks of the size of the number of every symbol we've provided.
    We need to shuffle it to have symbols distributed randomly on the sequence.
     */
    sequence.shuffle();

    /*
    Since we want to have only 1 "Scatter1" symbol on every reel during play, we need to continue shuffling
    the sequence until there are no situations where 2 or more "Scatter1" symbols appear together.
     */
    for (let j = 0; j < sequence.getSize(); j++) {
        const symbols = sequence.getSymbols(j, config.getReelsSymbolsNumber());
        const scatters = symbols.filter((symbol) => symbol === "Scatter1");
        if (scatters.length > 1) {
            sequence.shuffle();
            j = 0;
        }
    }

    /*
    Once we have the properly built sequence, we save it for the current reel.
     */
    sequences.push(sequence);
}

/*
 * Now let's add the stacks of special "Scatter2" symbols.
 * Let's add one stack at the middle of the sequence for each reel.
 */
sequences[1].addSymbol("Scatter2", config.getReelsSymbolsNumber(), Math.floor(sequences[1].getSize() / 2));
sequences[2].addSymbol("Scatter2", config.getReelsSymbolsNumber(), Math.floor(sequences[2].getSize() / 2));
sequences[3].addSymbol("Scatter2", config.getReelsSymbolsNumber(), Math.floor(sequences[3].getSize() / 2));

/*
 * And one more stack at the very end of the sequence so that these stacks will not intersect.
 */
sequences[1].addSymbol("Scatter2", config.getReelsSymbolsNumber());
sequences[2].addSymbol("Scatter2", config.getReelsSymbolsNumber());
sequences[3].addSymbol("Scatter2", config.getReelsSymbolsNumber());

/*
 * Once the sequences are built, we can put them into the config.
 */
config.setSymbolsSequences(sequences);

/*
 * Let's say that the initial balance for the game session should be 10000 credits.
 */
config.setCreditsAmount(10000);

/*
 * Finally, we need to define the paytable for the game.
 * Let's initialize an empty paytable for the list of available bets.
 */
const paytable = new Paytable(config.getAvailableBets());

/*
 * After that, we can specify the payouts for every particular symbol.
 */
paytable.setPayoutForSymbol("Nine", 3, 1);
paytable.setPayoutForSymbol("Nine", 4, 2);
paytable.setPayoutForSymbol("Nine", 5, 3);

paytable.setPayoutForSymbol("Ten", 3, 1);
paytable.setPayoutForSymbol("Ten", 4, 2);
paytable.setPayoutForSymbol("Ten", 5, 3);

paytable.setPayoutForSymbol("Jack", 3, 2);
paytable.setPayoutForSymbol("Jack", 4, 4);
paytable.setPayoutForSymbol("Jack", 5, 6);

paytable.setPayoutForSymbol("Queen", 3, 2);
paytable.setPayoutForSymbol("Queen", 4, 4);
paytable.setPayoutForSymbol("Queen", 5, 6);

paytable.setPayoutForSymbol("King", 3, 4);
paytable.setPayoutForSymbol("King", 4, 6);
paytable.setPayoutForSymbol("King", 5, 8);

paytable.setPayoutForSymbol("Ace", 3, 6);
paytable.setPayoutForSymbol("Ace", 4, 8);
paytable.setPayoutForSymbol("Ace", 5, 10);

paytable.setPayoutForSymbol("Scatter1", 3, 10);
paytable.setPayoutForSymbol("Scatter1", 4, 20);
paytable.setPayoutForSymbol("Scatter1", 5, 30);
paytable.setPayoutForSymbol("Scatter2", 12, 100);

/*
 * Once the paytable is defined, we can put it into the config.
 */
config.setPaytable(paytable);

/*
 * Now everything is done, and the default video slot game session can be created for the config we've just built.
 */
const session = new VideoSlotSession(config);

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];
