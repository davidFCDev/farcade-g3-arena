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

    // Limpiar arrays de la vuelta anterior
    this.cards = [];
    this.borders = [];
    this.isSelecting = false;

    // Fondo
    const bg = this.add.image(360, 540, "rival-bg");
    bg.setDisplaySize(width, height);
    bg.setDepth(0);

    // Crear grid de 2 columnas x 4 filas
    const cardWidth = 280;
    const cardHeight = 220; // Reducido para que quepan mejor
    const padding = 20;
    const totalHeight = cardHeight * 4 + padding * 3; // Altura total del grid
    const startX = (width - (cardWidth * 2 + padding)) / 2;
    const startY = (height - totalHeight) / 2; // Centrado vertical perfecto

    TEAMS.forEach((team, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = startX + col * (cardWidth + padding);
      const y = startY + row * (cardHeight + padding);

      // Container para la card
      const card = this.add.container(x, y);

      // Border (graphics con esquinas redondeadas)
      const border = this.add.graphics();
      border.lineStyle(6, 0x333333, 1);
      border.strokeRoundedRect(0, 0, cardWidth, cardHeight, 12); // Radio de 12px
      card.add(border);
      this.borders.push(border);

      // Fondo de la card (muy transparente con esquinas redondeadas)
      const cardBg = this.add.graphics();
      cardBg.fillStyle(0x1a1a1a, 0.3);
      cardBg.fillRoundedRect(6, 6, cardWidth - 12, cardHeight - 12, 10);
      card.add(cardBg);

      // Imagen del trainer (más grande)
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

      // Nombre del equipo (más grande con sombra)
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

    // Seleccionar rival aleatorio (excluyendo jugador y derrotados)
    const availableIndices = TEAMS.map((_, i) => i).filter(
      (i) => i !== this.selectedTeamIndex && !this.defeatedRivals.includes(i)
    );

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
        this.sound.play("sfx-confirm", { volume: 0.8 });
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

      // Seleccionar siguiente ALEATORIO (saltando jugador y derrotados)
      let newIndex;
      do {
        newIndex = Phaser.Math.Between(0, TEAMS.length - 1);
      } while (
        newIndex === this.selectedTeamIndex ||
        newIndex === currentIndex ||
        this.defeatedRivals.includes(newIndex)
      );

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

    // Esperar un momento antes de mostrar el overlay
    this.time.delayedCall(800, () => {
      const width = 720;
      const height = 1080;

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
        360,
        540,
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

    // Transición con más tiempo para leer el overlay del rival
    this.time.delayedCall(2200, () => {
      this.cameras.main.fadeOut(300, 0, 0, 0);
      this.cameras.main.once("camerafadeoutcomplete", () => {
        this.scene.start("BattleScene", {
          selectedTeam: TEAMS[this.selectedTeamIndex],
          rivalTeam: TEAMS[this.rivalIndex],
          selectedTeamIndex: this.selectedTeamIndex,
          defeatedRivals: this.defeatedRivals || [],
          currentScore: this.currentScore,
        });
      });
    });
  }
}
