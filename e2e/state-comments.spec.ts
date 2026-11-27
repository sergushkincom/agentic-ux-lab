import { expect, test } from "@playwright/test";

const STORAGE_KEY = "agentic-ux-lab/state-comments/comments-v1";

test.beforeEach(async ({ page }) => {
  await page.addInitScript((key) => {
    window.localStorage.removeItem(key);
  }, STORAGE_KEY);
});

test("the empty filter can show resolved comments again", async ({ page }) => {
  await page.goto("/experiments/state-comments");
  await page.getByRole("checkbox", { name: "Hide resolved" }).check();

  const markResolved = page.getByRole("button", { name: "Mark resolved" });
  await markResolved.first().click();
  await markResolved.first().click();

  await expect(page.getByRole("status")).toHaveText(/No open comments/);
  await page.getByRole("button", { name: "Show resolved" }).click();

  await expect(page.getByRole("checkbox", { name: "Hide resolved" })).not.toBeChecked();
  await expect(page.getByRole("status")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Mark unresolved" })).toHaveCount(3);
  await expect(page.getByText("Person list feels long at 320 px")).toBeVisible();
});

test("a new comment opens into the list and is highlighted", async ({ page }) => {
  await page.goto("/experiments/state-comments");
  const text = "The time label sits too close to the edge.";
  await page.getByLabel(/Add comment/).fill(text);
  await page.getByRole("button", { name: "Add comment" }).click();

  const item = page.locator("li", { hasText: text });
  await expect(item).toBeVisible();
  await expect(item).toHaveAttribute("data-open", "true");

  const card = item.locator("[data-highlight]");
  await expect(card).toHaveAttribute("data-highlight", "on");
  const motion = await card.evaluate((el) => {
    const style = getComputedStyle(el);
    return { name: style.animationName, duration: style.animationDuration };
  });
  expect(motion.name).not.toBe("none");
  expect(motion.duration).not.toBe("0s");

  const entrance = await item.evaluate((el) => getComputedStyle(el).transitionProperty);
  expect(entrance).toContain("grid-template-rows");
  expect(entrance).toContain("opacity");
});

test("reduced motion shows a new comment still, with no highlight", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/experiments/state-comments");
  const text = "Leave this one still.";
  await page.getByLabel(/Add comment/).fill(text);
  await page.getByRole("button", { name: "Add comment" }).click();

  const item = page.locator("li", { hasText: text });
  await expect(item).toBeVisible();
  await expect(item).toHaveAttribute("data-open", "true");

  const card = item.locator("[data-highlight]");
  await expect(card).toHaveAttribute("data-highlight", "off");
  const still = await item.evaluate((el) => {
    const row = getComputedStyle(el);
    const painted = getComputedStyle(el.querySelector("[data-highlight]") as Element);
    return {
      opacity: row.opacity,
      height: el.getBoundingClientRect().height,
      transition: row.transitionProperty,
      animation: painted.animationName,
    };
  });
  expect(still.opacity).toBe("1");
  expect(still.height).toBeGreaterThan(20);
  expect(still.transition).toBe("none");
  expect(still.animation).toBe("none");
});
