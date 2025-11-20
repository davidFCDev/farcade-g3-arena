import { TEAMS } from "../config/TeamsData";

export class PreloadScene extends Phaser.Scene {
  private progressBarElement?: HTMLElement;
  private assetsLoaded: boolean = false;

  constructor() {
    super({ key: "PreloadScene" });
  }

  init(): void {
    this.cameras.main.setBackgroundColor("#000000");
    this.createStudioBranding();
  }

  preload(): void {
    // Setup loading progress listeners
    this.load.on("progress", (value: number) => {
      this.updateProgressBar(value);
    });

    this.load.on("complete", () => {
      console.log("✅ Todos los assets cargados al 100%");
      this.assetsLoaded = true;
      this.updateProgressBar(1);
    });

    // Manejo de errores en la carga de archivos
    this.load.on("loaderror", (file: any) => {
      console.warn("⚠️ Error cargando archivo:", file.key, file.url);
      // Continuar aunque fallen algunos archivos (especialmente audio)
    });

    // WebFont loader (para fuentes tipo Orbitron, Pixelify, etc.)
    this.load.script(
      "webfont",
      "https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"
    );

    // --- AUDIO GLOBAL (Comentado temporalmente por errores 403 en S3) ---
    // Los archivos de audio en S3 no están configurados con acceso público
    // El juego funcionará sin audio hasta que se resuelva el acceso a S3
    /*
    this.load.audio(
      "bgm-menu",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/main-song-PcbJRVFBNYAiEXs0hmOdFb2GWzD7X9.mp3"
    );

    this.load.audio(
      "sfx-attack",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/sfx-attack.mp3"
    );
    this.load.audio(
      "sfx-special",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/sfx-special.mp3"
    );
    this.load.audio(
      "sfx-hit",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/sfx-hit.mp3"
    );
    this.load.audio(
      "sfx-block",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/sfx-block.mp3"
    );
    */

    // --- FONDOS PRINCIPALES ---
    this.load.image(
      "selection-bg",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/select-menu-scene.png"
    );
    this.load.image(
      "rival-bg",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/select-menu-scene.png"
    );

    // Mapas de batalla aleatorios (3 opciones)
    this.load.image(
      "battle-bg-1",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/map1+(1).webp"
    );
    this.load.image(
      "battle-bg-2",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/map2.webp"
    );
    this.load.image(
      "battle-bg-3",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/map3.webp"
    );

    // Mapa especial del Dark Boss
    this.load.image(
      "battle-bg-darkboss",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/Dise%C3%B1o+sin+t%C3%ADtulo+(97).png"
    );

    // --- UI GENERAL / SELECCIÓN DE PERSONAJE ---
    this.load.image(
      "pokedex",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/pokedex.webp"
    );
    this.load.image(
      "remix-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/11.webp"
    );
    this.load.image(
      "avax-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/14.webp"
    );
    this.load.image(
      "arbitrum-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/13.webp"
    );
    this.load.image(
      "wolves-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/18.webp"
    );
    this.load.image(
      "solana-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/17.webp"
    );
    this.load.image(
      "opensea-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/16.webp"
    );
    this.load.image(
      "g3-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/12.webp"
    );
    this.load.image(
      "yield-char",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/15.webp"
    );

    // --- UI DE BATALLA ---
    this.load.image(
      "badge",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-badge-final-getVjlLliCI9TVl59NtiaSnJhvMYYw.webp?owNA"
    );
    this.load.image(
      "uiZone",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-container%20%281%29-UL6xb74fyXAuhxOh76dceqwSvO0s1s.webp?vdV2"
    );
    this.load.image(
      "trainerLayer",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-trainerlayer-qSIY7qUTVIDfgeWMiWvLuS8tfQ89Sj.webp?7FAy"
    );
    this.load.image(
      "chatZone",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-chat-xr1DHsRAXUaFm3hlhJElpBlsV5AuZs.webp?Iqii"
    );
    this.load.image(
      "button",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-button-TFG5xTSKRm39sKQSjC5lvMT0McjobQ.webp?eCSj"
    );
    this.load.image(
      "coin",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/coin-sZgG9ZnAm2IZNembvWWDX3doEQBv7W.webp?n8Q8"
    );

    // --- TRAINERS Y MONSTRUOS (assets comunes por equipo) ---
    TEAMS.forEach((team, index) => {
      // Sprites de trainer para selección de rival
      this.load.image(`trainer-${index}`, team.trainer.sprite);

      // Sprites de monstruos (frontal y trasero, baby/adult)
      const sprites = team.trainer.monster.sprites;
      this.load.image(`${team.id}-player-baby`, sprites.babyBack);
      this.load.image(`${team.id}-player-adult`, sprites.adultBack);
      this.load.image(`${team.id}-enemy-baby`, sprites.babyFront);
      this.load.image(`${team.id}-enemy-adult`, sprites.adultFront);
    });
  }

