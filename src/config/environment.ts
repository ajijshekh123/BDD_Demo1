import dotenv from 'dotenv';

dotenv.config();

type BrowserName = 'chromium' | 'firefox' | 'webkit';

function readBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }

  if (value.toLowerCase() === 'true') {
    return true;
  }
  if (value.toLowerCase() === 'false') {
    return false;
  }

  throw new Error(`${name} must be "true" or "false".`);
}

function readPositiveInteger(name: string, defaultValue: number): number {
  const value = process.env[name];
  if (value === undefined) {
    return defaultValue;
  }

  if (!/^\d+$/.test(value)) {
    throw new Error(`${name} must be a positive integer.`);
  }
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw new Error(`${name} must be a positive integer.`);
  }
  return parsed;
}

function readBrowser(): BrowserName {
  const browserValue = (process.env.BROWSER ?? 'chromium').toLowerCase();
  if (browserValue === 'chromium' || browserValue === 'firefox' || browserValue === 'webkit') {
    return browserValue;
  }
  throw new Error(`BROWSER must be one of: chromium, firefox, webkit.`);
}

const baseUrl = process.env.BASE_URL ?? 'https://demowebshop.tricentis.com';
try {
  new URL(baseUrl);
} catch {
  throw new Error('BASE_URL must be a valid absolute URL.');
}

export const environment = {
  baseUrl: baseUrl.replace(/\/+$/, ''),
  browser: readBrowser(),
  headless: readBoolean('HEADLESS', true),
  video: readBoolean('VIDEO', false),
  defaultTimeout: readPositiveInteger('DEFAULT_TIMEOUT', 15_000),
  cucumberTimeout: readPositiveInteger('CUCUMBER_TIMEOUT', 60_000),
  email: process.env.BDD_EMAIL,
  password: process.env.BDD_PASSWORD
} as const;

export function requireLoginCredentials(): { email: string; password: string } {
  if (!environment.email || !environment.password) {
    throw new Error(
      'Set BDD_EMAIL and BDD_PASSWORD in your local .env file before running login scenarios.'
    );
  }
  return { email: environment.email, password: environment.password };
}
