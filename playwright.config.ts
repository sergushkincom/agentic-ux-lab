import { defineConfig, devices } from "@playwright/test";

const port = 3000;
const baseURL = `http://127.0.0.1:${port}`;

/**
 * Smoke runs against `next start`, so the production build has to exist.
 * CI builds first; locally run `npm run build` before `npm run test:smoke`.
 */
const requireBuild =
  "node -e \"if (!require('node:fs').existsSync('.next/BUILD_ID')) { console.error('Playwright smoke needs a production build. Run npm run build first.'); process.exit(1); }\"";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: `${requireBuild} && npm run start -- --hostname 127.0.0.1 --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
