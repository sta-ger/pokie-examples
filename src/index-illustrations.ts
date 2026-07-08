/*
Small procedural SVG icons for the examples index page - one per game, drawn under its title. Each
one is a tiny schematic of the grid shape from src/data.ts's own examples, redrawn here (not a
screenshot) so it can show the *concept* clearly: which cells matter and why, in the same visual
language (gray cells, colored highlights) as the actual game UI's reels/highlight colors.
*/

const CELL_SIZE = 16;
const GAP = 3;
const BASE_COLOR = "#d9d9d9";
const STROKE_COLOR = "#ffffff";

const SVG_NS = "http://www.w3.org/2000/svg";

function svgEl<K extends keyof SVGElementTagNameMap>(tag: K): SVGElementTagNameMap[K] {
    return document.createElementNS(SVG_NS, tag) as SVGElementTagNameMap[K];
}

function createCanvas(width: number, height: number): SVGSVGElement {
    const svg = svgEl("svg");
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    svg.setAttribute("width", String(width));
    svg.setAttribute("height", String(height));
    return svg;
}

function drawCell(svg: SVGSVGElement, x: number, y: number, color: string, dashed = false): void {
    const rect = svgEl("rect");
    rect.setAttribute("x", String(x));
    rect.setAttribute("y", String(y));
    rect.setAttribute("width", String(CELL_SIZE));
    rect.setAttribute("height", String(CELL_SIZE));
    rect.setAttribute("rx", "3");
    rect.setAttribute("fill", dashed ? "none" : color);
    if (dashed) {
        rect.setAttribute("stroke", color);
        rect.setAttribute("stroke-width", "1.5");
        rect.setAttribute("stroke-dasharray", "3,2");
    } else {
        rect.setAttribute("stroke", STROKE_COLOR);
        rect.setAttribute("stroke-width", "2");
    }
    svg.appendChild(rect);
}

// Draws a (possibly jagged - reelHeights can differ per reel) grid of cells, top-aligned per reel,
// starting at (originX, originY). colorAt returns undefined for a plain/base-colored cell.
function drawGrid(
    svg: SVGSVGElement,
    originX: number,
    originY: number,
    reelHeights: number[],
    colorAt: (reel: number, row: number) => string | undefined,
): {width: number; height: number} {
    const maxRows = Math.max(...reelHeights);
    reelHeights.forEach((rows, reel) => {
        for (let row = 0; row < rows; row++) {
            const x = originX + reel * (CELL_SIZE + GAP);
            const y = originY + row * (CELL_SIZE + GAP);
            drawCell(svg, x, y, colorAt(reel, row) ?? BASE_COLOR);
        }
    });
    return {
        width: reelHeights.length * (CELL_SIZE + GAP) - GAP,
        height: maxRows * (CELL_SIZE + GAP) - GAP,
    };
}

function drawBadge(svg: SVGSVGElement, cx: number, cy: number, text: string, bg: string): void {
    const circle = svgEl("circle");
    circle.setAttribute("cx", String(cx));
    circle.setAttribute("cy", String(cy));
    circle.setAttribute("r", "11");
    circle.setAttribute("fill", bg);
    circle.setAttribute("stroke", "#ffffff");
    circle.setAttribute("stroke-width", "1.5");
    svg.appendChild(circle);

    const label = svgEl("text");
    label.setAttribute("x", String(cx));
    label.setAttribute("y", String(cy + 4));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("font-size", "10");
    label.setAttribute("font-weight", "bold");
    label.setAttribute("fill", "#ffffff");
    label.setAttribute("font-family", "sans-serif");
    label.textContent = text;
    svg.appendChild(label);
}

function drawGlyph(svg: SVGSVGElement, x: number, y: number, text: string, size = 20, color = "#888888"): void {
    const label = svgEl("text");
    label.setAttribute("x", String(x));
    label.setAttribute("y", String(y));
    label.setAttribute("text-anchor", "middle");
    label.setAttribute("dominant-baseline", "middle");
    label.setAttribute("font-size", String(size));
    label.setAttribute("fill", color);
    label.textContent = text;
    svg.appendChild(label);
}

const GREEN = "#4caf50";
const BLUE = "#4dc9ff";
const ORANGE = "#ffb84d";
const PURPLE = "#c94dff";
const GOLD = "#f0b429";

