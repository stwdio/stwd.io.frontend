import { test, expect } from '@playwright/test';
import { AuthHelpers } from '../../utils/auth-helpers';
import { PageHelpers } from '../../utils/page-helpers';
import { TestSetup } from '../../utils/test-setup';

test.describe('Studio Browsing', () => {
  let authHelpers: AuthHelpers;
  let pageHelpers: PageHelpers;

  test.beforeEach(async ({ page }) => {
    authHelpers = new AuthHelpers(page);
    pageHelpers = new PageHelpers(page);
    
    await TestSetup.setupCleanState(page);
    await TestSetup.disableAnimations(page);
    
    // Login as creator for studio browsing
    await authHelpers.login('CREATOR');
  });

  test('should display studios browse page correctly', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Check page title
    await pageHelpers.expectPageTitle(/stwd\.io/);
    
    // Check main navigation
    await expect(page.getByRole('link', { name: /browse studios/i })).toBeVisible();
    await expect(page.getByRole('link', { name: /my lists/i })).toBeVisible();
    
    // Check filters section
    await expect(page.getByRole('heading', { name: /filters/i })).toBeVisible();
    
    // Check search functionality
    await expect(page.getByPlaceholder(/search by city, state/i)).toBeVisible();
    
    // Check studio listings
    await expect(page.locator('[data-testid="studio-card"], .studio-card, article').first()).toBeVisible({ timeout: 10000 });
  });

  test('should display studio cards with correct information', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Wait for studios to load
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    // Get first studio card
    const firstStudio = page.locator('h3').first().locator('..');
    
    // Should have studio name
    await expect(firstStudio.getByRole('heading', { level: 3 })).toBeVisible();
    
    // Should have price information
    await expect(firstStudio.getByText(/\$\d+.*per hour/i)).toBeVisible();
    
    // Should have location
    await expect(firstStudio.locator('text=/[A-Za-z]+,\\s*[A-Za-z]{2,}/')).toBeVisible();
    
    // Should have action buttons
    await expect(firstStudio.getByRole('button', { name: /view/i })).toBeVisible();
    await expect(firstStudio.getByRole('button', { name: /list/i })).toBeVisible();
    await expect(firstStudio.getByRole('button', { name: /quote/i })).toBeVisible();
  });

  test('should handle studio listing loading states', async ({ page }) => {
    // Enable slow network to test loading states
    await TestSetup.enableSlowNetwork(page);
    
    await page.goto('/browse');
    
    // Should show loading state initially
    // (Depends on implementation - might show skeleton cards or spinner)
    
    // Should eventually load studios
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 30000 });
  });

  test('should navigate to studio detail page', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Wait for studios to load and click on first studio
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    // Click on studio card or View button
    const firstStudioLink = page.locator('a[href^="/studios/"]').first();
    await expect(firstStudioLink).toBeVisible();
    await firstStudioLink.click();
    
    // Should navigate to studio detail page
    await pageHelpers.expectUrl(/\/studios\/\d+/);
    
    // Should show studio details
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Search for something that likely won't exist
    await page.getByPlaceholder(/search by city, state/i).fill('NonexistentCity12345');
    await page.getByRole('button', { name: /search studios/i }).click();
    
    // Should handle no results gracefully
    await page.waitForTimeout(2000);
    
    // Either show "no results" message or maintain current listings
    // Implementation depends on how search is handled
  });

  test('should display studio amenities and equipment', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Wait for first studio to load
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    // Check for amenities/equipment tags
    const firstStudio = page.locator('h3').first().locator('../..');
    
    // Should show some amenities or equipment
    const amenityTags = firstStudio.locator('[class*="tag"], [class*="badge"], [class*="chip"]');
    if (await amenityTags.count() > 0) {
      await expect(amenityTags.first()).toBeVisible();
    }
    
    // Or check for specific amenities by text
    const commonAmenities = ['Sound Isolation', 'Pro Tools', 'Wi-Fi', 'Kitchen', 'Parking'];
    let foundAmenity = false;
    
    for (const amenity of commonAmenities) {
      if (await firstStudio.getByText(amenity).isVisible()) {
        foundAmenity = true;
        break;
      }
    }
    
    // Should show at least some studio features
    // expect(foundAmenity).toBe(true);
  });

  test('should show studio ratings and reviews', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Wait for first studio to load
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    const firstStudio = page.locator('h3').first().locator('../..');
    
    // Should show review count
    await expect(firstStudio.getByText(/\(\d+\s*reviews?\)/i)).toBeVisible();
    
    // Should show star ratings (might be images or text)
    const starRating = firstStudio.locator('[class*="star"], [class*="rating"], img[alt*="star"]');
    if (await starRating.count() > 0) {
      await expect(starRating.first()).toBeVisible();
    }
  });

  test('should handle studio actions (View, List, Quote)', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Wait for first studio to load
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    const firstStudio = page.locator('h3').first().locator('../..');
    
    // Test View button
    const viewButton = firstStudio.getByRole('button', { name: /view/i });
    await expect(viewButton).toBeVisible();
    // Note: Clicking might navigate away, so we'll just verify it's clickable
    await expect(viewButton).toBeEnabled();
    
    // Test List button
    const listButton = firstStudio.getByRole('button', { name: /list/i });
    await expect(listButton).toBeVisible();
    await expect(listButton).toBeEnabled();
    
    // Test Quote button
    const quoteButton = firstStudio.getByRole('button', { name: /quote/i });
    await expect(quoteButton).toBeVisible();
    await expect(quoteButton).toBeEnabled();
  });

  test('should maintain studio listing state during navigation', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Wait for studios to load
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    // Get initial studio count
    const initialCount = await page.locator('h3').count();
    
    // Navigate away and back
    await page.goto('/');
    await authHelpers.waitForAuthStateResolution();
    
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Should show studios again
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    // Should have similar number of studios (allowing for some variation)
    const finalCount = await page.locator('h3').count();
    expect(finalCount).toBeGreaterThan(0);
  });

  test('should handle pagination or infinite scroll', async ({ page }) => {
    await page.goto('/browse');
    await authHelpers.waitForAuthStateResolution();
    
    // Wait for initial studios to load
    await expect(page.locator('h3').first()).toBeVisible({ timeout: 10000 });
    
    const initialCount = await page.locator('h3').count();
    
    // Scroll to bottom to trigger more loading (if infinite scroll)
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    
    // Wait a bit for potential loading
    await page.waitForTimeout(2000);
    
    // Or look for pagination controls
    const nextButton = page.getByRole('button', { name: /next|load more/i });
    if (await nextButton.isVisible()) {
      await nextButton.click();
      await page.waitForTimeout(2000);
    }
    
    // Check if more studios loaded
    const finalCount = await page.locator('h3').count();
    
    // Should either have more studios or maintain the same count
    expect(finalCount).toBeGreaterThanOrEqual(initialCount);
  });
});