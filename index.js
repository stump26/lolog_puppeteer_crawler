const puppeteer = require("puppeteer");

const opggHeadless = async (champion = "leesin") => {
  const getDOMElementSize = selector => {
    const element = document.querySelector(selector);
    if (!element) return null;
    const { x, y, width, height } = element.getBoundingClientRect();
    return { left: x, top: y, width, height, id: element.id };
  };

  const padding = "10";
  const runeQuerySelector = ".champion-overview__table--rune";

  const browser = await puppeteer.launch({
    headless: true
  });
  const page = await browser.newPage();

  // const defaultViewport = {
  //   height: 1920,
  //   width: 1280
  // };

  await page.goto(`https://www.op.gg/champion/${champion}`, {
    waitUntil: "networkidle0"
  });

  // // view port size
  // const bodyHandle = await page.$("body");
  // const boundingBox = await bodyHandle.boundingBox();
  // const newViewport = {
  //   width: Math.max(defaultViewport.width, Math.ceil(boundingBox.width)),
  //   height: Math.max(defaultViewport.height, Math.ceil(boundingBox.height))
  // };
  // await page.setViewport(Object.assign({}, defaultViewport, newViewport));

  const rect = await page.evaluate(getDOMElementSize, runeQuerySelector);
  console.log("TCL: opggHeadless -> rect", rect);

  if (!rect) {
    throw Error(`Could not find element that matches selector: ${selector}.`);
  }

  await page.screenshot({
    path: "runeExample.png",
    clip: {
      x: rect.left - padding,
      y: rect.top - padding,
      width: rect.width + padding * 2,
      height: rect.height + padding * 2
    }
  });
  await browser.close();
};

opggHeadless();
