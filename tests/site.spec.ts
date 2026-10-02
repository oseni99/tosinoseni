import { test, expect } from '@playwright/test';

test('home, Elsewhere, and unchanged résumé are reachable', async ({ page, request }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Hi, I’m Tosin.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Hackathons [5x winner]', exact: true })).toBeVisible();
  await expect(page.locator('#snake-open')).toHaveCount(0);
  await expect(page.getByText('SWE', { exact: false })).toHaveCount(1);
  await expect(page.getByRole('link', { name: 'MakeItGreen' })).toHaveAttribute('href', 'https://makeitgreen.dev');
  await expect(page.getByRole('link', { name: '2025 Mastercard x AUC Data Challenge' })).toHaveAttribute('href', 'https://datascience.aucenter.edu/annual-data-challenge-2025/');
  await expect(page.getByRole('heading', { name: 'Apple x Propel' })).toBeVisible();
  await expect(page.getByText('$17,500 prize')).toBeVisible();
  await expect(page.getByText('$20,000 prize')).toBeVisible();
  await expect(page.getByText('50,000 miles')).toBeVisible();
  await page.getByText('View 2 photos').click();
  await expect(page.getByRole('img', { name: /Tosin holding the Team Mesh award check/ })).toBeVisible();
  await expect(page.getByRole('img', { name: /Team Mesh and organizers/ })).toBeVisible();
  await page.locator('section[aria-labelledby="hackathons"]').screenshot({ path: 'test-results/hackathons-with-photos.png' });
  await page.getByRole('link', { name: 'elsewhere' }).click();
  await expect(page.getByRole('heading', { name: 'Elsewhere.' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Notes', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Email' })).toHaveAttribute('href', 'mailto:tosineoseni@gmail.com');
  await expect(page.getByRole('link', { name: 'GitHub' })).toBeVisible();
  const pdf = await request.get('/tosinoseni.pdf');
  expect(pdf.ok()).toBeTruthy();
  expect((await pdf.body()).subarray(0, 4).toString()).toBe('%PDF');
  expect(errors).toEqual([]);
});


test('home shows company icons, an email line, and share metadata', async ({ page, request }) => {
  await page.goto('/');
  await expect(page.locator('section[aria-labelledby="experience"] img')).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'tosineoseni@gmail.com' })).toHaveAttribute('href', 'mailto:tosineoseni@gmail.com');
  await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', 'https://tosinoseni.com/og.png');
  const person = JSON.parse(await page.locator('script[type="application/ld+json"]').innerHTML());
  expect(person['@type']).toBe('Person');
  expect(person.sameAs).toHaveLength(2);
  const image = await request.get('/og.png');
  expect(image.ok()).toBeTruthy();
});

test('unknown pages show a noindex 404 with a way home', async ({ page }) => {
  const response = await page.goto('/does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Lost.' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex');
  await page.getByRole('link', { name: '← Back home' }).click();
  await expect(page).toHaveURL('/');
});

test('mobile and desktop layouts have no horizontal overflow', async ({ page }) => {
  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: width === 1440 ? 1100 : 844 });
    for (const path of ['/', '/elsewhere/']) {
      await page.goto(path);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
      if (path === '/') await page.locator('section[aria-labelledby="experience"]').screenshot({ path: `test-results/experience-${width}.png` });
    }
  }
  await page.goto('/');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'test-results/home-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: 'test-results/home-mobile.png', fullPage: true });
});

test('content and links work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await expect(page.getByRole('heading', { name: 'Along the way' })).toBeVisible();

  await expect(page.getByRole('button', { name: 'Play Stack Snake' })).toBeHidden();
  await page.getByRole('link', { name: 'elsewhere' }).click();
  await expect(page.getByRole('link', { name: /Résumé/ })).toBeVisible();
  await context.close();
});

test('Stack Snake plays in a modal and links back to projects after a collision', async ({ page }) => {
  await page.goto('/elsewhere/');
  await page.getByRole('button', { name: 'Play Stack Snake' }).click();
  const game = page.getByRole('dialog', { name: 'Stack Snake.' });
  await expect(game).toBeVisible();
  await expect(game.getByText('Ready to build?')).toBeVisible();
  await game.screenshot({ path: 'test-results/stack-snake-desktop.png' });
  await game.getByRole('button', { name: 'Start game' }).click();
  await page.keyboard.press('Space');
  await expect(game.getByText('Paused.')).toBeVisible();
  await game.getByRole('button', { name: 'Resume game' }).click();
  await expect(game.getByText('BUILD FAILED')).toBeVisible({ timeout: 5000 });
  await expect(game.getByRole('button', { name: 'Run Again' })).toBeVisible();
  await game.getByRole('link', { name: 'See what I actually built with these →' }).click();
  await expect(game).toBeHidden();
  await expect(page).toHaveURL(/#projects$/);
});

test('Stack Snake fits a narrow touch viewport', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 320, height: 700 }, hasTouch: true, isMobile: true });
  const page = await context.newPage();
  await page.goto('/elsewhere/');
  await page.getByRole('button', { name: 'Play Stack Snake' }).click();
  const game = page.getByRole('dialog', { name: 'Stack Snake.' });
  await expect(game).toBeVisible();
  await expect(game.getByRole('button', { name: 'Move up' })).toBeVisible();
  await game.screenshot({ path: 'test-results/stack-snake-mobile.png' });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await game.getByRole('button', { name: 'Close Stack Snake' }).click();
  await expect(game).toBeHidden();
  await context.close();
});

test('the home page has no game or teaser, even after a minute', async ({ page }) => {
  await page.clock.install();
  await page.goto('/');
  await page.clock.fastForward(60_000);
  await expect(page.locator('#snake-teaser')).toHaveCount(0);
  await expect(page.locator('#stack-snake')).toHaveCount(0);
  await page.goto('/elsewhere/');
  await expect(page.getByRole('button', { name: 'Play Stack Snake' })).toBeVisible();
});

test('Space activates game buttons and pauses only when playing from the board', async ({ page }) => {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto('/elsewhere/');
  await page.getByRole('button', { name: 'Play Stack Snake' }).click();
  const game = page.getByRole('dialog');
  const board = page.locator('#snake-board');
  await expect(game.getByRole('button', { name: 'Start game' })).toBeFocused();
  await page.keyboard.press('Space');
  await expect(page.locator('#snake-overlay')).toBeHidden();
  await expect(board).toBeFocused();
  await page.keyboard.press('Space');
  await expect(game.getByText('Paused.')).toBeVisible();
  await game.getByRole('button', { name: 'Resume game' }).focus();
  await page.keyboard.press('Space');
  await expect(board).toBeFocused();
  await page.clock.runFor(2200);
  await expect(game.getByText('BUILD FAILED')).toBeVisible();
  await game.getByRole('button', { name: 'Run Again' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('#snake-overlay')).toBeHidden();
  await game.getByRole('button', { name: 'Close Stack Snake' }).focus();
  await page.keyboard.press('Space');
  await expect(game).toBeHidden();
});

test('an unchanged direction does not consume the next turn', async ({ page }) => {
  await page.clock.install({ time: 0 });
  await page.clock.pauseAt(1000);
  await page.goto('/elsewhere/');
  await page.getByRole('button', { name: 'Play Stack Snake' }).click();
  await page.getByRole('button', { name: 'Start game' }).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowUp');
  await page.clock.runFor(180);
  await expect(page.locator('#snake-board .snake-cell').nth(4 * 18 + 7)).toHaveClass(/snake-head/);
});
