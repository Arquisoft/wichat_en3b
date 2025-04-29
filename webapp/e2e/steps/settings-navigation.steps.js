const puppeteer = require('puppeteer');
const { defineFeature, loadFeature } = require('jest-cucumber');
const setDefaultOptions = require('expect-puppeteer').setDefaultOptions;
const feature = loadFeature('./features/settings-navigation.feature');
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
      .catch(() => {});
  });

  test("User access to settings", ({ given, when, then }) => {
    given("A user enters the application", async () => {
      await match(page, "div[data-testid='app-name-div']");
    });

    when("They click the settings button", async () => {
      await click(page, "button[data-testid='settings-button']");
    });

    then("The user is shown the settings page", async () => {
      await match(page, "[data-testid='language-div']");
    });
  });

  test("User wants to change the language", ({ given, when, then }) => {
    given("A user in the settings page", async () => {
      await match(page, "[data-testid='language-div']");
    });

    when("They change the language in the Language comboBox", async () => {
        await click(page, "[data-testid='language-select']");
        await click(page, "li[data-value='es']");
      });
    then("The language of the application is changed", async () => {
        await match(page, "div", { text: "Configuración" });
        await wait(500); 
        await click(page, "[data-testid='language-select']");
        await click(page, "li[data-value='en']");
  });

  test("The user wants to change the theme of the application", ({ given, when, then }) => {
    given("A user in the settings page", async () => {
      await match(page, "[data-testid='language-div']");
    });

    when("They choose a theme in the theme selector", async () => {
        await click(page, "button[aria-label='Select night theme']");
    });

    then("The application's theme is changed", async () => {
        await wait(500);

        const backgroundColor = await page.evaluate(() => {
          return window.getComputedStyle(document.body).backgroundColor;
        });
      
        expect(backgroundColor).toBe("rgb(35, 39, 42)"); 
    });
  });

  test("The user wants to change the AI model used", ({ given, when, then }) => {
    given("A user in the settings page", async () => {
      await match(page, "[data-testid='language-div']");
    });

    when("They click on advanced settings", async () => {
      await click(page, "button[data-testid='advanced-settings-button']");
    });

    then("They can change the AI Model used", async () => {
      await match(page, "[data-testid='ai-model-selector']");
    });
  });

  afterAll(async () => {
    await browser.close();
  });
  });
});