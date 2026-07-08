/*
An example of a reproducible/auditable round using SeededRandomNumberGenerator instead of the
default Math.random()-based RNG. The same seed always produces the same sequence of reel draws, so
a dispute (or a certification test suite) can replay a session from scratch and land on the exact
same outcome - this is what SeededRandomNumberGenerator/getLastStopPositions are for (see
docs/reels-and-sequences.md). It is NOT a substitute for SecureRandomNumberGenerator in a real-money
game; it exists specifically for reproducibility, not unpredictability.

The "Verify last spin" button proves this live rather than just asserting it: it builds a brand new
generator from the same seed, replays it forward exactly as many times as the real generator has
ever been asked for a combination (regardless of whether those draws came from Play clicks or a
Simulation run), and compares the result to what's actually on screen.
*/

import {
    SeededRandomNumberGenerator,
    SymbolsCombinationDescribing,
    SymbolsCombinationsAnalyzer,
    SymbolsCombinationsGenerating,
    SymbolsCombinationsGenerator,
    VideoSlotSession,
    VideoSlotSessionSerializer,
    VideoSlotWinCalculator,
} from "pokie";
import {VerifiableSpinConfig} from "./VerifiableSpinConfig.ts";

class CountingSymbolsCombinationsGenerator implements SymbolsCombinationsGenerating<string> {
    public callCount = 0;

    constructor(private readonly inner: SymbolsCombinationsGenerating<string>) {}

    public generateSymbolsCombination(): SymbolsCombinationDescribing<string> {
        this.callCount++;
        return this.inner.generateSymbolsCombination();
    }

    public getLastStopPositions(): number[] {
        return this.inner.getLastStopPositions?.() ?? [];
    }
}

const seed = Math.floor(Math.random() * 1_000_000_000);
const config = new VerifiableSpinConfig();
const combinationsGenerator = new CountingSymbolsCombinationsGenerator(
    new SymbolsCombinationsGenerator(config, new SeededRandomNumberGenerator(seed)),
);
const session = new VideoSlotSession(config, combinationsGenerator, new VideoSlotWinCalculator(config));

export const customGameSession = session;
export const customGameSessionSerializer = new VideoSlotSessionSerializer();
export const customScenarios = [];

const verifyLastSpin = (): {verified: boolean; replayedStopPositions: number[]} => {
    const replayGenerator = new SymbolsCombinationsGenerator(config, new SeededRandomNumberGenerator(seed));
    let replayedCombination: SymbolsCombinationDescribing<string> = replayGenerator.generateSymbolsCombination();
    for (let i = 1; i < combinationsGenerator.callCount; i++) {
        replayedCombination = replayGenerator.generateSymbolsCombination();
    }
    const verified = SymbolsCombinationsAnalyzer.areCombinationsEqual(
        replayedCombination.toMatrix(),
        session.getSymbolsCombination().toMatrix(),
    );
    return {verified, replayedStopPositions: replayGenerator.getLastStopPositions()};
};

export const afterRoundPlayed = () => {
    const container = document.getElementById("customInfo");
    if (!container) {
        return;
    }
    while (container.children.length > 0) {
        container.removeChild(container.children[0]);
    }

    const heading = document.createElement("h4");
    heading.innerText = "Audit trail";
    container.appendChild(heading);

    const seedLine = document.createElement("div");
    seedLine.innerText = `Session seed: ${seed} - rounds drawn so far: ${combinationsGenerator.callCount}`;
    container.appendChild(seedLine);

    const stopPositionsLine = document.createElement("div");
    stopPositionsLine.innerText = `Stop positions for this round: [${combinationsGenerator.getLastStopPositions().join(", ")}]`;
    container.appendChild(stopPositionsLine);

    const verifyButton = document.createElement("button");
    verifyButton.innerText = "Verify last spin";
    verifyButton.className = "btn btn-secondary btn-sm";
    verifyButton.style.marginTop = "10px";
    container.appendChild(verifyButton);

    const resultLine = document.createElement("div");
    resultLine.style.marginTop = "10px";
    container.appendChild(resultLine);

    verifyButton.onclick = () => {
        const {verified, replayedStopPositions} = verifyLastSpin();
        resultLine.innerText = verified
            ? `✓ Verified: replaying seed ${seed} for ${combinationsGenerator.callCount} draws reproduces stop positions [${replayedStopPositions.join(", ")}]`
            : `✗ Mismatch: replay produced [${replayedStopPositions.join(", ")}]`;
        resultLine.style.color = verified ? "#1a7a1a" : "#c02020";
    };
};
