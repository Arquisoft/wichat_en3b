const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/register-form.feature');

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

  test('The user is not registered in the site', ({given,when,then}) => {
    
    let username;
    let password;

    given('An unregistered user', async () => {
      username = "newUser"
      password = "newUserPassword123$"
      //Go from landing page to login page
      await expect(page).toClick("button", { text: "Login" }); 
      //Go from login page to register page
      await expect(page).toClick("a", { text: "Don’t have an account? Sign up here" });
    });

    when('I fill the data in the form and press submit', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button[data-testid="add-user-button"]');
    });

    then('I am redirected to the login page', async () => {
      await expect(page).toMatchElement("div", { text: "Ready to test your knowledge? Log in and let's go!" });
    });
  })

  //Uncomment this test when the backend is ready to handle the case of a user already registered in the database attemps to register again
  /* test('The user is already registered in the site', ({ given, when, then }) => {
    let username;
    let password;

    given('A registered user', async () => {
      username = "newUser"
      password = "newUserPassword"
    });

    when('I fill the data in the form and press submit', async () => {
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button', { text: 'Add User' });
    });

    then('An error message should be shown in the screen', async () => {
      await expect(page).toMatchElement("div", { text: "User added successfully" });
    });
}); */

  afterAll(async ()=>{
    browser.close()
  })

});