async function click(page, selector, options) {
  await page.waitForSelector(selector, options);
  await expect(page).toClick(selector, options);
}

async function type(page, selector, text) {
  await page.waitForSelector(selector);
  await expect(page).toFill(selector, text);
}

async function match(page, selector, options) {
  await page.waitForSelector(selector, options);
  await expect(page).toMatchElement(selector, options);
}

async function wait(time) {
  await new Promise((resolve) => setTimeout(resolve, time));
}

module.exports = {
  click,
  type,
  match,
  wait,
};