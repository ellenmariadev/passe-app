import { expect, test } from "@playwright/test";

import { createClub } from "./helpers";

test.use({ viewport: { width: 375, height: 812 } });

test("telas de jogadores e clubes sem rolagem horizontal em 375px", async ({
  page,
  request,
}) => {
  await page.goto("/players");
  const playersOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(playersOverflow).toBeLessThanOrEqual(1);

  await page.goto("/clubs");
  const clubsOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(clubsOverflow).toBeLessThanOrEqual(1);

  const club = await createClub(request);
  await page.goto(`/clubs/${club.id}`);
  const clubOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(clubOverflow).toBeLessThanOrEqual(1);
});
