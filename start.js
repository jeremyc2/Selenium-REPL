#!/usr/bin/env node
const { spawn } = require('child_process'),
    fs = require('fs'),
    path = require('path'),
    start = require('./main/repl/selenium-repl');

const chromedriverPath = process.argv[2];

function installChromedriver(callback) {

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

    const powershell = spawn(script, {shell: process.platform === 'win32'? 'powershell.exe': 'pwsh'});
    
    powershell.stdout.on('data', (data) => {
      process.stdout.write(data.toString());
    });

    powershell.stderr.on('data', (data) => {
      process.stdout.write(`ERROR: ${data}`);
    });

    powershell.on('close', (code) => {
        
      if(code == 0) {
          callback();
      } else {
          process.stdout.write(`child process exited with code ${code}`);
      }
   
    });

}

try {
    start(chromedriverPath);
} catch (e) {
    installChromedriver(() => start(chromedriverPath));
}
