import {
    VideoSlotWithFreeGamesRoundNetworkData,
    WinningClusterNetworkData,
    WinningLineNetworkData,
    WinningScatterNetworkData,
    WinningValueNetworkData,
    WinningWayNetworkData,
} from "pokie";
import {getAnyWinData, getCustomScenarioData, getRoundData, getSymbolWinData} from "../data.ts";

export type HTMLElementWithDisabled = {
    disabled: string;
} & HTMLElement;

export type HTMLElementWithBaseColor = {
    baseColor: string;
} & (HTMLElement | HTMLTableCellElement);

export const setCountersValues = (
    credits: number,
    bet: number,
    win: number,
    freeGamesNum: number | undefined,
    freeGamesSum: number | undefined,
    freeGamesBank: number | undefined,
) => {
    if (!freeGamesSum) {
        document.getElementById("fgCounters")!.style.visibility = "hidden";
    } else {
        document.getElementById("fgCounters")!.style.visibility = "";
    }

    const creditsDiv = document.getElementById("credits")!;
    const betDiv = document.getElementById("bet")!;
    const winDiv = document.getElementById("win")!;
    creditsDiv.innerHTML = "Credits: " + credits;
    betDiv.innerHTML = "Bet: " + bet;
    winDiv.innerHTML = "Win: " + win;

    const numDiv = document.getElementById("fgNum")!;
    const sumDiv = document.getElementById("fgSum")!;
    const bankDiv = document.getElementById("fgBank")!;
    numDiv.innerHTML = "FG num: " + freeGamesNum;
    sumDiv.innerHTML = "FG sum: " + freeGamesSum;
    bankDiv.innerHTML = "FG bank: " + freeGamesBank;
};

const addHighlightButton = (
    div: HTMLElement,
    label: string,
    positions: number[][],
    highlightColor: string,
) => {
    const d = document.createElement("div");
    const btn = document.createElement("button");
    btn.innerText = label;
    btn.className = "btn btn-secondary btn-sm";
    d.style.paddingRight = "20px";
    d.style.paddingBottom = "20px";
    d.style.display = "inline-block";
    d.appendChild(btn);

    btn.onmouseenter = () => {
        positions.forEach(([x, y]) => {
            const td = document.getElementById(y + ":" + x);
            if (td) {
                td.style.backgroundColor = highlightColor;
            }
        });
    };
    btn.onmouseleave = () => {
        positions.forEach(([x, y]) => {
            const td = document.getElementById(y + ":" + x) as HTMLElementWithBaseColor;
            if (td) {
                td.style.backgroundColor = td.baseColor;
            }
        });
    };
    div.appendChild(d);
};

export const drawWinningLinesList = (
    div: HTMLElement,
    winningLines?: Record<string, WinningLineNetworkData>,
    winningScatters?: Record<string, WinningScatterNetworkData>,
    winningClusters?: Record<string, WinningClusterNetworkData>,
    winningValues?: Record<string, WinningValueNetworkData>,
    winningWays?: Record<string, WinningWayNetworkData>,
) => {
    while (div.children.length > 0) {
        div.removeChild(div.children[0]);
    }
    if (winningLines) {
        Object.keys(winningLines).forEach((lineId) => {
            const line = winningLines[lineId];
            const d = document.createElement("div");
            const btn = document.createElement("button");
            btn.innerText = "Line: " + lineId + ", win: " + line.winAmount;
            btn.className = "btn btn-secondary btn-sm";
            d.style.paddingRight = "20px";
            d.style.paddingBottom = "20px";
            d.style.display = "inline-block";
            d.appendChild(btn);

            btn.onmouseenter = () => {
                line.pattern.forEach((flag, x) => {
                    let color;
                    const y = line.definition[x];
                    if (line.symbolsPositions.includes(x) !== undefined && flag) {
                        color = "#00FF00";
                    } else {
                        color = "#999999";
                    }
                    const td = document.getElementById(y + ":" + x)!;
                    td.style.backgroundColor = color;
                });
            };
            btn.onmouseleave = () => {
                line.definition.forEach((y, x) => {
                    const td = document.getElementById(y + ":" + x) as HTMLElementWithBaseColor;
                    td.style.backgroundColor = td.baseColor;
                });
            };
            div.appendChild(d);
        });
    }
    if (winningScatters) {
        Object.values(winningScatters).forEach((scatter) => {
            addHighlightButton(
                div,
                "Scatter: " + scatter.symbolId + ", win: " + scatter.winAmount,
                scatter.symbolsPositions,
                "#00FF00",
            );
        });
    }
    if (winningClusters) {
        Object.values(winningClusters).forEach((cluster) => {
            addHighlightButton(
                div,
                "Cluster: " + cluster.symbolId + " x" + cluster.symbolsPositions.length + ", win: " + cluster.winAmount,
                cluster.symbolsPositions,
                "#4dc9ff",
            );
        });
    }
    if (winningValues) {
        Object.values(winningValues).forEach((value) => {
            addHighlightButton(
                div,
                "Value: " + value.symbolId + ", win: " + value.winAmount,
                value.symbolsPositions,
                "#ffb84d",
            );
        });
    }
    if (winningWays) {
        Object.values(winningWays).forEach((way) => {
            addHighlightButton(
                div,
                "Way: " + way.symbolId + ", ways: " + way.waysCount + ", win: " + way.winAmount,
                way.symbolsPositions,
                "#c94dff",
            );
        });
    }
};

