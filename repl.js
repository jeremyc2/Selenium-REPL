const DriverFactory = require('./DriverFactory'),
    CustomEvent = require('./utils/CustomEvent'),
    selenium = require('selenium-webdriver'),
    path = require('path');

const events = {
    replStarted: new CustomEvent(),
    driverBuilt: new CustomEvent()
}

function buildDriver(browser, headless) {

    if(browser) {
        globalThis.browser = browser
    } else if(globalThis.browser) {
        browser = globalThis.browser;
    } else {
        return;
    }

    if(headless) {
        globalThis.headless = headless
    } else if(globalThis.headless) {
        headless = globalThis.headless;
    }

    var driver;
    if(browser == 'chrome' || browser == 'edge') {
        driver = new DriverFactory(browser, {options: getChromeOptions(), headless}).driver;
    } else {
        driver = new DriverFactory(browser, {headless}).driver;
    }

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

var getChromeOptions = require('./utils/misc').once(() => {
    return new Options()
        .addArguments(`load-extension=${path.resolve(__dirname, 'extension')}`);
})

var myrepl;

module.exports = (driverPath, {browser, headless, autoImportSelectors}) => {
    
    globalThis.Options = new require(`selenium-webdriver/${browser}`).Options;

    if(driverPath) {
        process.env[`${browser.toUpperCase()}DRIVER_PATH`] = driverPath;
    }

    try {
        buildDriver(browser, headless);
    } catch (e) {
        throw "Error building driver";
    }

    if(autoImportSelectors) {
        importSelectors();
    }

    myrepl = require('repl').start({ignoreUndefined: true});
    events.replStarted.emit();

    Object.assign(myrepl.context, {
        ...selenium,
        buildDriver,
        get,
        importSelectors
    });

}
