const fs = require('fs'),
    path = require('path');

const driverPath = process.argv[2];

if(typeof driverPath === 'undefined') return;

const content = `DRIVER_PATH='${driverPath}'`;

fs.writeFileSync(path.resolve(__dirname, '../.env'), content);
