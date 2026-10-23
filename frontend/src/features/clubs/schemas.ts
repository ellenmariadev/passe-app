import * as yup from "yup";

export const createClubSchema = yup.object({
  name: yup
    .string()
    .trim()
    .required("Informe o nome.")
    .min(3, "O nome deve ter pelo menos 3 caracteres.")
    .max(60, "O nome deve ter no máximo 60 caracteres."),
  acronym: yup
    .string()
    .required("Informe a sigla.")
    .matches(/^[A-Z]{3}$/, "A sigla deve ter exatamente 3 letras maiúsculas."),
});

export type CreateClubFormValues = yup.InferType<typeof createClubSchema>;
