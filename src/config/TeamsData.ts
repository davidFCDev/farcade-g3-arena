// Configuración de equipos, trainers y monstruos

export interface MonsterSprites {
  adultFront: string;
  adultBack: string;
  babyFront: string;
  babyBack: string;
  pathdrop: string;
  specialAbility: {
    url: string;
    frames: number;
    rows: number;
    cols: number;
    totalWidth: number;
    totalHeight: number;
    frameWidth: number;
    frameHeight: number;
  };
}

export interface Monster {
  name: string;
  color: string; // Color para partículas de sobrecarga
  isFlying?: boolean; // True si el monstruo vuela (posición más elevada)
  sprites: MonsterSprites;
}

export interface Trainer {
  name: string;
  displayName: string; // Nombre que se muestra en pantalla (ej: "@Samstock")
  sprite: string;
  monster: Monster;
}

export interface Team {
  id: string;
  name: string;
  trainer: Trainer;
}

// Definición de monstruos
const FLORAMIX: Monster = {
  name: "Floramix",
  color: "#A4DA0D", // Verde lima brillante (Plant type)
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/remix-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/remix-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/remix-baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/remixabritrum-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-special-APVGnBDCYlEN2eHNJvvDtp3uatuqZC.webp?6O5x",
      frames: 15,
      rows: 3,
      cols: 5,
      totalWidth: 1280,
      totalHeight: 384,
      frameWidth: 256,
      frameHeight: 128,
    },
  },
};

const BLAZOID: Monster = {
  name: "Blazoid",
  color: "#FF4500", // Rojo fuego/naranja (Fire/robot type)
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/avax-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/avax-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/avax-baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/avaxabritrum-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/avax-special-6AqaUBImx5J9QepUMWaYMfmBBS0579.webp?gTin",
      frames: 8,
      rows: 1,
      cols: 8,
      totalWidth: 1024,
      totalHeight: 128,
      frameWidth: 128,
      frameHeight: 128,
    },
  },
};

const ARBITRON: Monster = {
  name: "Arbitron",
  color: "#B0C4DE", // Azul acero claro (Steel type)
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/arbitrum-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/arbitrum-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/arbitrum-baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/abritrum-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/arbitrum-special-32BLXtY5jfKCLFN63Q78IlSgPGDC3X.webp?U0Mn",
      frames: 10,
      rows: 2,
      cols: 5,
      totalWidth: 640,
      totalHeight: 256,
      frameWidth: 128,
      frameHeight: 128,
    },
  },
};

const SPARKID: Monster = {
  name: "Sparkid",
  color: "#FFD700", // Amarillo eléctrico dorado (Electric type)
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/g3-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/g3-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/g3-baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/g3abritrum-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/g3-special-gbKzNVq9toSX1kt0H4zExKwOmklKo1.webp?0BUV",
      frames: 5,
      rows: 1,
      cols: 5,
      totalWidth: 640,
      totalHeight: 256,
      frameWidth: 128,
      frameHeight: 256,
    },
  },
};

const SEABYT: Monster = {
  name: "Seabyt",
  color: "#00CED1", // Cian agua (Aqua type)
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/opensea-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/opensea-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/opensea-baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/openseaabritrum-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/opensea-special-NK358EJEhzQWQAq1pHRwdIAxuj93gn.webp?QVl5",
      frames: 12,
      rows: 4,
      cols: 4,
      totalWidth: 512,
      totalHeight: 512,
      frameWidth: 128,
      frameHeight: 128,
    },
  },
};

const SOLATOX: Monster = {
  name: "Solatox",
  color: "#9333EA", // Púrpura venenoso (Poison type)
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/solana-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/solana-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/solana-baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/solanaabritrum-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/solana-special-VPvR8bqH8sIVYBnD7P0i6QuiUf9TEF.webp?vscD",
      frames: 24,
      rows: 4,
      cols: 6,
      totalWidth: 768,
      totalHeight: 512,
      frameWidth: 128,
      frameHeight: 128,
    },
  },
};

