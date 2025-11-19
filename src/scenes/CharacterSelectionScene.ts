import { TEAMS } from "../config/TeamsData";

export class CharacterSelectionScene extends Phaser.Scene {
  private currentIndex: number = 7; // Empezar con Remix (índice 7)
  private teamImage?: Phaser.GameObjects.Image;
  private imageMask?: Phaser.Display.Masks.GeometryMask;
  private teamNameText?: Phaser.GameObjects.Text;

  constructor() {
    super({ key: "CharacterSelectionScene" });
  }

  // Todos los assets se precargan ahora en PreloadScene
  preload() {}

  create() {
    const width = 720;
    const height = 1080;

    // Fondo con imagen
    const bg = this.add.image(360, 540, "selection-bg");
    bg.setDisplaySize(width, height);
    bg.setDepth(0);

    // Mapeo de imágenes
    const charImages: { [key: string]: string } = {
      "team-avax": "avax-char",
      "team-yieldguild": "yield-char",
      "team-wolves": "wolves-char",
      "team-solana": "solana-char",
      "team-opensea": "opensea-char",
      "team-g3": "g3-char",
      "team-arbitrum": "arbitrum-char",
      "team-remix": "remix-char",
    };

    // Imagen del equipo (detrás de la pokédex)
    // Posición fija relativa al centro de la pantalla
    this.teamImage = this.add.image(
      360,
      480,
      charImages[TEAMS[this.currentIndex].id]
    );
    this.teamImage.setDepth(1);
    // Escalar para que encaje en la pantalla de la pokédex
    const imageScale = Math.min(
      (width * 0.55) / this.teamImage.width,
      (height * 0.45) / this.teamImage.height
    );
    this.teamImage.setScale(imageScale);

    // Crear máscara para ocultar el overflow de las imágenes
    const maskShape = this.add.graphics();
    maskShape.fillStyle(0xffffff);
    // Área rectangular donde se muestra la imagen (zona de la pantalla de la pokédex)
    maskShape.fillRect(110, 190, 500, 600);
    this.imageMask = maskShape.createGeometryMask();
    this.teamImage.setMask(this.imageMask);

    // Pokédex encima de la imagen
    const pokedex = this.add.image(360, 540, "pokedex");
    pokedex.setDepth(10);
    // Escalar pokédex para que ocupe casi toda la pantalla
    const pokedexScale = Math.min(
      (width * 0.98) / pokedex.width,
      (height * 0.95) / pokedex.height
    );
    pokedex.setScale(pokedexScale);

    // Luz de encendido (arriba izquierda con glow) - Cyan
    const powerLight = this.add.circle(170, 170, 45, 0x03ebe9);
    powerLight.setDepth(25);

    // Glow de la luz de encendido
    const glowLight1 = this.add.circle(170, 170, 54, 0x03ebe9, 0.4);
    glowLight1.setDepth(24);
    const glowLight2 = this.add.circle(170, 170, 63, 0x03ebe9, 0.2);
    glowLight2.setDepth(23);

    // Animación pulsante de la luz
    this.tweens.add({
      targets: [powerLight, glowLight1, glowLight2],
      alpha: 0.6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Triángulos de navegación (debajo del cristal de la pokédex)
    // Posición fija relativa a la pokédex
    const triangleY = 728;

    // Triángulo izquierdo (más grande)
    const leftTriangle = this.add.graphics();
    leftTriangle.fillStyle(0x333333, 1);
    leftTriangle.fillTriangle(
      290,
      triangleY, // vértice izquierdo
      325,
      triangleY - 20, // vértice superior
      325,
      triangleY + 20 // vértice inferior
    );
    leftTriangle.setDepth(25);
    // Área de hit ampliada (rectángulo más grande que el triángulo visual)
    leftTriangle.setInteractive(
      new Phaser.Geom.Rectangle(
        270, // x más a la izquierda
        triangleY - 40, // y más arriba
        70, // ancho ampliado
        80 // alto ampliado
      ),
      Phaser.Geom.Rectangle.Contains
    );
    // Cursor pointer para mejorar UX
    if (leftTriangle.input) {
      leftTriangle.input.cursor = "pointer";
    }
    leftTriangle.on("pointerdown", () => this.previousTeam(charImages));
    leftTriangle.on("pointerover", () => {
      leftTriangle.clear();
      leftTriangle.fillStyle(0x555555, 1);
      leftTriangle.fillTriangle(
        290,
        triangleY,
        325,
        triangleY - 20,
        325,
        triangleY + 20
      );
    });
    leftTriangle.on("pointerout", () => {
      leftTriangle.clear();
      leftTriangle.fillStyle(0x333333, 1);
      leftTriangle.fillTriangle(
        290,
        triangleY,
        325,
        triangleY - 20,
        325,
        triangleY + 20
      );
    });

    // Triángulo derecho (más grande)
    const rightTriangle = this.add.graphics();
    rightTriangle.fillStyle(0x333333, 1);
    rightTriangle.fillTriangle(
      430,
      triangleY, // vértice derecho
      395,
      triangleY - 20, // vértice superior
      395,
      triangleY + 20 // vértice inferior
    );
    rightTriangle.setDepth(25);
    // Área de hit ampliada (rectángulo más grande que el triángulo visual)
    rightTriangle.setInteractive(
      new Phaser.Geom.Rectangle(
        380, // x más a la izquierda
        triangleY - 40, // y más arriba
        70, // ancho ampliado
        80 // alto ampliado
      ),
      Phaser.Geom.Rectangle.Contains
    );
    if (rightTriangle.input) {
      rightTriangle.input.cursor = "pointer";
    }
    rightTriangle.on("pointerdown", () => this.nextTeam(charImages));
    rightTriangle.on("pointerover", () => {
      rightTriangle.clear();
      rightTriangle.fillStyle(0x555555, 1);
      rightTriangle.fillTriangle(
        430,
        triangleY,
        395,
        triangleY - 20,
        395,
        triangleY + 20
      );
    });
    rightTriangle.on("pointerout", () => {
      rightTriangle.clear();
      rightTriangle.fillStyle(0x333333, 1);
      rightTriangle.fillTriangle(
        430,
        triangleY,
        395,
        triangleY - 20,
        395,
        triangleY + 20
      );
    });

    // Nombre del equipo (debajo de la imagen)
    // Posición fija relativa a la pokédex
    const teamNameOnly = TEAMS[this.currentIndex].name
      .replace("Team ", "")
      .toUpperCase();
    this.teamNameText = this.add.text(360, 655, teamNameOnly, {
      fontSize: "32px",
      color: "#ffffff",
      fontFamily: "Orbitron",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 5,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: "#000000",
        blur: 5,
        fill: true,
      },
    });
    this.teamNameText.setOrigin(0.5, 0.5);
    this.teamNameText.setDepth(25);

    // Texto "Select" (en la parte baja de la pokédex)
    // Posición fija
    const selectText = this.add.text(315, 910, "SELECT", {
      fontSize: "32px",
      color: "#1a1a1a",
      fontFamily: "Orbitron",
      fontStyle: "bold",
    });
    selectText.setOrigin(0.5, 0.5);
    selectText.setDepth(25);
    // Área de hit ampliada para facilitar el toque en móviles
    selectText.setInteractive(
      new Phaser.Geom.Rectangle(-60, -30, 240, 80), // Área mucho más grande
      Phaser.Geom.Rectangle.Contains
    );
    // Configurar cursor pointer
    if (selectText.input) {
      selectText.input.cursor = "pointer";
    }

    // Animación de parpadeo suave (menos transparente)
    this.tweens.add({
      targets: selectText,
      alpha: 0.7,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    selectText.on("pointerdown", () => {
      this.sound.play("sfx-start", { volume: 0.8 });
      this.selectTeam();
    });
    selectText.on("pointerover", () => {
      selectText.setStyle({ color: "#333333" });
      selectText.setScale(1.05);
    });
    selectText.on("pointerout", () => {
      selectText.setStyle({ color: "#2a2a2a" });
      selectText.setScale(1);
    });

    // Overlay de introducción con "Choose Your Team"
    const overlay = this.add.rectangle(0, 0, width, height, 0x000000, 0.85);
    overlay.setOrigin(0, 0);
    overlay.setDepth(100);

    const introText = this.add.text(360, 540, "CHOOSE\nYOUR TEAM", {
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
    });
    introText.setOrigin(0.5, 0.5);
    introText.setDepth(101);

    // Fade out del overlay después de 1 segundo
    this.time.delayedCall(1000, () => {
      this.tweens.add({
        targets: [overlay, introText],
        alpha: 0,
        duration: 500,
        ease: "Power2",
        onComplete: () => {
          overlay.destroy();
          introText.destroy();

          // Iniciar música de selección en loop
          const music = this.sound.add("music-selection", {
            loop: true,
            volume: 0.6,
          });
          music.play();
        },
      });
    });
  }

  nextTeam(charImages: { [key: string]: string }) {
    if (this.currentIndex < TEAMS.length - 1) {
      this.currentIndex++;
    } else {
      this.currentIndex = 0; // Volver al inicio
    }
    this.sound.play("sfx-pokedex", { volume: 0.5 });
    this.updateTeamImage(charImages, 1); // 1 = dirección derecha
  }

  previousTeam(charImages: { [key: string]: string }) {
    if (this.currentIndex > 0) {
      this.currentIndex--;
    } else {
      this.currentIndex = TEAMS.length - 1; // Ir al final
    }
    this.sound.play("sfx-pokedex", { volume: 0.5 });
    this.updateTeamImage(charImages, -1); // -1 = dirección izquierda
  }

  updateTeamImage(
    charImages: { [key: string]: string },
    direction: number = 1
  ) {
    if (!this.teamImage) return;

    // Guardar referencia de la imagen actual antes de crear la nueva
    const oldImage = this.teamImage;

    // Crear nueva imagen EXACTAMENTE en la misma posición (sin offset)
    const newImage = this.add.image(
      360,
      480,
      charImages[TEAMS[this.currentIndex].id]
    );
    newImage.setDepth(1);
    const imageScale = Math.min(
      (720 * 0.55) / newImage.width,
      (1080 * 0.45) / newImage.height
    );
    newImage.setScale(imageScale);

    // Empezar completamente invisible
    newImage.setAlpha(0);

    // Aplicar la máscara a la nueva imagen
    if (this.imageMask) {
      newImage.setMask(this.imageMask);
    }

    // Actualizar referencia ANTES de las animaciones
    this.teamImage = newImage;

    // Actualizar el nombre del equipo con fade
    if (this.teamNameText) {
      // Fade out del texto actual
      this.tweens.add({
        targets: this.teamNameText,
        alpha: 0,
        duration: 150,
        ease: "Power2",
        onComplete: () => {
          const teamNameOnly = TEAMS[this.currentIndex].name
            .replace("Team ", "")
            .toUpperCase();
          this.teamNameText!.setText(teamNameOnly);
          // Fade in del nuevo texto
          this.tweens.add({
            targets: this.teamNameText,
            alpha: 1,
            duration: 150,
            ease: "Power2",
          });
        },
      });
    }

    // CROSSFADE: Fade out de la imagen antigua Y fade in de la nueva AL MISMO TIEMPO
    // Esto evita cualquier flash blanco porque siempre hay una imagen visible
    this.tweens.add({
      targets: oldImage,
      alpha: 0,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        oldImage.destroy();
      },
    });

    // Fade in de la nueva imagen AL MISMO TIEMPO (sin delay)
    this.tweens.add({
      targets: newImage,
      alpha: 1,
      duration: 300,
      ease: "Power2",
    });
  }

  selectTeam() {
    const selectedTeam = TEAMS[this.currentIndex];
    console.log("Selected team:", selectedTeam.name);

    // Fade out y transición a la selección de rival
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.time.delayedCall(500, () => {
      // Iniciar la escena de selección de rival con el índice del equipo seleccionado
      this.scene.start("RivalSelectionScene", {
        selectedTeamIndex: this.currentIndex,
      });
    });
  }
}
