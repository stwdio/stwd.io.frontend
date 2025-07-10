import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';
import { PageHelpers } from '../../utils/page-helpers';
import { TestSetup } from '../../utils/test-setup';

test.describe('Protected Routes and Route Guards', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    await TestSetup.setupCleanState(page);
    await TestSetup.disableAnimations(page);
  });

  test.describe('Route Guard Logic', () => {
    test('should block access to protected routes when not authenticated', async ({ page }) => {
      const protectedRoutes = ['/lists', '/profile/dashboard'];
      
      for (const route of protectedRoutes) {
        await page.goto(route);
        await authHelpers.waitForAuthStateResolution();
        
        // Should be redirected away from protected route
        await expect(page.url()).not.toContain(route);
        
        // Should be on login or public page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(auth\/login|browse|\/)$/);
      }
    });

    test('should allow access to protected routes when authenticated', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Try accessing protected route
      await page.goto('/lists');
      await authHelpers.waitForAuthStateResolution();
      
      // Should be authenticated and on appropriate page
      await authHelpers.expectToBeLoggedIn();
      
      // May redirect to /browse for creators, or stay on /lists
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(lists|browse)$/);
    });

    test('should redirect authenticated users away from auth pages', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      const authRoutes = ['/auth/login', '/auth/signup'];
      
      for (const route of authRoutes) {
        await page.goto(route);
        await authHelpers.waitForAuthStateResolution();
        
        // Should be redirected away from auth pages
        await expect(page.url()).not.toContain('/auth');
        
        // Should be on dashboard or appropriate page
        const currentUrl = page.url();
        expect(currentUrl).toMatch(/\/(browse|onboarding|profile)/);
      }
    });
  });

  test.describe('Role-Based Access Control', () => {
    test('should redirect creator to browse page by default', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Navigate to root or dashboard
      await page.goto('/');
      await authHelpers.waitForAuthStateResolution();
      
      // Creator should be directed to browse page
      await pageHelpers.expectUrl(/\/browse/);
    });

    test('should handle user without role (new user)', async ({ page }) => {
      // This test simulates a new user who needs onboarding
      // Note: Might need special test user setup for this
      
      await page.goto('/auth/login');
      
      // For now, we'll test the onboarding redirect logic
      await page.goto('/onboarding');
      await authHelpers.waitForAuthStateResolution();
      
      // Should show onboarding page
      await expect(page.getByText(/what are you here to do/i)).toBeVisible();
    });
  });

  test.describe('Auth State Loading Prevention', () => {
    test('should not show infinite loading on auth state changes', async ({ page }) => {
      const consoleLogs: string[] = [];
      
      page.on('console', msg => {
        consoleLogs.push(`${msg.type()}: ${msg.text()}`);
      });
      
      // Login and navigate to problematic routes
      await authHelpers.login('CREATOR');
      
      const problematicRoutes = ['/', '/auth/login', '/lists'];
      
      for (const route of problematicRoutes) {
        await page.goto(route);
        await authHelpers.waitForAuthStateResolution();
        
        // Should not be stuck in loading state
        await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 15000 });
        
        // Should be on a valid page
        await expect(page.url()).toMatch(/\/(browse|onboarding|auth\/login|profile\/dashboard)$/);
      }
      
      // Check for our timeout mechanism working
      const timeoutLogs = consoleLogs.filter(log => 
        log.includes('Profile fetch timeout') || 
        log.includes('Error in fetchProfile')
      );
      
      // Our timeout fix should handle profile fetch issues gracefully
      console.log('Auth timeout logs (expected with our fix):', timeoutLogs);
    });

    test('should handle rapid route changes without breaking', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Rapidly navigate between routes
      const routes = ['/', '/browse', '/', '/auth/login', '/'];
      
      for (const route of routes) {
        await page.goto(route);
        await page.waitForTimeout(500); // Brief pause between navigations
      }
      
      // Wait for final resolution
      await authHelpers.waitForAuthStateResolution();
      
      // Should not be stuck and should be on a valid page
      await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 15000 });
      await expect(page.url()).toMatch(/\/(browse|onboarding)/);
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain authentication across page reloads', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Navigate to protected route
      await page.goto('/browse');
      await authHelpers.waitForAuthStateResolution();
      
      // Reload page
      await page.reload();
      await authHelpers.waitForAuthStateResolution();
      
      // Should still be authenticated
      await authHelpers.expectToBeLoggedIn();
      await pageHelpers.expectUrl(/\/browse/);
    });

    test('should handle session expiration gracefully', async ({ page }) => {
      await authHelpers.login('CREATOR');
      
      // Clear session storage to simulate expiration
      await page.evaluate(() => {
        sessionStorage.clear();
        localStorage.clear();
      });
      
      // Try to navigate to protected route
      await page.goto('/lists');
      await authHelpers.waitForAuthStateResolution();
      
      // Should handle expired session and redirect appropriately
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(auth\/login|browse|\/)$/);
    });
  });

  test.describe('Error Handling', () => {
    test('should handle network errors during auth checks', async ({ page }) => {
      // Mock network failure
      await page.route('**/auth/**', route => {
        route.abort('failed');
      });
      
      await page.goto('/lists');
      await authHelpers.waitForAuthStateResolution();
      
      // Should handle network error gracefully
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(auth\/login|browse|\/)$/);
    });

    test('should handle malformed auth tokens', async ({ page }) => {
      // Set invalid token
      await page.evaluate(() => {
        localStorage.setItem('supabase.auth.token', 'invalid-token');
      });
      
      await page.goto('/lists');
      await authHelpers.waitForAuthStateResolution();
      
      // Should handle invalid token and redirect to login
      const currentUrl = page.url();
      expect(currentUrl).toMatch(/\/(auth\/login|browse|\/)$/);
    });
  });
});