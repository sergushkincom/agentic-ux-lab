import { expect, test } from "@playwright/test";

const route = "/experiments/absence-coverage";

test("the Friday plan decides what Monday reports", async ({ page }) => {
  await page.goto(route);

  await expect(page.getByRole("heading", { level: 2, name: "Before you leave" })).toBeVisible();
  await expect(page.getByTestId("plan-sentences")).toContainText(
    "What it does not do goes to Mara.",
  );

  await page.getByRole("button", { name: "Leave for the week" }).click();
  await expect(page.getByRole("heading", { level: 2, name: "When you are back" })).toBeFocused();
  await expect(page.getByTestId("headline")).toHaveText(
    "14 things came in. 3 wait for you, 4 closed by Mara, 7 done by the assistant.",
  );
  await expect(page.locator('li[data-status="waiting"]')).toHaveCount(3);

  await page.getByRole("button", { name: /Back to Friday/ }).click();
  await page.getByRole("radio", { name: "Nobody. It waits for you" }).check();
  await page.getByRole("checkbox", { name: /Move your meetings/ }).uncheck();
  await expect(page.getByRole("radio", { name: "1:1s only" })).toBeDisabled();

  await page.getByRole("button", { name: /^Monday/ }).click();
  await expect(page.getByTestId("headline")).toHaveText(
    "14 things came in. 9 wait for you, 5 done by the assistant.",
  );
  await expect(page.locator('li[data-status="waiting"]')).toHaveCount(9);
  await expect(page.getByText("Nobody has looked at it.").first()).toBeVisible();
});

test("a promise is stopped by a rule that has no switch", async ({ page }) => {
  await page.goto(route);

  await expect(page.getByText("Not a setting.")).toBeVisible();
  await page.getByRole("checkbox", { name: /Also for people outside the company/ }).check();
  await page.getByRole("radio", { name: "Any size" }).check();
  await page.getByRole("button", { name: "Leave for the week" }).click();

  const discount = page.locator("li", { hasText: "12% discount" });
  await expect(discount).toContainText("Never allowed");
  await expect(discount).toContainText("it never promises a price in your name");
  await expect(discount).toHaveAttribute("data-status", "waiting");
});

test("the whole plan can be set from the keyboard", async ({ page }) => {
  await page.goto(route);

  const first = page.getByRole("checkbox", { name: /Answer from your notes/ });
  await first.focus();
  await page.keyboard.press("Space");
  await expect(first).not.toBeChecked();

  const leave = page.getByRole("button", { name: "Leave for the week" });
  await leave.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("headline")).toContainText("14 things came in.");
  await expect(page.getByText('On Friday you turned off "Answer from your notes".').first()).toBeVisible();
});
