import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ogPath = resolve(__dirname, 'og.html');
const outPath = resolve(__dirname, 'img/og-image.png');

const browser = await puppeteer.launch({ headless: 'new' });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 2 });
await page.goto(`file://${ogPath}`, { waitUntil: 'networkidle0' });
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 600));
await page.screenshot({ path: outPath, type: 'png', omitBackground: false });
await browser.close();
console.log(`Wrote ${outPath}`);
