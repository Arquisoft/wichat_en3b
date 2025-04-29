const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register-form.feature');
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

  test('The user is not registered in the site', ({given,when,then}) => {
    
    let username;
    let password;

    given('An unregistered user', async () => {
      username = "newUser"
      password = "newUserPassword123$"
      //Go from landing page to login page
      await click(page, "button", { text: "Login" }); 
      //Go from login page to register page
      await click(page, "a", { text: "Don’t have an account? Sign up here" });
    });

    when('I fill the data in the form and press submit', async () => {
      await type(page, 'input[name="username"]', username);
      await type(page, 'input[name="password"]', password);
      await wait(100);
      await click(page, 'button[data-testid="add-user-button"]');
    });

    then('I am redirected to the login page', async () => {
      await match(page, "div", { text: "Ready to test your knowledge? Log in and let's go!" });
    });
  })

  test('The user is already registered in the site', ({ given, when, then }) => {
    let username;
    let password;

    given('A registered user', async () => {
      username = "newUser"
      password = "newUserPassword123$"
    });

    when('I fill the data in the form and press submit', async () => {
      await page.goto("http://localhost:3000/signup", {
        waitUntil: "networkidle0",
      });

      await type(page, 'input[name="username"]', username);
      await type(page, 'input[name="password"]', password);
      await wait(100);
      await click(page, 'button[data-testid="add-user-button"]');
    });

    then('An error message should be shown in the screen', async () => {
      await match(page, "p", { text: "Username already taken" });
    });
  });

  afterAll(async ()=>{
    browser.close()
  })

});