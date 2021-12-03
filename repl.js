const ChromedriverFactory = require('./ChromedriverFactory'),
    CustomEvent = require('./utils/CustomEvent'),
    selenium = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    path = require('path');

const events = {
    replStarted: new CustomEvent(),
    driverBuilt: new CustomEvent()
}

function buildDriver() {
    var driver = new ChromedriverFactory(chromeOptions).driver;
    events.replStarted.once(() => {
        myrepl.context.driver = driver;
        events.driverBuilt.emit();
    });
    return driver;
}

function get(url) {
    url = require('./utils/misc').getFullURL(url);

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
    events.driverBuilt.on(() => {
        const { $, $$, $x, $$x } = require('./utils/selector')(myrepl.context.driver);
        Object.assign(myrepl.context, {
            $,
            $$,
            $x,
            $$x
        });
    });
}

var chromeOptions = new chrome.Options()
    .addArguments(`load-extension=${path.resolve(__dirname, './extension')}`);

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
        importSelectors();
    }

    myrepl = require('repl').start({ignoreUndefined: true});
    events.replStarted.emit();

    Object.assign(myrepl.context, {
        ...selenium,
        chrome,
        buildDriver,
        get,
        importSelectors
    });

}
