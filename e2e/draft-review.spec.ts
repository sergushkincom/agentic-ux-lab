import { expect, test } from "@playwright/test";

const route = "/experiments/draft-review";

test("the draft shows what was decided for you before anything is opened", async ({ page }) => {
  await page.goto(route);

  await expect(page.getByTestId("headline")).toHaveText(
    "I made 6 decisions for you. I'm not sure about 3. You have looked at 0 of 6.",
  );
  const draft = page.getByTestId("draft");
  await expect(draft.locator('[data-mark="doubt"]')).toHaveCount(3);
  await expect(draft.locator('[data-mark="open"]')).toHaveCount(3);
  await expect(draft.locator('[data-part="recordings"]')).toContainText(
    "Nothing here about the interview recordings he asked for.",
  );

  const cards = page.locator("li[data-decision]");
  await expect(cards).toHaveCount(6);
  await expect(cards.nth(0)).toHaveAttribute("data-doubt", "yes");
  await expect(cards.nth(2)).toHaveAttribute("data-doubt", "yes");
  await expect(cards.nth(3)).toHaveAttribute("data-doubt", "no");

  await expect(page.getByRole("button", { name: "Send as mine (simulated)" })).toBeDisabled();
  await expect(page.getByTestId("send-note")).toHaveText(
    "3 decisions I'm not sure about are still open. Look at them before this goes.",
  );
});

test("keep, change and why work on a decision, and a change rewrites the draft", async ({
  page,
}) => {
  await page.goto(route);
  const price = page.locator('li[data-decision="price"]');

  const why = price.getByRole("button", { name: "Why?" });
  await expect(why).toHaveAttribute("aria-expanded", "false");
  await why.click();
  await expect(why).toHaveAttribute("aria-expanded", "true");
  await expect(price.getByText("The offer from January lists one workshop at €2,400.")).toBeVisible();

  await price.getByRole("button", { name: "Change" }).click();
  await price.getByRole("radio", { name: "Send the price separately" }).check();
  await expect(price).toHaveAttribute("data-status", "changed");
  await expect(price.getByTestId("status")).toHaveText("Changed by you");
  const part = page.getByTestId("draft").locator('[data-part="price"]');
  await expect(part).toContainText("I will send you a price for a second workshop in a separate message.");
  await expect(part).toHaveAttribute("data-mark", "changed");

  await price.getByRole("button", { name: "Back to the draft" }).click();
  await expect(price).toHaveAttribute("data-status", "accepted");
  await expect(part).toContainText("costs the same as the first, €2,400.");
  await expect(price.getByRole("button", { name: "Keep" })).toHaveAttribute("aria-pressed", "true");

  await expect(page.getByTestId("headline")).toContainText("You have looked at 1 of 6.");
});

test("doubts are not kept in bulk, and sending says who decided what", async ({ page }) => {
  await page.goto(route);

  await page.getByRole("button", { name: "Keep the 3 I'm sure about" }).click();
  await expect(page.locator('li[data-decision][data-status="accepted"]')).toHaveCount(3);
  await expect(page.locator('li[data-decision][data-doubt="yes"][data-status="open"]')).toHaveCount(3);
  await expect(page.getByRole("button", { name: /I'm sure about/ })).toHaveCount(0);
  const send = page.getByRole("button", { name: "Send as mine (simulated)" });
  await expect(send).toBeDisabled();

  // A marked part of the draft leads to its decision, from the keyboard.
  await page.getByTestId("draft").locator('[data-part="date"]').focus();
  await page.keyboard.press("Enter");
  const date = page.locator('li[data-decision="date"]');
  await expect(date.getByRole("heading", { level: 3 })).toBeFocused();

  await date.getByRole("button", { name: "Keep" }).click();
  await page.locator('li[data-decision="price"]').getByRole("button", { name: "Keep" }).click();
  await expect(page.getByTestId("send-note")).toHaveText(
    "1 decision I'm not sure about is still open. Look at it before this goes.",
  );

  const recordings = page.locator('li[data-decision="recordings"]');
  await recordings.getByRole("button", { name: "Change" }).click();
  await recordings.getByRole("radio", { name: "Say you will come back on it" }).check();

  await expect(page.getByTestId("send-note")).toHaveText("You have looked at every decision.");
  await expect(send).toBeEnabled();
  await send.click();
  await expect(page.getByTestId("receipt")).toHaveText(
    "Sent in this demo only. Nothing left the page. You decided 6 of 6: 1 changed, 5 kept.",
  );
});
