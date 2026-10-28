import { test, expect } from '@playwright/test';

// Helper: log in via the React-Select dropdowns
async function login(page: any, username: string, password: string) {
  await page.goto('https://bstackdemo.com/signin');

  // Open username dropdown and pick the option
  await page.locator('#username').locator('div.css-yk16xz-control').click();
  await page.getByText(username, { exact: true }).click();

  // Open password dropdown and pick the option
  await page.locator('#password').locator('div.css-yk16xz-control').click();
  await page.getByText(password, { exact: true }).click();

  await page.locator('#login-btn').click();
}

// ─────────────────────────────────────────────────────────────────────────────
// TEST 1 — Successful end-to-end checkout
// ─────────────────────────────────────────────────────────────────────────────
test('successful checkout — add iPhone 12 and place order', async ({ page }) => {
  await login(page, 'demouser', 'testingisfun99');

  // Wait for the product page to load (demouser shown in nav)
  await expect(page.getByText('demouser')).toBeVisible();

  // Add iPhone 12 to cart (product id="1")
  await page.locator('[id="1"]').getByText('Add to cart').click();

  // Cart sidebar should show 1 item and $799.00
  await expect(page.getByText('$ 799.00').first()).toBeVisible();

  // Proceed to checkout
  await page.getByText('CHECKOUT').click();
  await expect(page).toHaveURL(/checkout/);

  // Fill shipping address
  await page.locator('#firstNameInput').fill('Test');
  await page.locator('#lastNameInput').fill('User');
  await page.locator('#addressLine1Input').fill('123 Test Street');
  await page.locator('#provinceInput').fill('California');
  await page.locator('#postCodeInput').fill('90001');

  // Submit order
  await page.locator('#checkout-shipping-continue').click();

  // Confirm order placed
  await expect(page).toHaveURL(/confirmation/);
  await expect(
    page.getByText('Your Order has been successfully placed.')
  ).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 2 — Failure test: locked_user cannot log in
// ─────────────────────────────────────────────────────────────────────────────
test('failure — locked_user is blocked from signing in', async ({ page }) => {
  await page.goto('https://bstackdemo.com/signin');

  // Open username dropdown and pick locked_user
  await page.locator('#username').locator('div.css-yk16xz-control').click();
  await page.getByText('locked_user', { exact: true }).click();

  // Open password dropdown
  await page.locator('#password').locator('div.css-yk16xz-control').click();
  await page.getByText('testingisfun99', { exact: true }).click();

  await page.locator('#login-btn').click();

  // Expect an error message — locked_user should NOT reach the product page
  await expect(page.getByText('Your account has been locked.')).toBeVisible();
});

// ─────────────────────────────────────────────────────────────────────────────
// TEST 3 — Self-heal test: intentionally stale selector on the login button
//
// The selector '#login-button' is wrong (real id is '#login-btn').
// BrowserStack Self-Heal detects the broken locator and heals it at runtime,
// allowing the test to pass and surfacing the suggested fix in the dashboard.
// ─────────────────────────────────────────────────────────────────────────────
test('self-heal — stale login-button selector is healed by BrowserStack', async ({ page }) => {
  await page.goto('https://bstackdemo.com/signin');

  // Select username
  await page.locator('#username').locator('div.css-yk16xz-control').click();
  await page.getByText('demouser', { exact: true }).click();

  // Select password
  await page.locator('#password').locator('div.css-yk16xz-control').click();
  await page.getByText('testingisfun99', { exact: true }).click();

  // ⚠️  Intentionally stale selector — real id is '#login-btn'.
  // BrowserStack Self-Heal will detect the mismatch and heal it.
  await page.locator('#login-button').click();

  // After self-heal the login should succeed
  await expect(page.getByText('demouser')).toBeVisible();
});
