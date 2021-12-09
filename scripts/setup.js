const fs = require('fs'),
    path = require('path');

const browser = process.argv[2],
    driverPath = process.argv[3];

if(typeof driverPath === 'undefined') return;

const content = `\n${browser.toUpperCase()}DRIVER_PATH='${driverPath}'`;

var fileText = fs.readFileSync(path.resolve(__dirname, '../.env'), {encoding: 'utf8'});

if(fileText.indexOf(browser.toUpperCase()) === -1) {
    fs.appendFileSync(path.resolve(__dirname, '../.env'), content);
}