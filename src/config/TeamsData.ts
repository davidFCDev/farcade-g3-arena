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
    adultFront: "",
    adultBack:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-adult-back-WJoDLv3bBS-Pg1FgbyaqvRD3v7rHuTrOMmrgTO9lc.webp?bJDx",
    babyFront: "",
    babyBack:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-baby-back-qAP8aEVODU-Md6CfTLshZ4MzXfsU1pvym9XE0oCce.webp?1YnV",
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
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/avax-adult-front-B0SGInpNMA-uu8sfswTzu3xkQkS56eyrzBWoZGGG1.webp?7ZpL",
    adultBack: "",
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/avax-baby-front-JVzpC2c49E-QOJn17OgnKdfuB5VzJflmuxOVX6dBh.webp?WgEG",
    babyBack: "",
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
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/arbitrum-adult-front-Tam80AjM63-LTM55CMVGGcX4lEMU1SyD3Ijgk1hK2.webp?tFdx",
    adultBack: "",
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/arbitrum-baby-front-AdOm4M8IRy-eZ14dOcJVitWuZJnQBeR0RGejaL9gt.webp?3KHC",
    babyBack: "",
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
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/g3-adult-front-BIme9PRpwy-oUGeULadMBJdYZhJF2qe7QhXpLCFyd.webp?aBUl",
    adultBack: "",
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/g3-baby-front-Lj6Nuf1LGD-qynSaTfwueLjoKLZdlbgHYIYagai5g.webp?Ggmw",
    babyBack: "",
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
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/opensea-adult-front-klY6dFEQA6-IHIGzH7m4icJa2YYkD8Fdm7tBI8AKO.webp?ecye",
    adultBack: "",
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/opensea-baby-front-QPn7v4ty0Q-8EiM6dUb42Tdk6wVFCITytwuvVDvMB.webp?FDnA",
    babyBack: "",
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
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/solana-adult-front-AOyuWE5rqk-P26IhDqXMfpVcp13NYiYo3nhOTpNbT.webp?gYBn",
    adultBack: "",
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/solana-baby-front-3JI05XJGhR-Y1UIuBciZOYfttmoDBaQoN6C0u4Vzj.webp?vIF6",
    babyBack: "",
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
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/wolves-adult-front-iNLEeyF6Qi-wD3CDS63LzLHkDDOcly6iC5PyCfNct.webp?dEKa",
    adultBack: "",
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/wolves-baby-front-ITL6PPdio5-TWuaEROnxJGzkjovffI0QIph06GrCg.webp?XPkx",
    babyBack: "",
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
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/yield-adult-front-f4n03Fu77D-mFbfmLPLDX6GGshQZsrIAqZAol4U5N.webp?ia98",
    adultBack: "",
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/yield-baby-front-k5xxO5ciVO-lNCKWsEY3w1RLTbPlZLWTyScUNCThM.webp?23uJ",
    babyBack: "",
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

const DARKBULL: Monster = {
  name: "Dark Bull",
  color: "#8B0000", // Rojo oscuro sangre (Dark/Fighting type)
  sprites: {
    adultFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/adult-dark-front-3k5kFfdL2U-mUOUsi34z6gVNxh0LxnpqJk7YkHdC7.webp?oBGj",
    adultBack:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/adult-dark-front-3k5kFfdL2U-mUOUsi34z6gVNxh0LxnpqJk7YkHdC7.webp?oBGj", // Usar mismo sprite por ahora
    babyFront:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/baby-dark-front-HAeNsGn8gd-CpBI50hNonSjP3mskDcsV4rPizhmMQ.webp?ikPM",
    babyBack:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/baby-dark-front-HAeNsGn8gd-CpBI50hNonSjP3mskDcsV4rPizhmMQ.webp?ikPM", // Usar mismo sprite por ahora
    pathdrop:
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-pathdrop-TrOfBKXKanWbjRdoGot3LFHiOZQdlw.webp?SAX2",
    specialAbility: {
      url: "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/dark-mage-XEKtuMePSXjKPu6CWA37v5Rkyey8rf.webp?kFAy",
      frames: 10,
      rows: 1,
      cols: 10,
      totalWidth: 1920,
      totalHeight: 128,
      frameWidth: 192,
      frameHeight: 128,
    },
  },
};

// Definición de trainers
const REMIX_TRAINER: Trainer = {
  name: "Remix",
  displayName: "@Remix",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/remix-trainer-GkCgaZdD7l-5VX7pp6Yvc8mnEzClzqPgZ1PShRKUM.webp?1u3R",
  monster: FLORAMIX,
};

const AVAX_TRAINER: Trainer = {
  name: "Avax",
  displayName: "@Avax",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/avax-trainer-bUGUicX3Ex-WX4HUSCSeuO5qTXwdtulniytACv7Cg.webp?xads",
  monster: BLAZOID,
};

const ARBITRUM_TRAINER: Trainer = {
  name: "Arbitrum",
  displayName: "@Arbitrum",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/arbitrum-trainer-TKA8BfPVaO-J2ya8sb6V060aqW3rYkqEzzK8e6SxC.webp?NHpJ",
  monster: ARBITRON,
};

const G3_TRAINER: Trainer = {
  name: "G3",
  displayName: "@G3",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/g3-trainer-yJXYN9l02C-GPfLTptEvEmR9WX8ZuNpZOlXLirmQb.webp?Webk",
  monster: SPARKID,
};

const OPENSEA_TRAINER: Trainer = {
  name: "Opensea",
  displayName: "@Opensea",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/opensea-trainer-BRHYGXiACM-6BwgCekiNRAa3Y0m60ClmrlSsHoUjw.webp?JCpn",
  monster: SEABYT,
};

const SOLANA_TRAINER: Trainer = {
  name: "Solana",
  displayName: "@Solana",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/solana-trainer-XrTOfOFO11-s0tFfLPBTHuRnHfJGv0iwPVxZXWlZ2.webp?P1X9",
  monster: SOLATOX,
};

const WOLVES_TRAINER: Trainer = {
  name: "Wolves",
  displayName: "@Wolves",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/wolves-trainer-6eTZ6Eh2S6-Ry78yjOfBHw0dzLKfvKy8S138PH7AE.webp?I68b",
  monster: NOCTYRA,
};

const YIELDGUILD_TRAINER: Trainer = {
  name: "YieldGuild",
  displayName: "@YieldGuild",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/yield-trainer-zg0cbPkE6g-7dCXfcmuioDTSqOOO259IiY04XNJ5b.webp?rqdQ",
  monster: CRYOWIND,
};

const DARKCHAMPION_TRAINER: Trainer = {
  name: "DarkChampion",
  displayName: "Dark Champion",
  sprite:
    "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/1-2SVbqTH6Dm-EWpcSPtCXv7qeio6Wjo2Lobq90fP9H.webp?xtE4",
  monster: DARKBULL,
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
  {
    id: "team-darkchampion",
    name: "Dark Champion",
    trainer: DARKCHAMPION_TRAINER,
  },
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
