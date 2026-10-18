import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const clubes = [
  { nome: "Águias FC", sigla: "AGU" },
  { nome: "Delta FC", sigla: "DEL" },
  { nome: "Gama SC", sigla: "GAM" },
].map((c) => ({ ...c, nomeNormalizado: c.nome.toLowerCase() }));

const jogadores = [
  {
    nome: "Meia Lua",
    posicao: "MEI",
    agilidade: 85,
    idade: 25,
    velocidade: 70,
    finalizacao: 68,
    passe: 82,
    drible: 79,
    defesa: 55,
    fisico: 64,
    potencial: 86,
    valorBase: "40.00",
  },
  {
    nome: "Rui Prado",
    posicao: "GOL",
    agilidade: 60,
    idade: 29,
    velocidade: 55,
    finalizacao: 30,
    passe: 65,
    drible: 40,
    defesa: 77,
    fisico: 68,
    potencial: 80,
    valorBase: "30.00",
  },
  {
    nome: "Ivo Teles",
    posicao: "GOL",
    agilidade: 50,
    idade: 31,
    velocidade: 52,
    finalizacao: 28,
    passe: 60,
    drible: 35,
    defesa: 72,
    fisico: 70,
    potencial: 78,
    valorBase: "24.00",
  },
  {
    nome: "Téo Brandão",
    posicao: "ZAG",
    agilidade: 55,
    idade: 24,
    velocidade: 60,
    finalizacao: 35,
    passe: 60,
    drible: 45,
    defesa: 84,
    fisico: 78,
    potencial: 86,
    valorBase: "46.00",
  },
  {
    nome: "Hugo Vaz",
    posicao: "ZAG",
    agilidade: 40,
    idade: 35,
    velocidade: 48,
    finalizacao: 30,
    passe: 58,
    drible: 40,
    defesa: 84,
    fisico: 76,
    potencial: 84,
    valorBase: "38.00",
  },
  {
    nome: "Davi Lins",
    posicao: "LAT",
    agilidade: 75,
    idade: 22,
    velocidade: 72,
    finalizacao: 70,
    passe: 78,
    drible: 76,
    defesa: 70,
    fisico: 66,
    potencial: 80,
    valorBase: "34.00",
  },
  {
    nome: "Lino Matos",
    posicao: "LAT",
    agilidade: 82,
    idade: 26,
    velocidade: 79,
    finalizacao: 60,
    passe: 70,
    drible: 79,
    defesa: 63,
    fisico: 68,
    potencial: 83,
    valorBase: "34.00",
  },
  {
    nome: "Lauro Neves",
    posicao: "MEI",
    agilidade: 70,
    idade: 27,
    velocidade: 68,
    finalizacao: 65,
    passe: 82,
    drible: 78,
    defesa: 52,
    fisico: 60,
    potencial: 85,
    valorBase: "36.00",
  },
  {
    nome: "Nei Soares",
    posicao: "MEI",
    agilidade: 65,
    idade: 19,
    velocidade: 66,
    finalizacao: 62,
    passe: 70,
    drible: 74,
    defesa: 50,
    fisico: 58,
    potencial: 84,
    valorBase: "28.08",
  },
  {
    nome: "Otto Rangel",
    posicao: "ATA",
    agilidade: 90,
    idade: 21,
    velocidade: 78,
    finalizacao: 75,
    passe: 73,
    drible: 82,
    defesa: 48,
    fisico: 68,
    potencial: 88,
    valorBase: "51.52",
  },
  {
    nome: "Ugo Falcão",
    posicao: "ATA",
    agilidade: 80,
    idade: 28,
    velocidade: 77,
    finalizacao: 81,
    passe: 68,
    drible: 76,
    defesa: 45,
    fisico: 70,
    potencial: 85,
    valorBase: "52.00",
  },
];

async function main() {
  for (const clube of clubes) {
    await prisma.clube.upsert({
      where: { nomeNormalizado: clube.nomeNormalizado },
      update: {},
      create: clube,
    });
  }

  if ((await prisma.jogador.count()) > 0) {
    console.log("Jogadores já existem; nada a fazer.");
    return;
  }

  await prisma.jogador.createMany({ data: jogadores });
  console.log(
    `Seed concluído: ${clubes.length} clubes e ${jogadores.length} jogadores livres.`,
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
