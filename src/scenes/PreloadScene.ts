import { TEAMS } from "../config/TeamsData";
import { PreloadSceneBase } from "./PreloadSceneBase";

/**
 * PreloadScene – extiende PreloadSceneBase (boot sprite + carga paralela).
 * Carga TODOS los assets del juego y salta directo a RivalSelectionScene.
 */
export class PreloadScene extends PreloadSceneBase {
  private fontsLoaded: boolean = false;

  constructor() {
    super("PreloadScene", "RivalSelectionScene");
  }

  // ── Assets del proyecto ──────────────────────────────────────────────
  protected loadProjectAssets(): void {
    // Manejo de errores en la carga
    this.load.on("loaderror", (file: any) => {
      console.warn("⚠️ Error cargando archivo:", file.key, file.url);
    });

    // ── AUDIO ───────────────────────────────────────────────────────────
    this.load.audio(
      "sfx-start",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/start-KAHDaTAFztq3sUz7CJy7TutmOGzsp2.mp3?050F",
    );
    this.load.audio(
      "sfx-select",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/select-JnOvmii78UigFWiLDpIfDbdbwIWeN4.mp3?7Px7",
    );
    this.load.audio(
      "music-selection",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/start-music-xxYYpxNilydXjoP7YoueVCKX8BQevz.mp3?CjSh",
    );
    this.load.audio(
      "music-battle",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/music1-Q0vPf8z0Spzm88n1OQtNKP7cgsPK5w.mp3?CE9h",
    );
    this.load.audio(
      "music-battle-2",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/cyberpunk-132336-RFAH5p8ZvOJxB6YancH1gEURaSlpkE.mp3?CqdS",
    );
    this.load.audio(
      "sfx-sphere-hit",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/sphere-WLSBDucIaPDaAlXubJ3SEfjq79o9K9.mp3?e54C",
    );
    this.load.audio(
      "sfx-special",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/special-YjhYkcVGXDgUTALglTIPQKxvjsEkid.mp3?LD1H",
    );
    this.load.audio(
      "sfx-attack",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/attack-aswJG3qiQoxlKZnaevHsNgKIa9xBnu.mp3?RJLA",
    );
    this.load.audio(
      "sfx-shield",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/shield-z5xrn3ac2LMFJCyQm0DjBhvccel8B2.mp3?ivSh",
    );

    // ── FONDOS ─────────────────────────────────────────────────────────
    // Fondo de selección de rival
    this.load.image(
      "rival-bg",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/1-2SVbqTH6Dm-EWpcSPtCXv7qeio6Wjo2Lobq90fP9H.webp?xtE4",
    );
    // Mapas de batalla aleatorios (3 opciones)
    this.load.image(
      "battle-bg-1",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/map1-190JxiNL2V-4UrHHrf7ZHA0siPbmxHMP6X3GGoyGo.webp?0Wsh",
    );
    this.load.image(
      "battle-bg-2",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/map2-wKkWI4gyuY-CyfNTvRfC2J7eQqwJCS9oQFOI0WZDW.webp?Wipq",
    );
    this.load.image(
      "battle-bg-3",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/map3-Xp5PX1RcG2-7Wwk1h9gkM1e6o1tZ2EgZKgMnYjHw6.webp?jg7N",
    );

    // Mapa especial del Dark Boss
    this.load.image(
      "battle-bg-darkboss",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/diseo-sin-ttulo-97-DcTTKECEQj-HoAdA8AZMM0PCiH2IHgq9UqBrIqeir.webp?sE3d",
    );

    // ── UI DE BATALLA ──────────────────────────────────────────────────
    this.load.image(
      "badge",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-badge-final-getVjlLliCI9TVl59NtiaSnJhvMYYw.webp?owNA",
    );
    this.load.image(
      "uiZone",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-container%20%281%29-UL6xb74fyXAuhxOh76dceqwSvO0s1s.webp?vdV2",
    );
    this.load.image(
      "trainerLayer",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-trainerlayer-qSIY7qUTVIDfgeWMiWvLuS8tfQ89Sj.webp?7FAy",
    );
    this.load.image(
      "chatZone",
      "https://remix.gg/blob/0d6cff4c-aa80-4b7a-8ec2-107962211b8e/ui-chat-xr1DHsRAXUaFm3hlhJElpBlsV5AuZs.webp?Iqii",
    );

    // ── TRAINERS Y MONSTRUOS (por equipo) ──────────────────────────────
    TEAMS.forEach((team, index) => {
      this.load.image(`trainer-${index}`, team.trainer.sprite);

      const sprites = team.trainer.monster.sprites;
      if (sprites.babyBack)
        this.load.image(`${team.id}-player-baby`, sprites.babyBack);
      if (sprites.adultBack)
        this.load.image(`${team.id}-player-adult`, sprites.adultBack);
      if (sprites.babyFront)
        this.load.image(`${team.id}-enemy-baby`, sprites.babyFront);
      if (sprites.adultFront)
        this.load.image(`${team.id}-enemy-adult`, sprites.adultFront);
    });
  }

  // ── Post-carga: cargar fuentes ───────────────────────────────────────
  protected override onAssetsLoaded(): void {
    this.loadFonts();
  }

  private loadFonts(): void {
    // Orbitron se carga via <link> en index.html, esperamos a que esté lista
    document.fonts.ready.then(() => {
      this.fontsLoaded = true;
      this.checkTransition();
    });
  }

  // ── Transición: esperar animación + assets + fuentes ─────────────────
  protected override checkTransition(): void {
    if (this.animationComplete && this.assetsLoaded && this.fontsLoaded) {
      // Siempre Team Remix (índice 7 en TEAMS)
      this.scene.start(this.nextSceneKey, { selectedTeamIndex: 7 });
    }
  }
}
