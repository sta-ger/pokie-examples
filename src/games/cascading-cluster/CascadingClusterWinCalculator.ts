import {
    CascadeRefillProviding,
    CascadeResult,
    CascadingSpinResolver,
    ClusterWinCalculator,
    ClusterWinEvaluator,
    SymbolsCombinationDescribing,
    VideoSlotConfigDescribing,
    VideoSlotWinCalculating,
    WinEvaluationPipeline,
    WinningLineDescribing,
    WinningScatterDescribing,
} from "pokie";
import {CascadingClusterConfig} from "./CascadingClusterConfig.ts";

/*
This is a custom VideoSlotWinCalculating implementation rather than the usual VideoSlotWinCalculator
dispatcher, because a cascading round isn't "evaluate the grid once" - it's "evaluate, remove the
winning cluster, collapse+refill, and repeat until nothing wins", which is exactly what
CascadingSpinResolver does. We build our own single-evaluator WinEvaluationPipeline (cluster pays
only, no lines/scatters, so there's no aggregation-policy conflict to resolve) and feed it in.
*/
export class CascadingClusterWinCalculator implements VideoSlotWinCalculating<string> {
    private readonly resolver: CascadingSpinResolver<string>;
    private lastCascadeResult?: CascadeResult<string>;
    private totalWin = 0;

    constructor(config: VideoSlotConfigDescribing<string>) {
        const clusterCalculator = new ClusterWinCalculator(config, CascadingClusterConfig.MINIMUM_CLUSTER_SIZE);
        const pipeline = new WinEvaluationPipeline<string>([
            new ClusterWinEvaluator(clusterCalculator, CascadingClusterConfig.MINIMUM_CLUSTER_SIZE),
        ]);
        const refillProvider: CascadeRefillProviding<string> = {
            getRefillSymbols: (screen, removedPositions) => {
                const removedCountByReel = screen.map(() => 0);
                removedPositions.forEach(([reelId]) => removedCountByReel[reelId]++);
                return removedCountByReel.map((count) =>
                    Array.from(
                        {length: count},
                        () => CascadingClusterConfig.SYMBOLS[Math.floor(Math.random() * CascadingClusterConfig.SYMBOLS.length)],
                    ),
                );
            },
        };
        this.resolver = new CascadingSpinResolver<string>(pipeline, config, refillProvider);
    }

    public calculateWin(bet: number, symbolsCombination: SymbolsCombinationDescribing<string>): void {
        this.lastCascadeResult = this.resolver.resolve(symbolsCombination.toMatrix(), bet);
        // Layer an escalating step multiplier (x1, x2, x3...) on top of each step's own cluster
        // win - CascadingSpinResolver itself is multiplier-agnostic, this is game-specific.
        this.totalWin = this.lastCascadeResult
            .getCascadeSteps()
            .reduce((sum, step, index) => sum + step.getWinEvaluationResult().getTotalWin() * (index + 1), 0);
    }

    public getWinAmount(): number {
        return this.totalWin;
    }

    public getWinningLines(): Record<string, WinningLineDescribing<string>> {
        return {};
    }

    public getWinningScatters(): Record<string, WinningScatterDescribing<string>> {
        return {};
    }

    public getLinesWinning(): number {
        return 0;
    }

    public getScattersWinning(): number {
        return 0;
    }

    public getLastCascadeResult(): CascadeResult<string> | undefined {
        return this.lastCascadeResult;
    }
}