  create(): void {
    // Assets loaded, wait for minimum display time then transition
  }

  private createStudioBranding(): void {
    const gameCanvas = this.sys.game.canvas;
    const gameContainer = gameCanvas.parentElement;

    const overlay = document.createElement("div");
    overlay.id = "studio-overlay";
    overlay.style.cssText = `
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: #000000;
      z-index: 9999;
      pointer-events: all;
    `;

    const studioText = document.createElement("div");
    studioText.id = "studio-text";
    studioText.style.cssText = `
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-family: "Pixelify Sans", "Press Start 2P", system-ui, monospace;
      font-weight: 700;
      color: #ffffff;
      text-shadow: 3px 3px 0 #000;
      gap: 6px;
      opacity: 0;
      transform: translateY(8px) scale(0.98);
      transition: opacity 700ms ease, transform 500ms cubic-bezier(0.2, 0.6, 0.2, 1);
      min-height: 80px;
      width: 100%;
    `;

    const brandMain = document.createElement("div");
    brandMain.style.cssText = `
      font-size: 24px;
      letter-spacing: 3px;
      line-height: 1;
      color: #ffffff;
      position: relative;
      text-shadow: 2px 0 #000, -2px 0 #000, 0 2px #000, 0 -2px #000,
        2px 2px #000, -2px 2px #000, 2px -2px #000, -2px -2px #000,
        3px 3px 0 #000;
      margin-bottom: 8px;
    `;
    brandMain.textContent = "HELLBOUND";

    const progressContainer = document.createElement("div");
    progressContainer.style.cssText = `
      width: 200px;
      height: 20px;
      border: 3px solid #000000;
      border-radius: 12px;
      margin: 12px auto;
      display: block;
      position: relative;
      box-sizing: border-box;
      background: #1a1a1a;
      overflow: hidden;
      box-shadow: 
        inset 0 2px 4px rgba(0, 0, 0, 0.5),
        0 0 8px rgba(183, 255, 0, 0.3);
    `;

    const greenLine = document.createElement("div");
    greenLine.style.cssText = `
      width: 0%;
      height: 100%;
      background: linear-gradient(to bottom, 
        #b7ff00 0%, 
        #a0e600 30%,
        #8fcc00 50%,
        #a0e600 70%,
        #b7ff00 100%
      );
      border-radius: 9px;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      position: relative;
      box-shadow: 
        0 0 10px rgba(183, 255, 0, 0.6),
        inset 0 1px 0 rgba(255, 255, 255, 0.3);
    `;

    progressContainer.appendChild(greenLine);
    this.progressBarElement = greenLine;

    const brandSub = document.createElement("div");
    brandSub.style.cssText = `
      font-size: 14px;
      letter-spacing: 4px;
      color: #b7ff00;
      text-shadow: 3px 3px 0 #000, 0 0 10px rgba(183, 255, 0, 0.3);
      line-height: 1;
    `;
    brandSub.textContent = "STUDIOS";

    const brandTm = document.createElement("span");
    brandTm.style.cssText = `
      position: absolute;
      top: -6px;
      right: -16px;
      font-size: 9px;
      color: #ffffff;
      text-shadow: 2px 2px 0 #000;
      opacity: 0.9;
    `;
    brandTm.textContent = "™";

    brandMain.appendChild(brandTm);
    studioText.appendChild(brandMain);
    studioText.appendChild(progressContainer);
    studioText.appendChild(brandSub);
    overlay.appendChild(studioText);

    if (gameContainer) {
      gameContainer.appendChild(overlay);
    } else {
      document.body.appendChild(overlay);
    }

    (this as any).studioOverlay = overlay;
    (this as any).studioText = studioText;

    this.showStudioText();
  }