const highlightPositions = (positions: number[][], color: string) => {
    positions.forEach(([x, y]) => {
        const td = document.getElementById(y + ":" + x) as HTMLElementWithBaseColor;
        if (td) {
            td.style.backgroundColor = color;
            td.baseColor = td.style.backgroundColor;
        }
    });
};

export const drawOutcome = (
    reelsSymbols: string[][],
    bet: number,
    credits: number,
    totalWin: number,
    freeGamesNum: number | undefined,
    freeGamesSum: number | undefined,
    freeGamesBank: number | undefined,
    winningLines?: Record<string, WinningLineNetworkData>,
    winningScatters?: Record<string, WinningScatterNetworkData>,
    winningClusters?: Record<string, WinningClusterNetworkData>,
    winningValues?: Record<string, WinningValueNetworkData>,
    winningWays?: Record<string, WinningWayNetworkData>,
) => {
    const reelsTable = document.getElementById("reels") as HTMLTableElement;
    drawReelsSymbols(reelsSymbols, reelsTable);

    setCountersValues(credits, bet, totalWin, freeGamesNum, freeGamesSum, freeGamesBank);

    const hasAnyWin =
        (winningLines && Object.keys(winningLines).length > 0) ||
        (winningScatters && Object.keys(winningScatters).length > 0) ||
        (winningClusters && Object.keys(winningClusters).length > 0) ||
        (winningValues && Object.keys(winningValues).length > 0) ||
        (winningWays && Object.keys(winningWays).length > 0);

    const winningLinesDiv = document.getElementById("winningLines")!;
    if (hasAnyWin) {
        winningLinesDiv.style.display = "";
        const winningLinesListDiv = document.getElementById("winningLinesList")!;
        drawWinningLinesList(winningLinesListDiv, winningLines, winningScatters, winningClusters, winningValues, winningWays);
        if (winningLines) {
            Object.keys(winningLines).forEach((lineId) => {
                const line = winningLines[lineId];
                line.symbolsPositions.forEach((x) => {
                    const y = line.definition[x];
                    const td = document.getElementById(y + ":" + x) as HTMLElementWithBaseColor;
                    td.style.backgroundColor = "#DDFFDD";
                    td.baseColor = td.style.backgroundColor;
                });
            });
        }
    } else {
        winningLinesDiv.style.display = "none";
    }

    if (winningScatters) {
        Object.values(winningScatters).forEach((scatter) => highlightPositions(scatter.symbolsPositions, "#ffda00"));
    }
    if (winningClusters) {
        Object.values(winningClusters).forEach((cluster) => highlightPositions(cluster.symbolsPositions, "#4dc9ff"));
    }
    if (winningValues) {
        Object.values(winningValues).forEach((value) => highlightPositions(value.symbolsPositions, "#ffb84d"));
    }
    if (winningWays) {
        Object.values(winningWays).forEach((way) => highlightPositions(way.symbolsPositions, "#c94dff"));
    }
};

export const drawReelsSymbols = (reelsSymbols: string[][], table: HTMLTableElement) => {
    while (table.children.length > 0) {
        table.removeChild(table.children[0]);
    }
    // One row, one column per reel, each column an independently-sized stack of cells - this
    // renders a uniform grid exactly like before (every reel the same height) but also handles a
    // jagged one (reels of different heights, e.g. VariableHeightSymbolsCombinationsGenerator)
    // without a separate code path, since reels never need to line up row-for-row here.
    const tr = document.createElement("tr");
    reelsSymbols.forEach((reelSymbols, reelId) => {
        const td = document.createElement("td");
        td.style.verticalAlign = "top";
        reelSymbols.forEach((item, rowId) => {
            const cell = document.createElement("div") as HTMLElementWithBaseColor;
            cell.id = rowId + ":" + reelId;
            cell.className = "reels-item";
            cell.innerText = item;
            cell.baseColor = cell.style.backgroundColor;
            td.appendChild(cell);
        });
        tr.appendChild(td);
    });
    table.appendChild(tr);
};

const drawOutcomeFromData = (data: VideoSlotWithFreeGamesRoundNetworkData) => {
    drawOutcome(
        data.reelsSymbols,
        data.bet,
        data.credits,
        data.totalWin ?? 0,
        data.freeGamesNum,
        data.freeGamesSum,
        data.freeGamesBank,
        data.winningLines,
        data.winningScatters,
        data.winningClusters,
        data.winningValues,
        data.winningWays,
    );
};

export const play = async () => {
    (document.getElementById("playButton") as HTMLElementWithDisabled).disabled = "disabled";
    const data = (await getRoundData()) as VideoSlotWithFreeGamesRoundNetworkData;
    (document.getElementById("playButton") as HTMLElementWithDisabled).disabled = "";
    drawOutcomeFromData(data);
};

export const getAnyWin = async () => {
    const data = (await getAnyWinData()) as VideoSlotWithFreeGamesRoundNetworkData;
    drawOutcomeFromData(data);
};

export const getSymbolWin = async (itemId: string, times: number) => {
    const data = (await getSymbolWinData(itemId, times)) as VideoSlotWithFreeGamesRoundNetworkData;
    drawOutcomeFromData(data);
};

export const getCustomScenario = async (scenarioId: string) => {
    const data = (await getCustomScenarioData(scenarioId)) as VideoSlotWithFreeGamesRoundNetworkData;
    drawOutcomeFromData(data);
};
