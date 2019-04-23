const formatDate = require("date-fns/format");
const puppeteer = require("puppeteer");
const sanitize = require("sanitize-filename");
let program = require("commander");

// Parse arguments
program
  .version("0.1.0")
  .option("-u, --url <path>", "The URL of the page you want to screenshot")
  .option("-d, --dest <path>", "The output file path")
  .option("-w, --width <pixels>", "The viewport width in pixels", parseInt)
  .option("-h, --height <pixels>", "The viewport height in pixels", parseInt)
  .option("-f, --format <format>", "The output file format")
  .option(
    "-t, --wait <milliseconds>",
    "The amount of time in milliseconds to wait after pageload before taking the screenshot", parseInt
  )
  .parse(process.argv);

/**
 * Build a timestamped, sanitized filename
 *
 * @param {string} url
 * @param {string} format
 */
function buildFilename(url, format) {
  const currentDateTime = new Date();
  const currentDateTimeToString = formatDate(
    currentDateTime,
    "YYYYMMDDTHHmmss"
  );

  return `./output/${currentDateTimeToString}_${sanitize(url)}.${
    format === "jpeg" ? "jpg" : format
  }`;
}

/**
 *
 * @param {string} url - The URL of the page you want to screenshot.
 * @param {string} dest - The output file path.
 * @param {number} width - The viewport width in pixels.
 * @param {number} height - The viewport height in pixels.
 * @param {number} format - The output file format.
 * @param {number} wait - The amount of time in milliseconds to wait after pageload before taking the screenshot.
 */
async function run(
  url,
  dest,
  width = 1920,
  height = 1080,
  format = "jpeg",
  waitTime = 0
) {
  let browser = await puppeteer.launch();
  let page = await browser.newPage();
  const outputPath = dest || buildFilename(url, format);
  await page.setViewport({ width: width, height: height });
  await page.goto(url);
  if (waitTime) {
    await page.waitFor(waitTime);
  }
  await page.screenshot({ path: outputPath, type: format });
  await page.close();
  await browser.close();
}

if (program.url) {
  run(
    program.url,
    program.dest,
    program.width,
    program.height,
    program.format,
    program.wait
  );
}
