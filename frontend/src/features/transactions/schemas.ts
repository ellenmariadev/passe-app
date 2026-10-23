import * as yup from "yup";

export const buySchema = yup.object({
  club_id: yup.string().required("Selecione o clube comprador."),
  loyalty_until: yup
    .string()
    .required("Informe a data e hora do fim da fidelidade."),
});

export type BuyFormValues = yup.InferType<typeof buySchema>;
