const puppeteer = require('puppeteer');

const postArray = [];

let browser;
let pages;
const testUnit = 'https://renderer.apester.com/interaction/5b421e7896df421316afeee7?preview=true&iframe_preview=true';
let apesterIframe;

test('Event: interactiob_loaded, interaction_seen, slide_seen', async () => {
    jest.setTimeout(25000);
    browser = await puppeteer.launch({
        headless: false
    });
    pages = await browser.pages();
    await pages[0].goto(testUnit);
    pages[0].on('response', response => {
        if (response.request().resourceType() !== 'xhr') {
            return;
        }
        if (response.request().method() === 'POST' && response.request().url() === 'https://events.apester.com/event') {
            const eventData = JSON.parse(response._request._postData);
            postArray.push(eventData.event);
        }
    });
    apesterIframe = await pages[0].frames()[1];
});

test('Event: like', async () => {
    const likeButton = await apesterIframe.waitForSelector('.like-btn', {
        visible: true
    });
    await pages[0].waitFor(1000);
    await likeButton.click();
    await pages[0].waitFor(1000);
});
test('Event: unlike', async () => {
    const likeButton = await apesterIframe.waitForSelector('.like-btn', {
        visible: true
    });
    await likeButton.click();
    await pages[0].waitFor(1000);
});
test('Event: open_share_screen', async () => {
    const shareButton = await apesterIframe.waitForSelector('.icon-share', {
        visible: true
    });
    await shareButton.click();
    await pages[0].waitFor(1000);
    const closeButton = await apesterIframe.waitForSelector('div > div > div > i', {
        visible: true
    });
    await pages[0].waitFor(1000);
    await closeButton.click();
    await pages[0].waitFor(1000);
});
test('Event: channel_logo_clicked', async () => {
    const publisherLogo = await apesterIframe.waitForSelector('a > media > img', {
        visible: true
    });
    await pages[0].waitFor(1000);
    await publisherLogo.click();
    await pages[0].waitFor(1000);
});
test('Event: picked answer, interaction_started, interaction_finished and summary_slide_seen', async () => {
    await pages[0].bringToFront();
    const answer = await apesterIframe.waitForSelector('.wrong-answer', {
        visible: true
    });
    await pages[0].waitFor(1000);
    await answer.click();
});
test('Event: back_button_clicked', async () => {
    const backButton = await apesterIframe.waitForSelector('.nav-button.backward', {
        visible: true
    });
    await pages[0].waitFor(1000);
    await backButton.click();
    await pages[0].waitFor(2000);
});
afterAll(async () => {
    await browser.close();
});