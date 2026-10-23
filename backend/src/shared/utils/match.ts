import type { PlayerAttributes, Position } from "./players.js";

export type MatchCondition = "APTO" | "MAL_CONDICIONADO";

export interface MatchStarter {
  playerId: number;
  name: string;
  position: Position;
  condition: MatchCondition;
  attributes: PlayerAttributes;
}

export interface DuelParticipant {
  playerId: number;
  name: string;
  position: Position;
  condition: MatchCondition;
  attribute: string;
  value: number;
}

export interface SimulatedDuel {
  order: number;
  attackingClubId: number;
  attacker: DuelParticipant;
  defender: DuelParticipant;
  goal: boolean;
}

export interface SimulatedMatch {
  duels: SimulatedDuel[];
  homeGoals: number;
  awayGoals: number;
  result: "MANDANTE" | "VISITANTE" | "EMPATE";
}

/** RN20: atributo de ataque conforme a posição do atacante. */
export function attackAttribute(position: Position): string {
  switch (position) {
    case "ATA":
      return "shooting";
    case "MEI":
      return "passing";
    case "ZAG":
    case "LAT":
      return "dribbling";
    default:
      return "defending";
  }
}

function getAttribute(attributes: PlayerAttributes, name: string): number {
  switch (name) {
    case "shooting":
      return attributes.finalizacao;
    case "passing":
      return attributes.passe;
    case "dribbling":
      return attributes.drible;
    case "defending":
      return attributes.defesa;
    default:
      return 0;
  }
}

/** RN20: titular MAL_CONDICIONADO joga com 15% a menos em cada atributo. */
function effectiveAttributes(starter: MatchStarter): PlayerAttributes {
  if (starter.condition === "APTO") {
    return starter.attributes;
  }
  const scale = (value: number): number => Math.round(value * 0.85);
  return {
    velocidade: scale(starter.attributes.velocidade),
    finalizacao: scale(starter.attributes.finalizacao),
    passe: scale(starter.attributes.passe),
    drible: scale(starter.attributes.drible),
    defesa: scale(starter.attributes.defesa),
    fisico: scale(starter.attributes.fisico),
  };
}

interface Team {
  clubId: number;
  starters: MatchStarter[];
}

/**
 * RN20: simula os 6 duelos entre dois times com escalação completa.
 * `starters` deve estar na ordem do elenco: goleiro + 4 jogadores de linha
 * (1º o mais recuado, 4º o mais avançado).
 */
export function simulateMatch(home: Team, away: Team): SimulatedMatch {
  const duels: SimulatedDuel[] = [];
  let homeGoals = 0;
  let awayGoals = 0;

  const attacks: Array<{
    order: number;
    attacking: Team;
    defending: Team;
    attackerIndex: number;
    defenderIndex: number;
  }> = [
    {
      order: 1,
      attacking: home,
      defending: away,
      attackerIndex: 4,
      defenderIndex: 0,
    },
    {
      order: 2,
      attacking: home,
      defending: away,
      attackerIndex: 3,
      defenderIndex: 1,
    },
    {
      order: 3,
      attacking: home,
      defending: away,
      attackerIndex: 2,
      defenderIndex: 2,
    },
    {
      order: 4,
      attacking: away,
      defending: home,
      attackerIndex: 4,
      defenderIndex: 0,
    },
    {
      order: 5,
      attacking: away,
      defending: home,
      attackerIndex: 3,
      defenderIndex: 1,
    },
    {
      order: 6,
      attacking: away,
      defending: home,
      attackerIndex: 2,
      defenderIndex: 2,
    },
  ];

  for (const attack of attacks) {
    const attackerStarter = attack.attacking.starters[attack.attackerIndex];
    const defenderStarter = attack.defending.starters[attack.defenderIndex];

    const attackerAttr = effectiveAttributes(attackerStarter);
    const defenderAttr = effectiveAttributes(defenderStarter);

    const attackAttrName = attackAttribute(attackerStarter.position);
    const attackValue = getAttribute(attackerAttr, attackAttrName);
    const defenseValue = defenderAttr.defesa;

    const goal = attackValue > defenseValue;

    if (goal) {
      if (attack.attacking.clubId === home.clubId) {
        homeGoals += 1;
      } else {
        awayGoals += 1;
      }
    }

    duels.push({
      order: attack.order,
      attackingClubId: attack.attacking.clubId,
      attacker: {
        playerId: attackerStarter.playerId,
        name: attackerStarter.name,
        position: attackerStarter.position,
        condition: attackerStarter.condition,
        attribute: attackAttrName,
        value: attackValue,
      },
      defender: {
        playerId: defenderStarter.playerId,
        name: defenderStarter.name,
        position: defenderStarter.position,
        condition: defenderStarter.condition,
        attribute: "defending",
        value: defenseValue,
      },
      goal,
    });
  }

  const result =
    homeGoals > awayGoals
      ? "MANDANTE"
      : homeGoals < awayGoals
        ? "VISITANTE"
        : "EMPATE";

  return { duels, homeGoals, awayGoals, result };
}
