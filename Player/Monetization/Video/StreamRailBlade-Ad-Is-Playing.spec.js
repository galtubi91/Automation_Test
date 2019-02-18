const puppeteer = require('puppeteer');
const timeout = 20000;
let browser;
let pages;
const TestPage = 'https://galtubi91.github.io/articles/StreamRailBlade-stg/';
const playerEvents = [];
let apesterIframe;


beforeAll(async () => {
    jest.setTimeout(40000);
    browser = await puppeteer.launch({
        headless: true,
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

test('Test StreamRailBlade video ad is playing in view', async () => {
    await pages[0].waitFor('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    await pages[0].hover('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    apesterIframe = await pages[0].frames()[1];
    await apesterIframe.waitFor('div[id^=sr-player]');
    const srBladeControlBar = await apesterIframe.evaluate(() => {
        const btn = document.querySelector('div[class=sr-blade-control-bar]');
        return JSON.parse(JSON.stringify(getComputedStyle(btn)));
    });
    await pages[0].waitFor(10000); //waiting for player_mon_playing event to be sent
    const playerMonEvents = playerEvents.filter((event) => event.startsWith("player_mon"));
    expect(srBladeControlBar).toBeTruthy();
    expect(playerMonEvents).toContain("player_mon_playing");
});

afterAll(async () => {
    await browser.close();
});