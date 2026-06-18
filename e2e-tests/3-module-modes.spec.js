const { test, expect } = require('@playwright/test');

test.describe('Module Modes Flow', () => {

  test('Mode Completo: Loads all questions', async ({ page }) => {
    await page.goto('/quiz-cmmi/index.html');
    
    // Check persistent back button
    const backBtn = page.locator('.back-to-portal');
    await expect(backBtn).toHaveText('← Volver al portal');
    
    // Start Mode Completo
    await page.locator('#btn-mode-all').click();
    await expect(page.locator('#quiz-screen')).toBeVisible();
    
    // Answer one question
    await expect(page.locator('.question-text')).toBeVisible();
    await page.locator('.option-btn').first().click();
    
    // Feedback should show
    await expect(page.locator('#justification-panel')).not.toHaveClass(/hidden/);
    
    // Go Next
    await page.locator('#btn-next').click();
    
  });

  test('Mode Category: Select category and start', async ({ page }) => {
    await page.goto('/quiz-cmmi/index.html');
    
    await page.locator('#btn-mode-category').click();
    
    // Should show category list
    const setupCategory = page.locator('#category-picker');
    await expect(setupCategory).not.toHaveClass(/hidden/);
    
    // Select first category
    await page.locator('.category-btn').first().click();
    
    // Should be in quiz
    await expect(page.locator('#quiz-screen')).toBeVisible();
    await expect(page.locator('.question-text')).toBeVisible();
  });

  test('Mode Random: Short quiz', async ({ page }) => {
    await page.goto('/quiz-cmmi/index.html');
    
    await page.locator('#btn-mode-random').click();
    
    await expect(page.locator('#quiz-screen')).toBeVisible();
    await expect(page.locator('.question-text')).toBeVisible();
    
    // Verify progress info is visible
    await expect(page.locator('.quiz-progress-info')).toBeVisible();
  });
});
