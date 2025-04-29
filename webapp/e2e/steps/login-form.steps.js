const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/login-form.feature');

let page;
let browser;

defineFeature(feature, test => {
  
  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox']})
      : await puppeteer.launch({ headless: false, slowMo: 10 });
    page = await browser.newPage();

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
      await expect(page).toClick("button", { text: "Login" }); 
      await expect(page).toMatchElement("div", { text: "Login" });
    });

    when('They submit the invalid credentials into the login form', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('[data-testid="login-submit"]')
    });

    then('An error message should be displayed', async () => {
        await expect(page).toMatchElement("div", { text: "Error: Invalid credentials" });
    });
  })

  test('User with valid credentials', ({given,when,then}) => {
    
    let username;
    let password;

    given('The user is on the login page', async () => {
      username = "correctUser"
      password = "correctPassword123$"
      //Go from login page to register page
      await expect(page).toClick('a[data-testid="register-link"]');
      //Add the user credentials to the database 
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button[data-testid="add-user-button"]');
      //You are redirected to the login page
      await expect(page).toMatchElement("div", { text: "Login to Start Playing" });
    });

    when('They submit the correct credentials into the login form', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('[data-testid="login-submit"]')
    });

    then('They should be redirected to the dashboard', async () => {
      await page.waitForSelector('body');
      //Check if the user arrived to the dashboard
      await expect(page).toMatchElement('div[data-testid="dashboard-welcomeMsg"]');
    });
  });

  afterAll(async ()=>{
    browser.close()
  })

});