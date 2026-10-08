import { Given, Then, When } from '@cucumber/cucumber';
import { environment, requireLoginCredentials } from '../config/environment';
import { HomePage } from '../pages/home.page';
import { LoginPage } from '../pages/login.page';
import { CustomWorld } from '../support/world';

Given('I open the Demo Web Shop home page', async function (this: CustomWorld) {
  await new HomePage(this.page).open(environment.baseUrl);
});

When('I log in using the configured account', async function (this: CustomWorld) {
  const { email, password } = requireLoginCredentials();
  const homePage = new HomePage(this.page);
  await homePage.openLogin();
  await new LoginPage(this.page).login(email, password);
});

Then(
  'I should be on the home page as the logged-in user',
  async function (this: CustomWorld) {
    const { email } = requireLoginCredentials();
    const expectedUrl = new URL(environment.baseUrl);
    const expectedPath = expectedUrl.pathname.replace(/\/+$/, '') || '/';
    await this.page.waitForURL(
      (url) =>
        url.origin === expectedUrl.origin &&
        (url.pathname.replace(/\/+$/, '') || '/') === expectedPath
    );
    if (!(await new HomePage(this.page).isLoggedInAs(email))) {
      throw new Error(`Expected the home page to show the logged-in account "${email}".`);
    }
  }
);
