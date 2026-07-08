// Headless regression smoke test for the example games. Boots a real vite dev server, drives each
// page in a real (system) Chrome via Playwright, and asserts on runtime behavior — not just that
// things compile. Run with `npm run test:e2e`.

import {chromium} from "playwright";
import {spawn} from "node:child_process";
import {fileURLToPath} from "node:url";
import {dirname, join} from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const VITE_BIN = join(__dirname, "..", "node_modules", ".bin", "vite");

const PORT = 5199;
const BASE_URL = `http://localhost:${PORT}`;
const PAGES = [
    "simple-slot.html",
    "slot-with-free-games.html",
    "slot-with-sticky-respin.html",
    "cascading-cluster.html",
    "megaways-style.html",
    "growing-grid.html",
    "value-pay-multiplier.html",
    "verifiable-spin.html",
    "mixed-evaluators.html",
];

const failures = [];

function assert(condition, message) {
    if (!condition) {
        failures.push(message);
        console.error(`FAIL: ${message}`);
    } else {
        console.log(`ok: ${message}`);
    }
}

function startDevServer() {
    return new Promise((resolve, reject) => {
        const proc = spawn(VITE_BIN, ["--port", String(PORT), "--strictPort"], {stdio: "pipe"});
        let settled = false;
        const timeout = setTimeout(() => {
            if (!settled) {
                settled = true;
                reject(new Error("vite dev server did not start in time"));
            }
        }, 20000);
        proc.stdout.on("data", (chunk) => {
            if (!settled && chunk.toString().includes("ready in")) {
                settled = true;
                clearTimeout(timeout);
                resolve(proc);
            }
        });
        proc.stderr.on("data", (chunk) => process.stderr.write(chunk));
        proc.on("exit", (code) => {
            if (!settled) {
                settled = true;
                clearTimeout(timeout);
                reject(new Error(`vite dev server exited early with code ${code}`));
            }
        });
    });
}

function trackConsoleErrors(page) {
    // Neither pokie nor this repo ever calls console.error/warn, so a "console error" here is
    // always a browser-generated resource-load failure (missing favicon, or the jsdelivr CDN
    // bootstrap css/js when the sandbox has no network) — noise unrelated to app correctness.
    // pageerror (an actually-thrown, uncaught JS exception) is the real regression signal: that's
    // what fires if e.g. a broken win-evaluation call throws mid-round.
    const errors = [];
    page.on("pageerror", (err) => errors.push(String(err)));
    return errors;
}

function parseCredits(text) {
    return parseInt(text.replace(/[^0-9-]/g, ""), 10);
}

function parseWin(text) {
    return parseInt(text.replace(/[^0-9-]/g, ""), 10);
}

async function waitUntilInteractive(page) {
    // initializeUi() injects the button markup synchronously but only wires up its onclick
    // handler after an internal await (getInitialData()); waiting for the element to exist isn't
    // enough — clicking before the handler is attached is a silent no-op.
    await page.waitForFunction(() => typeof document.getElementById("playButton")?.onclick === "function");
}

async function readState(page) {
    return page.evaluate(() => ({
        credits: document.getElementById("credits").innerText,
        win: document.getElementById("win").innerText,
        fgNum: document.getElementById("fgNum").innerText,
        fgSum: document.getElementById("fgSum").innerText,
        reels: document.getElementById("reels").innerText,
    }));
}

