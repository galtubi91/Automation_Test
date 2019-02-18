const puppeteer = require('puppeteer');

const timeout = 20000;
let browser;
let pages;
const testUnit = 'https://renderer.stg.apester.com/v2/5c57010eb27f2b75664bbd6e?preview=true&iframe_preview=true';
let apesterIframe;
let UnitLength;
const playerEvents = [];


beforeAll(async () => {
    jest.setTimeout(25000);
    browser = await puppeteer.launch({
        headless: true,
    });
    pages = await browser.pages();
    await pages[0].goto(testUnit, {
        waitUntil: 'domcontentloaded',
        timeout
    });
    await pages[0].on('response', response => {
        if (response.request().resourceType() !== 'xhr') {
            return;
        }
        if (response.request().method() === 'POST' && response.request().url() === 'https://events.apester.com/event') {
            const eventData = JSON.parse(response._request._postData);
            playerEvents.push(eventData);
        }
    });
    apesterIframe = await pages[0].frames()[1];
});
test('finish the unit', async () => {
    await pages[0].waitFor(1000);
    UnitLength = await apesterIframe.evaluate(() => interaction.framesOrder.length);
    for (let i = 0; i < UnitLength; i += 1) {
        if (i < UnitLength) {
            await apesterIframe.click(`[data-testid="navButton-right"]`);
        }
    }
});

test('Click on previous nav button', async () => {
    const isVisible = await apesterIframe.evaluate(() => {
        const e = document.querySelector('div[class^=StyledShareProviderButtons]');
        if (!e)
            return false;
        const style = window.getComputedStyle(e);
        return style && style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
    });
    if (isVisible) {
        for (let i = UnitLength; i > 1; i--) {
            await apesterIframe.click(`[data-testid="navButton-left"]`);
        }
    }

    function checkPickedAnswerTruthy(eventObj) {
        if (eventObj.event === 'picked_answer') {
            expect(eventObj.properties.answerId).toBeTruthy();
        }
    }

    playerEvents.forEach(checkPickedAnswerTruthy);
    await browser.close();
});