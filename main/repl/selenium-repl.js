const ChromedriverFactory = require('../ChromedriverFactory'),
    CustomEvent = require('../utils/CustomEvent'),
    selenium = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    path = require('path');

const events = {
    startRepl: new CustomEvent(),
    driverBuilt: new CustomEvent()
}

function buildDriver() {
    var driver = new ChromedriverFactory(chromeOptions).driver;
    events.startRepl.once(() => {
        myrepl.context.driver = driver;
        events.driverBuilt.emit();
    });
    return driver;
}

function get(url) {
    url = require('../utils/misc').getFullURL(url);

    if(myrepl.context.driver) {
        return myrepl.context.driver.get(url)
            .catch(() => {
                return buildDriver().get(url);
            });
    } else {
        return buildDriver().get(url);
    }
}

function importSelectors() {
    events.driverBuilt.once(() => {
        const { $, $$, $x, $$x } = require('../utils/selector')(myrepl.context.driver);
        Object.assign(myrepl.context, {
            $,
            $$,
            $x,
            $$x
        });
    });
}

var chromeOptions = new chrome.Options()
    .addArguments(`load-extension=${path.resolve(__dirname, '../../extension')}`);

var myrepl;

module.exports = (chromedriverPath, autoImportSelectors) => {

    if(chromedriverPath) {
        process.env.CHROMEDRIVER_PATH = chromedriverPath;
    }

    try {
        buildDriver();
    } catch (e) {
        throw "Error building chromedriver";
    }

    if(autoImportSelectors) {
        events.driverBuilt.on(importSelectors);
    }

    myrepl = require('repl').start();
    events.startRepl.emit();

    Object.assign(myrepl.context, {
        ...selenium,
        chrome,
        buildDriver,
        get
    });

}
