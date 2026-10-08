import { After, Before, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { chromium, firefox, webkit, type BrowserType } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { environment } from '../config/environment';
import { CustomWorld } from './world';

setDefaultTimeout(environment.cucumberTimeout);

const browserTypes: Record<typeof environment.browser, BrowserType> = {
  chromium,
  firefox,
  webkit
};

function artifactName(name: string): string {
  const safeName = name.replace(/[^a-zA-Z0-9-_]+/g, '-').replace(/^-|-$/g, '');
  return `${safeName || 'scenario'}-${Date.now()}`;
}

Before(async function (this: CustomWorld, { pickle }) {
  const browserType = browserTypes[environment.browser];
  this.browser = await browserType.launch({ headless: environment.headless });
  if (environment.video) {
    await mkdir(path.resolve('artifacts/videos'), { recursive: true });
  }
  this.context = await this.browser.newContext({
    ...(environment.video
      ? { recordVideo: { dir: path.resolve('artifacts/videos') } }
      : {})
  });
  this.page = await this.context.newPage();
  this.page.setDefaultTimeout(environment.defaultTimeout);
  await this.context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  this.traceStarted = true;
  this.log(`Started ${environment.browser} for "${pickle.name}".`);
});

After(async function (this: CustomWorld, { pickle, result }) {
  const failed = result?.status === Status.FAILED;
  const name = artifactName(pickle.name);
  const artifactDirectory = path.resolve('artifacts', failed ? 'failures' : 'traces');

  await mkdir(artifactDirectory, { recursive: true });

  try {
    if (failed && this.page) {
      const screenshot = await this.page.screenshot({ fullPage: true });
      await this.attach(screenshot, 'image/png');
    }

    if (this.context) {
      const tracePath = path.join(artifactDirectory, `${name}-trace.zip`);
      const traceSaved = failed && this.traceStarted;
      if (this.traceStarted) {
        await this.context.tracing.stop(failed ? { path: tracePath } : undefined);
        this.traceStarted = false;
      }
      if (traceSaved) {
        await this.attach(`Playwright trace: ${tracePath}`, 'text/plain');
      }
    }
  } finally {
    try {
      if (this.context) {
        await this.context.close();
      }
    } finally {
      if (this.browser) {
        await this.browser.close();
      }
    }
  }
});
