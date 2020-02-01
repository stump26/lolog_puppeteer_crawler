const puppeteer = require("puppeteer");

const opggHeadless = async (champion = "LeeSin") => {
  const getDOMElementSize = selector => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const { x, y, width, height } = element.getBoundingClientRect();
    return { left: x, top: y, width, height, id: element.id };
  };

  const padding = "10";
  const runeQuerySelector =
    "#scroll-view-main > div > div.withNav__Wrapper-sc-1gdc90q-1.fQLInq > div > div > div.View-sc-1c57lgy-1.cLLSJv.View__StyledDiv-sc-1c57lgy-0.eidRwp > div:nth-child(3) > div.View-sc-1c57lgy-1.cLLSJv.View__StyledDiv-sc-1c57lgy-0.hxNeHv > div.Column-sc-1cxsa6a-0.ixlThO > div:nth-child(1) > div.Inner-sc-7vmxjm-0.htsreA > div:nth-child(1) > div.View-sc-1c57lgy-1.sc-jTqLGJ.iIRNkD.View__StyledDiv-sc-1c57lgy-0.eidRwp > div";
  const itemAndSpellQuerySelector =
    "#scroll-view-main > div > div.withNav__Wrapper-sc-1gdc90q-1.fQLInq > div > div > div.View-sc-1c57lgy-1.cLLSJv.View__StyledDiv-sc-1c57lgy-0.eidRwp > div:nth-child(3) > div.View-sc-1c57lgy-1.cLLSJv.View__StyledDiv-sc-1c57lgy-0.hxNeHv > div.Column-sc-1cxsa6a-0.ixlThO > div:nth-child(1) > div.Inner-sc-7vmxjm-0.htsreA > div:nth-child(1) > div.View-sc-1c57lgy-1.cLLSJv.View__StyledDiv-sc-1c57lgy-0.eidRwp";
  const browser = await puppeteer.launch({
    headless: false,
    args: ["--headless", "--disable-dev-shm-usage", "--no-sandbox"]
  });
  const page = await browser.newPage();

  const defaultViewport = {
    height: 1920,
    width: 1280
  };

  await page.goto(`https://blitz.gg/lol/champions/${champion}`);

  // Resize view-port for suitable content.
  const bodyHandle = await page.$("body");
  const boundingBox = await bodyHandle.boundingBox();
  const newViewport = {
    width: Math.max(defaultViewport.width, Math.ceil(boundingBox.width)),
    height: Math.max(defaultViewport.height, Math.ceil(boundingBox.height))
  };
  await page.setViewport(Object.assign({}, defaultViewport, newViewport));

  async function screenshotDOMElement(opts) {
    const rect = await page.evaluate(getDOMElementSize, opts.selector);
    console.log("TCL: opggHeadless -> rect", rect);

    if (!rect) {
      throw Error(
        `Could not find element that matches selector: ${opts.selector}.`
      );
    }

    return await page.screenshot({
      clip: {
        x: rect.left - padding,
        y: rect.top - padding,
        width: rect.width + padding * 2,
        height: rect.height + padding * 2
      },
      type: "jpeg",
      quality: 80,
      encoding: "base64"
    });
  }

  // screenshot Rune,Item,Spell build on parallel
  let resultJSON = await (() => {
    const promises = [];
    promises.push(
      screenshotDOMElement({
        selector: runeQuerySelector
      })
    );
    promises.push(
      screenshotDOMElement({
        selector: itemAndSpellQuerySelector
      })
    );

    return Promise.all(promises).then(([img1, img2]) => {
      browser.close();
      return {
        runeHint: img1,
        itemAndSpellHint: img2
      };
    });
  })();

  return resultJSON;
};

module.exports = opggHeadless;
