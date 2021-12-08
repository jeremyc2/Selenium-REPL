const { Builder } = require('selenium-webdriver'),
    path = require('path');

class DriverFactory {
    constructor(browser, options) {
        require('dotenv').config({ path: path.resolve(__dirname, '.env') });

        this.browser = browser;
        this.options = options;
        this.addDriverPath();
    }

    addDriverPath() {
        const driverPath = process.env.DRIVER_PATH;

        if(driverPath && process.env.PATH.split(path.delimiter).every(x => x != driverPath)) {
            process.env.PATH = driverPath + path.delimiter + process.env.PATH;
        }
    }

    set options(options) {
        this._options = options;
        const defaultSwitch = 'enable-logging';
        if(this._options) {
            const excludeSwitches = this._options.options_.excludeSwitches;
            if(!excludeSwitches || excludeSwitches.indexOf(defaultSwitch) === -1) {
                this._options.excludeSwitches(defaultSwitch);
            }
        } else {
            const {Options} = new require(`selenium-webdriver/${this.browser}`);
            this._options = new Options();
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