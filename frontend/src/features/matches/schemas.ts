import * as yup from "yup";

export const matchSchema = yup.object({
  home_club_id: yup.string().required("Escolha o mandante."),
  away_club_id: yup
    .string()
    .required("Escolha o visitante.")
    .test(
      "distinct-clubs",
      "Mandante e visitante devem ser diferentes.",
      function (value) {
        if (!value || !this.parent.home_club_id) {
          return true;
        }
        return value !== this.parent.home_club_id;
      },
    ),
});

export type MatchFormValues = yup.InferType<typeof matchSchema>;
