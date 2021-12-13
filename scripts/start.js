#!/usr/bin/env node
const { program } = require('commander'),
    { spawn } = require('child_process'),
    fs = require('fs'),
    path = require('path');

const mainScripts = [
    'installChromedriver',
    'installEdgedriver',
    'installGeckodriver'
]

if(mainScripts.includes(process.argv[2])) {
    var script = `${path.resolve(__dirname, process.argv[2])}.js`,
        opts = {stdio: 'inherit', shell: true};
    spawn(`node ${script}`, process.argv.slice(3), opts);
    return;
}

program
    .option('-b, --browser <browser>', 'chrome, edge, or firefox')
    .option('-d, --driverPath <path>', 'folder location of webdriver')
    .option('-h --headless', 'webdriver headless mode')
    .option('-s --selectors', 'add additional selector functions to the REPL');

program.parse(process.argv);

var { browser, driverPath, headless, selectors: autoImportSelectors } = program.opts();

if(!browser) browser = 'chrome';

if(driverPath) {
    driverPath = path.resolve(driverPath);
}

function quote(text) {
    return text? `'${text}'`: null;
}

function getInstallScript() {
    switch (browser) {
        case 'chrome':
            return 'Install-Chromedriver.ps1';
        case 'edge':
            return 'Install-Edgedriver.ps1';
        case 'firefox':
            return 'Install-Geckodriver.ps1';
        default:
            throw "Unsupported Browser";
    }
}

function getFilename() {
    var filename;

    switch (browser) {
        case 'chrome':
            filename = 'chromedriver';
            break;
        case 'edge':
            filename = 'msedgedriver';
            break;
        case 'firefox':
            filename = 'geckodriver';
            break;
        default:
            throw "Unsupported Browser";
    }

    if(process.platform === 'win32') {
        filename += '.exe';
    }
    
    return filename;
}

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

async function spawnShell(script, isPowershell, setWorkingDirectory) {
    return new Promise((resolve, reject) => {

        var opts = {stdio: 'inherit'};

        if(isPowershell) {
             opts.shell = process.platform === 'win32'? 
                  'powershell.exe': 'pwsh'
        } else {
            opts.shell = true;
        }

        if(setWorkingDirectory) {
            opts.cwd = path.resolve(__dirname, '../');
        }

        const shell = spawn(script, opts);
    
        shell.on('close', (code) => {
            
          if(code == 0) {
              resolve();
          } else {
              reject();
          }
       
        });
    });
}

async function installDriver() {

    var script = `Function Install-Driver {
    ${fs.readFileSync(path.resolve(__dirname, `../${getInstallScript()}`))}
    }
    Install-Driver `;
    
    if(driverPath) {
        script += driverPath;
    } else {
        script += path.resolve(__dirname, `../${getFilename()}`);
    }

    return spawnShell(script, true, true);

}

async function startREPL() {
    const altScript = `node --experimental-repl-await -e \
        "try { \
            require('${
                JSON.stringify(path.resolve(__dirname, '../repl'))
            }')(${
                quote(driverPath)
            }, ${
                JSON.stringify({browser, headless, autoImportSelectors})
                    .replace(/"/g, "'")
            }) \
         } catch { \
            process.exit(1) \
         }"`;

    if(compareNodeVersion('16.6.0')) {
        require('../repl')(driverPath, {browser, headless, autoImportSelectors});
    } else {
        await spawnShell(altScript);
    }
    
}

(async () => {
    try {
        await startREPL();
    } catch {
        await installDriver();
        await startREPL();
    }
})()
