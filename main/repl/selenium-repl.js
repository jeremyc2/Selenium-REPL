const ChromedriverFactory = require('../ChromedriverFactory'),
    selenium = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    path = require('path'),
    fs = require('fs');

function buildDriver() {
    var driver = new ChromedriverFactory(chromeOptions).driver;
    var interval = setInterval(() => {
        if(myrepl.context) {
            clearInterval(interval);
            myrepl.context.driver = driver;
        }
    }, 300);
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

function loadSelectorFunctions() {
    const { $, $$, $x } = require('../utils/selector')(myrepl.context.driver);
    Object.assign(myrepl.context, {
        $,
        $$,
        $x
    });
}

var chromeOptions = new chrome.Options()
    .addExtensions(fs.readFileSync(path.resolve(__dirname, '../../css-selector.crx'), { encoding: 'base64' }));

var myrepl;

module.exports = (chromedriverPath) => {

    if(chromedriverPath) {
        process.env.CHROMEDRIVER_PATH = chromedriverPath;
    }

    try {
        buildDriver();
    } catch (e) {
        throw "Error building chromedriver";
    }

    myrepl = require('repl').start();

    Object.assign(myrepl.context, {
        ...selenium,
        chrome,
        buildDriver,
        get,
        loadSelectorFunctions
    });

}
