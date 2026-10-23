import { expect, test } from "@playwright/test";

import { uniquePlayerName } from "./helpers";

test("valida os campos obrigatórios no cadastro de jogador", async ({
  page,
}) => {
  await page.goto("/players/new");
  await page.getByRole("button", { name: "Cadastrar jogador" }).click();

  await expect(page.getByText("Informe o nome.")).toBeVisible();
  await expect(page.getByText("Informe a posição.")).toBeVisible();
  await expect(page.getByText("Informe a agilidade.")).toBeVisible();
  await expect(page.getByText("Informe a idade.")).toBeVisible();
});

test("cadastra e edita um jogador", async ({ page }) => {
  const name = uniquePlayerName();
  const editedName = uniquePlayerName();

  await page.goto("/players/new");
  await page.getByLabel("Nome").fill(name);
  await page.getByLabel("Posição").click();
  await page.getByRole("option", { name: "Meia" }).click();
  await page.getByLabel("Agilidade").fill("70");
  await page.locator("#age").fill("25");
  await page.getByLabel("Velocidade").fill("70");
  await page.getByLabel("Finalização").fill("68");
  await page.getByLabel("Passe").fill("82");
  await page.getByLabel("Drible").fill("79");
  await page.getByLabel("Defesa").fill("55");
  await page.getByLabel("Físico").fill("64");
  await page.getByLabel("Potencial").fill("86");

  await page.getByRole("button", { name: "Cadastrar jogador" }).click();

  await expect(page).toHaveURL(/\/players\/\d+/);
  await expect(page.getByRole("heading", { name })).toBeVisible();

  await page.getByRole("button", { name: "Editar" }).click();
  await expect(page).toHaveURL(/\/players\/\d+\/edit/);

  await page.getByLabel("Nome").fill(editedName);
  await page.getByRole("button", { name: "Salvar alterações" }).click();

  await expect(page.getByRole("heading", { name: editedName })).toBeVisible();
});
