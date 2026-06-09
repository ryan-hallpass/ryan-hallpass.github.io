import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { unlinkSync, existsSync } from 'fs';
import { execFileSync } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const indexPath = resolve(__dirname, 'index.html');
const outPath = resolve(__dirname, 'proposal.pdf');
const tmpPath = resolve(__dirname, '.proposal-unprotected.pdf');
const PDF_PASSWORD = 'daube';

const browser = await puppeteer.launch({ headless: 'new', args: ['--no-sandbox', '--disable-setuid-sandbox'] });
const page = await browser.newPage();

await page.setViewport({ width: 1280, height: 720, deviceScaleFactor: 2 });
await page.goto(`file://${indexPath}?print=1`, { waitUntil: 'networkidle0' });

await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 1500));

await page.evaluate(() => {
  document.documentElement.classList.add('print-mode');
  document.querySelectorAll('[data-reveal]').forEach(el => el.classList.add('is-visible'));
});

await new Promise(r => setTimeout(r, 400));

await page.pdf({
  path: tmpPath,
  width: '13.333in',
  height: '7.5in',
  printBackground: true,
  preferCSSPageSize: true,
  margin: { top: 0, right: 0, bottom: 0, left: 0 },
});

await browser.close();

if (existsSync(outPath)) unlinkSync(outPath);
try {
  execFileSync('qpdf', ['--encrypt', PDF_PASSWORD, PDF_PASSWORD, '256', '--', tmpPath, outPath]);
} catch (err) {
  execFileSync('python', ['-c', `
from pypdf import PdfReader, PdfWriter
reader = PdfReader(${JSON.stringify(tmpPath)})
writer = PdfWriter()
for page in reader.pages:
    writer.add_page(page)
writer.encrypt(${JSON.stringify(PDF_PASSWORD)}, ${JSON.stringify(PDF_PASSWORD)}, algorithm="AES-256")
with open(${JSON.stringify(outPath)}, "wb") as f:
    writer.write(f)
`]);
}
unlinkSync(tmpPath);
console.log(`Wrote ${outPath} (encrypted, password: ${PDF_PASSWORD})`);
