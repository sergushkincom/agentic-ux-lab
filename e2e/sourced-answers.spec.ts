import { expect, test } from "@playwright/test";

const route = "/experiments/sourced-answers";

test("each sentence says what it rests on before anything is opened", async ({ page }) => {
  await page.goto(route);

  await expect(page.getByTestId("headline")).toHaveText(
    "4 sentences: 2 say what a document says, 1 is worked out, 1 has no source. 1 part of your question I couldn't find.",
  );
  await expect(page.locator('li[data-grounding="stated"]')).toHaveCount(2);
  await expect(page.locator('li[data-grounding="combined"]')).toHaveCount(1);
  await expect(page.locator('li[data-grounding="none"]')).toHaveCount(1);
  await expect(page.locator('li[data-grounding="none"]')).toContainText(
    "No source. This is a guess.",
  );

  const ceiling = page.getByRole("button", { name: /Your line manager can approve up to €200/ });
  await expect(ceiling).toHaveAttribute("aria-expanded", "false");
  await ceiling.click();
  await expect(ceiling).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByText("€160 plus 25% is €200. No document gives the €200 figure.")).toBeVisible();
  await expect(page.locator("mark", { hasText: "up to 25% above the limit" })).toBeVisible();

  await page.getByRole("checkbox", { name: /Only what rests on a document/ }).check();
  await expect(page.locator('li[data-grounding="none"]')).toHaveCount(0);
  await expect(page.getByRole("status")).toHaveText("1 sentence with no source hidden.");
});

test("a question with no answer says so and does not answer from the closest passage", async ({
  page,
}) => {
  await page.goto(route);
  await page.getByRole("button", { name: "What is the budget per person for a team dinner?" }).click();

  await expect(page.getByTestId("headline")).toHaveText(
    "I couldn't find this. Nothing below is an answer.",
  );
  await expect(page.locator("li[data-grounding]")).toHaveCount(0);

  const notFound = page.getByTestId("not-found");
  await expect(notFound.getByRole("heading", { level: 3, name: "I couldn't find this" })).toBeVisible();
  await expect(notFound).toContainText(
    "Where I looked: Travel and expenses policy, Expenses FAQ, Team handbook.",
  );
  await expect(notFound).toContainText("I have not answered from it.");
  await expect(page.getByTestId("concerns").locator("li")).toHaveCount(1);
});

test("a doubt opens the sentence it is about, from the keyboard", async ({ page }) => {
  await page.goto(route);
  await page.getByRole("checkbox", { name: /Only what rests on a document/ }).check();

  const concernsList = page.getByTestId("concerns");
  await expect(concernsList.locator("li").first()).toContainText(
    "Two documents disagree on the hotel limit.",
  );

  const guess = concernsList.locator('li[data-kind="guess"]');
  await guess.getByRole("button", { name: "Show the sentence" }).focus();
  await page.keyboard.press("Enter");

  const sentence = page.getByRole("button", { name: /Approval usually takes a day or two/ });
  await expect(sentence).toBeFocused();
  await expect(sentence).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("checkbox", { name: /Only what rests on a document/ })).not.toBeChecked();
  await expect(page.getByText("No document says how long approval takes.")).toBeVisible();

  await page.getByRole("button", { name: "How many days can I work from abroad this year?" }).click();
  await expect(concernsList.locator('li[data-kind="old"]')).toContainText("last edited 14 months ago");
  await expect(concernsList.locator('li[data-kind="read-as"]')).toContainText(
    "I read “this year” as the calendar year.",
  );
});
