const puppeteer = require('puppeteer');

const devices = require('puppeteer/DeviceDescriptors');

const iPhone = devices['iPhone 6'];
let browser;
let pages;
const testUnit = 'http://player.apester.local.com/v2/5b1feb8f2f7cb50237e61987?preview=true&iframe_preview=true';
let apesterIframe;
let textSizes;
let hyperlink;
const desktopTextSizes = {
  small: '15px',
  normal: '19px',
  large: '27px',
  huge: '43px',
  gigantic: '65px'
};
const mobileTextSizes = {
  small: '14px',
  normal: '18px',
  large: '25px',
  huge: '40px',
  gigantic: '60px'
};

beforeAll(async () => {
  jest.setTimeout(20000);
  browser = await puppeteer.launch({
    headless: false
  });
  pages = await browser.pages();
  await pages[0].goto(testUnit);
  apesterIframe = await pages[0].frames()[1];
});

test('click on hyperlink', async () => {
  hyperlink = await apesterIframe.evaluate(() => Array.from(document.querySelectorAll('font a'))
    .map(element => element.getAttribute('href')));
  expect(hyperlink.length).toBe(1);
  await apesterIframe.click(`[class="ape-hyperlink"]`);

  browser.on('targetcreated', async target => {
    const url = target.url();
    expect(url).toBe('https://www.ynet.co.il/home/0,7340,L-8,00.html');
  });
});

test('Check text color', async () => {
  const textColor = await apesterIframe.$eval('p font', elem => window.getComputedStyle(elem).getPropertyValue('color'));
  expect(textColor).toBe('rgb(255, 255, 255)');
});

test('Check text font', async () => {
  const textFont = await apesterIframe.$eval('p font', elem => window.getComputedStyle(elem).getPropertyValue('font-family'));
  expect(textFont).toBe('Oswald, sans-serif');
});

test('Check text alignment', async () => {
  const textAlignment = await apesterIframe.evaluate(() => Array.from(document.querySelectorAll('p > font'))
    .map(element => window.getComputedStyle(element).getPropertyValue('text-align')));
  expect(textAlignment[0]).toBe('center');
  expect(textAlignment[1]).toBe('left');
  expect(textAlignment[2]).toBe('right');
});

test('Check text sizes on desktop mode', async () => {
  textSizes = await apesterIframe.evaluate(() => Array.from(document.querySelectorAll('p > font'))
    .map(element => window.getComputedStyle(element).getPropertyValue('font-size')));
  expect(textSizes[0]).toBe(desktopTextSizes.small);
  expect(textSizes[1]).toBe(desktopTextSizes.normal);
  expect(textSizes[2]).toBe(desktopTextSizes.large);
  expect(textSizes[3]).toBe(desktopTextSizes.huge);
  expect(textSizes[4]).toBe(desktopTextSizes.gigantic);
});

test('Check text sizes on mobile mode', async () => {
  pages = await browser.pages();
  await pages[0].waitFor(1000);
  pages = await browser.pages();
  await pages[1].goto(testUnit);
  await pages[1].emulate(iPhone);
  apesterIframe = await pages[1].frames()[1];
  textSizes = await apesterIframe.evaluate(() => Array.from(document.querySelectorAll('p > font'))
    .map(element => window.getComputedStyle(element).getPropertyValue('font-size')));
  expect(textSizes[0]).toBe(mobileTextSizes.small);
  expect(textSizes[1]).toBe(mobileTextSizes.normal);
  expect(textSizes[2]).toBe(mobileTextSizes.large);
  expect(textSizes[3]).toBe(mobileTextSizes.huge);
  expect(textSizes[4]).toBe(mobileTextSizes.gigantic);
  await browser.close();
});