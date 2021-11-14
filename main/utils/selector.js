const { By } = require('selenium-webdriver');

var driver;

function $(selector, startNode) {
    if(!selector) return;

    startNode = startNode || driver;

    return startNode.findElement(By.css(selector));
}

function $$(selector, startNode) {
    if(!selector) return;

    startNode = startNode || driver;

    return startNode.findElements(By.css(selector));
}

function $x(path, startNode) {
    if(!path) return;

    startNode = startNode || driver;

    return startNode.findElement(By.xpath(path));
}

function $$x(path, startNode) {
    if(!path) return;

    startNode = startNode || driver;

    return startNode.findElements(By.xpath(path));
}

module.exports = function(webdriver) {
    driver = webdriver;

    return {
        $,
        $$,
        $x,
        $$x
    }
}
