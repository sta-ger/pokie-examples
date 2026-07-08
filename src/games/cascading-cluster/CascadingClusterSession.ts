import {
    SymbolsCombination,
    SymbolsCombinationDescribing,
    SymbolsCombinationsGenerating,
    VideoSlotConfigRepresenting,
    VideoSlotSession,
} from "pokie";
import {CascadingClusterWinCalculator} from "./CascadingClusterWinCalculator.ts";

export class CascadingClusterSession extends VideoSlotSession<string> {
    private readonly cascadeWinCalculator: CascadingClusterWinCalculator;

    constructor(
        config: VideoSlotConfigRepresenting<string>,
        combinationsGenerator: SymbolsCombinationsGenerating<string>,
        cascadeWinCalculator: CascadingClusterWinCalculator,
    ) {
        super(config, combinationsGenerator, cascadeWinCalculator);
        this.cascadeWinCalculator = cascadeWinCalculator;
    }

    /*
    The base VideoSlotSession would report the freshly-generated pre-cascade grid. What a player
    (and the UI) should see after play() is the fully settled screen once every cascade step has
    resolved - there's never a "winning" grid left on screen, by definition, once cascading stops.
    */
    public getSymbolsCombination(): SymbolsCombinationDescribing<string> {
        const finalScreen = this.cascadeWinCalculator.getLastCascadeResult()?.getFinalScreen();
        return finalScreen ? new SymbolsCombination<string>().fromMatrix(finalScreen) : super.getSymbolsCombination();
    }
}
