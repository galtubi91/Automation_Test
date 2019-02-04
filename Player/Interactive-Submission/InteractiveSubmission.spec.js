const initBrowser = require('../puppeteer/setup');
const navButtonId = require('../src/client/components/NavButton/NavButton').testId;

let browser;
let pages;
const testUnit = 'http://player.apester.local.com/v2/5b6ac6ed06b289008abc36d4?preview=true&iframe_preview=true';
let apesterIframe;
let rightNavButton;

beforeAll(async () => {
    jest.setTimeout(15000);
    browser = await initBrowser();
    pages = await browser.pages();
    await pages[0].goto(testUnit);
    apesterIframe = await pages[0].frames()[1];
    rightNavButton = navButtonId('right');
});


test('click on interactive components', async () => {
    let interactiveOptions = await apesterIframe.$$(`[data-testid="interactiveComponent"] > li`);
    await interactiveOptions[0].click();
    await apesterIframe.click(`[data-testid="${rightNavButton}"]`);
    await pages[0].waitFor(1500);
    interactiveOptions = await apesterIframe.$$(`[data-testid="interactiveComponent"] > li`);
    await interactiveOptions[3].click();
    await apesterIframe.click(`[data-testid="${rightNavButton}"]`);
    await pages[0].waitFor(1500);
    interactiveOptions = await apesterIframe.$$(`[data-testid="interactiveComponent"] > li`);
    await interactiveOptions[2].click();
});

afterAll(async () => {
    await browser.close();
});