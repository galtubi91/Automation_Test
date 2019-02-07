const puppeteer = require("puppeteer");

let browser;
let pages;
const testUnit =
    "https://renderer.stg.apester.com/v2/5c52fce87e45a0dfb4d62e30?preview=true&iframe_preview=true";
let apesterIframe;
const playerCrashWithException = [];


beforeAll(async () => {
    jest.setTimeout(15000);
    browser = await puppeteer.launch({
        headless: false
    });
    pages = await browser.pages();
    await pages[0].goto(testUnit);
    apesterIframe = await pages[0].frames()[1];
    pages[0].on('console', async msg => {
        const args = await msg.args()
        args.forEach(async (arg) => {
            const val = await arg.jsonValue();
            if (JSON.stringify(val) === JSON.stringify({})) {
                const exception = arg._remoteObject.description;
                playerCrashWithException.push(exception);
            }
        })
    });
});

test("Default Layout", async () => {
    await apesterIframe.waitFor("div[class^=StyledInteractiveMultiChoice]");
    let defaultLayoutOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice]"
    );
    await defaultLayoutOptions[0].click();
    await pages[0].waitFor(4000);
    let nextSlideTitle = await apesterIframe.evaluate(() => {
        const elements = document.querySelectorAll(
            "div[class^=StyledCanvasTextComponentV1] > p"
        );
        return Array.from(elements).map(element => element.innerText);
    });
    expect(playerCrashWithException).toEqual([]);
    expect(nextSlideTitle[1]).toBe("big image");
});
test("Big image", async () => {
    let bigImageOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice] > div"
    );
    await bigImageOptions[0].click();
    await pages[0].waitFor(5000);
    let nextSlideTitle = await apesterIframe.evaluate(() => {
        const elements = document.querySelectorAll(
            "div[class^=StyledCanvasTextComponentV1] > p"
        );
        return Array.from(elements).map(element => element.innerText);
    });
    expect(playerCrashWithException).toEqual([]);
    expect(nextSlideTitle[1]).toBe("versus");
});
test("Versus", async () => {
    let versusOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice] > div"
    );
    await versusOptions[0].click();
    await pages[0].waitFor(5000);
    let nextSlideTitle = await apesterIframe.evaluate(() => {
        const elements = document.querySelectorAll(
            "div[class^=StyledCanvasTextComponentV1] > p"
        );
        return Array.from(elements).map(element => element.innerText);
    });
    expect(playerCrashWithException).toEqual([]);
    expect(nextSlideTitle[1]).toBe("image in focus");
});
test("Image in focus ", async () => {
    let imageInFocusOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice] > div"
    );
    await imageInFocusOptions[0].click();
    await apesterIframe.waitFor("div[class^=StyledShareProviderButtons]");
    const summaryShareVisible = await apesterIframe.evaluate(() => {
        const e = document.querySelector("div[class^=StyledShareProviderButtons]");
        if (!e) return false;
        const style = window.getComputedStyle(e);
        return style;
    });
    expect(playerCrashWithException).toEqual([]);
    expect(summaryShareVisible).toBeTruthy();
});

afterAll(async () => {
    await browser.close();
});