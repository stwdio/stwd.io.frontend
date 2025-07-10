import { Page, expect } from '@playwright/test';
import { TEST_USERS } from '../fixtures/test-data';

export class AuthHelpers {
  constructor(private page: Page) {}

  async login(userType: keyof typeof TEST_USERS = 'CREATOR') {
    const user = TEST_USERS[userType];
    
    // Navigate to login page
    await this.page.goto('/auth/login');
    
    // Wait for login form to be visible
    await expect(this.page.getByRole('textbox', { name: /email/i })).toBeVisible();
    
    // Fill in credentials
    await this.page.getByRole('textbox', { name: /email/i }).fill(user.email);
    await this.page.getByRole('textbox', { name: /password/i }).fill(user.password);
    
    // Submit login form
    await this.page.getByRole('button', { name: 'Sign in', exact: true }).click();
    
    // Wait for successful login (should redirect away from login page)
    await this.page.waitForURL((url) => !url.pathname.includes('/auth/login'), {
      timeout: 15000
    });
    
    return user;
  }

  async logout() {
    // Look for user avatar or profile menu
    const userMenu = this.page.getByRole('button').filter({ 
      hasText: /avatar|profile|claude/i 
    }).first();
    
    if (await userMenu.isVisible()) {
      await userMenu.click();
      
      // Look for logout option
      const logoutButton = this.page.getByRole('menuitem', { name: /logout|sign out/i });
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
      }
    }
    
    // Alternative: Clear browser storage manually
    await this.page.context().clearCookies();
    await this.page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Verify logout by checking if we're redirected to login
    await this.page.goto('/');
    await this.page.waitForTimeout(2000);
  }

  async waitForAuthStateResolution(timeoutMs = 8000) {
    // Wait for either the loading spinner to disappear or content to load
    try {
      await this.page.waitForSelector('.animate-spin', { 
        state: 'detached', 
        timeout: timeoutMs 
      });
    } catch {
      // Loading spinner might not be present, continue
    }
    
    // Wait for any major page content to be stable
    await this.page.waitForLoadState('networkidle', { timeout: 5000 });
  }

  async expectToBeLoggedIn() {
    // Should not be on auth pages
    await expect(this.page.url()).not.toContain('/auth/login');
    
    // Should see user avatar or authenticated content
    await expect(
      this.page.getByRole('button').filter({ hasText: /avatar|claude/i }).first()
    ).toBeVisible({ timeout: 10000 });
  }

  async expectToBeLoggedOut() {
    // Should be able to access login page without redirect
    await this.page.goto('/auth/login');
    await expect(this.page.getByRole('textbox', { name: /email/i })).toBeVisible();
  }

  async expectOnboardingRequired() {
    await expect(this.page.url()).toContain('/onboarding');
    await expect(this.page.getByText(/what are you here to do/i)).toBeVisible();
  }

  async completeOnboarding(role: 'creator' | 'owner' = 'creator') {
    await expect(this.page.url()).toContain('/onboarding');
    
    if (role === 'creator') {
      await this.page.getByRole('button', { name: /continue as creator/i }).click();
    } else {
      await this.page.getByRole('button', { name: /continue as studio owner/i }).click();
    }
    
    // Wait for redirect after role selection
    await this.page.waitForURL((url) => !url.pathname.includes('/onboarding'), {
      timeout: 10000
    });
  }
}