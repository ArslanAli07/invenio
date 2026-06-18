const puppeteer = require('puppeteer');

(async () => {
    console.log("Launching browser...");
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    page.on('console', msg => {
        if (msg.type() === 'error') {
            console.log('PAGE LOG ERROR:', msg.text());
        }
    });

    page.on('pageerror', error => {
        console.log('PAGE ERROR:', error.message);
    });

    page.on('requestfailed', request => {
        console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
    });

    console.log("Navigating to store page...");
    try {
        await page.goto('http://invenio.test/store', { waitUntil: 'networkidle0', timeout: 10000 });
        console.log("Page loaded successfully.");
    } catch (e) {
        console.log("Navigation error:", e.message);
    }

    await browser.close();
})();
