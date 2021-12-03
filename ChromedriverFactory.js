const { Builder } = require('selenium-webdriver'),
    { Options } = require('selenium-webdriver/chrome'),
    path = require('path');

class ChromedriverFactory {
    constructor(chromeOptions) {
        require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

        this.chromeOptions = chromeOptions;
        this.addDriverPath();
        this.disableLogging();
    }

    addDriverPath() {
        const chromedriverPath = process.env.CHROMEDRIVER_PATH;

        if(chromedriverPath && process.env.PATH.split(path.delimiter).every(x => x != chromedriverPath)) {
            process.env.PATH = chromedriverPath + path.delimiter + process.env.PATH;
        }
    }

    disableLogging() {
        const defaultSwitch = 'enable-logging';
        if(this.chromeOptions) {
            const excludeSwitches = this.chromeOptions.options_.excludeSwitches;
            if(!excludeSwitches || excludeSwitches.indexOf(defaultSwitch) === -1) {
                this.chromeOptions.excludeSwitches(defaultSwitch);
            }
        } else {
            this.chromeOptions = new Options();
            this.chromeOptions.excludeSwitches(defaultSwitch);
        }
    }

    get driver() {
        return new Builder()
            .forBrowser('chrome')
            .withCapabilities(this.chromeOptions)
            .build();
    }
}

module.exports = ChromedriverFactory;
