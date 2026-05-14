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

  const ingredientsSection = (page: Page) =>
    page.locator('section').filter({ hasText: 'Булки' });

  const constructorSection = (page: Page) =>
    page.locator('section').filter({ hasText: 'Оформить заказ' });

  const modalsContainer = (page: Page) => page.locator('#modals');

  test('should display ingredients from API', async ({ page }) => {
    const ingredients = ingredientsSection(page);

    // Wait for ingredients to load within the ingredients section
    await expect(
      ingredients.getByText('Краторная булка N-200i')
    ).toBeVisible();
    await expect(
      ingredients.getByText('Филе Люминесцентного тетраодонтимформа')
    ).toBeVisible();
    await expect(ingredients.getByText('Соус Spicy-X')).toBeVisible();
  });

  test('should add bun ingredient to constructor', async ({ page }) => {
    // Wait for ingredients to load
    await expect(
      ingredientsSection(page).getByText('Краторная булка N-200i')
    ).toBeVisible();

    // Find the bun ingredient and click "Добавить"
    const bunContainer = ingredientsSection(page)
      .locator('li')
      .filter({ hasText: 'Краторная булка N-200i' });
    await bunContainer.getByText('Добавить').click();

    const constructor = constructorSection(page);

    // Verify bun appears in constructor (top and bottom)
    await expect(
      constructor.getByText('Краторная булка N-200i (верх)')
    ).toBeVisible();
    await expect(
      constructor.getByText('Краторная булка N-200i (низ)')
    ).toBeVisible();
  });

  test('should add main ingredient to constructor', async ({ page }) => {
    // Wait for ingredients to load
    await expect(
      ingredientsSection(page).getByText('Филе Люминесцентного тетраодонтимформа')
    ).toBeVisible();

    // Find the main ingredient and click "Добавить"
    const mainContainer = ingredientsSection(page)
      .locator('li')
      .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
    await mainContainer.getByText('Добавить').click();

    // Verify ingredient appears in constructor section
    await expect(
      constructorSection(page).getByText('Филе Люминесцентного тетраодонтимформа')
    ).toBeVisible();
  });

  test('should add sauce ingredient to constructor', async ({ page }) => {
    // Wait for ingredients to load
    await expect(
      ingredientsSection(page).getByText('Соус Spicy-X')
    ).toBeVisible();

    // Find the sauce ingredient and click "Добавить"
    const sauceContainer = ingredientsSection(page)
      .locator('li')
      .filter({ hasText: 'Соус Spicy-X' });
    await sauceContainer.getByText('Добавить').click();

    // Verify ingredient appears in constructor section
    await expect(
      constructorSection(page).getByText('Соус Spicy-X')
    ).toBeVisible();
  });

  test('should open ingredient modal with correct ingredient data', async ({
    page
  }) => {
    // Wait for ingredients to load
    await expect(
      ingredientsSection(page).getByText('Краторная булка N-200i')
    ).toBeVisible();

    // Click on the ingredient name in the ingredients section
    await ingredientsSection(page).getByText('Краторная булка N-200i').click();

    const modals = modalsContainer(page);

    // Verify modal with ingredient details is opened
    await expect(modals.getByText('Детали ингредиента')).toBeVisible();
    // Verify the ingredient name is in the modal
    await expect(
      modals.getByText('Краторная булка N-200i')
    ).toBeVisible();
    // Verify specific nutritional characteristics of the clicked ingredient
    // Mock data: Краторная булка N-200i has calories=420, proteins=80, fat=24, carbohydrates=53
    await expect(modals.getByText('420')).toBeVisible();
    await expect(modals.getByText('80')).toBeVisible();
    await expect(modals.getByText('24')).toBeVisible();
    await expect(modals.getByText('53')).toBeVisible();
  });

  test('should close ingredient modal by clicking close button', async ({
    page
  }) => {
    // Wait for ingredients to load
    await expect(
      ingredientsSection(page).getByText('Краторная булка N-200i')
    ).toBeVisible();

    // Open ingredient modal
    await ingredientsSection(page).getByText('Краторная булка N-200i').click();
    await expect(
      modalsContainer(page).getByText('Детали ингредиента')
    ).toBeVisible();

    // Close modal by clicking the close button in the modal header
    const modalContainer = modalsContainer(page);
    const closeButton = modalContainer
      .locator('div')
      .first()
      .locator('button');
    await closeButton.click();

    // Verify modal is closed
    await expect(
      modalsContainer(page).getByText('Детали ингредиента')
    ).not.toBeVisible();
  });

  test('should close ingredient modal by clicking overlay', async ({
    page
  }) => {
    // Wait for ingredients to load
    await expect(
      ingredientsSection(page).getByText('Краторная булка N-200i')
    ).toBeVisible();

    // Open ingredient modal
    await ingredientsSection(page).getByText('Краторная булка N-200i').click();
    await expect(
      modalsContainer(page).getByText('Детали ингредиента')
    ).toBeVisible();

    // Close modal by clicking the overlay
    // The overlay is a fixed-position div covering the full screen behind the modal
    // Click at the top-left corner of the viewport (outside the modal area)
    const box = await page.locator('#modals > div').nth(1).boundingBox();
    if (box) {
      await page.mouse.click(box.x + 5, box.y + 5);
    }

    // Verify modal is closed
    await expect(
      modalsContainer(page).getByText('Детали ингредиента')
    ).not.toBeVisible();
  });

  test.describe('Order creation', () => {
    test.beforeEach(async ({ page, context }) => {
      // Set mock auth tokens before each order test
      // Use context.addCookies for Playwright-level cookie management
      await context.addCookies([
        {
          name: 'accessToken',
          value: TEST_ACCESS_TOKEN,
          url: 'http://localhost:4000'
        }
      ]);
      // Use page.evaluate for localStorage (runs immediately on the current page)
      await page.evaluate((token) => {
        localStorage.setItem('refreshToken', token);
      }, TEST_REFRESH_TOKEN);

      await page.goto('/');
    });

    test.afterEach(async ({ page, context }) => {
      // Immediately clear auth tokens on the current page using page.evaluate
      await page.evaluate(() => {
        document.cookie =
          'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        localStorage.removeItem('refreshToken');
      });
      // Also clear Playwright context-level cookies to prevent leakage
      await context.clearCookies();
    });

    test('should create order successfully', async ({ page }) => {
      // Wait for ingredients to load
      await expect(
        ingredientsSection(page).getByText('Краторная булка N-200i')
      ).toBeVisible();

      // Add bun to constructor
      const bunContainer = ingredientsSection(page)
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' });
      await bunContainer.getByText('Добавить').click();

      // Add main ingredient to constructor
      const mainContainer = ingredientsSection(page)
        .locator('li')
        .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
      await mainContainer.getByText('Добавить').click();

      // Click "Оформить заказ" button
      await constructorSection(page).getByText('Оформить заказ').click();

      const modals = modalsContainer(page);

      // Wait for order modal to appear with order number
      await expect(modals.getByText('54321')).toBeVisible();
      await expect(modals.getByText('идентификатор заказа')).toBeVisible();
    });

    test('should close order modal and verify constructor is empty', async ({
      page
    }) => {
      // Wait for ingredients to load
      await expect(
        ingredientsSection(page).getByText('Краторная булка N-200i')
      ).toBeVisible();

      // Add bun to constructor
      const bunContainer = ingredientsSection(page)
        .locator('li')
        .filter({ hasText: 'Краторная булка N-200i' });
      await bunContainer.getByText('Добавить').click();

      // Add main ingredient
      const mainContainer = ingredientsSection(page)
        .locator('li')
        .filter({ hasText: 'Филе Люминесцентного тетраодонтимформа' });
      await mainContainer.getByText('Добавить').click();

      // Click "Оформить заказ"
      await constructorSection(page).getByText('Оформить заказ').click();

      const modals = modalsContainer(page);

      // Wait for order modal
      await expect(modals.getByText('54321')).toBeVisible();

      // Close order modal
      const closeButton = modals
        .locator('div')
        .first()
        .locator('button');
      await closeButton.click();

      // Verify modal is closed
      await expect(modals.getByText('54321')).not.toBeVisible();

      const constructor = constructorSection(page);

      // Verify constructor is empty - should show placeholder texts
      await expect(constructor.getByText('Выберите булки').first()).toBeVisible();
      await expect(constructor.getByText('Выберите начинку')).toBeVisible();
    });
  });
});
