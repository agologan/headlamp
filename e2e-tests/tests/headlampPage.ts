import { Page, expect } from '@playwright/test';

export class HeadlampPage {
  constructor(private page: Page) { }

  async authenticate() {
    await this.page.goto('/');

    await this.page.waitForSelector('h1:has-text("Authentication")');

    // Expects the URL to contain c/main/token
    this.hasURLContaining(/.*token/);

    const token = process.env.HEADLAMP_TOKEN || '';
    this.hasToken(token);

    // Fill in the token
    await this.page.locator("#token").fill(token);

    // Click on the "Authenticate" button and wait for navigation
    await Promise.all([
      this.page.waitForNavigation(),
      this.page.click('button:has-text("Authenticate")'),
    ]);
  }

  async hasURLContaining(pattern: RegExp) {
    await expect(this.page).toHaveURL(pattern);
  }

  async hasTitleContaining(pattern: RegExp) {
    await expect(this.page).toHaveTitle(pattern);
  }

  async hasToken(token: string) {
    expect(token).not.toBe('');
  }

  async hasNetworkTab() {
    const networkTab = this.page.locator('span:has-text("Network")').first();
    expect(await networkTab.textContent()).toBe('Network');
  }

  async hasSecurityTab() {
    const networkTab = this.page.locator('span:has-text("Security")').first();
    expect(await networkTab.textContent()).toBe('Security');
  }

  async checkPageContent(text: string) {
    const pageContent = await this.page.content();
    expect(pageContent).toContain(text);
  }

  async pageLocatorContent(locator: string, text: string) {
    const pageContent = this.page.locator(locator).textContent();
    expect(await pageContent).toContain(text);
  }

  async navigateTopage(page: string, title: RegExp) {
    await this.page.goto(page);
    await this.page.waitForLoadState('load');
    await this.hasTitleContaining(title);
  }

  async logout() {
    // Click on the account button to open the user menu
    await this.page.click('button[aria-label="Account of current user"]');

    // Wait for the logout option to be visible and click on it
    await this.page.waitForSelector('a.MuiMenuItem-root:has-text("Log out")');
    await this.page.click('a.MuiMenuItem-root:has-text("Log out")');
    await this.page.waitForLoadState('load');

    // Expects the URL to contain c/main/token
    await this.hasURLContaining(/.*token/);
  }

  async tableHasHeaders(tableSelector: string, expectedHeaders: string[]) {
    // Get all table headers
    const headers = await this.page.$$eval(`${tableSelector} th`, ths =>
      ths.map(th => {
        if (th && th.textContent) {
          return th.textContent.trim();
        }
      })
    );

    // Check if all expected headers are present in the table
    for (const header of expectedHeaders) {
      if (!headers.includes(header)) {
        throw new Error(`Table does not contain header: ${header}`);
      }
    }
  }

  async clickOnPlugin(pluginName: string) {
    await this.page.click(`a:has-text("${pluginName}")`);
    await this.page.waitForLoadState('load');
  }
}
