import {expect, test} from "@playwright/test";

test.describe("workbook", () => {
  test("persists sheet style and switches locale", async ({page}) => {
    await page.goto("/en");

    const sheetStyleSelect = page.getByTestId("sheet-style-select");
    await expect(sheetStyleSelect).toHaveValue("seyes");

    await sheetStyleSelect.selectOption("large-grid");
    await expect(sheetStyleSelect).toHaveValue("large-grid");

    await page.reload();
    await expect(sheetStyleSelect).toHaveValue("large-grid");

    await page.getByRole("button", {name: "Settings"}).click();
    const languageSelect = page.getByTestId("language-select");
    await languageSelect.selectOption("fr");

    await expect(page).toHaveURL(/\/fr$/);
    await expect(page.getByRole("button", {name: "Imprimer"})).toBeVisible();
    await expect(page.getByTestId("language-select")).toHaveValue("fr");
  });

  test("inserts geometry points and written additions", async ({page}) => {
    await page.goto("/en");

    const canvas = page.getByTestId("document-canvas");

    await page.getByRole("button", {name: "Point"}).click();
    await canvas.click({position: {x: 280, y: 260}});
    await expect(page.getByTestId("geometry-shape-point")).toHaveCount(1);

    await page.getByRole("button", {name: "Point"}).click();
    await page.getByRole("button", {name: "Written addition"}).click();
    await canvas.click({position: {x: 460, y: 320}});

    await expect(page.getByTestId("floating-math-block-addition")).toHaveCount(1);
    await expect(page.locator(".addition-number-input").first()).toBeVisible();
  });
});
