import { expect, test } from "@playwright/test";

test("navegação principal entre os módulos", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Passe" })).toBeVisible();

  await page.goto("/players");
  await expect(
    page.getByRole("heading", { name: "Jogadores" }),
  ).toBeVisible();

  await page.goto("/clubs");
  await expect(page.getByRole("heading", { name: "Clubes" })).toBeVisible();

  await page.goto("/market");
  await expect(page.getByRole("heading", { name: "Mercado" })).toBeVisible();

  await page.goto("/league");
  await expect(
    page.getByRole("heading", { name: "Classificação" }),
  ).toBeVisible();
});

test("navega pelo menu lateral", async ({ page }) => {
  await page.goto("/");
  const sidebar = page.locator("aside");
  await sidebar.getByRole("link", { name: "Jogadores" }).click();
  await expect(page).toHaveURL("/players");
});
