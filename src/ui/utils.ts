import {
    SymbolsCombination,
    VideoSlotWithFreeGamesRoundNetworkData,
    WinningLineNetworkData,
    WinningScatterNetworkData,
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

export const drawWinningLinesList = (
    div: HTMLElement,
    winningLines?: Record<string, WinningLineNetworkData>,
    winningScatters?: Record<string, WinningScatterNetworkData>,
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
            const d = document.createElement("div");
            const btn = document.createElement("button");
            btn.innerText = "Scatter: " + scatter.symbolId + ", win: " + scatter.winAmount;
            btn.className = "btn btn-secondary btn-sm";
            d.style.paddingRight = "20px";
            d.style.paddingBottom = "20px";
            d.style.display = "inline-block";
            d.appendChild(btn);

            btn.onmouseenter = () => {
                scatter.symbolsPositions.forEach(([x, y]) => {
                    let color = "#00FF00";
                    const td = document.getElementById(y + ":" + x)!;
                    td.style.backgroundColor = color;
                });
            };
            btn.onmouseleave = () => {
                scatter.symbolsPositions.forEach(([x, y]) => {
                    const td = document.getElementById(y + ":" + x) as HTMLElementWithBaseColor;
                    td.style.backgroundColor = td.baseColor;
                });
            };
            div.appendChild(d);
        });
    }
};

export const drawOutcome = (
    reelsSymbols: string[][],
    bet: number,
    credits: number,
    freeGamesNum: number | undefined,
    freeGamesSum: number | undefined,
    freeGamesBank: number | undefined,
    winningLines?: Record<string, WinningLineNetworkData>,
    winningScatters?: Record<string, WinningScatterNetworkData>,
) => {
    const reelsTable = document.getElementById("reels") as HTMLTableElement;
    drawReelsSymbols(reelsSymbols, reelsTable);

    let win = 0;
    if (winningLines && Object.values(winningLines).length > 0) {
        win = Object.values(winningLines).reduce((sum, line) => sum + line.winAmount, 0);
    }
    if (winningScatters && Object.values(winningScatters).length > 0) {
        win += Object.values(winningScatters).reduce((sum, scatter) => sum + scatter.winAmount, 0);
    }
    setCountersValues(credits, bet, win, freeGamesNum, freeGamesSum, freeGamesBank);

    const winningLinesDiv = document.getElementById("winningLines")!;
    if (
        (winningLines && Object.keys(winningLines).length > 0) ||
        (winningScatters && Object.keys(winningScatters).length > 0)
    ) {
        winningLinesDiv.style.display = "";
        const winningLinesListDiv = document.getElementById("winningLinesList")!;
        drawWinningLinesList(winningLinesListDiv, winningLines, winningScatters);
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

    if (winningScatters && Object.keys(winningScatters).length > 0) {
        Object.keys(winningScatters).forEach((itemId) => {
            const scatter = winningScatters[itemId];
            scatter.symbolsPositions.forEach(([x, y]) => {
                const td = document.getElementById(y + ":" + x) as HTMLElementWithBaseColor;
                td.style.backgroundColor = "#ffda00";
                td.baseColor = td.style.backgroundColor;
            });
        });
    }
};

export const drawReelsSymbols = (reelsSymbols: string[][], table: HTMLTableElement) => {
    while (table.children.length > 0) {
        table.removeChild(table.children[0]);
    }
    const symbols = new SymbolsCombination().fromMatrix(reelsSymbols).toMatrix(true);
    symbols.forEach((row, i) => {
        const tr = document.createElement("tr");
        tr.className = "reels-row";
        row.forEach((item, j) => {
            const td = document.createElement("td") as HTMLElementWithBaseColor;
            td.id = i + ":" + j;
            td.className = "reels-item";
            td.innerText = item;
            td.baseColor = td.style.backgroundColor;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });
};

export const play = async () => {
    (document.getElementById("playButton") as HTMLElementWithDisabled).disabled = "disabled";
    const data = (await getRoundData()) as VideoSlotWithFreeGamesRoundNetworkData;
    (document.getElementById("playButton") as HTMLElementWithDisabled).disabled = "";
    drawOutcome(
        data.reelsSymbols,
        data.bet,
        data.credits,
        data.freeGamesNum,
        data.freeGamesSum,
        data.freeGamesBank,
        data.winningLines,
        data.winningScatters,
    );
};

export const getAnyWin = async () => {
    const data = (await getAnyWinData()) as VideoSlotWithFreeGamesRoundNetworkData;
    drawOutcome(
        data.reelsSymbols,
        data.bet,
        data.credits,
        data.freeGamesNum,
        data.freeGamesSum,
        data.freeGamesBank,
        data.winningLines,
        data.winningScatters,
    );
};

export const getSymbolWin = async (itemId: string, times: number) => {
    const data = (await getSymbolWinData(itemId, times)) as VideoSlotWithFreeGamesRoundNetworkData;
    drawOutcome(
        data.reelsSymbols,
        data.bet,
        data.credits,
        data.freeGamesNum,
        data.freeGamesSum,
        data.freeGamesBank,
        data.winningLines,
        data.winningScatters,
    );
};

export const getCustomScenario = async (scenarioId: string) => {
    const data = (await getCustomScenarioData(scenarioId)) as VideoSlotWithFreeGamesRoundNetworkData;
    drawOutcome(
        data.reelsSymbols,
        data.bet,
        data.credits,
        data.freeGamesNum,
        data.freeGamesSum,
        data.freeGamesBank,
        data.winningLines,
        data.winningScatters,
    );
};
