const puppeteer = require('puppeteer');

let browser;
let pages;
const cookies = {
  name: 'qmerceSession',
  value: 's%3AsGtjhswQa-eTrm7ELirHGnkjKKx0459f.DJKJfyhQ220t96OYr13g4y%2BWYiAUv25ikg3XJslOBRw',
  domain: '.apester.com',
  path: '/'
};
const interactionIds = ['5b6aaeaeafc9e430a21caa58', '5bead4883cea789d6b5534ec', '5beacc572fa029b425d09884', '5beac465c14140480bd1313b'];

function prepareURL(interactionId) {
  return `https://app.apester.com/editor/${interactionId}?isJourney=false&m=false`;
}
/* eslint-disable no-undef */
beforeAll(async () => {
  jest.setTimeout(450000);
  browser = await puppeteer.launch({
    headless: false
  });
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

test('remove story summary slide', async () => {
  /* eslint-disable no-await-in-loop */
  for (let i = 0; i < interactionIds.length; i += 1) {
    const url = await prepareURL(interactionIds[i]);
    await pages[0].goto(url);
    await pages[0].evaluate(() => {
      localStorage.setItem('ape.INFO_OVERLAY_SHOWN', true);
    });
    await pages[0].waitFor(2500);
    const deleteSlideButton = await pages[0].$$('.slide-corner-btn');
    await deleteSlideButton[Object.keys(deleteSlideButton).length - 1].click();
    const confirmButton = await pages[0].waitForSelector('body > section.editor-container > div > div.confirm-delete-modal.open > div > button.confirm-delete-modal__container--accept-btn', {
      visible: true
    });
    await confirmButton.click();
    const updateButton = await pages[0].waitForSelector('div:nth-child(4) > div > div', {
      visible: true
    });
    await updateButton.click();
    await pages[0].waitFor(6500);
  }
  await browser.close();
});