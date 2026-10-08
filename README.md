# Playwright + Cucumber BDD Framework

This project combines Gherkin feature files, Cucumber step definitions, page objects, and Playwright browser automation. The initial scenario logs into [Demo Web Shop](https://demowebshop.tricentis.com/) using credentials supplied locally.

## Get started

1. Install Node.js 20 or newer.
2. Install project dependencies and the browser:

   ```powershell
   npm install
   npx playwright install chromium
   ```

   If the browser download fails with `UNABLE_TO_GET_ISSUER_CERT_LOCALLY` on a managed Windows network, Node may not be using the trusted certificate store. With Node.js 22.15 or newer, retry in the same PowerShell session with:

   ```powershell
   $env:NODE_USE_SYSTEM_CA = "1"
   npx playwright install chromium
   ```

   If your network uses a private proxy certificate that is not in the system trust store, ask your IT team for its trusted CA certificate in PEM format and set `NODE_EXTRA_CA_CERTS` to that file before retrying:

   ```powershell
   $env:NODE_EXTRA_CA_CERTS = "C:\path\to\trusted-company-ca.pem"
   npx playwright install chromium
   ```

   Do not disable TLS certificate verification to work around this error.

3. Copy `.env.example` to `.env` and set `BDD_EMAIL` and `BDD_PASSWORD` to a registered account for the demo site. Do not commit `.env`.
4. Run the suite:

   ```powershell
   npm test
   ```

Run only the login scenario in a visible browser window and create the Allure results:

```powershell
npm run test:login:ui
```

After the test completes, generate and open the HTML report:

```powershell
npm run allure:generate
npm run allure:open
```

The `allure:open` command starts a local report server and opens it in your browser. Allure results are written to `allure-results/`, and the generated site is in `allure-report/`; both directories are ignored by Git. The existing Cucumber JSON report remains at `reports/cucumber-report.json`. Use `npm run test:login` to execute the login scenario headlessly. `npm run typecheck` checks TypeScript without running the browser.

## Framework walkthrough

### Level 1 — BDD fundamentals

- **BDD** describes behavior from the user's point of view.
- **Gherkin** is the readable syntax used in `features/**/*.feature`.
- A **Feature** groups related behavior; a **Scenario** is one example of that behavior.
- **Given** establishes context, **When** performs an action, and **Then** checks an observable result.
- Use a **Scenario Outline** plus **Examples** when the same steps need to run with multiple input rows. Keep secrets out of Examples; read credentials from environment configuration as the login scenario does.
- **Background** contains setup steps shared by every scenario in its feature. The login feature uses it to open the shop.

### Level 2 — BDD automation

```text
features/auth/login.feature
        ↓ Gherkin steps
src/steps/login.steps.ts
        ↓ delegates actions and assertions
src/pages/home.page.ts + src/pages/login.page.ts
        ↓ semantic locators
Playwright Page / Browser
```

Keep feature files business-readable, step definitions thin, and UI selectors/actions in page objects. Prefer accessible role and label locators over brittle CSS or XPath.

### Level 3 — Advanced BDD and execution

- **Hooks:** `src/support/hooks.ts` creates an isolated browser context per scenario, starts tracing, and captures an attached screenshot and saved trace when a scenario fails.
- **Tags:** use tags such as `@smoke` and `@login`; run a group with `npx cucumber-js --tags @smoke`.
- **Scenario Outline / Examples and Data Tables:** Cucumber supports both directly in feature files. Add them when scenarios need tabular inputs or repeated cases; avoid inventing extra production scenarios solely to exercise syntax.
- **Custom World:** `src/support/world.ts` holds the scenario's browser, context, and page. Cucumber creates a separate World for each scenario, including when scenarios execute in parallel.
- **Fixtures:** use the World and hooks as scenario-scoped fixtures; add reusable fixture setup in hooks or typed World helpers when new scenarios need it.
- **Configuration / environments:** `src/config/environment.ts` reads `.env` and validates settings. Override `BASE_URL`, `BROWSER` (`chromium`, `firefox`, or `webkit`), `HEADLESS`, `DEFAULT_TIMEOUT` (Playwright action timeout), `CUCUMBER_TIMEOUT` (Cucumber hook/step timeout in milliseconds; defaults to 60 seconds), `VIDEO`, `PARALLEL`, and `RETRIES` per environment.
- **Parallel execution:** set `PARALLEL=2` (or another positive integer) before `npm test`. Start at `1` for this shared demo site; increase when test data and environment can safely support concurrent logins.
- **Screenshots, videos, tracing, and reports:** failed scenarios attach a screenshot and save a trace under `artifacts/failures/`; set `VIDEO=true` to save Playwright videos under `artifacts/videos/`. The JSON report is saved under `reports/`.

PowerShell example:

```powershell
$env:PARALLEL = "2"
$env:VIDEO = "true"
npm test
```

### Level 4 — Locator mastery

Playwright locators are auto-waiting and retryable. Prefer the strongest user-facing locator available:

| Locator | Good fit |
| --- | --- |
| `getByRole()` | Buttons, links, headings, and other accessible controls |
| `getByLabel()` | Form inputs associated with a visible label |
| `getByText()` | Visible text when no more specific semantic locator fits |
| `getByPlaceholder()` | Inputs identified by placeholder text |
| `getByTestId()` | Stable test IDs agreed with the application team |
| `locator()` | CSS selectors or a scoped element when semantic locators are insufficient |

Use CSS (`.class`, `[data-*]`) only when it is stable and readable. XPath is supported but should be a last resort. For changing collections, use `filter({ hasText })`, `filter({ has })`, `nth()`, or chain from a scoped parent to its child rather than building a long global selector. Use `frameLocator()` for iframes. Playwright locators can pierce open Shadow DOM by default; closed shadow roots are not directly accessible. For dynamic elements, rely on locator auto-waiting and explicit state assertions rather than fixed sleeps.

The login page demonstrates `getByLabel()` for fields, `getByRole()` for the submit button, and a scoped locator for the account indicator.

### Level 5 — Project architecture

```text
                    BDD
                     |
             +-------+-------+
             |               |
        Feature Files     Gherkin
             |
             v
       Step Definitions
             |
             v
        Page Objects
             |
             v
          Locators
             |
             v
         Playwright
             |
      +------+-------+
      |      |       |
   Reports  CI/CD  Test Data
```

Add future scenarios under `features/`, step glue under `src/steps/`, and reusable UI operations under `src/pages/`. Keep credentials in CI secrets/local environment variables. For CI, install dependencies and the configured Playwright browser, set credentials securely, then run `npm test` and publish the `reports/` and `artifacts/` directories.
