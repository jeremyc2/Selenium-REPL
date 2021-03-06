const { Builder } = require('selenium-webdriver'),
    path = require('path');

class DriverFactory {
    constructor(browser, {options, headless}) {
        require('dotenv').config({ path: path.resolve(__dirname, '.env') });

        this.browser = browser == 'edge'? 'MicrosoftEdge': browser;
        this.headless = headless;
        this.options = options;
        this.addDriverPath(browser);
    }

    addDriverPath(browser) {
        var prefix;
        if(browser == 'firefox') {
            prefix = 'GECKO';
        } else {
            prefix = browser.toUpperCase();
        }
        
        const driverPath = process.env[`${prefix}DRIVER_PATH`];

        if(driverPath && process.env.PATH.split(path.delimiter).every(x => x != driverPath)) {
            process.env.PATH = driverPath + path.delimiter + process.env.PATH;
        }
    }

    set options(options) {        
        this._options = options;
        const defaultSwitch = 'enable-logging';
        if(this._options) {
            if(this.headless) {
                this._options.headless();
            }
            
            if(this.browser == 'firefox') return;
            const excludeSwitches = this._options.options_.excludeSwitches;
            if(!excludeSwitches || excludeSwitches.indexOf(defaultSwitch) === -1) {
                this._options.excludeSwitches(defaultSwitch);
            }
        } else {
            const {Options} = new require(`selenium-webdriver/${this.browser}`);
            this._options = new Options();
            if(this.headless) {
                this._options.headless();
            }
            
            if(this.browser == 'firefox') return;
            this._options.excludeSwitches(defaultSwitch);
        }
    }

    get options() {
        return this._options;
    }

    get driver() {
        return new Builder()
            .forBrowser(this.browser)
            .withCapabilities(this.options)
            .build();
    }
}

module.exports = DriverFactory;
