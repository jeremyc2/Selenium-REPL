#!/usr/bin/env node
const { spawn } = require('child_process'),
    path = require('path');

var args = process.argv.slice(2),
    opts = {cwd: __dirname, stdio: 'inherit', shell: process.platform === 'win32'? 'powershell.exe': 'pwsh'};

if(args[0]) {
    args[0] = path.resolve(args[0]);
}

spawn('../Install-Edgedriver.ps1', args, opts);
