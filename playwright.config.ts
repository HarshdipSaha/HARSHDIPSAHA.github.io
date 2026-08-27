import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests over the static export in `out/` — run `npm run build` first.
 * Playwright starts `serve out` itself (clean URLs, real 404s), so the tests
 * exercise exactly what GitHub Pages will host.
 */
const PORT = 3100;

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npx serve out -l ${PORT} -n -L --no-port-switching`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
});
