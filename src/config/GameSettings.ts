/**
 * Game Settings for Platform Battlers
 * Estilo Pokémon - Layout de batalla
 */

export const GameSettings = {
  canvas: {
    width: 720,
    height: 1080, // Base height (2:3). Use getGameHeight() for actual runtime height.
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

/**
 * Compute game height based on the actual viewport.
 * - 2:3 or wider → 1080 (standard)
 * - Taller screens → proportionally larger (e.g. 1280 for 9:16)
 */
export function getGameHeight(): number {
  const w = window.innerWidth;
  const h = window.innerHeight;
  const aspectRatio = w / h;
  const is2by3 = Math.abs(aspectRatio - 2 / 3) < 0.02;

  if (is2by3 || aspectRatio > 2 / 3) {
    return GameSettings.canvas.height;
  }

  // Taller than 2:3 — expand height, cap at 1920
  return Math.min(1920, Math.round(GameSettings.canvas.width / aspectRatio));
}

export default GameSettings;
