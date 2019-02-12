const puppeteer = require("puppeteer");
let browser;
let pages;
let apesterIframe;

const loginPage = 'https://editor.stg.apester.com';

beforeAll(async () => {
    jest.setTimeout(15000);
    browser = await puppeteer.launch({
        headless: false,
        defaultViewport: null,
    });
    pages = await browser.pages();
    await pages[0].goto(loginPage, {
        waitUntil: 'networkidle0'
    });
    //apesterIframe = await pages[0].frames()[1];
});

test("Log-in with username and password", async () => {
    await pages[0].waitFor('input[ng-model=username]');
    await pages[0].type('input[ng-model=username]', 'gal.tubi@apester.com');
    await pages[0].type('input[ng-model=password]', '594875:Tubi');
    await Promise.all([
        pages[0].click('button[class^=login-button]'),
        pages[0].waitForNavigation({
            waitUntil: 'networkidle0'
        }),
    ]);


});

afterAll(async () => {
    //await browser.close();
});