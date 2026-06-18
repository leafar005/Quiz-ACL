const { test, expect } = require('@playwright/test');

test.describe('Global Quiz Flow', () => {

  test('Select 10 questions and complete a short quiz', async ({ page }) => {
    await page.goto('/');
    
    // Select 10 questions in the dropdown
    await page.selectOption('#global-num', '10');
    
    // Start global quiz
    await page.locator('a#global-link').click();
    
    // Ensure we are in the quiz
    await expect(page.locator('#quiz-screen')).toBeVisible();
    
    // Verify quit button works
    const btnQuit = page.locator('#btn-quit');
    await expect(btnQuit).toBeVisible();
    
    // We expect exactly 10 questions
    // In the quiz, we will loop 10 times to answer
    for (let i = 0; i < 10; i++) {
      // Wait for question to be rendered
      await expect(page.locator('.question-text')).toBeVisible();
      
      // Submit answer by clicking option
      const firstOption = page.locator('.option-btn').first();
      await firstOption.click();
      
      // Wait for feedback to appear
      await expect(page.locator('#justification-panel')).not.toHaveClass(/hidden/);
      
      // Click next or finish
      if (i < 9) {
        await page.locator('#btn-next').click();
      } else {
        await page.locator('#btn-next').click(); // Actually 'Ver Resultados'
      }
    }
    
    // Should be on results screen
    await expect(page.locator('#results-screen')).toBeVisible();
    
    // Verify score appears
    await expect(page.locator('#results-pct')).toBeVisible();
    
    // Click Home to return
    await page.locator('#btn-home').click();
    await expect(page.locator('h1').first()).toHaveText('Portal de Encuestas ACL');
  });

  test('Quit halfway through', async ({ page }) => {
    await page.goto('/quiz-global/index.html?num=10');
    
    // Answer one question
    await expect(page.locator('.question-text')).toBeVisible();
    await page.locator('.option-btn').first().click();
    await page.locator('#btn-next').click();
    
    // Quit
    page.on('dialog', dialog => dialog.accept());
    await page.locator('#btn-quit').click();
    
    // Should be back at portal
    await expect(page.locator('h1').first()).toHaveText('Portal de Encuestas ACL');
  });
});
