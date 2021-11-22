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

async function spawnShell(script, isPowershell) {
    return new Promise((resolve, reject) => {

        var opts = {stdio: 'inherit', cwd: path.resolve(__dirname)};

        if(isPowershell) {
             opts.shell = process.platform === 'win32'? 
                  'powershell.exe': 'pwsh'
        } else {
            opts.shell = true;
        }

        const powershell = spawn(script, opts);
    
        powershell.on('close', (code) => {
            
          if(code == 0) {
              resolve();
          } else {
              reject();
          }
       
        });
    });
}

async function installChromedriver() {

    var script = `Function Install-Chromedriver {
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

    return spawnShell(script, true);

}

async function startREPL() {
    const altScript = `node --experimental-repl-await -e \
        "try { \
            require('./main/repl/selenium-repl')(${
                chromedriverPath? `'${chromedriverPath}'`: ''
            }) \
         } catch { \
            process.exit(1) \
         }"`;
  
    if(compareNodeVersion('16.6.0')) {
        require('./main/repl/selenium-repl')(chromedriverPath);
    } else {
        await spawnShell(altScript);
    }
    
}

(async () => {
    try {
        await startREPL();
    } catch {
        await installChromedriver();
        await startREPL();
    }
})()
