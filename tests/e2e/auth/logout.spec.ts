import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';
import { PageHelpers } from '../../utils/page-helpers';
import { TestSetup } from '../../utils/test-setup';

test.describe('Logout Flow', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    await TestSetup.setupCleanState(page);
    await TestSetup.disableAnimations(page);
  });

  test('should logout successfully from authenticated state', async ({ page }) => {
    // Login first
    await authHelpers.login('CREATOR');
    await authHelpers.expectToBeLoggedIn();
    
    // Logout
    await authHelpers.logout();
    
    // Should be able to access login page
    await authHelpers.expectToBeLoggedOut();
    
    // Should not show authenticated content
    const userAvatar = page.getByRole('button').filter({ hasText: /avatar|claude/i });
    await expect(userAvatar).not.toBeVisible();
  });

  test('should clear authentication state completely', async ({ page }) => {
    // Login first
    await authHelpers.login('CREATOR');
    
    // Verify session exists
    const sessionBefore = await page.evaluate(() => {
      return {
        localStorage: localStorage.length > 0,
        sessionStorage: sessionStorage.length > 0
      };
    });
    
    // Logout
    await authHelpers.logout();
    
    // Verify session is cleared
    const sessionAfter = await page.evaluate(() => {
      return {
        localStorage: localStorage.length,
        sessionStorage: sessionStorage.length
      };
    });
    
    expect(sessionAfter.localStorage).toBe(0);
    expect(sessionAfter.sessionStorage).toBe(0);
  });

  test('should redirect to public page after logout', async ({ page }) => {
    // Login and navigate to protected page
    await authHelpers.login('CREATOR');
    await page.goto('/lists');
    
    // Logout
    await authHelpers.logout();
    
    // Try to access protected page
    await page.goto('/lists');
    
    // Should be redirected to login or public page
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(auth\/login|browse|\/)$/);
  });

  test('should handle logout when already logged out', async ({ page }) => {
    // Start logged out
    await page.goto('/');
    
    // Try logout operation
    await authHelpers.logout();
    
    // Should not cause errors and should still be able to login
    await page.goto('/auth/login');
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
  });

  test('should maintain logout state across page refreshes', async ({ page }) => {
    // Login and logout
    await authHelpers.login('CREATOR');
    await authHelpers.logout();
    
    // Refresh page
    await page.reload();
    await page.waitForLoadState('networkidle');
    
    // Should still be logged out
    await authHelpers.expectToBeLoggedOut();
  });

  test('should logout from all tabs/windows', async ({ context, page }) => {
    // Login in first tab
    await authHelpers.login('CREATOR');
    
    // Open second tab
    const secondPage = await context.newPage();
    const secondAuthHelpers = new AuthHelpers(secondPage);
    
    await secondPage.goto('/');
    await secondAuthHelpers.waitForAuthStateResolution();
    
    // Should be logged in on second tab too
    await secondAuthHelpers.expectToBeLoggedIn();
    
    // Logout from first tab
    await authHelpers.logout();
    
    // Check if second tab is also logged out (may require refresh depending on implementation)
    await secondPage.reload();
    await secondPage.waitForLoadState('networkidle');
    
    // Navigate to login to verify logout state
    await secondPage.goto('/auth/login');
    await expect(secondPage.getByRole('textbox', { name: /email/i })).toBeVisible();
    
    await secondPage.close();
  });
});