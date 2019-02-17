const puppeteer = require("puppeteer");

let browser;
let pages;
const testUnit = "https://galtubi91.github.io/articles/Poll-stg/";
let apesterIframe;
const playerCrashWithException = [];


beforeAll(async () => {
    jest.setTimeout(15000);
    browser = await puppeteer.launch({
        headless: true
    });
    pages = await browser.pages();
    await pages[0].goto(testUnit, {
        waitUntil: 'domcontentloaded'
    });
    await pages[0].setViewport({
        width: 1200,
        height: 800
    });
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
    await pages[0].waitFor('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    await pages[0].hover('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    apesterIframe = await pages[0].frames()[1];
    await apesterIframe.waitFor("div[class^=StyledInteractiveMultiChoice]");
    let defaultLayoutOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice]"
    );
    await defaultLayoutOptions[0].click();
    await pages[0].waitFor(4000);
    expect(playerCrashWithException.length).toEqual(0);
    let nextSlideTitle = await apesterIframe.evaluate(() => {
        const elements = document.querySelectorAll(
            "div[class^=StyledCanvasTextComponentV1] > p"
        );
        return Array.from(elements).map(element => element.innerText);
    });
    expect(nextSlideTitle[1]).toBe("big image");
});
test("Big image", async () => {
    let bigImageOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice] > div"
    );
    await bigImageOptions[0].click();
    await pages[0].waitFor(5000);
    expect(playerCrashWithException.length).toEqual(0);
    let nextSlideTitle = await apesterIframe.evaluate(() => {
        const elements = document.querySelectorAll(
            "div[class^=StyledCanvasTextComponentV1] > p"
        );
        return Array.from(elements).map(element => element.innerText);
    });
    expect(nextSlideTitle[1]).toBe("versus");
});
test("Versus", async () => {
    let versusOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice] > div"
    );
    await versusOptions[0].click();
    await pages[0].waitFor(5000);
    expect(playerCrashWithException.length).toEqual(0);
    let nextSlideTitle = await apesterIframe.evaluate(() => {
        const elements = document.querySelectorAll(
            "div[class^=StyledCanvasTextComponentV1] > p"
        );
        return Array.from(elements).map(element => element.innerText);
    });
    expect(nextSlideTitle[1]).toBe("image in focus");
});
test("Image in focus ", async () => {
    let imageInFocusOptions = await apesterIframe.$$(
        "div[class^=StyledInteractiveMultiChoice] > div"
    );
    await imageInFocusOptions[0].click();
    await apesterIframe.waitFor("div[class^=StyledShareProviderButtons]");
    expect(playerCrashWithException.length).toEqual(0);
    const summaryShareVisible = await apesterIframe.evaluate(() => {
        const e = document.querySelector("div[class^=StyledShareProviderButtons]");
        if (!e) return false;
        const style = window.getComputedStyle(e);
        return style;
    });
    expect(summaryShareVisible).toBeTruthy();
});

afterAll(async () => {
    await browser.close();
});