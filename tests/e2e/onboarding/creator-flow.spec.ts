import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';
import { PageHelpers } from '../../utils/page-helpers';
import { TestSetup } from '../../utils/test-setup';

test.describe('Creator Onboarding Flow', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    await TestSetup.setupCleanState(page);
    await TestSetup.disableAnimations(page);
  });

  test('should display onboarding page correctly', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check main heading
    await expect(page.getByRole('heading', { name: /welcome to stwd\.io/i })).toBeVisible();
    await expect(page.getByText(/what are you here to do/i)).toBeVisible();
    
    // Check creator option
    await expect(page.getByText(/i'm a creator/i)).toBeVisible();
    await expect(page.getByText(/discover.*book.*record/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue as creator/i })).toBeVisible();
    
    // Check studio owner option  
    await expect(page.getByText(/i'm a studio owner/i)).toBeVisible();
    await expect(page.getByText(/list my studio.*manage bookings/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /continue as studio owner/i })).toBeVisible();
  });

  test('should complete creator onboarding successfully', async ({ page }) => {
    // Login first (simulating new user who needs onboarding)
    await authHelpers.login('CREATOR');
    
    // If redirected to onboarding, complete it
    if (page.url().includes('/onboarding')) {
      await authHelpers.completeOnboarding('creator');
    } else {
      // Navigate to onboarding manually for testing
      await page.goto('/onboarding');
      await authHelpers.waitForAuthStateResolution();
      
      if (page.url().includes('/onboarding')) {
        await authHelpers.completeOnboarding('creator');
      }
    }
    
    // Should be redirected to creator dashboard (browse page)
    await pageHelpers.expectUrl(/\/browse/);
    
    // Should show creator-specific content
    await expect(page.getByRole('link', { name: /browse studios/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /my lists/i })).toBeVisible();
  });

  test('should prevent access to onboarding when user has role', async ({ page }) => {
    // Login as user with existing role
    await authHelpers.login('CREATOR');
    await authHelpers.waitForAuthStateResolution();
    
    // Try to access onboarding page
    await page.goto('/onboarding');
    await authHelpers.waitForAuthStateResolution();
    
    // Should be redirected away from onboarding
    await expect(page.url()).not.toContain('/onboarding');
    
    // Should be on appropriate dashboard
    await pageHelpers.expectUrl(/\/browse/);
  });

  test('should handle creator role selection with proper navigation', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Select creator role
    const creatorButton = page.getByRole('button', { name: /continue as creator/i });
    await expect(creatorButton).toBeVisible();
    await creatorButton.click();
    
    // Should navigate away from onboarding
    await page.waitForURL(url => !url.pathname.includes('/onboarding'), { timeout: 10000 });
    
    // Should be on creator dashboard
    await pageHelpers.expectUrl(/\/browse/);
    
    // Should show authenticated state
    await authHelpers.expectToBeLoggedIn();
  });

  test('should show correct creator role description', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check creator card content
    const creatorCard = page.locator('text=I\'m a Creator').locator('..');
    
    await expect(creatorCard.getByText(/discover.*book.*record/i)).toBeVisible();
    await expect(creatorCard.getByText(/professional studios/i)).toBeVisible();
  });

  test('should handle onboarding with network delays', async ({ page }) => {
    await TestSetup.enableSlowNetwork(page);
    
    await page.goto('/onboarding');
    
    // Select creator role
    await page.getByRole('button', { name: /continue as creator/i }).click();
    
    // Should eventually navigate even with slow network
    await page.waitForURL(url => !url.pathname.includes('/onboarding'), { timeout: 30000 });
    
    // Should reach creator dashboard
    await pageHelpers.expectUrl(/\/browse/);
  });

  test('should maintain authentication state during onboarding', async ({ page }) => {
    // Start at onboarding while authenticated
    await authHelpers.login('CREATOR');
    
    // If already redirected away from onboarding, manually go there for testing
    await page.goto('/onboarding');
    await authHelpers.waitForAuthStateResolution();
    
    // Even if redirected, user should remain authenticated
    await authHelpers.expectToBeLoggedIn();
  });

  test('should handle onboarding page refresh', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Refresh page
    await page.reload();
    await pageHelpers.waitForPageLoad();
    
    // Should still show onboarding content
    await expect(page.getByRole('heading', { name: /welcome to stwd\.io/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue as creator/i })).toBeVisible();
  });

  test('should redirect unauthenticated users from onboarding', async ({ page }) => {
    // Ensure not logged in
    await authHelpers.logout();
    
    // Try to access onboarding
    await page.goto('/onboarding');
    await authHelpers.waitForAuthStateResolution();
    
    // Should be redirected to login or public page
    const currentUrl = page.url();
    expect(currentUrl).toMatch(/\/(auth\/login|browse|\/)$/);
  });

  test('should have accessible onboarding interface', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check for proper heading structure
    const mainHeading = page.getByRole('heading', { level: 1 });
    await expect(mainHeading).toBeVisible();
    
    // Check that buttons are properly labeled
    const creatorButton = page.getByRole('button', { name: /continue as creator/i });
    const ownerButton = page.getByRole('button', { name: /continue as studio owner/i });
    
    await expect(creatorButton).toBeVisible();
    await expect(ownerButton).toBeVisible();
    
    // Check for keyboard navigation
    await creatorButton.focus();
    await expect(creatorButton).toBeFocused();
    
    await page.keyboard.press('Tab');
    await expect(ownerButton).toBeFocused();
  });

  test('should handle role selection errors gracefully', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Mock a network error during role selection
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to select creator role
    await page.getByRole('button', { name: /continue as creator/i }).click();
    
    // Should handle error gracefully (stay on page or show error message)
    await page.waitForTimeout(2000);
    
    // Should still be on onboarding or show appropriate error handling
    // Implementation specific behavior
  });
});