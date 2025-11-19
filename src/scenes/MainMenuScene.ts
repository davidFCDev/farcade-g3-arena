export class MainMenuScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainMenuScene" });
  }

  preload() {
    // Cargar imagen de fondo
    this.load.image(
      "menu-bg",
      "https://g3-remix-bucket.s3.eu-north-1.amazonaws.com/Dise%C3%B1o+sin+t%C3%ADtulo+(98).png"
    );

    // Cargar audios
    this.load.audio(
      "sfx-start",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/start-KAHDaTAFztq3sUz7CJy7TutmOGzsp2.mp3?050F"
    );
    this.load.audio(
      "sfx-pokedex",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/pokedex-xxWufziI92hGtKzMk5B6OvZc73k8WH.mp3?2AgA"
    );
    this.load.audio(
      "sfx-select",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/select-JnOvmii78UigFWiLDpIfDbdbwIWeN4.mp3?7Px7"
    );
    this.load.audio(
      "music-selection",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/start-music-xxYYpxNilydXjoP7YoueVCKX8BQevz.mp3?CjSh"
    );
    this.load.audio(
      "music-battle",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/music1-Q0vPf8z0Spzm88n1OQtNKP7cgsPK5w.mp3?CE9h"
    );
    this.load.audio(
      "music-battle-2",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/cyberpunk-132336-RFAH5p8ZvOJxB6YancH1gEURaSlpkE.mp3?CqdS"
    );

    // Nuevos efectos de sonido para batallas
    this.load.audio(
      "sfx-sphere-hit",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/sphere-WLSBDucIaPDaAlXubJ3SEfjq79o9K9.mp3?e54C"
    );
    this.load.audio(
      "sfx-special",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/special-YjhYkcVGXDgUTALglTIPQKxvjsEkid.mp3?LD1H"
    );
    this.load.audio(
      "sfx-attack",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/attack-aswJG3qiQoxlKZnaevHsNgKIa9xBnu.mp3?RJLA"
    );
    this.load.audio(
      "sfx-shield",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/shield-z5xrn3ac2LMFJCyQm0DjBhvccel8B2.mp3?ivSh"
    );
  }

  create() {
    // Esperar a que las fuentes se carguen antes de crear el contenido
    document.fonts.ready.then(() => {
      this.createContent();
    });
  }

  createContent() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Fondo - ajustar para cubrir toda la pantalla
    const bg = this.add.image(centerX, centerY, "menu-bg");
    const scaleX = width / bg.width;
    const scaleY = height / bg.height;
    const scale = Math.max(scaleX, scaleY);
    bg.setScale(scale);
    bg.setDepth(0);

    // Overlay oscuro suave
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      width,
      height,
      0x000000,
      0.25
    );
    overlay.setDepth(1);

    // Título "G3 ARENA" (tamaño aumentado)
    const title = this.add.text(centerX, centerY - 190, "G3 ARENA", {
      fontSize: "100px", // aumentado desde 80px
      color: "#03EAE9",
      fontFamily: "Orbitron",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 8,
      shadow: {
        offsetX: 6,
        offsetY: 6,
        color: "#000000",
        blur: 12,
        fill: true,
      },
    });
    title.setOrigin(0.5, 0.5);
    title.setDepth(10);

    // Contenedor del botón START
    const buttonY = centerY + 110;
    const buttonWidth = 300;
    const buttonHeight = 80;

    // Fondo del botón con esquinas redondeadas (más transparente)
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x1a1a1a, 0.4);
    buttonBg.fillRoundedRect(
      centerX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      15
    );
    buttonBg.setDepth(5);

    // Border del botón
    const buttonBorder = this.add.graphics();
    buttonBorder.lineStyle(4, 0x03eae9, 1);
    buttonBorder.strokeRoundedRect(
      centerX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      15
    );
    buttonBorder.setDepth(6);

    // Texto del botón
    const buttonText = this.add.text(centerX, buttonY, "START", {
      fontSize: "42px",
      color: "#ffffff",
      fontFamily: "Orbitron",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 4,
      shadow: {
        offsetX: 3,
        offsetY: 3,
        color: "#000000",
        blur: 6,
        fill: true,
      },
    });
    buttonText.setOrigin(0.5, 0.5);
    buttonText.setDepth(7);

    // Zona interactiva del botón con cursor pointer
    const buttonZone = this.add.zone(
      centerX,
      buttonY,
      buttonWidth,
      buttonHeight
    );
    buttonZone.setInteractive({ useHandCursor: true });
    buttonZone.setDepth(7);

    // Click en el botón (sin animación)
    buttonZone.on("pointerdown", () => {
      this.sound.play("sfx-start", { volume: 0.8 });
      this.startGame();
    });

    // Subtítulo (más grande, blanco puro, sin borde, con sombra como el título)
    const subtitle = this.add.text(
      centerX,
      centerY - 90,
      "There can be only one",
      {
        fontSize: "32px", // aumentado desde 24px
        color: "#FFFFFF", // blanco puro
        fontFamily: "Orbitron",
        fontStyle: "bold",
        shadow: {
          offsetX: 5,
          offsetY: 5,
          color: "#000000",
          blur: 10,
          fill: true,
        },
      }
    );
    subtitle.setOrigin(0.5, 0.5);
    subtitle.setDepth(10);

    // Parpadeo muy suave del botón START (texto y borde ligeramente pulsando)
    this.tweens.add({
      targets: [buttonText, buttonBorder],
      alpha: 0.85,
      duration: 1400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
  }

  startGame() {
    // Fade out y transición a la selección de personajes
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("CharacterSelectionScene");
    });
  }
}
