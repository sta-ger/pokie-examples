import {
    drawReelsSymbols,
    getAnyWin,
    getCustomScenario,
    getSymbolWin,
    HTMLElementWithBaseColor,
    play,
    setCountersValues,
} from "./utils.ts";
import {VideoSlotWithFreeGamesInitialNetworkData} from "pokie";
import {getInitialData} from "../data.ts";

export const initializeUi = async (div: HTMLDivElement, customScenarios?: [string, string][]) => {
    const style = document.createElement("style");
    style.innerText = `
            .reels-row {
                height: 50px;
                background-color: #dddddd;
            }

            .reels-item {
                width: 115px;
                text-align: center;
                font-weight: bold;
                color: #444444;
                border: 3px solid white;
            }

            .paragraph {
                padding-top: 20px;
            }
    `;
    style.id = "ui-style";

    if (!document.getElementById("ui-style")) {
        document.head.appendChild(style);
    }

    const link = document.createElement("link");
    link.href = "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css";
    link.rel = "stylesheet";
    link.integrity = "sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC";
    link.crossOrigin = "anonymous";
    link.id = "bootstrap-link";

    if (!document.getElementById("ui-link")) {
        document.head.appendChild(link);
    }

    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js";
    script.integrity = "sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM";
    script.crossOrigin = "anonymous";
    script.id = "bootstrap-script";

    if (!document.getElementById("bootstrap-script")) {
        document.head.appendChild(script);
    }

    div.className = "container";
    div.style.width = "600px";

    div.innerHTML = `
            <div class="paragraph">
                <table id="reels" class="reels"></table>
            </div>

            <div class="paragraph">
                <div style="display: flex; justify-content: center;">
                    <div id="credits" style="flex: 1; text-align: center;">Credits</div>
                    <div id="bet" style="flex: 1; text-align: center;">Bet</div>
                    <div id="win" style="flex: 1; text-align: center;">Win</div>
                </div>
                <div id="fgCounters" style="display: flex; justify-content: center;">
                    <div id="fgNum" style="flex: 1; text-align: center">FG num: 0</div>
                    <div id="fgSum" style="flex: 1; text-align: center">FG sum: 10</div>
                    <div id="fgBank" style="flex: 1; text-align: center">FG bank: 1000</div>
                </div>
            </div>

            <div class="paragraph">
                <div class="d-flex align-items-center gap-2">
                    <button id="playButton" type="button" class="btn btn-primary btn-lg">Play</button>
                    <button id="playWinButton" type="button" class="btn btn-primary btn-lg"">
                        Win
                    </button>
                    <div class="flex-grow-1"></div>
                    <div class="dropdown">
                        <a
                            class="btn btn-secondary dropdown-toggle"
                            href="#"
                            role="button"
                            id="dropdownMenuLink"
                            data-bs-toggle="dropdown"
                            aria-expanded="false"
                        >
                            Simulations
                        </a>
                        <ul id="dropDownList" class="dropdown-menu" aria-labelledby="dropdownMenuLink">
                        </ul>
                    </div>
                </div>
            </div>

            
            <div class="paragraph" id="winningLines" style="display: none">
                <h4>Winning lines</h4>
                <div class="paragraph" id="winningLinesList"></div>
            </div>
            
            <div class="paragraph">
                <div class="accordion" id="accordionMath">
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="headingLinesDefinitions">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#collapseLinesDefinitions" aria-expanded="true" aria-controls="collapseLinesDefinitions">
                                Lines definitions
                            </button>
                        </h2>
                        <div id="collapseLinesDefinitions" class="accordion-collapse collapse" aria-labelledby="headingLinesDefinitions"
                             data-bs-parent="#accordionMath">
                            <div id="linesDefinitionsList" class="accordion-body" >
                                
                            </div>
                        </div>
                    </div>
                    <div class="accordion-item">
                        <h2 class="accordion-header" id="headingPaytable">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse"
                                    data-bs-target="#collapsePaytable" aria-expanded="true" aria-controls="collapsePaytable">
                                Paytable
                            </button>
                        </h2>
                        <div id="collapsePaytable" class="accordion-collapse collapse" aria-labelledby="headingPaytable"
                             data-bs-parent="#accordionMath">
                            <div class="accordion-body">
                                <table class="table">
                                    <thead>
                                    <tr id="paytableHead">
                                        <th scope="col">Symbol</th>
                                    </tr>
                                    </thead>
                                    <tbody id="paytableBody">
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                <div>
            <div>
           
        `;

    const initialData = (await getInitialData()) as VideoSlotWithFreeGamesInitialNetworkData;

    const ddList = document.getElementById("dropDownList")!;
    const pt = initialData.paytable["10"];
    Object.keys(pt).forEach((itemId) => {
        const entry = pt[itemId];
        Object.keys(entry).forEach((times) => {
            const intTimes = parseInt(times, 10);
            const a = document.createElement("a");
            a.className = "dropdown-item";
            a.innerText = 'Symbol "' + itemId + '" x ' + times;
            a.onclick = () => getSymbolWin(itemId, intTimes);
            const li = document.createElement("li");
            li.appendChild(a);
            ddList.appendChild(li);
        });
    });

    document.getElementById("playButton")!.onclick = () => play();
    document.getElementById("playWinButton")!.onclick = () => getAnyWin();

    const reelsTable = document.getElementById("reels") as HTMLTableElement;
    drawReelsSymbols(initialData.reelsSymbols, reelsTable);

    const winningLines = initialData.winningLines;
    let win = 0;
    if (winningLines && Object.keys(winningLines).length > 0) {
        win = Object.values(winningLines).reduce((sum, line) => sum + line.winAmount, 0);
    }
    setCountersValues(
        initialData.credits,
        initialData.bet,
        win,
        initialData.freeGamesNum,
        initialData.freeGamesSum,
        initialData.freeGamesBank,
    );

    customScenarios?.forEach((scenario) => {
        const a = document.createElement("a");
        a.className = "dropdown-item";
        a.innerText = scenario[1];
        a.id = `scenario-${scenario[0]}`;
        const li = document.createElement("li");
        li.appendChild(a);
        ddList.appendChild(li);
    });

    document.querySelectorAll('[id^="scenario-"]').forEach((element) => {
        const e = element as HTMLElement;
        e.onclick = () => getCustomScenario(e.id.replace("scenario-", ""));
    });

    const ptBetData = Object.values(initialData.paytable)[0];
    const ptMlt = new Set<number>();
    Object.values(ptBetData).forEach((symbolData) => {
        Object.keys(symbolData).forEach((mlt) => ptMlt.add(parseInt(mlt)));
    });

    const ptHead = document.getElementById("paytableHead")!;
    ptMlt.forEach((mlt) => {
        const th = document.createElement("th");
        th.scope = "col";
        th.innerText = mlt.toString();
        ptHead.appendChild(th);
    });

    const ptBody = document.getElementById("paytableBody")!;

    Object.keys(ptBetData).forEach((symbolId) => {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.innerText = symbolId;
        tr.appendChild(td);
        ptMlt.forEach((mlt) => {
            const td = document.createElement("td");
            td.innerText = ptBetData[symbolId][mlt] ? ptBetData[symbolId][mlt].toString() : "";
            tr.appendChild(td);
        });
        ptBody.appendChild(tr);
    });

    const linesDefinitionsDiv = document.getElementById("linesDefinitionsList")!;
    while (linesDefinitionsDiv.children.length > 0) {
        linesDefinitionsDiv.removeChild(linesDefinitionsDiv.children[0]);
    }

    Object.keys(initialData.linesDefinitions).forEach((lineId) => {
        const definition = initialData.linesDefinitions[lineId];
        const d = document.createElement("div");
        const btn = document.createElement("button");
        btn.innerText = "Line: " + lineId;
        btn.className = "btn btn-secondary btn-sm";
        d.style.paddingRight = "20px";
        d.style.paddingBottom = "20px";
        d.style.display = "inline-block";
        d.appendChild(btn);
        btn.onmouseenter = () => {
            definition.forEach((y, x) => {
                const color = "#999999";
                const td = document.getElementById(y + ":" + x)!;
                td.style.backgroundColor = color;
            });
        };
        btn.onmouseleave = () => {
            definition.forEach((y, x) => {
                const td = document.getElementById(y + ":" + x) as HTMLElementWithBaseColor;
                td.style.backgroundColor = td.baseColor;
            });
        };
        linesDefinitionsDiv.appendChild(d);
    });
};
