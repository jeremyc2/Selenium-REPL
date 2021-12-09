const fs = require('fs'),
    path = require('path');

const browser = process.argv[2],
    driverPath = process.argv[3];

if(typeof driverPath === 'undefined') return;

const content = `\n${browser.toUpperCase()}DRIVER_PATH='${driverPath}'`;

const envPath = path.resolve(__dirname, '../.env')

var fileText = '';
if(fs.existsSync(envPath)) {
    fileText = fs.readFileSync(envPath, {encoding: 'utf8'});
}

if(fileText.indexOf(browser.toUpperCase()) === -1) {
    fs.appendFileSync(envPath, content);
}
