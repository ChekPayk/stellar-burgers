import { test, expect, Page } from '@playwright/test';
import path from 'path';

const TEST_ACCESS_TOKEN = 'test-access-token-mock';
const TEST_REFRESH_TOKEN = 'test-refresh-token-mock';

const HARS_DIR = path.resolve(__dirname, 'hars');

test.describe('Constructor Page', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock all API requests using HAR files
    await page.routeFromHAR(path.join(HARS_DIR, 'ingredients.har'), {
      url: '**/api/ingredients',
      update: false
    });

    await page.routeFromHAR(path.join(HARS_DIR, 'user.har'), {
      url: '**/api/auth/user',
      update: false
    });

    await page.routeFromHAR(path.join(HARS_DIR, 'order.har'), {
      url: '**/api/orders',
      update: false
    });

    await page.goto('/');
  });

  test('should display ingredients from API', async ({ page }) => {
    // Wait for ingredients to load
    await page.waitForSelector('text=Краторная булка N-200i');
    await page.waitForSelector('text=Филе Люминесцентного тетраодонтимформа');
    await page.waitForSelector('text=Соус Spicy-X');

    // Verify ingredient names are visible in the ingredients list
    await expect(page.getByText('Краторная булка N-200i').first()).toBeVisible();
    await expect(
      page.getByText('Филе Люминесцентного тетраодонтимформа').first()
    ).toBeVisible();
    await expect(page.getByText('Соус Spicy-X').first()).toBeVisible();
  });

  test('should add bun ingredient to constructor', async ({ page }) => {
    // Wait for ingredients to load
    await page.waitForSelector('text=Краторная булка N-200i');

    // Find the bun ingredient and click "Добавить"
    const bunContainer = page
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });
    const addButton = bunContainer.getByText('Добавить');
    await addButton.click();

    // Verify bun appears in constructor (top and bottom)
    await expect(
      page.getByText('Краторная булка N-200i (верх)')
    ).toBeVisible();
    await expect(
      page.getByText('Краторная булка N-200i (низ)')
    ).toBeVisible();
  });

  test('should add main ingredient to constructor', async ({ page }) => {
    // Wait for ingredients to load
    await page.waitForSelector('text=Филе Люминесцентного тетраодонтимформа');

    // Find the main ingredient and click "Добавить"
    const mainContainer = page
      .locator('li')
      .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
    const addButton = mainContainer.getByText('Добавить');
    await addButton.click();

    // Verify ingredient appears in constructor (use first() to avoid strict mode
    // since the ingredient name appears both in the list and in the constructor)
    await expect(
      page.getByText('Филе Люминесцентного тетраодонтимформа').first()
    ).toBeVisible();
  });

  test('should add sauce ingredient to constructor', async ({ page }) => {
    // Wait for ingredients to load
    await page.waitForSelector('text=Соус Spicy-X');

    // Find the sauce ingredient and click "Добавить"
    const sauceContainer = page
      .locator('li')
      .filter({ hasText: 'Соус Spicy-X' });
    const addButton = sauceContainer.getByText('Добавить');
    await addButton.click();

    // Verify ingredient appears in constructor (use first() to avoid strict mode
    // since the ingredient name appears both in the list and in the constructor)
    await expect(
      page.getByText('Соус Spicy-X').first()
    ).toBeVisible();
  });

  test('should open ingredient modal with correct ingredient data', async ({
    page
  }) => {
    // Wait for ingredients to load
    await page.waitForSelector('text=Краторная булка N-200i');

    // Click on the ingredient link (name) - use first() to get the ingredient list item
    await page.getByText('Краторная булка N-200i').first().click();

    // Verify modal with ingredient details is opened
    await expect(page.getByText('Детали ингредиента')).toBeVisible();
    // The ingredient name appears both in the list and in the modal heading
    await expect(
      page.getByText('Краторная булка N-200i').first()
    ).toBeVisible();
  });

  test('should close ingredient modal by clicking close button', async ({
    page
  }) => {
    // Wait for ingredients to load
    await page.waitForSelector('text=Краторная булка N-200i');

    // Open ingredient modal
    await page.getByText('Краторная булка N-200i').first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();

    // Close modal by clicking the close button in the modal header
    // The modal is rendered via portal into #modals element
    // The close button is inside #modals > div:first-child > div:first-child > button
    const modalContainer = page.locator('#modals');
    const closeButton = modalContainer
      .locator('div')
      .first()
      .locator('button');
    await closeButton.click();

    // Verify modal is closed
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test('should close ingredient modal by clicking overlay', async ({
    page
  }) => {
    // Wait for ingredients to load
    await page.waitForSelector('text=Краторная булка N-200i');

    // Open ingredient modal
    await page.getByText('Краторная булка N-200i').first().click();
    await expect(page.getByText('Детали ингредиента')).toBeVisible();

    // Close modal by clicking the overlay
    // The overlay is a fixed-position div covering the full screen behind the modal
    // Click at the top-left corner of the viewport (outside the modal area)
    // to trigger the overlay's onClick handler
    const box = await page.locator('#modals > div').nth(1).boundingBox();
    if (box) {
      // Click at the top-left corner of the overlay (outside the modal)
      await page.mouse.click(box.x + 5, box.y + 5);
    }

    // Verify modal is closed
    await expect(page.getByText('Детали ингредиента')).not.toBeVisible();
  });

  test.describe('Order creation', () => {
    test.beforeEach(async ({ page }) => {
      // Set mock auth tokens before each order test
      // addInitScript runs before page navigation, so we need to re-navigate
      await page.addInitScript(
        ({ accessToken, refreshToken }) => {
          document.cookie = `accessToken=${accessToken}; path=/`;
          localStorage.setItem('refreshToken', refreshToken);
        },
        { accessToken: TEST_ACCESS_TOKEN, refreshToken: TEST_REFRESH_TOKEN }
      );

      // Re-navigate to apply the auth tokens set by addInitScript
      await page.goto('/');
    });

    test.afterEach(async ({ page }) => {
      // Clean up auth tokens after each order test
      await page.addInitScript(() => {
        document.cookie =
          'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('refreshToken');
      });
    });

    test('should create order successfully', async ({ page }) => {
      // Wait for ingredients to load
      await page.waitForSelector('text=Краторная булка N-200i');

      // Add bun to constructor
      const bunContainer = page
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' });
      await bunContainer.getByText('Добавить').click();

      // Add main ingredient to constructor
      const mainContainer = page
        .locator('li')
        .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
      await mainContainer.getByText('Добавить').click();

      // Click "Оформить заказ" button
      await page.getByText('Оформить заказ').click();

      // Wait for order modal to appear with order number
      // The order number is rendered in an h2 with class text_type_digits-large
      await expect(page.getByText('54321')).toBeVisible();
      await expect(page.getByText('идентификатор заказа')).toBeVisible();
    });

    test('should close order modal and verify constructor is empty', async ({
      page
    }) => {
      // Wait for ingredients to load
      await page.waitForSelector('text=Краторная булка N-200i');

      // Add bun to constructor
      const bunContainer = page
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' });
      await bunContainer.getByText('Добавить').click();

      // Add main ingredient
      const mainContainer = page
        .locator('li')
        .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
      await mainContainer.getByText('Добавить').click();

      // Click "Оформить заказ"
      await page.getByText('Оформить заказ').click();

      // Wait for order modal
      await expect(page.getByText('54321')).toBeVisible();

      // Close order modal - the modal is rendered via portal into #modals
      const modalContainer = page.locator('#modals');
      const closeButton = modalContainer
        .locator('div')
        .first()
        .locator('button');
      await closeButton.click();

      // Verify modal is closed
      await expect(page.getByText('54321')).not.toBeVisible();

      // Verify constructor is empty - should show placeholder texts
      // "Выберите булки" appears twice (top and bottom), use first()
      await expect(page.getByText('Выберите булки').first()).toBeVisible();
      await expect(page.getByText('Выберите начинку')).toBeVisible();
    });
  });
});
