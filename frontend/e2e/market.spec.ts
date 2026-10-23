import { expect, test } from "@playwright/test";

import { createClub, createPlayer } from "./helpers";

test("compra um jogador livre para um clube", async ({ page, request }) => {
  const club = await createClub(request);
  const player = await createPlayer(request);

  await page.goto("/market");

  const row = page.getByRole("row", { name: new RegExp(player.name) });
  await row.getByRole("button", { name: "Comprar" }).click();

  await page.getByLabel("Clube comprador").click();
  await page.getByRole("option", { name: club.name }).click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();

  await expect(page.getByText("Custo total")).toBeVisible();
  await expect(page.getByText("Novo caixa do clube")).toBeVisible();
});

test("valida os campos obrigatórios da compra", async ({
  page,
  request,
}) => {
  await createPlayer(request);
  await page.goto("/market");

  await page.getByRole("button", { name: "Comprar" }).first().click();
  await page.getByRole("button", { name: "Confirmar compra" }).click();
  await expect(page.getByText("Selecione o clube comprador.")).toBeVisible();
});
