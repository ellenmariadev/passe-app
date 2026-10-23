import * as yup from "yup";

import {
  CONDITIONS,
  POSITIONS,
  type Condition,
  type Position,
} from "@/lib/domain";

const nameSchema = yup
  .string()
  .trim()
  .required("Informe o nome.")
  .min(3, "O nome deve ter pelo menos 3 caracteres.")
  .max(100, "O nome deve ter no máximo 100 caracteres.");

const agilitySchema = yup
  .number()
  .transform((value) => (Number.isNaN(value) ? undefined : value))
  .typeError("Informe um número inteiro.")
  .integer("A agilidade deve ser um número inteiro.")
  .min(1, "A agilidade deve ser entre 1 e 100.")
  .max(100, "A agilidade deve ser entre 1 e 100.")
  .required("Informe a agilidade.");

const ageSchema = yup
  .number()
  .transform((value) => (Number.isNaN(value) ? undefined : value))
  .typeError("Informe um número inteiro.")
  .integer("A idade deve ser um número inteiro.")
  .min(16, "A idade deve ser entre 16 e 45.")
  .max(45, "A idade deve ser entre 16 e 45.")
  .required("Informe a idade.");

function attributeSchema(label: string) {
  return yup
    .number()
    .transform((value) => (Number.isNaN(value) ? undefined : value))
    .typeError("Informe um número inteiro.")
    .integer(`${label} deve ser um número inteiro.`)
    .min(1, `${label} deve ser entre 1 e 99.`)
    .max(99, `${label} deve ser entre 1 e 99.`)
    .required(`Informe ${label.toLowerCase()}.`);
}

export const createPlayerSchema = yup.object({
  name: nameSchema,
  position: yup
    .mixed<Position>()
    .oneOf(POSITIONS, "Informe uma posição válida.")
    .required("Informe a posição."),
  agility: agilitySchema,
  age: ageSchema,
  pace: attributeSchema("Velocidade"),
  shooting: attributeSchema("Finalização"),
  passing: attributeSchema("Passe"),
  dribbling: attributeSchema("Drible"),
  defending: attributeSchema("Defesa"),
  physical: attributeSchema("Físico"),
  potential: attributeSchema("Potencial"),
});

export const updatePlayerSchema = yup.object({
  name: nameSchema,
  position: yup
    .mixed<Position>()
    .oneOf(POSITIONS, "Informe uma posição válida.")
    .required("Informe a posição."),
  agility: agilitySchema,
  age: ageSchema,
});

export const updateConditionSchema = yup.object({
  condition: yup
    .mixed<Condition>()
    .oneOf(CONDITIONS, "Informe uma condição válida.")
    .required("Informe a condição."),
});

export type CreatePlayerFormValues = yup.InferType<typeof createPlayerSchema>;
export type UpdatePlayerFormValues = yup.InferType<typeof updatePlayerSchema>;
export type UpdateConditionFormValues = yup.InferType<
  typeof updateConditionSchema
>;