const NOCTYRA: Monster = {
  name: "Noctyra",
  color: "#1F1F1F", // Negro oscuro (Dark type)
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/wolve-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/wolves-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/wolves--baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/wolves-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/wolves-special-i7bnwvLbhu0tlY6QQwdT3x465UbQ2w.webp?RYI7",
      frames: 15,
      rows: 4,
      cols: 4,
      totalWidth: 512,
      totalHeight: 512,
      frameWidth: 128,
      frameHeight: 128,
    },
  },
};

const CRYOWIND: Monster = {
  name: "Cryowind",
  color: "#87CEEB", // Azul cielo claro (Ice/Flying type)
  isFlying: true, // Este monstruo vuela
  sprites: {
    adultFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/yield-adult-front.webp",
    adultBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/yield-adult-back.webp",
    babyFront:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/yield-baby-front.webp",
    babyBack:
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/yieldabritrum-baby-back.webp",
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/yield-special-BLsXQRAbAChCxpE6zDbVVZknVUNB9Y.webp?WTti",
      frames: 11,
      rows: 4,
      cols: 3,
      totalWidth: 768,
      totalHeight: 512,
      frameWidth: 256,
      frameHeight: 128,
    },
  },
};

// Definición de trainers
const REMIX_TRAINER: Trainer = {
  name: "Remix",
  displayName: "@Remix",
  sprite:
    "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/remix-trainer.webp",
  monster: FLORAMIX,
};

const AVAX_TRAINER: Trainer = {
  name: "Avax",
  displayName: "@Avax",
  sprite:
    "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/avax-trainer.webp",
  monster: BLAZOID,
};

const ARBITRUM_TRAINER: Trainer = {
  name: "Arbitrum",
  displayName: "@Arbitrum",
  sprite:
    "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/arbitrum-trainer.webp",
  monster: ARBITRON,
};

const G3_TRAINER: Trainer = {
  name: "G3",
  displayName: "@G3",
  sprite: "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/g3-trainer.webp",
  monster: SPARKID,
};

const OPENSEA_TRAINER: Trainer = {
  name: "Opensea",
  displayName: "@Opensea",
  sprite:
    "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/opensea-trainer.webp",
  monster: SEABYT,
};

const SOLANA_TRAINER: Trainer = {
  name: "Solana",
  displayName: "@Solana",
  sprite:
    "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/solana-trainer.webp",
  monster: SOLATOX,
};

const WOLVES_TRAINER: Trainer = {
  name: "Wolves",
  displayName: "@Wolves",
  sprite:
    "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/wolves-trainer.webp",
  monster: NOCTYRA,
};

const YIELDGUILD_TRAINER: Trainer = {
  name: "YieldGuild",
  displayName: "@YieldGuild",
  sprite:
    "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/yield-trainer.webp",
  monster: CRYOWIND,
};

// Definición de equipos
export const TEAMS: Team[] = [
  {
    id: "team-avax",
    name: "Team Avax",
    trainer: AVAX_TRAINER,
  },
  {
    id: "team-yieldguild",
    name: "Team YieldGuild",
    trainer: YIELDGUILD_TRAINER,
  },
  {
    id: "team-wolves",
    name: "Team Wolves",
    trainer: WOLVES_TRAINER,
  },
  {
    id: "team-solana",
    name: "Team Solana",
    trainer: SOLANA_TRAINER,
  },
  {
    id: "team-opensea",
    name: "Team Opensea",
    trainer: OPENSEA_TRAINER,
  },
  {
    id: "team-g3",
    name: "Team G3",
    trainer: G3_TRAINER,
  },
  {
    id: "team-arbitrum",
    name: "Team Arbitrum",
    trainer: ARBITRUM_TRAINER,
  },
  {
    id: "team-remix",
    name: "Team Remix",
    trainer: REMIX_TRAINER,
  },
  // Aquí se añadirán más equipos...
];

// Funciones helper para acceder a los datos
export const getTeamById = (id: string): Team | undefined => {
  return TEAMS.find((team) => team.id === id);
};

export const getAllTeams = (): Team[] => {
  return TEAMS;
};

export const getMonsterByName = (name: string): Monster | undefined => {
  for (const team of TEAMS) {
    if (team.trainer.monster.name === name) {
      return team.trainer.monster;
    }
  }
  return undefined;
};
