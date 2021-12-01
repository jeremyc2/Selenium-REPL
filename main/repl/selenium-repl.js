const ChromedriverFactory = require('../ChromedriverFactory'),
    selenium = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    path = require('path'),
    EventEmitter = require('events');

class MyEmitter extends EventEmitter {}

const myEmitter = new MyEmitter();

function buildDriver() {
    var driver = new ChromedriverFactory(chromeOptions).driver;
    myEmitter.once('replStart', () => {
        myrepl.context.driver = driver;
        myEmitter.emit('driverBuilt');
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
    myEmitter.on('driverBuilt', () => {
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

    myrepl = require('repl').start();
    myEmitter.emit('replStart');

    Object.assign(myrepl.context, {
        ...selenium,
        chrome,
        buildDriver,
        get,
        importSelectors
    });
    
    if(autoImportSelectors) {
        importSelectors();
    }

}
