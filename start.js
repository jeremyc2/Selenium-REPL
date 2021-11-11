#!/usr/bin/env node
const { exec } = require('child_process'),
    fs = require('fs'),
    path = require('path');

function installChromedriver(cb) {

    const script = `Function Install-Chromedriver {
    ${fs.readFileSync(path.resolve(__dirname, 'Install-Chromedriver.ps1'))}
    }
    Install-Chromedriver ${path.resolve(__dirname)}/chromedriver;`;

    exec(script, {'shell':'pwsh'}, cb);

}

try {
    require('./main/repl/selenium-repl')();
} catch (e) {
    installChromedriver(require('./main/repl/selenium-repl'));
}