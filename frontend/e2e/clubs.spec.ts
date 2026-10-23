import { expect, test } from "@playwright/test";

import { uniqueClub } from "./helpers";

test("cria um clube e aparece na listagem", async ({ page }) => {
  const { name, acronym } = uniqueClub();

  await page.goto("/clubs/new");
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Sigla").fill(acronym);
  await page.getByRole("button", { name: "Criar clube" }).click();

  await expect(page).toHaveURL(/\/clubs\/\d+/);
  await expect(page.getByRole("heading", { name })).toBeVisible();
  await expect(page.getByText("300,00").first()).toBeVisible();

  await page.goto("/clubs");
  await expect(page.getByText(name).first()).toBeVisible();
});
