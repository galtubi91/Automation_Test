const initBrowser = require('../puppeteer/setup');

let browser;
let pages;
const cookies = {
    name: 'qmerceSession',
    value: 's%3ASexg2RrqzwB_LUjr8KkdQseVVBghIcd9.c3XMSbWUBBpX9phCU5%2BfgPpCLcaEwlJCDwvvnvE7dPE',
    domain: '.apester.com',
    path: '/'
};
const interactionIds = ['5b6aaeaeafc9e430a21caa58', '5b71427fcd0ad7948c271254', '5b69ccb7b2f5086637fc6393', '5b695f35b2f508df4ffc61e6', '5b687abbafc9e480611ca5d5'];

function prepareURL(interactionId) {
    return `https://app.apester.com/editor/${interactionId}?isJourney=false&m=false`;
}

beforeAll(async () => {
    jest.setTimeout(450000);
    browser = await initBrowser();
    pages = await browser.pages();
    await pages[0].setCookie(cookies);
    await pages[0].setViewport({
        width: 1391,
        height: 754
    });
    pages[0].on('dialog', async dialog => {
        await dialog.accept();
    });
});

test('update unit model to ver 7', async () => {
    for (let i = 0; i < interactionIds.length; i += 1) {
        const url = await prepareURL(interactionIds[i]);
        await pages[0].goto(url);
        await pages[0].evaluate(() => {
            localStorage.setItem("ape.INFO_OVERLAY_SHOWN", true);
        });
        const updateButton = await pages[0].waitForSelector('div:nth-child(4) > div > div', {
            visible: true
        });
        await updateButton.click();
        await pages[0].waitFor(6900);
    }
    await browser.close();
});