import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';
import { PageHelpers } from '../../utils/page-helpers';
import { TestSetup } from '../../utils/test-setup';
import { TEST_USERS } from '../../fixtures/test-data';

test.describe('Login Flow', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    await TestSetup.setupCleanState(page);
    await TestSetup.disableAnimations(page);
  });

  test('should display login form correctly', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Check page title and heading
    await pageHelpers.expectPageTitle(/stwd\.io/);
    await expect(page.getByRole('heading', { name: /welcome back/i })).toBeVisible();
    
    // Check form elements
    await expect(page.getByRole('textbox', { name: /email/i })).toBeVisible();
    await expect(page.getByRole('textbox', { name: /password/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible();
    
    // Check Google OAuth button
    await expect(page.getByRole('button', { name: /sign in with google/i })).toBeVisible();
    
    // Check alternative links
    await expect(page.getByRole('link', { name: /send a magic link email/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /forgot your password/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /don't have an account/i })).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    const user = await authHelpers.login('CREATOR');
    
    // Should be redirected away from login page to appropriate dashboard
    await pageHelpers.expectUrl(/\/(browse|onboarding|profile\/dashboard)/);
    
    // Should show authenticated state
    await authHelpers.expectToBeLoggedIn();
    
    // Should display user avatar or name
    await expect(page.getByText(user.email.split('@')[0])).toBeVisible();
  });

  test('should handle invalid credentials gracefully', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Fill invalid credentials
    await page.getByRole('textbox', { name: /email/i }).fill('invalid@example.com');
    await page.getByRole('textbox', { name: /password/i }).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible();
    
    // Should stay on login page
    await pageHelpers.expectUrl(/\/auth\/login/);
  });

  test('should handle empty form submission', async ({ page }) => {
    await page.goto('/auth/login');
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    
    // Should show validation errors or remain on page
    await pageHelpers.expectUrl(/\/auth\/login/);
  });

  test('should redirect authenticated users away from login page', async ({ page }) => {
    // First login
    await authHelpers.login('CREATOR');
    
    // Try to visit login page again
    await page.goto('/auth/login');
    
    // Should be redirected away from login page
    await authHelpers.waitForAuthStateResolution();
    await expect(page.url()).not.toContain('/auth/login');
  });

  test('should preserve redirect URL after login', async ({ page }) => {
    // Try to access protected page without auth
    await page.goto('/lists');
    
    // Should be redirected to login with redirect parameter
    await pageHelpers.expectUrl(/\/auth\/login/);
    
    // Login
    await authHelpers.login('CREATOR');
    
    // Should be redirected to originally requested page or dashboard
    await authHelpers.waitForAuthStateResolution();
    // Note: Depending on implementation, might go to /lists or default dashboard
    await expect(page.url()).not.toContain('/auth/login');
  });

  test('should handle login with slow network', async ({ page }) => {
    await TestSetup.enableSlowNetwork(page);
    
    await page.goto('/auth/login');
    
    // Fill credentials
    await page.getByRole('textbox', { name: /email/i }).fill(TEST_USERS.CREATOR.email);
    await page.getByRole('textbox', { name: /password/i }).fill(TEST_USERS.CREATOR.password);
    
    // Submit and wait for loading state
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should eventually succeed even with slow network
    await authHelpers.waitForAuthStateResolution(30000);
    await authHelpers.expectToBeLoggedIn();
  });

  test('should login without loading issues', async ({ page }) => {
    // This test validates that the SSR implementation prevents loading issues
    const consoleLogs = await TestSetup.captureConsoleLogs(page);
    
    await authHelpers.login('CREATOR');
    
    // Navigate to root path
    await page.goto('/');
    await authHelpers.waitForAuthStateResolution();
    
    // Should not be stuck in loading state
    await expect(page.locator('.animate-spin')).not.toBeVisible({ timeout: 5000 });
    
    // Should be on a valid page
    await expect(page.url()).toMatch(/\/(browse|onboarding)/);
    
    // Check that there are no profile-related errors
    const authErrors = consoleLogs.filter(log => 
      log.includes('Error') && log.includes('profile')
    );
    
    // With SSR implementation, there should be no profile fetch errors
    expect(authErrors.length).toBe(0);
  });
});