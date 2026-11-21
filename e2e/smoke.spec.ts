import { expect, test, type Page } from "@playwright/test";
import { experimentHref, experiments } from "../src/lib/experiments";

/**
 * The site index, then every registry row that is a route in this app.
 * A row with `href` is an external experiment and is not a route here.
 */
function smokeRoutes(): string[] {
  return [
    "/",
    ...experiments
      .filter((experiment) => !experiment.href)
      .map((experiment) => experimentHref(experiment)),
  ];
}

const routes = smokeRoutes();

/** Copy and markup from Next.js built-in error and not-found pages. */
const NEXT_ERROR_TEXT =
  /Application error: a (?:client|server)-side exception has occurred|This page could not be found/;

test("smoke routes are the index plus internal experiments only", () => {
  expect(routes[0]).toBe("/");
  expect(routes.filter((route) => route === "/")).toHaveLength(1);

  for (const experiment of experiments) {
    const route = `/experiments/${experiment.slug}`;
    if (experiment.href) {
      expect(routes, `${experiment.slug} is external`).not.toContain(experiment.href);
      expect(routes, `${experiment.slug} must not be treated as a route`).not.toContain(route);
    } else {
      expect(routes, `${experiment.slug} must be visited`).toContain(route);
    }
  }

  for (const route of routes) {
    expect(route.startsWith("/"), route).toBe(true);
  }
});

for (const route of routes) {
  test(`${route} returns 2xx and is not a Next.js error page`, async ({ page }) => {
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => {
      pageErrors.push(error.message);
    });

    const response = await page.goto(route, { waitUntil: "load" });
    if (response === null) {
      throw new Error(`${route} did not respond`);
    }

    const status = response.status();
    expect(status >= 200 && status < 300, `${route} returned HTTP ${status}`).toBe(true);

    await page.waitForLoadState("networkidle");
    await assertNotNextErrorPage(page, route);

    const experiment = experiments.find(
      (entry) => !entry.href && experimentHref(entry) === route,
    );
    if (experiment) {
      await expect(page.getByText(experiment.title).first()).toBeVisible();
    } else {
      await expect(page.getByRole("heading", { level: 1, name: "Agentic UX Lab" })).toBeVisible();
      await expect(page.locator(".specimen-card")).toHaveCount(experiments.length);
      for (const entry of experiments) {
        const card = page.locator(".specimen-card", { hasText: entry.title });
        await expect(card, entry.slug).toBeVisible();
        await expect(card, entry.slug).toHaveAttribute("href", experimentHref(entry));
        if (entry.href) {
          await expect(card, entry.slug).toHaveAttribute("target", "_blank");
        }
      }
    }

    await assertNotNextErrorPage(page, route);
    expect(pageErrors, `${route} threw in the browser:\n${pageErrors.join("\n")}`).toEqual([]);
  });
}

async function assertNotNextErrorPage(page: Page, route: string): Promise<void> {
  const htmlId = await page.locator("html").getAttribute("id");
  expect(htmlId, `${route} rendered a Next.js error page`).not.toBe("__next_error__");
  await expect(
    page.locator(".next-error-h1"),
    `${route} rendered a Next.js error page`,
  ).toHaveCount(0);
  const text = await page.locator("body").innerText();
  expect(text, `${route} rendered a Next.js error page`).not.toMatch(NEXT_ERROR_TEXT);
}
