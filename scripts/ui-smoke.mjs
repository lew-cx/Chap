#!/usr/bin/env node
/** Focused browser acceptance against a running Chap dev server and LewLM fixture. */
import { chromium } from 'playwright';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const failures = [];
page.on('pageerror', (error) => failures.push(`pageerror: ${error.message}`));
page.on('console', (message) => {
  if (message.type() === 'error') failures.push(`console: ${message.text()}`);
});

await page.goto('http://localhost:5173/#/chat', { waitUntil: 'domcontentloaded' });
await page.getByText('LewLM 0.4.2').waitFor();
const options = await page.locator('label:has-text("model") option').allTextContents();
if (!options.some((value) => value.includes('fixture-chat'))) {
  failures.push(`model picker: ${options.join(' | ')}`);
}

await page.getByRole('button', { name: 'tools', exact: true }).click();
await page.locator('textarea.code').fill(JSON.stringify([
  {
    name: 'get_weather',
    description: 'weather',
    input_schema: { type: 'object', properties: { city: { type: 'string' } } },
  },
], null, 2));
await page.locator('textarea[placeholder^="Ask anything"]').fill('What is the weather in Lisbon?');
await page.getByRole('button', { name: 'Send' }).click();
await page.getByRole('button', { name: 'Send' }).waitFor({ timeout: 15_000 });
await page.getByText('tool calls', { exact: true }).waitFor();
await page.getByText('tool_calls', { exact: true }).waitFor();

for (const route of [
  '#/ops/overview',
  '#/ops/runtime',
  '#/ops/events',
  '#/ops/jobs',
  '#/lab/audio',
  '#/settings/contract',
]) {
  await page.goto(`http://localhost:5173/${route}`, { waitUntil: 'domcontentloaded' });
  if ((await page.getByText('This panel crashed').count()) > 0) failures.push(`${route}: error boundary`);
}

await page.screenshot({ path: '/tmp/chap-ui-smoke.png', fullPage: true });
await browser.close();
if (failures.length) throw new Error(failures.join('\n'));
console.log('Chap UI smoke passed: model picker, tool call, and updated routes rendered without browser errors.');
