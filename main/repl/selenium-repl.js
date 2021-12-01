const ChromedriverFactory = require('../ChromedriverFactory'),
    selenium = require('selenium-webdriver'),
    chrome = require('selenium-webdriver/chrome'),
    path = require('path');

class EventPromise {
    listeners;
    constructor() {
        this.listeners = [];
        this.promise = new Promise(resolve => {
            this.resolve = resolve;
        });
    }
    on(cb) {
        this.listeners.push(cb);
    }
    emit() {
        this.resolve();
        this.listeners.forEach(cb => this.once(cb));
    }
    once(executor) {
        this.promise = this.promise.then(executor);
    }
    catch(executor) {
        this.promise = this.promise.catch(executor);
    }
    finally(executor) {
        this.promise = this.promise.finally(executor);
    }
}

const events = {
    startRepl: new EventPromise(),
    driverBuilt: new EventPromise()
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
