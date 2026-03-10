const puppeteer = require('puppeteer');
const path = require('path');

async function runSmokeTest() {
  console.log('Starting Smoke Test...');
  let hasErrors = false;

  const browser = await puppeteer.launch({
    headless: 'new',
  });

  const page = await browser.newPage();

  // Catch console errors and page errors
  page.on('pageerror', (err) => {
    console.error('Page Error:', err.message);
    hasErrors = true;
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('Console Error:', msg.text());
      hasErrors = true;
    }
  });

  const filePath = `file://${path.resolve(__dirname, '../index.html')}`;
  console.log(`Navigating to ${filePath}`);

  try {
    await page.goto(filePath, { waitUntil: 'networkidle0' });

    // Check if main elements are present
    const title = await page.title();
    console.log(`Page Title: ${title}`);

    const containerExists = await page.evaluate(() => {
      return !!document.querySelector('.container') && !!document.querySelector('.sidebar');
    });

    if (!containerExists) {
      console.error('Error: Main container or sidebar not found in DOM.');
      hasErrors = true;
    }
  } catch (err) {
    console.error('Failed to load page:', err);
    hasErrors = true;
  } finally {
    await browser.close();
  }

  if (hasErrors) {
    console.error('❌ Smoke Test Failed.');
    process.exit(1);
  } else {
    console.log('✅ Smoke Test Passed Successfully!');
    process.exit(0);
  }
}

runSmokeTest();
