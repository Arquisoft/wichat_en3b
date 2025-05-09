const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/login-form.feature');
const { click, type, match, wait } = require('../test-helper.js');

let page;
let browser;

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", slowMo: 1, args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 1 });
    page = await browser.newPage();

    //Way of setting up the timeout
    setDefaultOptions({ timeout: 60000 });

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => {});
  });

  test('User with invalid credentials', ({given,when,then}) => {
    
    let username;
    let password;

    given('The user is on the login page', async () => {
      username = "incorrectUser"
      password = "incorrectPassword"
      //Go from landing page to login page
      await click(page, "button", { text: "Login" }); 
      await match(page, "div", { text: "Login" });
    });

    when('They submit the invalid credentials into the login form', async () => {
      await type(page, 'input[name="username"]', username);
      await type(page, 'input[name="password"]', password);
      await wait(100);
      await click(page, '[data-testid="login-submit"]')
    });

    then('An error message should be displayed', async () => {
      await match(page, "div", { text: "Error: Invalid credentials" });
    });
  })

  test('User with valid credentials', ({given,when,then}) => {
    
    let username;
    let password;

    given('The user is on the login page', async () => {
      username = "correctUser"
      password = "correctPassword123$"
      //Go from login page to register page
      await click(page, 'a[data-testid="register-link"]');
      //Add the user credentials to the database 
      await type(page, 'input[name="username"]', username);
      await type(page, 'input[name="password"]', password);
      await wait(100);
      await click(page, 'button[data-testid="add-user-button"]');
      //You are redirected to the login page
      await match(page, "div", { text: "Login to Start Playing" });
    });

    when('They submit the correct credentials into the login form', async () => {
      await type(page, 'input[name="username"]', username);
      await type(page, 'input[name="password"]', password);
      await wait(100);
      await click(page, '[data-testid="login-submit"]')
    });

    then('They should be redirected to the dashboard', async () => {
      //Check if the user arrived to the dashboard
      await match(page, 'div[data-testid="dashboard-welcomeMsg"]');
    });
  });

  afterAll(async ()=>{
    browser.close()
  });

});