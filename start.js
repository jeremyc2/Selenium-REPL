#!/usr/bin/env node
const { spawn } = require('child_process'),
    fs = require('fs'),
    path = require('path');

const chromedriverPath = process.argv[2];

function compareNodeVersion(version) {
  const oldParts = process.version.substring(1).split('.');
  const newParts = version.split('.');
  for (var i = 0; i < newParts.length; i++) {
    const a = parseInt(oldParts[i]);
    const b = parseInt(newParts[i]);
    if (a > b) return true;
    if (a < b) return false;
  }
  return true;
}

async function spawnPowershell(script) {
    return new Promise((resolve, reject) => {
        const powershell = spawn(script, {shell: process.platform === 'win32'? 'powershell.exe': 'pwsh', stdio: 'inherit'});
    
        powershell.on('close', (code) => {
            
          if(code == 0) {
              resolve();
          } else {
              process.stdout.write(`child process exited with code ${code}`);
              reject();
          }
       
        });
    });
}

async function installChromedriver() {

    var script = `Push-Location ${path.resolve(__dirname)};
    Function Install-Chromedriver {
    ${fs.readFileSync(path.resolve(__dirname, 'Install-Chromedriver.ps1'))}
    }
    Install-Chromedriver `;
    
    if(chromedriverPath) {
        script += chromedriverPath;
    } else {
        script += path.resolve(__dirname, 'chromedriver');

        if(process.platform === 'win32') {
            script += '.exe';
        }
    }

    return spawnPowershell(script);

}


const script = `Push-Location ${path.resolve(__dirname)};
    node ${
        !compareNodeVersion('16.6.0')? '--experimental-repl-await': ''
    } -e "require('./main/repl/selenium-repl')('${chromedriverPath}')"`;

try {
    spawnPowershell(script);
} catch (e) {
    installChromedriver().then(() => spawnPowershell(script));
}
