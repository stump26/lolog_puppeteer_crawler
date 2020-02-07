const puppeteer = require('puppeteer');

const opggHeadless = async champion => {
  const getDOMElementSize = selector => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const { x, y, width, height } = element.getBoundingClientRect();
    return { left: x, top: y, width, height, id: element.id };
  };

  const padding = '10';
  const runeQuerySelector =
    '#scroll-view-main div.View-sc-1c57lgy-1.sc-cxZfpC.ixlBxq.View__StyledDiv-sc-1c57lgy-0.eidRwp > div';
  const itemAndSpellQuerySelector =
    '#scroll-view-main div.Inner-sc-7vmxjm-0.htsreA > div > div.View-sc-1c57lgy-1.cLLSJv.View__StyledDiv-sc-1c57lgy-0.eidRwp';
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      // "--headless",
      '--disable-dev-shm-usage',
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/76.0.3803.0 Safari/537.36',
      '--lang=ko,en-US;q=0.9,en;q=0.8,ko-KR;q=0.7,la;q=0.6',
    ],
  });
  const page = await browser.newPage();
  process.on('unhandledRejection', async (reason, p) => {
    console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
    await browser.close();
  });

  const defaultViewport = {
    width: 1380,
    height: 1920,
  };

  await page.setViewport(defaultViewport);
  await page.goto(`https://blitz.gg/lol/champions/${champion}`, {
    waitUntil: 'networkidle0',
    timeout: 0,
  });
  // Resize view-port for suitable content.
  const bodyHandle = await page.$('body');
  const boundingBox = await bodyHandle.boundingBox();
  const newViewport = {
    width: Math.max(defaultViewport.width, Math.ceil(boundingBox.width)),
    height: Math.max(defaultViewport.height, Math.ceil(boundingBox.height)),
  };
  await page.setViewport(Object.assign({}, defaultViewport, newViewport));

  async function screenshotDOMElement(opts) {
    const rect = await page.evaluate(getDOMElementSize, opts.selector);
    console.log('TCL: opggHeadless -> rect', rect);

    if (!rect) {
      throw Error(`Could not find element that matches selector: ${opts.selector}.`);
    }

    return await page.screenshot({
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2,
      },
      type: 'jpeg',
      quality: 80,
      encoding: 'binary',
    });
  }

  // screenshot Rune,Item,Spell build on parallel
  let resultJSON = await (() => {
    const promises = [];
    promises.push(
      screenshotDOMElement({
        selector: runeQuerySelector,
      }),
    );
    promises.push(
      screenshotDOMElement({
        selector: itemAndSpellQuerySelector,
      }),
    );

    return Promise.all(promises).then(([img1, img2]) => {
      browser.close();
      return {
        runeHint: img1,
        itemAndSpellHint: img2,
      };
    });
  })();

  return resultJSON;
};

module.exports = opggHeadless;
