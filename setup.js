const fs = require('fs'),
    path = require('path');

const chromedriverPath = process.argv[2];

if(typeof chromedriverPath === 'undefined') return;

const content = `CHROMEDRIVER_PATH="${chromedriverPath}"`;

fs.writeFile(path.resolve(__dirname, '.env'), content, err => {
    if (err) {
        console.error(err);
    }
});