const illustrations: Record<string, () => SVGSVGElement> = {
    // A straight payline across a plain grid - the most basic "match symbols on a line" concept.
    "simple-slot": () => {
        const heights = [4, 4, 4, 4, 4];
        const svg = createCanvas(5 * (CELL_SIZE + GAP) - GAP, 4 * (CELL_SIZE + GAP) - GAP);
        drawGrid(svg, 0, 0, heights, (_reel, row) => (row === 2 ? GREEN : undefined));
        return svg;
    },

    // A scattered (non-straight) winning pattern plus an "x2" bonus-round multiplier badge.
    "slot-with-free-games": () => {
        const heights = [3, 3, 3, 3, 3];
        const width = 5 * (CELL_SIZE + GAP) - GAP;
        const svg = createCanvas(width + 14, 3 * (CELL_SIZE + GAP) - GAP + 4);
        const scattered: Record<string, boolean> = {"0:0": true, "1:2": true, "2:1": true, "3:0": true, "4:2": true};
        drawGrid(svg, 0, 4, heights, (reel, row) => (scattered[`${reel}:${row}`] ? GREEN : undefined));
        drawBadge(svg, width + 2, 12, "x2", ORANGE);
        return svg;
    },

    // A few cells held in place (gold) between spins, plus a respin glyph.
    "slot-with-sticky-respin": () => {
        const heights = [3, 3, 3, 3, 3];
        const width = 5 * (CELL_SIZE + GAP) - GAP;
        const svg = createCanvas(width + 26, 3 * (CELL_SIZE + GAP) - GAP);
        const sticky: Record<string, boolean> = {"1:1": true, "2:1": true, "2:2": true};
        drawGrid(svg, 0, 0, heights, (reel, row) => (sticky[`${reel}:${row}`] ? GOLD : undefined));
        drawGlyph(svg, width + 14, (3 * (CELL_SIZE + GAP) - GAP) / 2, "↻", 20, GOLD);
        return svg;
    },

    // A cluster (connected blob, not a line) of adjacent same-colored cells.
    "cascading-cluster": () => {
        const heights = [5, 5, 5, 5, 5, 5];
        const svg = createCanvas(6 * (CELL_SIZE + GAP) - GAP, 5 * (CELL_SIZE + GAP) - GAP);
        const cluster: Record<string, boolean> = {"2:2": true, "3:2": true, "3:3": true, "4:3": true, "4:2": true};
        drawGrid(svg, 0, 0, heights, (reel, row) => (cluster[`${reel}:${row}`] ? BLUE : undefined));
        return svg;
    },

    // A jagged grid - each reel a different height - with one "way" traced across it.
    "megaways-style": () => {
        const heights = [2, 4, 3, 5, 2, 4];
        const svg = createCanvas(6 * (CELL_SIZE + GAP) - GAP, 5 * (CELL_SIZE + GAP) - GAP);
        const way: Record<string, boolean> = {"0:0": true, "1:1": true, "2:0": true, "3:2": true};
        drawGrid(svg, 0, 0, heights, (reel, row) => (way[`${reel}:${row}`] ? PURPLE : undefined));
        return svg;
    },

    // Two grids, small -> bigger, joined by an arrow: the grid growing over rounds.
    "growing-grid": () => {
        const smallHeights = [3, 3, 3, 3, 3];
        const bigHeights = [5, 5, 5, 5, 5];
        const smallWidth = 5 * (CELL_SIZE + GAP) - GAP;
        const smallHeight = 3 * (CELL_SIZE + GAP) - GAP;
        const bigHeight = 5 * (CELL_SIZE + GAP) - GAP;
        const arrowGap = 24;
        const svg = createCanvas(smallWidth * 2 + arrowGap, bigHeight);
        drawGrid(svg, 0, (bigHeight - smallHeight) / 2, smallHeights, () => undefined);
        drawGlyph(svg, smallWidth + arrowGap / 2, bigHeight / 2, "→", 22, "#666666");
        drawGrid(svg, smallWidth + arrowGap, 0, bigHeights, () => undefined);
        return svg;
    },

    // Coin symbols (pay anywhere, independent of lines) plus a multiplier wild sitting on a line.
    "value-pay-multiplier": () => {
        const heights = [3, 3, 3, 3, 3];
        const width = 5 * (CELL_SIZE + GAP) - GAP;
        const height = 3 * (CELL_SIZE + GAP) - GAP;
        const svg = createCanvas(width, height + 14);
        const line: Record<string, boolean> = {"0:1": true, "1:1": true, "2:1": true, "3:1": true, "4:1": true};
        drawGrid(svg, 0, 14, heights, (reel, row) => (line[`${reel}:${row}`] ? GREEN : undefined));
        [0, 3].forEach((reel) => {
            const cx = reel * (CELL_SIZE + GAP) + CELL_SIZE / 2;
            const cy = 14 + 0 * (CELL_SIZE + GAP) + CELL_SIZE / 2;
            drawBadge(svg, cx, cy, "$", ORANGE);
        });
        // The multiplier wild sits on the winning line itself (row 1), not floating above it.
        const multiplierCx = 2 * (CELL_SIZE + GAP) + CELL_SIZE / 2;
        const multiplierCy = 14 + 1 * (CELL_SIZE + GAP) + CELL_SIZE / 2;
        drawBadge(svg, multiplierCx, multiplierCy, "x3", GREEN);
        return svg;
    },

    // A plain grid with a "verified" checkmark badge - the RNG/outcome can be independently
    // reproduced and confirmed, rather than the grid itself illustrating anything special.
    "verifiable-spin": () => {
        const heights = [3, 3, 3, 3, 3];
        const width = 5 * (CELL_SIZE + GAP) - GAP;
        const height = 3 * (CELL_SIZE + GAP) - GAP;
        const svg = createCanvas(width + 8, height + 8);
        drawGrid(svg, 0, 0, heights, () => undefined);
        drawBadge(svg, width, height, "✓", GREEN);
        return svg;
    },

    // The same grid, three disjoint highlight groups at once: a line, a cluster, and a way.
    "mixed-evaluators": () => {
        const heights = [4, 4, 4, 4, 4];
        const svg = createCanvas(5 * (CELL_SIZE + GAP) - GAP, 4 * (CELL_SIZE + GAP) - GAP);
        const cells: Record<string, string> = {
            "0:0": GREEN,
            "1:0": GREEN,
            "2:0": GREEN,
            "3:0": GREEN,
            "4:0": GREEN,
            "1:2": BLUE,
            "2:2": BLUE,
            "2:3": BLUE,
            "1:3": BLUE,
            "3:1": PURPLE,
            "4:1": PURPLE,
        };
        drawGrid(svg, 0, 0, heights, (reel, row) => cells[`${reel}:${row}`]);
        return svg;
    },
};

document.querySelectorAll<HTMLElement>("[data-illustration]").forEach((container) => {
    const key = container.dataset.illustration;
    const draw = key ? illustrations[key] : undefined;
    if (draw) {
        container.appendChild(draw());
    }
});
