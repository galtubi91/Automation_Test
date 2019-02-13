const puppeteer = require('puppeteer');
const timeout = 20000;
let browser;
let pages;
const TestPage = 'https://galtubi91.github.io/articles/Cedato-stg/';
const playerEvents = [];
let apesterIframe;


beforeAll(async () => {
    jest.setTimeout(35000);
    browser = await puppeteer.launch({
        headless: false,
        slowMo: 300,
        executablePath: '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome'

    });
    pages = await browser.pages();
    await pages[0].setViewport({
        width: 1200,
        height: 800
    });
    await pages[0].goto(TestPage, {
        waitUntil: 'domcontentloaded',
        timeout
    });
    await pages[0].on('response', response => {
        if (response.request().resourceType() !== 'xhr') {
            return;
        }
        if (response.request().method() === 'POST' && response.request().url() === 'https://events.apester.com/event') {
            const eventData = JSON.parse(response._request._postData);
            playerEvents.push(eventData.event);
        }
    });


});

test('Ad is not playing when not in view', async () => {
    apesterIframe = await pages[0].frames()[1];
    const playerMonEvents = playerEvents.filter((event) => event.startsWith("player_mon"));
    expect(playerMonEvents).not.toContain("player_mon_playing");
});

test('Test cedato video ad is playing in view', async () => {
    await pages[0].waitFor('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    await pages[0].hover('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    apesterIframe = await pages[0].frames()[1];
    await apesterIframe.waitFor('#__cedato_root_container');
    const cedatoControlBar = await apesterIframe.evaluate(() => {
        const btn = document.querySelector('div[class=__cedato_control_bar]');
        return JSON.parse(JSON.stringify(getComputedStyle(btn)));
    });
    await pages[0].waitFor(5000);
    const playerMonEvents = playerEvents.filter((event) => event.startsWith("player_mon"));
    expect(cedatoControlBar).toBeTruthy();
    expect(playerMonEvents).toContain("player_mon_playing");
});

afterAll(async () => {
    await browser.close();
});