  private showStudioText(): void {
    const studioText = (this as any).studioText;

    if (!studioText) {
      this.transitionToGame().catch(console.error);
      return;
    }

    studioText.style.opacity = "1";
    studioText.style.transform = "translateY(0) scale(1)";

    this.waitForAssetsAndTransition();
  }

  private waitForAssetsAndTransition(): void {
    const minDisplayTime = 2000;
    const startTime = Date.now();

    // Esperar a que WebFont esté cargado y luego cargar Orbitron explícitamente
    const ensureFontsLoaded = (): Promise<void> => {
      return new Promise((resolve) => {
        const onWebFontReady = () => {
          const wf = (window as any).WebFont;
          if (!wf || !wf.load) {
            // Si por algún motivo WebFont no está disponible, hacemos fallback a document.fonts
            if ((document as any).fonts?.ready) {
              (document as any).fonts.ready
                .then(() => resolve())
                .catch(() => resolve());
            } else {
              resolve();
            }
            return;
          }

          wf.load({
            google: {
              families: ["Orbitron:400,700"],
            },
            active: () => {
              resolve();
            },
            inactive: () => {
              resolve();
            },
          });
        };

        // Esperar a que el script de WebFont se haya cargado
        const checkInterval = setInterval(() => {
          if ((window as any).WebFont) {
            clearInterval(checkInterval);
            onWebFontReady();
          }
        }, 50);
      });
    };

    const checkAndTransition = () => {
      const elapsedTime = Date.now() - startTime;

      if (this.assetsLoaded && elapsedTime >= minDisplayTime) {
        ensureFontsLoaded()
          .then(() => {
            console.log(
              "🎮 Transición a MainMenuScene (assets + fuentes listas)"
            );

            const studioText = (this as any).studioText;
            if (studioText) {
              studioText.style.opacity = "0";
              studioText.style.transform = "translateY(8px) scale(0.98)";
            }

            setTimeout(() => {
              this.transitionToGame().catch(console.error);
            }, 600);
          })
          .catch(() => {
            // Si algo va mal con las fuentes, al menos continuamos
            console.warn("⚠️ Error cargando fuentes con WebFont, continuando");
            const studioText = (this as any).studioText;
            if (studioText) {
              studioText.style.opacity = "0";
              studioText.style.transform = "translateY(8px) scale(0.98)";
            }

            setTimeout(() => {
              this.transitionToGame().catch(console.error);
            }, 600);
          });
      } else {
        setTimeout(checkAndTransition, 100);
      }
    };

    checkAndTransition();
  }

  private updateProgressBar(progress: number): void {
    if (this.progressBarElement) {
      const percentage = Math.round(progress * 100);
      this.progressBarElement.style.width = `${percentage}%`;
      console.log(`📦 Loading: ${percentage}%`);
    }
  }

  private async transitionToGame(): Promise<void> {
    const overlay = (this as any).studioOverlay;

    if (overlay && overlay.parentElement) {
      overlay.parentElement.removeChild(overlay);
      (this as any).studioOverlay = null;
      (this as any).studioText = null;
    }

    this.progressBarElement = undefined;
    this.scene.start("MainMenuScene");
  }
}
