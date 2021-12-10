#!/usr/bin/env node
const { spawn } = require('child_process');

var args = process.argv.slice(2),
    opts = {cwd: __dirname, stdio: 'inherit', shell: process.platform === 'win32'? 'powershell.exe': 'pwsh'};

spawn('./Install-Geckodriver.ps1', args, opts);