import { Page, BrowserContext } from '@playwright/test';

export class TestSetup {
  static async setupCleanState(page: Page) {
    // Navigate to a page first to ensure we have a document context
    await page.goto('/');
    
    // Clear all storage
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    // Set viewport for consistent testing
    await page.setViewportSize({ width: 1280, height: 720 });
    
    // Set geolocation for location-based features
    await page.context().setGeolocation({ latitude: 34.0522, longitude: -118.2437 }); // Los Angeles
    
    // Grant necessary permissions
    await page.context().grantPermissions(['geolocation']);
  }

  static async setupMockResponses(page: Page) {
    // Mock external API calls if needed
    await page.route('**/api/external/**', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ mocked: true })
      });
    });
  }

  static async disableAnimations(page: Page) {
    // Disable CSS animations for faster, more reliable tests
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          transition-delay: 0s !important;
        }
      `
    });
  }

  static async enableSlowNetwork(page: Page) {
    // Simulate slow network for testing loading states
    const client = await page.context().newCDPSession(page);
    await client.send('Network.emulateNetworkConditions', {
      offline: false,
      downloadThroughput: 500 * 1024, // 500kb/s
      uploadThroughput: 500 * 1024,
      latency: 100
    });
  }

  static async captureConsoleLogs(page: Page): Promise<string[]> {
    const logs: string[] = [];
    
    page.on('console', msg => {
      logs.push(`${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', err => {
      logs.push(`ERROR: ${err.message}`);
    });
    
    return logs;
  }

  static async waitForHydration(page: Page) {
    // Wait for React hydration to complete
    await page.waitForFunction(() => {
      return window.document.readyState === 'complete';
    });
    
    // Additional wait for any client-side rendering
    await page.waitForTimeout(1000);
  }
}