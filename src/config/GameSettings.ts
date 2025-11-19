/**
 * Game Settings for Platform Battlers
 * Estilo Pokémon - Layout de batalla
 */

export const GameSettings = {
  canvas: {
    width: 720,
    height: 1080,
  },
  layout: {
    battleField: {
      height: 594, // 55% - Campo de batalla superior
    },
    bottomUI: {
      height: 486, // 45% - UI inferior dividida
      messageBox: {
        width: 360, // 50% izquierda
      },
      abilityGrid: {
        width: 360, // 50% derecha
      },
    },
  },
  monsters: {
    player: {
      x: 180, // Posición inferior-izquierda
      y: 420,
      scale: 1.2,
    },
    enemy: {
      x: 540, // Posición superior-derecha
      y: 200,
      scale: 1.0,
    },
  },
  ui: {
    messageBox: {
      padding: 20,
      fontSize: "24px",
      lineHeight: 32,
    },
    abilityButton: {
      size: 120,
      spacing: 20,
    },
    hpBar: {
      width: 180,
      height: 24,
    },
  },
};

export default GameSettings;
