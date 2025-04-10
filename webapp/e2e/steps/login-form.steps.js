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
    //Way of setting up the timeout
    setDefaultOptions({ timeout: 10000 })

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
      password = "correctPassword"
      //Go from login page to register page
      await expect(page).toClick("a", { text: "Don't have an account? Register here." });
      //Add the user credentials to the database 
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button', { text: 'Add User' });
      //Go to the login page
      await expect(page).toClick("a", { text: "Already have an account? Login here." });
    });

    when('They submit the correct credentials into the login form', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('[data-testid="login-submit"]')
    });

    then('They should be redirected to the dashboard', async () => {
        await expect(page).toMatchElement("div", { text: "Home" });
    });
  });

  afterAll(async ()=>{
    browser.close()
  })

});