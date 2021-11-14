# Selenium REPL
<img src="https://github.com/jeremyc2/Selenium-REPL/blob/main/REPL-Infographic.svg" width="400">

*Currently only supports testing in Google Chrome*
## Before you begin
1. Make sure you have [NodeJS](https://nodejs.org/en/) installed
2. If you do not have PowerShell installed, make sure you have downloaded the [Chromedriver](https://chromedriver.chromium.org/downloads) executable

## Quickstart
Open PowerShell. Enter ```npx selenium-repl```.

## Setup
*If you have PowerShell installed, execute ***Setup.ps1*** and skip the remaining setup instructions.*  
1. In a Terminal Window, navigate to this repository and enter the command ```npm install```
2. Enter the command ```npm run setup CHROMEDRIVER_PATH``` replacing ***CHROMEDRIVER_PATH*** with the path to your folder containing chromedriver.exe†

## Run the REPL
*If you have PowerShell installed, execute **Start.ps1** and skip the remaining steps.*
1. In a Terminal Window, navigate to this repository and enter the command ```npm start```  

[Learn about Selenium REPL exclusive functions](https://github.com/jeremyc2/Selenium-REPL/wiki/Selenium-REPL-Exclusive-Functions).  
Right-click an element to copy its CSS Selector.

## Creating Tests
Refer to the [Official Selenium Documentation](https://www.selenium.dev/documentation/). It is recommended you follow the [Page Object Model
](https://www.selenium.dev/documentation/guidelines/page_object_models/). 

Store Pages in ***main/pages*** and Tests in ***main/tests***.

### Example Test
#### test1.js
```javascript
const ChromedriverFactory = require('../ChromedriverFactory'),
    LoginPage = require('../pages/LoginPage');

function test1() {
    var driver = new ChromedriverFactory().driver;

    driver.get('https://www.google.com');

    var loginPage = new LoginPage(driver);
    var homePage = loginPage.login('Username', 'Password');

    // ...
}

module.exports = test1;
```
#### LoginPage.js
```javascript
const { By } = require('selenium-webdriver'),
    HomePage = require('./HomePage');

class LoginPage {

    usernameField = By.css('#UserName');
    passwordField = By.css('#Password');
    loginButton = By.css('#LoginButton');

    constructor(driver) {
        this.driver = driver;
    }

    inputUsername(username) {
        this.driver.findElement(this.usernameField).sendKeys(username);
    }

    inputPassword(password) {
        this.driver.findElement(this.passwordField).sendKeys(password);
    }

    clickLogin() {
        this.driver.findElement(this.loginButton).click();
    }

    login(username, password) {
        this.inputUsername(username);
        this.inputPassword(password);
        this.clickLogin();
        return new HomePage(this.driver);
    }
}

module.exports = LoginPage;
```
[Selenium JavaScript Cheatsheet](https://jeremyc2.github.io/Selenium-REPL/selenium-repl-cheatsheet.html)

[JavaScript API Documentation](https://www.selenium.dev/selenium/docs/api/javascript/)

†*If the chromedriver folder is your current directory or if it is in your PATH, you may omit this step.*
