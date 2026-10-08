import type { Locator, Page } from 'playwright';

export class HomePage {
  private readonly loginLink: Locator;

  constructor(private readonly page: Page) {
    this.loginLink = page.getByRole('link', { name: 'Log in' });
  }

  async open(baseUrl: string): Promise<void> {
    await this.page.goto(baseUrl);
  }

  async openLogin(): Promise<void> {
    await this.loginLink.click();
  }

  async isLoggedInAs(email: string): Promise<boolean> {
    return this.page
      .locator('.header-links')
      .getByRole('link', { name: email, exact: true })
      .isVisible();
  }
}
