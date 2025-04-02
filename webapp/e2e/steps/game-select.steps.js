const puppeteer = require('puppeteer');
const { defineFeature, loadFeature }=require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-select.feature');

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

  test('User logged in the application', ({given,when,then}) => {
    
    let username;
    let password;

    given('The user is on the dashboard', async () => {
      username = "username"
      password = "harderpassword123"
      //Go from landing page to login page
      await expect(page).toClick("button", { text: "Login" }); 
      //Go to the register page to add the user credentials to the database
      await expect(page).toClick("a", { text: "Don't have an account? Register here." });
      //Fill the register form with the user credentials
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button', { text: 'Add User' })
      //Go back to the login page
      await expect(page).toClick("a", { text: "Already have an account? Login here." });
      //Fill the register form with the user credentials
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('[data-testid="login-submit"]')
      //Check if the user arrived to the dashboard
      await expect(page).toMatchElement("div", { text: "Home" });

    });

    when('They Click on "Play a game now"', async () => {
      await expect(page).toClick("button", { text: "Play A Game Now" });
    });

    then('They can choose the gamemode they want to play', async () => {
        //Click on wild
        await expect(page).toClick('input[type="radio"][value="wild"]');
        //Click back on custom
        await expect(page).toClick('input[type="radio"][value="custom"]');
        //Select the different game modes under custom
        await expect(page).toClick('button', { text: 'CITIES' });
        await expect(page).toClick('button', { text: 'FLAGS' });
        await expect(page).toClick('button', { text: 'ATHLETES' });
        await expect(page).toClick('button', { text: 'SINGERS' });
        //Click on next to select game type
        await expect(page).toClick('button', { text: 'NEXT' });
        //Select rounds
        await expect(page).toClick('input[type="checkbox"][name="rounds"]');
        //Click on next
        await expect(page).toClick('button', { text: 'NEXT' });
    });
  })

  

  afterAll(async ()=>{
    browser.close()
  })

});