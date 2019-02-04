const puppeteer = require('puppeteer');

const timeout = 20000;

let browser;
let apesterIframe;
const testUnit = 'https://renderer.apester.com/v2/5c50834a69eb4163fed43d95?preview=true&iframe_preview=true';
const mobileUnit = 'https://renderer.apester.com/v2/5c50834a69eb4163fed43d95?preview=true&iframe_preview=true&isMobile=true';

beforeAll(async () => {
  jest.setTimeout(15000);
  browser = await puppeteer.launch({
    headless: false
  });
  const pages = await browser.pages();
  await pages[0].goto(testUnit, {
    waitUntil: 'domcontentloaded',
    timeout
  });
});
test('Desktop Size', async () => {
  const pages = await browser.pages();
  await pages[0].waitFor(1000);
  apesterIframe = await pages[0].$('#iframe');
  const iframeSize = await apesterIframe.boxModel();
  expect(iframeSize.width).toEqual(400);
  expect(iframeSize.height).toEqual(640);
});
test('Mobile Size', async () => {
  await browser.newPage(); // opening new tab
  const pages = await browser.pages(); // get all open pages
  await pages[1].goto(mobileUnit, {
    waitUntil: 'domcontentloaded',
    timeout
  }); // navigate to renderer v2 page on the new tab created
  await pages[1].waitFor(1000);
  apesterIframe = await pages[1].$('#iframe');
  const iframeSize = await apesterIframe.boxModel(); // get our iframe size (width and height)
  expect(iframeSize.width).toEqual(320);
  expect(iframeSize.height).toEqual(512);
  await browser.close();
});