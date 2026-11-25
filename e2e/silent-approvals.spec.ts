import { expect, test } from "@playwright/test";

const route = "/experiments/silent-approvals";

test("one decision covers the group and leaves the exceptions waiting", async ({ page }) => {
  await page.goto(route);

  const tally = page.getByTestId("tally");
  await expect(tally).toHaveText(/40 of 40 waiting · 9 decisions left/);

  const pay = page.getByTestId("group-pay");
  await expect(pay.getByTestId(/^exception-/)).toHaveCount(2);

  await pay.getByRole("button", { name: "Pay 12 invoices · €47,130" }).click();

  await expect(tally).toHaveText(/28 of 40 waiting · 8 decisions left/);
  await expect(pay.getByText("12 invoices · €47,130: approved for payment.")).toBeVisible();
  await expect(pay.getByTestId(/^exception-/)).toHaveCount(2);

  await pay.getByRole("button", { name: "Undo" }).click();
  await expect(tally).toHaveText(/40 of 40 waiting · 9 decisions left/);
});

test("taking an item out changes the button, and a deletion has no undo", async ({ page }) => {
  await page.goto(route);

  const pay = page.getByTestId("group-pay");
  await pay.getByRole("button", { name: "Show the 12" }).click();
  await pay
    .getByRole("button", { name: "Take Invoice 2207 · Halvorn Metals out of the group" })
    .click();
  await expect(pay.getByRole("button", { name: "Pay 11 invoices · €42,820" })).toBeVisible();
  await expect(pay.getByText("You took this one out of the group.")).toBeVisible();
  await expect(page.getByTestId("tally")).toHaveText(/10 decisions left/);

  const del = page.getByTestId("group-delete");
  await del.getByRole("button", { name: "Delete 4 supplier records for good" }).click();
  await expect(del.getByText("No undo")).toBeVisible();
  await expect(del.getByRole("button", { name: "Undo" })).toHaveCount(0);
});

test("by arrival is forty cards with the same two buttons", async ({ page }) => {
  await page.goto(route);

  await page.getByRole("button", { name: "By arrival" }).click();
  await expect(page.getByTestId("arrival-card")).toHaveCount(40);
  await expect(page.getByTestId("tally")).toHaveText(/40 of 40 waiting · 40 decisions left/);

  await page.getByTestId("arrival-card").first().getByRole("button", { name: /^Approve/ }).click();
  await expect(page.getByTestId("arrival-card")).toHaveCount(39);
});
