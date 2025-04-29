const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-select.feature');

let page;
let browser;

defineFeature(feature, test => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 30 });
    page = await browser.newPage();

    //Way of setting up the timeout
    setDefaultOptions({ timeout: 60000 });

    await page
      .goto("http://localhost:3000", {
        waitUntil: "networkidle0",
      })
      .catch(() => { });
  });

  test('User logged in the application', ({ given, when, then }) => {

    let username;
    let password;

    given('The user is on the dashboard', async () => {
      username = "GameSelUsr"
      password = "GameSelectPass123$"
      //Go from landing page to login page
      await page.waitForSelector("button", { text: "Login" });
      await expect(page).toClick("button", { text: "Login" });
      //Go to the register page to add the user credentials to the database
      await page.waitForSelector("a", { text: "Don’t have an account? Sign up here" });
      await expect(page).toClick("a", { text: "Don’t have an account? Sign up here" });
      //Fill the register form with the user credentials
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('button[data-testid="add-user-button"]');
      //You are redirected to the login page
      await page.waitForSelector('[data-testid="login-submit"]');
      await expect(page).toMatchElement("div", { text: "Ready to test your knowledge? Log in and let's go!" });
      //Fill the register form with the user credentials
      await expect(page).toFill('input[name="username"]', username);
      await expect(page).toFill('input[name="password"]', password);
      await expect(page).toClick('[data-testid="login-submit"]')
      //Check if the user arrived to the dashboard
      await page.waitForSelector('div[data-testid="dashboard-welcomeMsg"]');
      await expect(page).toMatchElement('div[data-testid="dashboard-welcomeMsg"]');

    });

    when('They Click on "Play a game now"', async () => {
      await page.waitForSelector('button[data-testid="play-button"]');
      await expect(page).toMatchElement('div[data-testid="dashboard-readyToPlay"]');
      await expect(page).toClick('[data-testid="play-button"]');
    });

    then('They can choose the gametopic they want to play', async () => {
      //Check if the user arrived to the game topic selection page
      await page.waitForSelector('div[data-testid="game-topic-selection"]');
      await expect(page).toMatchElement('div[data-testid="game-topic-selection"]');
      //Click on wild
      await page.waitForSelector('[data-testid="wild-button"]');
      await expect(page).toClick('[data-testid="wild-button"]');
      //Click back on custom
      await page.waitForSelector('div[data-testid="game-topic-selection"]');
      await expect(page).toClick('[data-testid="custom-button"]');
    });
  });

  test('User in the game topic selection window', ({ given, when, then }) => {

    given('The user is on the game topic selection window and has chosen Custom', async () => {
      //Click on custom
      await page.waitForSelector('div[data-testid="game-topic-selection"]');
      await expect(page).toClick('[data-testid="custom-button"]');
    });

    when('They search for specific topics', async () => {
      let searchInput = "cities";
      await page.waitForSelector("[data-testid='search-input'] input");
      await expect(page).toFill("[data-testid='search-input'] input", searchInput);
    });

    then('They can choose that topic and go to the next screen', async () => {
      // Click on the accordion with the text "Geography"
      await expect(page).toClick("[data-testid='Geography']");
      //Click on the topic
      await page.waitForSelector("button", { text: "Cities" });
      await expect(page).toClick("button", { text: "CITIES" });
      //Click on the next button
      await expect(page).toClick("button", { text: "NEXT" });
    });
  });

  test('User in the game mode screen', ({ given, when, then }) => {

    given('The user is the the game mode selection screen', async () => {
      await page.waitForSelector('div[data-testid="game-mode-selection"]');
      await expect(page).toMatchElement('div[data-testid="game-mode-selection"]');
    });

    when('They choose any game mode', async () => {
      await expect(page).toClick("button[data-testid='TIME']");
    });

    then('They are able to play a game of that gamemode', async () => {
      await page.waitForNavigation({ waitUntil: "networkidle0" });
      const currentUrl = page.url();
      expect(currentUrl).toContain("/timegame");
    });
  });

  afterAll(async () => {
    browser.close()
  });
});