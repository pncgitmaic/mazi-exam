import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000/Uniex', { waitUntil: 'domcontentloaded' });
  
  // Wait a bit
  await new Promise(r => setTimeout(r, 2000));
  
  const content = await page.evaluate(() => document.body.innerHTML);
  if (content.includes('Welcome to prathamesh project workspace')) {
      console.log('SUCCESS: found Welcome to prathamesh project workspace');
  } else {
      console.log('FAIL: Did not find Uniex panel');
  }
  
  await browser.close();
})();
