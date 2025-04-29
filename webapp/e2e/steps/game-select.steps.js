const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions
const feature = loadFeature('./features/game-select.feature');
const { click, type, match, wait } = require('../test-helper.js');

let page;
let browser;

defineFeature(feature, test => {

  beforeAll(async () => {
    browser = process.env.GITHUB_ACTIONS
      ? await puppeteer.launch({ headless: "new", slowMo: 1, args: ['--no-sandbox', '--disable-setuid-sandbox'] })
      : await puppeteer.launch({ headless: false, slowMo: 1 });
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
      await click(page, "button", { text: "Login" });
      //Go to the register page to add the user credentials to the database
      await click(page, "a", { text: "Don’t have an account? Sign up here" });
      //Fill the register form with the user credentials
      await type(page, 'input[name="username"]', username);
      await type(page, 'input[name="password"]', password);
      await wait(100);
      await click(page, 'button[data-testid="add-user-button"]');
      //You are redirected to the login page
      await match(page, "div", { text: "Ready to test your knowledge? Log in and let's go!" });
      //Fill the register form with the user credentials
      await type(page, 'input[name="username"]', username);
      await type(page, 'input[name="password"]', password);
      await wait(100);
      await click(page, 'button[data-testid="login-submit"]');
      //Check if the user arrived to the dashboard
      await match(page, 'div[data-testid="dashboard-welcomeMsg"]');
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
      await page.waitForSelector("[data-testid='Geography']");
      await expect(page).toClick("[data-testid='Geography']");

      // Wait for the accordion to expand
      await wait(500);

      //Click on the topic
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