import { Page, expect } from '@playwright/test';

export class PageHelpers {
  constructor(private page: Page) {}

  async waitForPageLoad(url?: string) {
    if (url) {
      await this.page.goto(url);
    }
    await this.page.waitForLoadState('networkidle');
    
    // Wait for any loading spinners to disappear
    try {
      await this.page.waitForSelector('.animate-spin', { 
        state: 'detached', 
        timeout: 10000 
      });
    } catch {
      // Loading spinner might not be present
    }
  }

  async expectPageTitle(title: string | RegExp) {
    await expect(this.page).toHaveTitle(title);
  }

  async expectUrl(url: string | RegExp) {
    await expect(this.page).toHaveURL(url);
  }

  async expectElementVisible(selector: string) {
    await expect(this.page.locator(selector)).toBeVisible();
  }

  async expectElementNotVisible(selector: string) {
    await expect(this.page.locator(selector)).not.toBeVisible();
  }

  async expectElementText(selector: string, text: string | RegExp) {
    await expect(this.page.locator(selector)).toHaveText(text);
  }

  async clickByText(text: string | RegExp) {
    await this.page.getByText(text).click();
  }

  async clickByRole(role: string, options?: { name?: string | RegExp }) {
    await this.page.getByRole(role as any, options).click();
  }

  async fillInput(label: string | RegExp, value: string) {
    await this.page.getByLabel(label).fill(value);
  }

  async selectOption(label: string | RegExp, value: string) {
    await this.page.getByLabel(label).selectOption(value);
  }

  async uploadFile(selector: string, filePath: string) {
    await this.page.setInputFiles(selector, filePath);
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ 
      path: `test-results/screenshots/${name}.png`,
      fullPage: true 
    });
  }

  async scrollToElement(selector: string) {
    await this.page.locator(selector).scrollIntoViewIfNeeded();
  }

  async waitForElement(selector: string, state: 'visible' | 'hidden' | 'attached' | 'detached' = 'visible') {
    await this.page.waitForSelector(selector, { state });
  }

  async getElementCount(selector: string): Promise<number> {
    return await this.page.locator(selector).count();
  }

  async getAllElementTexts(selector: string): Promise<string[]> {
    return await this.page.locator(selector).allTextContents();
  }

  async isElementVisible(selector: string): Promise<boolean> {
    try {
      await this.page.waitForSelector(selector, { state: 'visible', timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  async waitForNavigation(urlPattern?: string | RegExp) {
    if (urlPattern) {
      await this.page.waitForURL(urlPattern);
    } else {
      await this.page.waitForLoadState('networkidle');
    }
  }
}