import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';
import { PageHelpers } from '../../utils/page-helpers';
import { TestSetup } from '../../utils/test-setup';
import { TEST_NAVIGATION_ROUTES } from '../../fixtures/test-data';

test.describe('Navigation and Routing', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    await TestSetup.setupCleanState(page);
    await TestSetup.disableAnimations(page);
  });

  test.describe('Public Routes', () => {
    for (const route of TEST_NAVIGATION_ROUTES.PUBLIC) {
      test(`should access public route: ${route}`, async ({ page }) => {
        await page.goto(route);
        await pageHelpers.waitForPageLoad();
        
        // Should load without redirect - except for /auth/login which should stay on login
        if (route === '/auth/login') {
          await expect(page.url()).toContain('/auth/login');
        } else {
          await expect(page.url()).not.toContain('/auth/login');
        }
        
        // Should show public content
        await pageHelpers.expectPageTitle(/stwd\.io/);
      });
    }
  });

  test.describe('Protected Routes - Unauthenticated', () => {
    for (const route of TEST_NAVIGATION_ROUTES.PROTECTED) {
      test(`should redirect to login for protected route: ${route}`, async ({ page }) => {
        await page.goto(route);
        await authHelpers.waitForAuthStateResolution();
        
        // Should be redirected to login or public page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(auth\/login|browse|\/)$/);
      });
    }
  });

  test.describe('Protected Routes - Authenticated', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login('CREATOR');
    });

    test('should access /lists when authenticated', async ({ page }) => {
      await page.goto('/lists');
      await authHelpers.waitForAuthStateResolution();
      
      // Should either access lists or redirect to browse (depending on implementation)
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(lists|browse)$/);
    });

    test('should redirect away from auth pages when authenticated', async ({ page }) => {
      await page.goto('/auth/login');
      await authHelpers.waitForAuthStateResolution();
      
      // Should be redirected away from login page
      await expect(page.url()).not.toContain('/auth/login');
    });
  });

  test.describe('Root Path Navigation (Fixed Infinite Loading)', () => {
    test('should handle root path navigation while logged in', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Navigate to root path - this was the problematic area
      await page.goto('/');
      await authHelpers.waitForAuthStateResolution();
      
      // Should not be stuck in infinite loading
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 15000 });
      
      // Should redirect to appropriate page
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(browse|onboarding)/);
    });

    test('should handle multiple rapid navigations to root path', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Rapidly navigate to root multiple times
      for (let i = 0; i < 3; i++) {
        await page.goto('/');
        await page.waitForTimeout(1000);
      }
      
      await authHelpers.waitForAuthStateResolution();
      
      // Should not be stuck and should be on valid page
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 15000 });
      await expect(page.url()).toMatch(/\/(browse|onboarding)/);
    });
  });

  test.describe('Navigation Menu', () => {
    test.beforeEach(async ({ page }) => {
      await authHelpers.login('CREATOR');
    });

    test('should show correct navigation items for creator', async ({ page }) => {
      await page.goto('/browse');
      await authHelpers.waitForAuthStateResolution();
      
      // Should show creator-specific navigation
      await expect(page.getByRole('link', { name: /browse studios/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /my lists/i })).toBeVisible();
      
      // Should show user avatar/profile
      await expect(page.getByRole('button').filter({ hasText: /avatar|claude/i })).toBeVisible();
    });

    test('should navigate between main sections', async ({ page }) => {
      await page.goto('/browse');
      await authHelpers.waitForAuthStateResolution();
      
      // Navigate to My Lists
      await page.getByRole('link', { name: /my lists/i }).click();
      await authHelpers.waitForAuthStateResolution();
      
      // Should be on lists page or redirected appropriately
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(lists|browse)$/);
      
      // Navigate back to Browse Studios
      await page.getByRole('link', { name: /browse studios/i }).click();
      await pageHelpers.expectUrl(/\/browse/);
    });
  });

  test.describe('URL History and Back Navigation', () => {
    test('should handle browser back/forward navigation', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Navigate to browse page
      await page.goto('/browse');
      await authHelpers.waitForAuthStateResolution();
      
      // Navigate to root
      await page.goto('/');
      await authHelpers.waitForAuthStateResolution();
      
      // Go back
      await page.goBack();
      await authHelpers.waitForAuthStateResolution();
      
      // Should be back on browse page
      await pageHelpers.expectUrl(/\/browse/);
      
      // Go forward
      await page.goForward();
      await authHelpers.waitForAuthStateResolution();
      
      // Should handle forward navigation without infinite loading
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 10000 });
    });
  });

  test.describe('Page Refresh Handling', () => {
    test('should maintain auth state after page refresh', async ({ page }) => {
      await authHelpers.login('CREATOR');
      await page.goto('/browse');
      
      // Refresh page
      await page.reload();
      await authHelpers.waitForAuthStateResolution();
      
      // Should still be authenticated and on correct page
      await authHelpers.expectToBeLoggedIn();
      await pageHelpers.expectUrl(/\/browse/);
    });

    test('should handle refresh on root path without infinite loading', async ({ page }) => {
      await authHelpers.login('CREATOR');
      await page.goto('/');
      await authHelpers.waitForAuthStateResolution();
      
      // Refresh page
      await page.reload();
      await authHelpers.waitForAuthStateResolution();
      
      // Should not get stuck in infinite loading
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 15000 });
      await expect(page.url()).toMatch(/\/(browse|onboarding)/);
    });
  });
});