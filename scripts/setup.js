const fs = require('fs'),
    path = require('path');

const browser = process.argv[2],
    driverPath = process.argv[3];

if(typeof driverPath === 'undefined') return;

const content = `${browser.toUpperCase()}DRIVER_PATH='${driverPath}'`;

fs.writeFileSync(path.resolve(__dirname, '../.env'), content);
