#!/usr/bin/env node
const { exec } = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    start = require('./main/repl/selenium-repl');

const chromedriverPath = process.argv[2];

function installChromedriver(cb) {

    var script = `Push-Location ${path.resolve(__dirname)};
    Function Install-Chromedriver {
    ${fs.readFileSync(path.resolve(__dirname, 'Install-Chromedriver.ps1'))}
    }
    Install-Chromedriver `;
    
    if(chromedriverPath) {
        script += chromedriverPath;
    } else {
        script += `${path.resolve(__dirname)}/chromedriver`;

        if(process.platform === 'win32') {
            script += '.exe';
        }
    }

    exec(script, {'shell': process.platform === 'win32'? 'powershell.exe': 'pwsh'}, cb);

}

try {
    start(chromedriverPath);
} catch (e) {
    installChromedriver((error, stdout, stderr) => {
        console.error(error, stderr);
        console.log(stdout);
        start(chromedriverPath)
    });
}