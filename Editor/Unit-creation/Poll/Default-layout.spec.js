const puppeteer = require("puppeteer");

let browser;
let pages;
const pollEditor = 'https://editor.stg.apester.com/editor/new?layoutId=5875f4e078db27b93b06a460&isJourney=false';
const publishErrorEvents = [];


const cookies = {
    name: 'stage1Session',
    value: 's%3ArvDKr5RHXTAEqoUIkRrft4cKCYq-zgIj.licMAUHzs%2B%2FDf0XSGBE9Mg34gEzg2XrjyCvUdqncHwY',
    domain: '.apester.com',
    path: '/'
};

beforeAll(async () => {
    jest.setTimeout(20000);
    browser = await puppeteer.launch({
        headless: false,
    });
    pages = await browser.pages();
    await pages[0].setCookie(cookies);
    await pages[0].goto(pollEditor, {
        waitUntil: 'domcontentloaded'
    });
    await pages[0].setViewport({
        width: 1391,
        height: 754
    });
    await pages[0].on('response', response => {
        if (response.request().resourceType() !== 'xhr') {
            return;
        }
        if (response.request().method() === 'POST' && response.request().url() === 'https://events.apester.com/event') {
            const eventData = JSON.parse(response._request._postData);
            if (eventData.event === 'editor_publish_error') {
                publishErrorEvents.push(eventData.event);
            } else {
                return;
            }
        }
    });
});

test('Default layout', async () => {
    await pages[0].waitFor('div[class=editable-background]');
    await pages[0].type('div[model="slide.title.value"]', 'Default layout');
    let slideAnswers = await pages[0].$$('div[ng-model="option.value"]');
    for (const answer of slideAnswers)
        await answer.type('answer');
    const PublishButton = await pages[0].$('div[class="ape-dropdown-menu"]');
    await PublishButton.click();
    await pages[0].waitFor(10000);
    await pages[0].waitFor('embed-box[aria-hidden="false"]');
    const embedBoxVisibility = await pages[0].evaluate(() => {
        const e = document.querySelector("#publishing > embed-box");
        if (!e)
            return false;
        const style = window.getComputedStyle(e);
        return style.display;
    });
    expect(embedBoxVisibility).toBe('inline')
});

afterAll(async () => {
    await browser.close();
});