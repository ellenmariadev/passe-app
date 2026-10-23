import * as yup from "yup";

import { FORMATIONS, type Formation } from "@/lib/domain";

const playerIdSchema = yup.string().required("Escolha um jogador.");

export const lineupSchema = yup.object({
  formation: yup
    .mixed<Formation>()
    .oneOf(FORMATIONS, "Selecione uma formação válida.")
    .required("Selecione a formação."),
  goalkeeper_id: playerIdSchema,
  slot1: playerIdSchema,
  slot2: playerIdSchema,
  slot3: playerIdSchema,
  slot4: playerIdSchema.test(
    "distinct-players",
    "Escolha 5 jogadores diferentes.",
    function (value) {
      const ids = [
        this.parent.goalkeeper_id,
        this.parent.slot1,
        this.parent.slot2,
        this.parent.slot3,
        value,
      ];
      if (ids.some((id) => id === undefined || id === "")) {
        return true;
      }
      return new Set(ids).size === ids.length;
    },
  ),
});

export type LineupFormValues = yup.InferType<typeof lineupSchema>;
