const puppeteer = require('puppeteer');
const timeout = 40000;
let browser;
let pages;
const TestPage = 'https://galtubi91.github.io/articles/Companion-stg/';
const impressionEvents = [];

beforeAll(async () => {
    jest.setTimeout(40000);
    browser = await puppeteer.launch({
        headless: true,
        executablePath: '/Applications/Google Chrome 2.app/Contents/MacOS/Google Chrome'
    });
    pages = await browser.pages();
    await pages[0].goto(TestPage, {
        waitUntil: 'domcontentloaded',
        timeout
    });
    await pages[0].setViewport({
        width: 1200,
        height: 800
    });
    await pages[0].on('response', response => {
        if (response.request().resourceType() !== 'xhr') {
            return;
        }
        if (response.request().method() === 'POST' && response.request().url() === 'https://events.apester.com/event') {
            const eventData = JSON.parse(response._request._postData);
            if (eventData.event === 'player_mon_impression_pending') {
                impressionEvents.push(eventData.properties);
            } else {
                return;
            }
        }
    });
});

test('Companion 100% fill rate: ad displayed', async () => {
    await pages[0].waitFor('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    await pages[0].hover('#main > article > div.entry-wrapper > div > div.apester-media.apester-element');
    const companionAd = await pages[0].$('div[class=apester-companion-container]');
    await pages[0].waitFor(15000);
    const adSize = await companionAd.boundingBox();
    expect(adSize.height).toBeGreaterThan(10)
});

test('Impression event and its properties sent properly', async () => {
    function propertieIsValid(eventObj) {
        for (let propt in eventObj) {
            expect(`${eventObj[propt]}`).toBeTruthy()
        }
    }

    if (impressionEvents.length === 0) {
        throw "impression event didnt send";
    } else {
        impressionEvents.forEach(propertieIsValid);
    }
});

afterAll(async () => {
    await browser.close();
});