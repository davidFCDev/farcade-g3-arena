import { initRemix } from "@insidethesim/remix-dev";
import GameSettings from "./config/GameSettings";
import { BattleScene } from "./scenes/BattleScene";
import { GameScene } from "./scenes/GameScene";
import { MainMenuScene } from "./scenes/MainMenuScene";
import { PreloadScene } from "./scenes/PreloadScene";
import { RivalSelectionScene } from "./scenes/RivalSelectionScene";

// SDK mock is automatically initialized by the framework (dev-init.ts)

// Esperar a que la fuente Orbitron se cargue antes de iniciar el juego
document.fonts.ready.then(() => {
  // Game configuration
  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.WEBGL,
    width: GameSettings.canvas.width,
    height: GameSettings.canvas.height,
    scale: {
      mode: Phaser.Scale.ENVELOP,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      parent: document.body,
      width: GameSettings.canvas.width,
      height: GameSettings.canvas.height,
    },
    backgroundColor: "#0f0f1e",
    scene: [
      PreloadScene,
      MainMenuScene,
      GameScene,
      RivalSelectionScene,
      BattleScene,
    ],
    physics: {
      default: "arcade",
    },
    fps: {
      target: 60,
    },
    pixelArt: false,
    antialias: true,
  };

  // Create the game instance
  const game = new Phaser.Game(config);

  // Store globally for performance monitoring and HMR cleanup
  (window as any).game = game;

  // Initialize Remix framework after game is created
  game.events.once("ready", () => {
    initRemix(game, {
      multiplayer: false,
    });
  });
});
