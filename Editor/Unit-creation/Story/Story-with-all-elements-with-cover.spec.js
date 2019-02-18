const puppeteer = require("puppeteer");

let browser;
let pages;
const storyEditor = 'https://editor.stg.apester.com/editor/new?layoutId=595a64463867dbbb3369d207&isJourney=false';
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
    await pages[0].goto(storyEditor, {
        waitUntil: 'domcontentloaded'
    });
    await pages[0].setViewport({
        width: 1391,
        height: 1000
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

test('Add user image to cover', async () => {
    await pages[0].evaluate(() => {
        const overlayKeys = {
            "OPEN_NEW_TAB_PREVIEW": {
                "name": "OPEN_NEW_TAB_PREVIEW",
                "state": "showen"
            },
            "IMAGE_SHOW_SWAP_TOOLTIP": {
                "name": "IMAGE_SHOW_SWAP_TOOLTIP",
                "state": "showen"
            },
            "IMAGE_SHOW_ADD_TOOLTIP": {
                "name": "IMAGE_SHOW_ADD_TOOLTIP",
                "state": "showen"
            }
        }
        localStorage.setItem('ape.INFO_OVERLAY_SHOWN', true);
        localStorage.setItem('ape.tooltips', JSON.stringify(overlayKeys));
    });


    const coverSlide = await pages[0].waitFor('div[id="cover"]');
    await coverSlide.click();
    const mediaTab = await pages[0].$('a[class="md-none-theme"]');
    await mediaTab.click();
    const firstImage = await pages[0].waitFor('[ng-model="image"]:nth-child(2)');
    await firstImage.click();
    const firstSlide = await pages[0].waitFor('div[id="slide0"]')
    await firstSlide.click();
    const gifsTab = await pages[0].waitFor('span[role="button"]:nth-child(2)');
    await gifsTab.click();
    const firstGif = await pages[0].waitFor('[ng-model="gif"]:nth-child(1)');
    await firstGif.click();
    let addNewSlideButton = await pages[0].$$('div[class="btn btn--rounded btn--big"]');
    await addNewSlideButton[1].click();
    const unsplashTab = await pages[0].waitFor('span[role="button"]:nth-child(3)');
    await unsplashTab.click();
    const unsplashFirstTab = await pages[0].waitFor('a[class="inventory__search-btn btn btn--block md-none-theme"]:nth-child(1)');
    await unsplashFirstTab.click();
    const firstUnsplashImage = await pages[0].waitFor('[ng-model="image"]:nth-child(2)');
    await firstUnsplashImage.click();
    addNewSlideButton = await pages[0].$$('div[class="btn btn--rounded btn--big"]');
    await addNewSlideButton[2].click();
    const videoTab = await pages[0].waitFor('div[class="panel__categorey-item"]:nth-child(2)');
    await videoTab.click();
    const firstVideo = await pages[0].waitFor('div[ng-model="video"]:nth-child(2)');
    await firstVideo.click();
    addNewSlideButton = await pages[0].$$('div[class="btn btn--rounded btn--big"]');
    await addNewSlideButton[3].click();
    const textComponentTab = await pages[0].waitFor('i[class="ic icon-canvas-text"]');
    await textComponentTab.click();
    const firstTitle = await pages[0].waitFor('div[ng-model="item"]:nth-child(1)');
    await firstTitle.click();
    const paragraphTab = await pages[0].waitFor('div[class="panel__categorey-item"]:nth-child(2)');
    await paragraphTab.click();
    const firstParagraph = await pages[0].waitFor('5');
    await firstParagraph.click();
    addNewSlideButton = await pages[0].$$('div[class="btn btn--rounded btn--big"]');
    await addNewSlideButton[4].click();
    const interactiveTab = await pages[0].waitFor('i[class="ic icon-interaction3"]');
    await interactiveTab.click();
    const pollComponent = await pages[0].waitFor('div[data-model*="poll"]');
    await pollComponent.click();







});

afterAll(async () => {
    //await browser.close();
});