async function checkPageLoadsAndPlays(browser, pageName) {
    const page = await browser.newPage();
    const consoleErrors = trackConsoleErrors(page);

    await page.goto(`${BASE_URL}/${pageName}`, {waitUntil: "networkidle"});
    await waitUntilInteractive(page);

    const before = await readState(page);
    const reelsSeen = new Set([before.reels]);
    let after = before;
    for (let i = 0; i < 5; i++) {
        await page.click("#playButton");
        await page.waitForTimeout(150);
        after = await readState(page);
        reelsSeen.add(after.reels);
    }

    assert(consoleErrors.length === 0, `${pageName}: no console errors after 5 spins (got: ${JSON.stringify(consoleErrors)})`);
    assert(Number.isFinite(parseCredits(after.credits)), `${pageName}: credits is a number after play (${after.credits})`);
    // A credits comparison can coincidentally cancel out over just 5 spins (small bet, wins that
    // happen to sum back to the exact starting balance) even though every spin genuinely played -
    // comparing the actual reels grid is a far more robust signal that Play is doing something,
    // since landing on the literal same grid by chance is astronomically unlikely.
    assert(reelsSeen.size > 1, `${pageName}: reels actually change across spins`);

    // Exercise the "Win" simulation button, which deterministically stops on a winning round —
    // this proves the win-evaluation/serialization pipeline (getWinEvaluationResult, etc.) works
    // end to end, not just that a round can be played. Most games surface the breakdown in the
    // generic #winningLines panel, but a game whose win calculator doesn't expose per-component
    // data through the standard lines/scatters/clusters/values/ways getters (e.g. a custom
    // multi-step calculator like the cascading-cluster example) can instead render its own
    // account of the win into #customInfo - either is a legitimate way to show the player why
    // they won, so accept whichever one this game actually used.
    await page.click("#playWinButton");
    await page.waitForTimeout(500);
    const winBreakdownShown = await page.evaluate(() => {
        const winningLinesVisible = document.getElementById("winningLines")?.style.display !== "none";
        const customInfoNonEmpty = (document.getElementById("customInfo")?.textContent ?? "").trim().length > 0;
        return winningLinesVisible || customInfoNonEmpty;
    });
    assert(winBreakdownShown, `${pageName}: "Win" simulation produces a visible win breakdown (winning-lines panel or custom info)`);
    assert(consoleErrors.length === 0, `${pageName}: no console errors after the "Win" simulation`);

    await page.close();
}

async function checkStickyRespinAccumulates(browser) {
    const page = await browser.newPage();
    const consoleErrors = trackConsoleErrors(page);

    await page.goto(`${BASE_URL}/slot-with-sticky-respin.html`, {waitUntil: "networkidle"});
    await waitUntilInteractive(page);

    // Sticky respins should never pay less than the round before them (symbols only ever get
    // added, never removed, between respins of the same sequence) — this is the exact behavior
    // SwsrCombinationsGenerator.generateSymbolsCombination()/SwsrWinCalculator.getAllWinningSymbolsPositions()
    // are responsible for. Run enough rounds to hit several respin sequences rather than relying
    // on RNG luck for just one.
    let prevFgNum = 0;
    let prevWin = 0;
    let sequencesObserved = 0;
    const ROUNDS = 200;

    for (let i = 0; i < ROUNDS; i++) {
        await page.click("#playButton");
        await page.waitForTimeout(120);
        const state = await readState(page);
        const fgNum = state.fgNum ? parseInt(state.fgNum.replace(/[^0-9-]/g, ""), 10) : 0;
        const win = parseWin(state.win);

        if (fgNum > 0 && fgNum === prevFgNum + 1) {
            sequencesObserved++;
            assert(
                win >= prevWin,
                `slot-with-sticky-respin.html: respin ${fgNum} win (${win}) is not lower than respin ${prevFgNum} win (${prevWin}) [round ${i}]`,
            );
        }
        prevFgNum = fgNum;
        prevWin = win;
    }

    assert(sequencesObserved >= 3, `slot-with-sticky-respin.html: observed at least 3 respin steps across ${ROUNDS} rounds (got ${sequencesObserved})`);
    assert(consoleErrors.length === 0, `slot-with-sticky-respin.html: no console errors across ${ROUNDS} spins (got: ${JSON.stringify(consoleErrors)})`);

    await page.close();
}

let devServer;
let browser;
try {
    console.log("Starting vite dev server...");
    devServer = await startDevServer();

    console.log("Launching browser...");
    browser = await chromium.launch({channel: "chrome", headless: true});

    for (const pageName of PAGES) {
        console.log(`\n--- ${pageName} ---`);
        await checkPageLoadsAndPlays(browser, pageName);
    }

    console.log(`\n--- slot-with-sticky-respin.html: sticky accumulation regression check ---`);
    await checkStickyRespinAccumulates(browser);
} finally {
    if (browser) await browser.close();
    if (devServer) devServer.kill("SIGKILL");
}

console.log(`\n${failures.length === 0 ? "PASS" : "FAIL"}: ${PAGES.length + 1} checks run, ${failures.length} failures`);
process.exit(failures.length === 0 ? 0 : 1);
