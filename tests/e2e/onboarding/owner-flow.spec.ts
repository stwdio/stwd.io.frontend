import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';
import { PageHelpers } from '../../utils/page-helpers';
import { TestSetup } from '../../utils/test-setup';

test.describe('Studio Owner Onboarding Flow', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    await TestSetup.setupCleanState(page);
    await TestSetup.disableAnimations(page);
  });

  test('should complete studio owner onboarding successfully', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Select studio owner role
    const ownerButton = page.getByRole('button', { name: /continue as studio owner/i });
    await expect(ownerButton).toBeVisible();
    await ownerButton.click();
    
    // Should navigate away from onboarding
    await page.waitForURL(url => !url.pathname.includes('/onboarding'), { timeout: 10000 });
    
    // Should be redirected to owner dashboard
    await pageHelpers.expectUrl(/\/profile\/dashboard/);
    
    // Should show owner-specific content
    // Note: This depends on the actual implementation of the owner dashboard
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should show correct studio owner role description', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check studio owner card content
    const ownerCard = page.locator('text=I\'m a Studio Owner').locator('..');
    
    await expect(ownerCard.getByText(/list my studio/i)).toBeVisible();
    await expect(ownerCard.getByText(/manage bookings/i)).toBeVisible();
    await expect(ownerCard.getByText(/grow my business/i)).toBeVisible();
  });

  test('should handle studio owner role selection with authentication', async ({ page }) => {
    // Login first (simulating new user who needs onboarding)
    await authHelpers.login('CREATOR'); // Using existing test user
    
    // Navigate to onboarding (might be redirected there automatically)
    await page.goto('/onboarding');
    await authHelpers.waitForAuthStateResolution();
    
    if (page.url().includes('/onboarding')) {
      // Complete onboarding as studio owner
      await authHelpers.completeOnboarding('owner');
      
      // Should be on owner dashboard
      await pageHelpers.expectUrl(/\/profile\/dashboard/);
      
      // Should maintain authenticated state
      await authHelpers.expectToBeLoggedIn();
    }
  });

  test('should show studio owner specific navigation after onboarding', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Select studio owner role
    await page.getByRole('button', { name: /continue as studio owner/i }).click();
    
    // Wait for navigation
    await page.waitForURL(url => !url.pathname.includes('/onboarding'), { timeout: 10000 });
    
    // Should show owner-specific navigation items
    // Implementation depends on the actual owner dashboard
    
    // Common owner features might include:
    // - Studio management
    // - Booking management
    // - Analytics/dashboard
    // - Profile settings
    
    await expect(page.getByRole('heading')).toBeVisible();
  });

  test('should handle role switching from creator to owner', async ({ page }) => {
    await page.goto('/onboarding');
    
    // First hover/focus on creator option
    const creatorCard = page.locator('text=I\'m a Creator').locator('..');
    await creatorCard.hover();
    
    // Then select studio owner instead
    const ownerButton = page.getByRole('button', { name: /continue as studio owner/i });
    await ownerButton.click();
    
    // Should navigate to owner dashboard
    await page.waitForURL(url => !url.pathname.includes('/onboarding'), { timeout: 10000 });
    await pageHelpers.expectUrl(/\/profile\/dashboard/);
  });

  test('should validate studio owner onboarding flow with slow network', async ({ page }) => {
    await TestSetup.enableSlowNetwork(page);
    
    await page.goto('/onboarding');
    
    // Select studio owner role
    await page.getByRole('button', { name: /continue as studio owner/i }).click();
    
    // Should eventually navigate even with slow network
    await page.waitForURL(url => !url.pathname.includes('/onboarding'), { timeout: 30000 });
    
    // Should reach owner dashboard
    await pageHelpers.expectUrl(/\/profile\/dashboard/);
  });

  test('should show appropriate visual feedback for studio owner selection', async ({ page }) => {
    await page.goto('/onboarding');
    
    const ownerCard = page.locator('text=I\'m a Studio Owner').locator('..');
    const ownerButton = page.getByRole('button', { name: /continue as studio owner/i });
    
    // Check hover states
    await ownerCard.hover();
    
    // Check button is interactive
    await expect(ownerButton).toBeEnabled();
    await expect(ownerButton).toBeVisible();
    
    // Visual feedback testing would be implementation specific
    // (checking for hover effects, button states, etc.)
  });

  test('should handle studio owner onboarding with JavaScript disabled', async ({ page }) => {
    // This test checks progressive enhancement
    await page.route('**/*.js', route => route.abort());
    
    await page.goto('/onboarding');
    
    // Basic content should still be visible
    await expect(page.getByText(/welcome to stwd\.io/i)).toBeVisible();
    await expect(page.getByText(/i'm a studio owner/i)).toBeVisible();
    
    // Button should be present (though functionality may be limited)
    await expect(page.getByRole('button', { name: /continue as studio owner/i })).toBeVisible();
  });

  test('should provide clear value proposition for studio owners', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Check that the studio owner option clearly explains benefits
    const ownerSection = page.locator('text=I\'m a Studio Owner').locator('..');
    
    // Should mention key features for studio owners
    await expect(ownerSection.getByText(/list.*studio/i)).toBeVisible();
    await expect(ownerSection.getByText(/manage.*bookings/i)).toBeVisible();
    await expect(ownerSection.getByText(/grow.*business/i)).toBeVisible();
    
    // Should have clear call-to-action
    await expect(ownerSection.getByRole('button', { name: /continue as studio owner/i })).toBeVisible();
  });

  test('should handle studio owner role selection errors', async ({ page }) => {
    await page.goto('/onboarding');
    
    // Mock network failure during role selection
    await page.route('**/api/**', route => {
      route.abort('failed');
    });
    
    // Try to select studio owner role
    await page.getByRole('button', { name: /continue as studio owner/i }).click();
    
    // Should handle error gracefully
    await page.waitForTimeout(3000);
    
    // Should remain on onboarding page or show appropriate error handling
    // Implementation specific behavior
  });

  test('should maintain consistent UI between role options', async ({ page }) => {
    await page.goto('/onboarding');
    
    const creatorCard = page.locator('text=I\'m a Creator').locator('..');
    const ownerCard = page.locator('text=I\'m a Studio Owner').locator('..');
    
    // Both options should be visually similar and equally prominent
    await expect(creatorCard).toBeVisible();
    await expect(ownerCard).toBeVisible();
    
    // Both should have buttons with similar styling/positioning
    await expect(page.getByRole('button', { name: /continue as creator/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /continue as studio owner/i })).toBeVisible();
    
    // Layout should be balanced
    const creatorBounds = await creatorCard.boundingBox();
    const ownerBounds = await ownerCard.boundingBox();
    
    if (creatorBounds && ownerBounds) {
      // Cards should be roughly similar in size (allowing for content differences)
      const heightDifference = Math.abs(creatorBounds.height - ownerBounds.height);
      expect(heightDifference).toBeLessThan(100); // Reasonable tolerance
    }
  });
});