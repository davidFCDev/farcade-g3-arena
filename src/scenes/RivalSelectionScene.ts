import { TEAMS } from "../config/TeamsData";

export class RivalSelectionScene extends Phaser.Scene {
  private selectedTeamIndex: number = 0;
  private rivalIndex: number = 0;
  private cards: Phaser.GameObjects.Container[] = [];
  private borders: Phaser.GameObjects.Graphics[] = [];
  private isSelecting: boolean = false;
  private defeatedRivals: number[] = []; // Indices de rivales derrotados
  private currentScore: number = 0;

  constructor() {
    super({ key: "RivalSelectionScene" });
  }

  init(data: {
    selectedTeamIndex: number;
    defeatedRivals?: number[];
    currentScore?: number;
  }) {
    // Resetear estado completo
    this.cards = [];
    this.borders = [];
    this.isSelecting = false;
    this.rivalIndex = 0;

    this.selectedTeamIndex = data.selectedTeamIndex;
    this.defeatedRivals = data.defeatedRivals || [];
    this.currentScore =
      typeof data.currentScore === "number" ? data.currentScore : 0;
  }

  // Todos los assets se precargan ahora en PreloadScene
  preload() {}

  create() {
    const width = 720;
    const height = 1080;
    const centerX = 360;
    const centerY = 540;

    // Limpiar arrays de la vuelta anterior
    this.cards = [];
    this.borders = [];
    this.isSelecting = false;

    // 🔧 MODO DESARROLLO: Solo 2 equipos (índice 0 y 1)
    const DEV_MODE = false;
    const MAX_TEAMS_DEV = 2;

    // Verificar si debemos mostrar el Dark Boss
    const totalNormalRivals = DEV_MODE ? MAX_TEAMS_DEV - 1 : TEAMS.length - 2; // Excluir jugador y Dark Boss
    const isTimeForDarkBoss = this.defeatedRivals.length >= totalNormalRivals;

    if (isTimeForDarkBoss) {
      // Mostrar pantalla del Dark Champion
      this.time.delayedCall(100, () => {
        this.showDarkBossAppearance();
      });
      return;
    }

    // Flujo normal de selección de rivales
    // Fondo - ajustar para cubrir toda la pantalla
    const bg = this.add.image(centerX, centerY, "rival-bg");
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setDepth(0);

    // Crear grid de 2 columnas x 4 filas
    const cardWidth = 280;
    const cardHeight = 220;
    const padding = 20;
    const totalHeight = cardHeight * 4 + padding * 3;
    const startX = (width - (cardWidth * 2 + padding)) / 2;
    const startY = (height - totalHeight) / 2;

    TEAMS.forEach((team, index) => {
      // 🔧 MODO DESARROLLO: Solo mostrar primeros 2 equipos
      if (DEV_MODE && index >= MAX_TEAMS_DEV) return;

      // Excluir al Dark Boss (último equipo) de la lista visible
      if (index === TEAMS.length - 1) return;

      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);

      // Container para la card
      const card = this.add.container(x, y);

      // Border
      const border = this.add.graphics();
      border.lineStyle(6, 0x333333, 1);
      border.strokeRoundedRect(0, 0, cardWidth, cardHeight, 12);
      card.add(border);
      this.borders.push(border);

      // Fondo de la card
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x1a1a1a, 0.3);
      cardBg.fillRoundedRect(6, 6, cardWidth - 12, cardHeight - 12, 10);
      card.add(cardBg);

      // Imagen del trainer
      const trainerImg = this.add.image(
        cardWidth / 2,
        cardHeight / 2 - 10,
        `trainer-${index}`
      );
      const scale = Math.min(
        (cardWidth - 30) / trainerImg.width,
        (cardHeight - 50) / trainerImg.height
      );
      trainerImg.setScale(scale);
      card.add(trainerImg);

      // Nombre del equipo
      const teamName = this.add.text(
        cardWidth / 2,
        cardHeight - 20,
        team.name.replace("Team ", "").toUpperCase(),
        {
          fontSize: "22px",
          color: "#ffffff",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
          shadow: {
            offsetX: 3,
            offsetY: 3,
            color: "#000000",
            blur: 5,
            fill: true,
          },
        }
      );
      teamName.setOrigin(0.5, 0.5);
      card.add(teamName);

      // Si es el equipo del jugador o un rival derrotado, aplicar efecto apagado
      if (
        index === this.selectedTeamIndex ||
        this.defeatedRivals.includes(index)
      ) {
        trainerImg.setAlpha(0.3);
        teamName.setAlpha(0.3);
        border.lineStyle(6, 0x666666, 0.5);
        border.strokeRoundedRect(0, 0, cardWidth, cardHeight, 12);
      }

      card.setDepth(5);
      this.cards.push(card);
    });

    // Iniciar selección aleatoria después de 0.5 segundos
    this.time.delayedCall(500, () => {
      this.startRandomSelection();
    });
  }

  startRandomSelection() {
    this.isSelecting = true;
    let currentIndex = -1;
    let speed = 50; // Velocidad inicial muy rápida
    let iterations = 0;
    const maxIterations = 8 + Phaser.Math.Between(1, 3); // Entre 9 y 11 iteraciones (mucho más corto)

    // 🔧 MODO DESARROLLO: Solo 2 equipos
    const DEV_MODE = false;
    const MAX_TEAMS_DEV = 2;

    // Seleccionar rival aleatorio (excluyendo jugador, derrotados y Dark Boss)
    const darkBossIndex = TEAMS.length - 1;
    const maxTeams = DEV_MODE ? MAX_TEAMS_DEV : TEAMS.length;
    const availableIndices = [];
    for (let i = 0; i < maxTeams; i++) {
      if (
        i !== this.selectedTeamIndex &&
        !this.defeatedRivals.includes(i) &&
        i !== darkBossIndex
      ) {
        availableIndices.push(i);
      }
    }

    // Si solo queda un rival, seleccionarlo directamente
    if (availableIndices.length === 1) {
      this.rivalIndex = availableIndices[0];

      // Parpadeo suave del rival seleccionado
      const blinkCount = 3;
      const blinkDuration = 250;

      for (let i = 0; i < blinkCount; i++) {
        // Apagar (borde gris)
        this.time.delayedCall(i * blinkDuration * 2, () => {
          this.borders[this.rivalIndex].clear();
          this.borders[this.rivalIndex].lineStyle(4, 0x666666, 0.5);
          this.borders[this.rivalIndex].strokeRoundedRect(0, 0, 280, 220, 12);
        });

        // Encender (borde cyan)
        this.time.delayedCall(i * blinkDuration * 2 + blinkDuration, () => {
          this.borders[this.rivalIndex].clear();
          this.borders[this.rivalIndex].lineStyle(6, 0x03eae9, 1);
          this.borders[this.rivalIndex].strokeRoundedRect(0, 0, 280, 220, 12);
          if (i === 0) this.sound.play("sfx-select", { volume: 0.5 });
        });
      }

      // Reproducir sonido de confirmación y continuar
      this.time.delayedCall(blinkCount * blinkDuration * 2, () => {
        this.sound.play("sfx-start", { volume: 0.8 });
      });

      this.time.delayedCall(blinkCount * blinkDuration * 2 + 500, () => {
        this.finishSelection();
      });
      return;
    }

    this.rivalIndex = Phaser.Utils.Array.GetRandom(availableIndices);

    const selectNext = () => {
      // Restaurar border anterior al estado original (según si es jugador/derrotado o no)
      if (currentIndex !== -1) {
        this.borders[currentIndex].clear();
        if (
          currentIndex === this.selectedTeamIndex ||
          this.defeatedRivals.includes(currentIndex)
        ) {
          // Restaurar estilo apagado
          this.borders[currentIndex].lineStyle(6, 0x666666, 0.5);
        } else {
          // Restaurar estilo normal
          this.borders[currentIndex].lineStyle(6, 0x333333, 1);
        }
        this.borders[currentIndex].strokeRoundedRect(0, 0, 280, 220, 12);
      }

      // Seleccionar siguiente ALEATORIO (saltando jugador, derrotados y Dark Boss)
      const darkBossIndex = TEAMS.length - 1;

      // 🔧 MODO DESARROLLO: Solo 2 equipos
      const DEV_MODE = false;
      const MAX_TEAMS_DEV = 2;

      // Contar cuántos rivales quedan disponibles
      const availableRivals = [];
      const maxIndex = DEV_MODE ? MAX_TEAMS_DEV : TEAMS.length - 1;
      for (let i = 0; i < maxIndex; i++) {
        // Excluir Dark Boss
        if (i !== this.selectedTeamIndex && !this.defeatedRivals.includes(i)) {
          availableRivals.push(i);
        }
      }

      // Si solo queda un rival, seleccionarlo directamente
      let newIndex;
      if (availableRivals.length === 1) {
        newIndex = availableRivals[0];
      } else {
        // Selección aleatoria normal
        const maxRandomIndex = DEV_MODE ? MAX_TEAMS_DEV - 1 : TEAMS.length - 2;
        do {
          newIndex = Phaser.Math.Between(0, maxRandomIndex); // Excluir Dark Boss del rango
        } while (
          newIndex === this.selectedTeamIndex ||
          newIndex === currentIndex ||
          this.defeatedRivals.includes(newIndex)
        );
      }

      currentIndex = newIndex;

      // Colorear nuevo border con cyan (#03EAE9)
      this.borders[currentIndex].clear();
      this.borders[currentIndex].lineStyle(6, 0x03eae9, 1);
      this.borders[currentIndex].strokeRoundedRect(0, 0, 280, 220, 12);

      // (Eliminado efecto de escala: solo cambia el borde)

      iterations++;

      // Desacelerar progresivamente (ajustado para menos iteraciones)
      if (iterations > maxIterations - 4) {
        speed += 30;
      } else if (iterations > maxIterations - 7) {
        speed += 10;
      }

      // Continuar o finalizar
      if (iterations < maxIterations || currentIndex !== this.rivalIndex) {
        // Reproducir sonido tick solo si NO es la última selección
        this.sound.play("sfx-select", { volume: 0.5 });
        this.time.delayedCall(speed, selectNext);
      } else {
        this.finishSelection();
      }
    };

    selectNext();
  }

  finishSelection() {
    this.isSelecting = false;

    // Efecto final en el rival seleccionado (#03EAE9)
    this.borders[this.rivalIndex].clear();
    this.borders[this.rivalIndex].lineStyle(8, 0x03eae9, 1);
    this.borders[this.rivalIndex].strokeRoundedRect(0, 0, 280, 220, 12);

    // Sonido de selección final (mismo que botón START)
    this.sound.play("sfx-start", { volume: 0.8 });

    // (Eliminada animación de celebración de escala para cumplir requisito: solo borde)

    // Obtener dimensiones una sola vez
    const width = 720;
    const height = 1080;
    const centerX = 360;
    const centerY = 540;

    // Esperar un momento antes de mostrar el overlay
    this.time.delayedCall(800, () => {
      // Overlay oscuro
      const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
      overlay.setOrigin(0, 0);
      overlay.setDepth(100);
      overlay.setAlpha(0);

      // Obtener el nombre del equipo rival
      const rivalTeamName = TEAMS[this.rivalIndex].name
        .replace("Team ", "")
        .toUpperCase();

      // Texto del overlay
      const overlayText = this.add.text(
        centerX,
        centerY,
        `${rivalTeamName}\nJOINS THE FIGHT`,
        {
          fontSize: "40px",
          color: "#ffffff",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
          align: "center",
          lineSpacing: 6,
          shadow: {
            offsetX: 4,
            offsetY: 4,
            color: "#000000",
            blur: 8,
            fill: true,
          },
        }
      );
      overlayText.setOrigin(0.5, 0.5);
      overlayText.setDepth(101);
      overlayText.setAlpha(0);

      // Fade in del overlay y texto
      this.tweens.add({
        targets: overlay,
        alpha: 0.85,
        duration: 500,
        ease: "Power2",
      });

      this.tweens.add({
        targets: overlayText,
        alpha: 1,
        duration: 500,
        ease: "Power2",
      });
    });

    // Precargar estado del SDK antes de la transición
    this.time.delayedCall(1800, async () => {
      // Mostrar texto de carga
      const loadingText = this.add.text(centerX, centerY + 100, "Loading...", {
        fontSize: "24px",
        color: "#03eae9",
        fontFamily: "Orbitron",
        fontStyle: "bold",
      });
      loadingText.setOrigin(0.5, 0.5);
      loadingText.setDepth(102);
      loadingText.setAlpha(0);

      this.tweens.add({
        targets: loadingText,
        alpha: 1,
        duration: 300,
      });

      // Intentar cargar estado del SDK
      let sdkState = null;
      if (window.FarcadeSDK?.singlePlayer?.actions?.ready) {
        try {
          const sdkTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("SDK timeout")), 3000)
          );
          const sdkReady = window.FarcadeSDK.singlePlayer.actions.ready();
          const gameInfo = (await Promise.race([sdkReady, sdkTimeout])) as any;
          if (gameInfo?.initialGameState?.gameState) {
            sdkState = gameInfo.initialGameState.gameState;
          }
        } catch (error) {
          console.log("SDK no disponible, continuando sin estado guardado");
        }
      }

      // Transición con estado precargado
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BattleScene", {
          selectedTeam: TEAMS[this.selectedTeamIndex],
          rivalTeam: TEAMS[this.rivalIndex],
          selectedTeamIndex: this.selectedTeamIndex,
          defeatedRivals: this.defeatedRivals || [],
          currentScore: this.currentScore,
          sdkState: sdkState, // Pasar estado precargado
        });
      });
    });
  }

  showDarkBossAppearance() {
    const width = 720;
    const height = 1080;
    const centerX = 360;
    const centerY = 540;

    // Fondo oscuro dramático
    const bg = this.add.rectangle(0, 0, width, height, 0x0a0a0a);
    bg.setOrigin(0, 0);
    bg.setDepth(0);

    // Efectos de rayos rojos oscuros
    for (let i = 0; i < 8; i++) {
      const ray = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        4,
        Phaser.Math.Between(200, 400),
        0x8b0000,
        0.3
      );
      ray.setRotation(Phaser.Math.FloatBetween(0, Math.PI * 2));
      ray.setDepth(1);

      this.tweens.add({
        targets: ray,
        alpha: 0,
        scaleX: 2,
        duration: 2000,
        repeat: -1,
        yoyo: true,
      });
    }

    // Mensaje principal "DARK BOSS APPEARED!"
    const mainText = this.add.text(centerX, centerY - 240, "DARK BOSS", {
      fontSize: "72px",
      color: "#8B0000",
      fontFamily: "Orbitron",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 8,
      align: "center",
      shadow: {
        offsetX: 6,
        offsetY: 6,
        color: "#000000",
        blur: 12,
        fill: true,
      },
    });
    mainText.setOrigin(0.5, 0.5);
    mainText.setDepth(10);
    mainText.setAlpha(0);

    const subText = this.add.text(centerX, centerY - 140, "APPEARED!", {
      fontSize: "56px",
      color: "#ffffff",
      fontFamily: "Orbitron",
      fontStyle: "bold",
      stroke: "#8B0000",
      strokeThickness: 6,
      align: "center",
      shadow: {
        offsetX: 5,
        offsetY: 5,
        color: "#8B0000",
        blur: 10,
        fill: true,
      },
    });
    subText.setOrigin(0.5, 0.5);
    subText.setDepth(10);
    subText.setAlpha(0);

    // Imagen del Dark Champion
    const darkChampionIndex = TEAMS.length - 1; // Último equipo (Dark Champion)
    const trainerImg = this.add.image(
      centerX,
      centerY + 110,
      `trainer-${darkChampionIndex}`
    );
    trainerImg.setScale(1.5);
    trainerImg.setDepth(5);
    trainerImg.setAlpha(0);

    // Brillo rojo detrás del trainer
    const glow = this.add.circle(centerX, centerY + 110, 150, 0x8b0000, 0.4);
    glow.setDepth(4);
    glow.setAlpha(0);

    // Animaciones de aparición
    this.tweens.add({
      targets: mainText,
      alpha: 1,
      scale: { from: 0.5, to: 1.2 },
      duration: 800,
      ease: "Back.easeOut",
    });

    this.time.delayedCall(400, () => {
      this.tweens.add({
        targets: subText,
        alpha: 1,
        scale: { from: 0.5, to: 1.1 },
        duration: 800,
        ease: "Back.easeOut",
      });
      // Sonido opcional (si está cargado)
      if (this.sound.get("sfx-start")) {
        this.sound.play("sfx-start", { volume: 1.0 });
      }
    });

    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: [trainerImg, glow],
        alpha: 1,
        y: 600,
        duration: 1000,
        ease: "Power2",
      });

      // Pulso del brillo
      this.tweens.add({
        targets: glow,
        scale: { from: 1, to: 1.3 },
        alpha: { from: 0.4, to: 0.2 },
        duration: 1500,
        repeat: -1,
        yoyo: true,
      });
    });

    // Precargar SDK y transición a la batalla
    this.time.delayedCall(3000, async () => {
      // Mostrar texto de carga
      const loadingText = this.add.text(centerX, centerY + 250, "Loading...", {
        fontSize: "24px",
        color: "#8B0000",
        fontFamily: "Orbitron",
        fontStyle: "bold",
      });
      loadingText.setOrigin(0.5, 0.5);
      loadingText.setDepth(15);
      loadingText.setAlpha(0);

      this.tweens.add({
        targets: loadingText,
        alpha: 1,
        duration: 300,
      });

      // Intentar cargar estado del SDK
      let sdkState = null;
      if (window.FarcadeSDK?.singlePlayer?.actions?.ready) {
        try {
          const sdkTimeout = new Promise((_, reject) =>
            setTimeout(() => reject(new Error("SDK timeout")), 3000)
          );
          const sdkReady = window.FarcadeSDK.singlePlayer.actions.ready();
          const gameInfo = (await Promise.race([sdkReady, sdkTimeout])) as any;
          if (gameInfo?.initialGameState?.gameState) {
            sdkState = gameInfo.initialGameState.gameState;
          }
        } catch (error) {
          console.log("SDK no disponible, continuando sin estado guardado");
        }
      }

      // Transición con estado precargado
      this.cameras.main.fadeOut(500, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BattleScene", {
          selectedTeam: TEAMS[this.selectedTeamIndex],
          rivalTeam: TEAMS[darkChampionIndex],
          selectedTeamIndex: this.selectedTeamIndex,
          defeatedRivals: this.defeatedRivals || [],
          currentScore: this.currentScore,
          isDarkBoss: true, // Flag para indicar que es el boss final
          sdkState: sdkState, // Pasar estado precargado
        });
      });
    });
  }
}
