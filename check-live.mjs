import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto('https://app-in-toss-chi.vercel.app/poll?id=poll-1779697739175', { waitUntil: 'networkidle0' });
  
  // Wait for a few seconds to let any fetches complete
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const text = await page.evaluate(() => document.body.innerText);
  console.log(text);
  
  await browser.close();
})();
