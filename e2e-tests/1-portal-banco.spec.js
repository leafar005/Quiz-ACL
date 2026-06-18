const { test, expect } = require('@playwright/test');

test.describe('Portal & Banco de Preguntas', () => {

  test('Main portal loads all menus correctly', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1').first()).toHaveText('Portal de Encuestas ACL');
    const cards = page.locator('.quiz-card');
    await expect(cards).toHaveCount(6);
  });

  test('Banco de Preguntas functionality', async ({ page }) => {
    await page.goto('/banco-preguntas/index.html');
    await expect(page.locator('h1').first()).toHaveText('Banco de Preguntas');
    const backBtn = page.locator('.back-to-portal');
    await expect(backBtn).toHaveText('← Volver al portal');
    
    // TOC should exist
    const tocModules = page.locator('.toc-module-group');
    await expect(tocModules).toHaveCount(4);
    
    // Wait for JS to render questions
    await page.waitForTimeout(500);
    const questions = page.locator('.question-card');
    const initialCount = await questions.count();
    expect(initialCount).toBeGreaterThan(100);
    
    // Test search filter
    await page.fill('#search-input', 'auditoría');
    await page.waitForTimeout(500); // Wait for debounce/render
    const visibleCards = page.locator('.question-card:visible');
    const filteredCount = await visibleCards.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThan(initialCount);
    
    // Each question should display its options
    const firstVisibleCard = visibleCards.first();
    const correctOption = firstVisibleCard.locator('.option-item.correct');
    await expect(correctOption).toBeVisible();
  });
});
