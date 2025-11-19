import { TEAMS, Team } from "../config/TeamsData";

export class BattleScene extends Phaser.Scene {
  private background!: Phaser.GameObjects.Image;
  private playerPokemon!: Phaser.GameObjects.Image;
  private enemyPokemon!: Phaser.GameObjects.Image;
  private playerTeam!: Team;
  private enemyTeam!: Team;
  private trainerImage!: Phaser.GameObjects.Image;

  // Sistema de HP por secciones (10 secciones cada uno)
  private playerHPSections: number = 10;
  private enemyHPSections: number = 10;
  private playerHPGraphics!: Phaser.GameObjects.Graphics;
  private enemyHPGraphics!: Phaser.GameObjects.Graphics;

  // Sistema de escudo
  private playerShieldSections: number = 0;
  private enemyShieldSections: number = 0;

  // Texto del chat para mostrar acciones
  private battleChatText!: Phaser.GameObjects.Text;

  // Control de minijuego
  private isMinigameActive: boolean = false;

  // Sistema de combate por turnos
  private isPlayerTurn: boolean = false; // Se decide con el lanzamiento de moneda
  private rivalTurnCount: number = 0; // Contador de turnos del rival para evolución
  private battleStarted: boolean = false; // Indica si la batalla ya comenzó
  private playerTurnArrow?: Phaser.GameObjects.Graphics;
  private enemyTurnArrow?: Phaser.GameObjects.Graphics;
  private hasUsedAbilityThisTurn: boolean = false; // Flag para controlar si usó habilidad en este turno
  private lastRivalAction: string = ""; // Última acción del rival (para evitar defense consecutivas)

  // Referencias a botones de habilidades
  private specialButton?: Phaser.GameObjects.Image;
  private specialButtonText?: Phaser.GameObjects.Text;

  // Posiciones de las barras de HP para actualización
  private playerHPBarX!: number;
  private playerHPBarY!: number;
  private playerHPBarWidth!: number;
  private enemyHPBarX!: number;
  private enemyHPBarY!: number;
  private enemyHPBarWidth!: number;

  // Sistema de evolución
  private isPlayerEvolved: boolean = false;
  private isEnemyEvolved: boolean = false;
  private evolutionEnergy: number = 0; // 0-100
  private evolutionFillGraphics!: Phaser.GameObjects.Graphics;
  private evolveOverlay?: Phaser.GameObjects.Container;
  private evolutionMaskShape!: Phaser.GameObjects.Rectangle;
  private evolutionFillSprite!: Phaser.GameObjects.Image;

  // Dimensiones de la barra de evolución
  private evolutionBarX!: number;
  private evolutionBarY!: number;
  private evolutionBarWidth: number = 32;
  private evolutionBarHeight: number = 205;
  private evolutionBarBorderRadius: number = 8;
  private evolutionInnerWidth!: number;
  private evolutionInnerHeight!: number;

  // Posiciones FIJAS de los adultos (centro del sprite con origin 0.5, 0.5)
  private readonly PLAYER_ADULT_X = 170;
  private readonly PLAYER_ADULT_Y = 540; // Posición fija del adulto (un poco más arriba)
  private readonly PLAYER_ADULT_SCALE = 0.75;

  private readonly ENEMY_ADULT_X = 535; // Movido a la izquierda (antes 550)
  private readonly ENEMY_ADULT_Y = 255; // Movido abajo (antes 240)
  private readonly ENEMY_ADULT_SCALE = 0.62; // Un poco más grande

  // Escalas de baby (más pequeños)
  private readonly PLAYER_BABY_SCALE = 0.55;
  private readonly ENEMY_BABY_SCALE = 0.4;

  // Posiciones de baby (un poco más abajo que el adulto)
  private readonly PLAYER_BABY_X = 170;
  private readonly PLAYER_BABY_Y = 580; // Más abajo que el adulto
  private readonly ENEMY_BABY_X = 535; // Movido a la izquierda (antes 550)
  private readonly ENEMY_BABY_Y = 310; // Movido abajo (antes 295)

  // Datos de progresión entre batallas
  private selectedTeamIndex: number = 0;
  private currentRivalIndex: number = -1;
  private defeatedRivals: number[] = [];

  // Sistema de puntuación
  private totalScore: number = 0;
  private battleStartTime: number = 0;
  private battleSuccessfulHits: number = 0;
  private scoreText?: Phaser.GameObjects.Text;

  // Flag para Dark Boss
  private isDarkBoss: boolean = false;

  // Sistema de tutoriales (solo primera vez)
  private hasSeenSmashTutorial: boolean = false;
  private hasSeenShieldTutorial: boolean = false;
  private hasSeenStealTutorial: boolean = false;
  private hasSeenSpecialTutorial: boolean = false;
  private hasSeenRivalAttackTutorial: boolean = false;

  constructor() {
    super({ key: "BattleScene" });
  }

  shutdown() {
    // Limpiar el overlay de evolución cuando la escena se cierra
    if (this.evolveOverlay) {
      this.evolveOverlay.removeAll(true);
      this.evolveOverlay.destroy();
      this.evolveOverlay = undefined;
    }
  }

  init(data: any) {
    // Resetear estado de batalla
    this.isPlayerEvolved = false;
    this.isEnemyEvolved = false;
    this.evolutionEnergy = 0;
    this.battleStarted = false;
    this.isMinigameActive = false;
    this.hasUsedAbilityThisTurn = false;

    // IMPORTANTE: Limpiar overlay de evolución de batallas anteriores
    if (this.evolveOverlay) {
      this.evolveOverlay.removeAll(true);
      this.evolveOverlay.destroy();
      this.evolveOverlay = undefined;
    }

    // Log defensivo para entender qué llega en producción/móvil
    console.log("BattleScene.init - data recibido:", data);

    // Puntuación acumulada
    if (data && typeof data.currentScore === "number") {
      this.totalScore = data.currentScore;
    } else {
      this.totalScore = 0;
    }
    this.resetBattleScoreTracking();

    // Equipo del jugador (desde CharacterSelectionScene o fallback)
    if (data && data.selectedTeam) {
      this.playerTeam = data.selectedTeam;
    } else {
      this.playerTeam = TEAMS[0];
    }

    // Equipo rival (desde RivalSelectionScene o fallback aleatorio)
    if (data && data.rivalTeam) {
      this.enemyTeam = data.rivalTeam;
    } else {
      const availableEnemies = TEAMS.filter(
        (team) => team.id !== this.playerTeam.id
      );
      this.enemyTeam =
        availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    }

    // Índice del equipo del jugador
    this.selectedTeamIndex =
      data && typeof data.selectedTeamIndex === "number"
        ? data.selectedTeamIndex
        : 0;

    // Rivales derrotados
    this.defeatedRivals = Array.isArray(data?.defeatedRivals)
      ? data.defeatedRivals
      : [];

    // Flag de Dark Boss
    this.isDarkBoss = data?.isDarkBoss === true;

    // Índice del rival actual
    if (data && data.rivalTeam) {
      const idx = TEAMS.findIndex((t) => t.id === data.rivalTeam.id);
      this.currentRivalIndex = idx >= 0 ? idx : -1;
    } else {
      this.currentRivalIndex = -1;
    }

    console.log("BattleScene.init - estado normalizado:", {
      totalScore: this.totalScore,
      selectedTeamIndex: this.selectedTeamIndex,
      defeatedRivals: this.defeatedRivals,
      currentRivalIndex: this.currentRivalIndex,
      playerTeamId: this.playerTeam?.id,
      enemyTeamId: this.enemyTeam?.id,
    });
  }

  preload() {
    // Cargar equipos - Jugador: equipo seleccionado, Rival: desde RivalSelectionScene o aleatorio
    if (!this.playerTeam) {
      this.playerTeam = TEAMS[0]; // Por defecto si no hay selección
    }

    // Si no hay rival seleccionado, elegir uno aleatorio diferente al jugador
    if (!this.enemyTeam) {
      const availableEnemies = TEAMS.filter(
        (team) => team.id !== this.playerTeam.id
      );
      this.enemyTeam =
        availableEnemies[Math.floor(Math.random() * availableEnemies.length)];
    }

    // Limpiar texturas anteriores del cache para forzar recarga
    // No eliminamos texturas precargadas globalmente, solo gestionamos
    // fondos y sprites especiales por key.

    // Background - selección especial para Dark Boss o aleatoria para otros
    let selectedBackground: string;
    if (this.isDarkBoss) {
      selectedBackground = "battle-bg-darkboss";
    } else {
      const backgrounds = ["battle-bg-1", "battle-bg-2", "battle-bg-3"];
      selectedBackground =
        backgrounds[Math.floor(Math.random() * backgrounds.length)];
    }

    // Guardar la key elegida para usarla directamente en create()
    (this as any).selectedBackgroundKey = selectedBackground;

    // Pokemon jugador / rival y UI se precargan ahora en PreloadScene, pero
    // los sprites especiales siguen siendo dinámicos por equipo.

    // Special Attack Spritesheet (habilidad especial) - desde TeamsData
    const specialAbility =
      this.playerTeam.trainer.monster.sprites.specialAbility;
    this.load.spritesheet("specialAttack", specialAbility.url, {
      frameWidth: specialAbility.frameWidth,
      frameHeight: specialAbility.frameHeight,
    });

    // Special Attack Spritesheet del enemigo - desde TeamsData
    const enemySpecialAbility =
      this.enemyTeam.trainer.monster.sprites.specialAbility;
    this.load.spritesheet("enemySpecialAttack", enemySpecialAbility.url, {
      frameWidth: enemySpecialAbility.frameWidth,
      frameHeight: enemySpecialAbility.frameHeight,
    });
  }

  async create() {
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Usar estado precargado si está disponible, sino intentar cargarlo
    const sceneData = this.scene.settings.data as any;
    let savedState = sceneData?.sdkState;

    if (!savedState && window.FarcadeSDK?.singlePlayer?.actions?.ready) {
      try {
        // Timeout de 3 segundos para evitar bloqueos indefinidos
        const sdkTimeout = new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error("SDK timeout después de 3 segundos")),
            3000
          )
        );

        const sdkReady = window.FarcadeSDK.singlePlayer.actions.ready();
        const gameInfo = (await Promise.race([sdkReady, sdkTimeout])) as any;

        if (gameInfo?.initialGameState?.gameState) {
          savedState = gameInfo.initialGameState.gameState;
        }
      } catch (error) {
        console.log("No se pudo cargar el estado del juego:", error);
      }
    }

    // Aplicar estado guardado si existe
    if (savedState) {
      this.hasSeenSmashTutorial =
        (savedState.hasSeenSmashTutorial as boolean) || false;
      this.hasSeenShieldTutorial =
        (savedState.hasSeenShieldTutorial as boolean) || false;
      this.hasSeenStealTutorial =
        (savedState.hasSeenStealTutorial as boolean) || false;
      this.hasSeenSpecialTutorial =
        (savedState.hasSeenSpecialTutorial as boolean) || false;
      this.hasSeenRivalAttackTutorial =
        (savedState.hasSeenRivalAttackTutorial as boolean) || false;
    }

    // RESET COMPLETO del estado de la batalla
    this.playerHPSections = 10;
    this.enemyHPSections = 10;
    this.playerShieldSections = 0;
    // Dark Boss inicia con escudo completo
    this.enemyShieldSections = this.isDarkBoss ? 10 : 0;
    this.isPlayerTurn = false;
    this.rivalTurnCount = 0;
    this.battleStarted = false;
    this.isPlayerEvolved = false;
    this.isEnemyEvolved = false;
    this.evolutionEnergy = 0;
    this.isMinigameActive = false;

    // Detener música de selección y arrancar música de batalla
    const selectionMusic = this.sound.get("music-selection");
    if (selectionMusic) {
      selectionMusic.stop();
      selectionMusic.destroy();
    }

    // Detener y remover TODAS las músicas de batalla anteriores
    const oldBattleMusic1 = this.sound.get("music-battle");
    if (oldBattleMusic1) {
      oldBattleMusic1.stop();
      oldBattleMusic1.destroy();
    }
    const oldBattleMusic2 = this.sound.get("music-battle-2");
    if (oldBattleMusic2) {
      oldBattleMusic2.stop();
      oldBattleMusic2.destroy();
    }

    // Seleccionar aleatoriamente entre las dos músicas de batalla
    const battleMusicKey =
      Math.random() < 0.5 ? "music-battle" : "music-battle-2";
    this.sound.add(battleMusicKey, { loop: true, volume: 0.65 }).play();

    // Crear textura de píxel para partículas
    if (!this.textures.exists("pixel")) {
      const graphics = this.add.graphics();
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 2, 2);
      graphics.generateTexture("pixel", 2, 2);
      graphics.destroy();
    }

    // Background (usa la key seleccionada en preload)
    const bgKey = (this as any).selectedBackgroundKey || "battle-bg-1";
    this.background = this.add.image(centerX, centerY, bgKey);
    const scale = Math.max(
      width / this.background.width,
      height / this.background.height
    );
    this.background.setScale(scale);

    // Calcular offset para monstruos voladores
    const playerFlyingOffset = this.playerTeam.trainer.monster.isFlying
      ? -80
      : 0;
    const enemyFlyingOffset = this.enemyTeam.trainer.monster.isFlying ? -80 : 0;

    // Pokemon enemigo - Empieza como baby (más pequeño)
    const enemyBabyKey = `${this.enemyTeam.id}-enemy-baby`;
    this.enemyPokemon = this.add.image(
      this.ENEMY_BABY_X,
      this.ENEMY_BABY_Y + enemyFlyingOffset,
      enemyBabyKey
    );
    this.enemyPokemon.setScale(this.ENEMY_BABY_SCALE);

    // Pokemon jugador - Empieza como baby (más pequeño)
    const playerBabyKey = `${this.playerTeam.id}-player-baby`;
    this.playerPokemon = this.add.image(
      this.PLAYER_BABY_X,
      this.PLAYER_BABY_Y + playerFlyingOffset,
      playerBabyKey
    );
    this.playerPokemon.setScale(this.PLAYER_BABY_SCALE);

    // === BADGES (POSICIONES FIJAS) ===

    // Badge del enemigo - POSICIÓN FIJA
    const enemyBadgeX = -120;
    const enemyBadgeY = 125; // Ajustado más arriba
    const enemyBadge = this.add.image(enemyBadgeX, enemyBadgeY, "badge");
    enemyBadge.setOrigin(0, 0.5);
    enemyBadge.setScale(1.2);

    // Nombre del enemigo - desde TeamsData
    const enemyNameY = enemyBadge.y - 30;
    this.add
      .text(
        enemyBadge.x + 140,
        enemyNameY,
        this.enemyTeam.trainer.monster.name,
        {
          fontSize: "32px",
          color: "#203B68",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          align: "left",
        }
      )
      .setOrigin(0, 0.5);

    // Barra de vida del enemigo - Alineada con el inicio del nombre
    const enemyHPBarY = enemyNameY + 35;
    const enemyHPBarWidth = 220;
    const enemyHPBarX = enemyBadge.x + 140; // Mismo inicio que el nombre

    // Guardar posiciones para actualización
    this.enemyHPBarX = enemyHPBarX + 4;
    this.enemyHPBarY = enemyHPBarY - 10;
    this.enemyHPBarWidth = enemyHPBarWidth - 8;

    // Borde con esquinas redondeadas - Border más grueso
    const enemyHPBarBorderGraphics = this.add.graphics();
    enemyHPBarBorderGraphics.fillStyle(0x1e3b6a, 1);
    enemyHPBarBorderGraphics.fillRoundedRect(
      enemyHPBarX,
      enemyHPBarY - 14,
      enemyHPBarWidth,
      28,
      3
    );

    // Fondo con esquinas redondeadas
    const enemyHPBarBgGraphics = this.add.graphics();
    enemyHPBarBgGraphics.fillStyle(0x333333, 1);
    enemyHPBarBgGraphics.fillRoundedRect(
      enemyHPBarX + 4,
      enemyHPBarY - 10,
      enemyHPBarWidth - 8,
      20,
      2
    );

    // Crear graphics para las secciones de HP del enemigo
    this.enemyHPGraphics = this.add.graphics();
    this.updateEnemyHPBar(
      this.enemyHPBarX,
      this.enemyHPBarY,
      this.enemyHPBarWidth
    );

    // Badge del jugador - POSICIÓN FIJA
    const playerBadgeX = width + 120;
    const playerBadgeY = 555; // Ajustado más abajo
    const playerBadge = this.add.image(playerBadgeX, playerBadgeY, "badge");
    playerBadge.setOrigin(1, 0.5);
    playerBadge.setFlipX(true);
    playerBadge.setScale(1.2);

    // Nombre del jugador - desde TeamsData
    const playerNameY = playerBadge.y - 30;
    this.add
      .text(
        playerBadge.x - 140,
        playerNameY,
        this.playerTeam.trainer.monster.name,
        {
          fontSize: "32px",
          color: "#203B68",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          align: "right",
        }
      )
      .setOrigin(1, 0.5);

    // Barra de vida del jugador - Alineada con el final del nombre
    const playerHPBarY = playerNameY + 35;
    const playerHPBarWidth = 220;
    const playerHPBarX = playerBadge.x - 140 - playerHPBarWidth; // Termina donde termina el nombre

    // Guardar posiciones para actualización
    this.playerHPBarX = playerHPBarX + 4;
    this.playerHPBarY = playerHPBarY - 10;
    this.playerHPBarWidth = playerHPBarWidth - 8;

    // Borde con esquinas redondeadas - Border más grueso
    const playerHPBarBorderGraphics = this.add.graphics();
    playerHPBarBorderGraphics.fillStyle(0x1e3b6a, 1);
    playerHPBarBorderGraphics.fillRoundedRect(
      playerHPBarX,
      playerHPBarY - 14,
      playerHPBarWidth,
      28,
      3
    );

    // Fondo con esquinas redondeadas
    const playerHPBarBgGraphics = this.add.graphics();
    playerHPBarBgGraphics.fillStyle(0x333333, 1);
    playerHPBarBgGraphics.fillRoundedRect(
      playerHPBarX + 4,
      playerHPBarY - 10,
      playerHPBarWidth - 8,
      20,
      2
    );

    // Crear graphics para las secciones de HP del jugador
    this.playerHPGraphics = this.add.graphics();
    this.updatePlayerHPBar(
      this.playerHPBarX,
      this.playerHPBarY,
      this.playerHPBarWidth
    );

    // Contenedor para puntos acumulados debajo del badge del jugador
    const scoreBoxWidth = 200;
    const scoreBoxHeight = 68;
    const scoreBoxX = playerHPBarX + playerHPBarWidth / 2 - scoreBoxWidth / 2;
    const scoreBoxY = playerHPBarY + 65;

    const scoreBg = this.add.graphics();
    scoreBg.setDepth(60);
    scoreBg.fillStyle(0x203a6a, 0.85);
    scoreBg.lineStyle(3, 0x03eae9, 1);
    scoreBg.fillRoundedRect(
      scoreBoxX,
      scoreBoxY,
      scoreBoxWidth,
      scoreBoxHeight,
      14
    );
    scoreBg.strokeRoundedRect(
      scoreBoxX,
      scoreBoxY,
      scoreBoxWidth,
      scoreBoxHeight,
      14
    );

    this.scoreText = this.add
      .text(
        scoreBoxX + scoreBoxWidth / 2,
        scoreBoxY + scoreBoxHeight / 2,
        "0",
        {
          fontSize: "32px",
          color: "#ffffff",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 4,
        }
      )
      .setOrigin(0.5, 0.5)
      .setDepth(61);

    this.updateScoreDisplay();

    // === UI ZONE ===
    // Zona inferior pegada al bottom de la pantalla
    const uiZone = this.add.image(centerX, height, "uiZone");

    // Escalar la imagen para cubrir el ancho completo y anclar al bottom
    const uiScale = width / uiZone.width;
    uiZone.setScale(uiScale);
    uiZone.setOrigin(0.5, 1); // Anclado al bottom

    // Calcular la altura real de la UI Zone después del escalado
    const uiZoneHeight = uiZone.displayHeight;
    const uiZoneTop = height - uiZoneHeight; // Posición superior de la UI Zone

    // Trainer Layer - Background del trainer centrado verticalmente en UI Zone
    const trainerLayerY = uiZoneTop + uiZoneHeight / 2;
    const trainerLayer = this.add.image(15, trainerLayerY, "trainerLayer");
    trainerLayer.setOrigin(0, 0.5); // Centrado verticalmente

    // Escalar para que quepa dentro de la UI Zone (sin exceder) - Reducido
    const trainerScale = (uiZoneHeight * 0.88) / trainerLayer.height;
    trainerLayer.setScale(trainerScale);

    // Trainer - Personaje del jugador pegado al bottom del trainerLayer
    const trainerBottomY = trainerLayerY + trainerLayer.displayHeight / 2;
    const trainerTextureKey = `trainer-${TEAMS.findIndex(
      (team) => team.id === this.playerTeam.id
    )}`;
    this.trainerImage = this.add.image(
      trainerLayer.x + trainerLayer.displayWidth / 2,
      trainerBottomY,
      trainerTextureKey
    );
    this.trainerImage.setOrigin(0.5, 1); // Anclado al bottom

    // Escalar el trainer un poco más grande
    const trainerFitScale =
      (trainerLayer.displayHeight * 0.95) / this.trainerImage.height;
    this.trainerImage.setScale(trainerFitScale);

    // Nombre del jugador - Pegado al bottom de la imagen del trainer (no del layer) - desde TeamsData
    const trainerImageBottom = this.trainerImage.y; // El trainer tiene origin (0.5, 1), así que y = bottom
    const playerNameText = this.add.text(
      this.trainerImage.x,
      trainerImageBottom, // Justo en el bottom del trainer
      this.playerTeam.trainer.displayName,
      {
        fontSize: "32px", // Más grande (antes 24px)
        color: "#ffffff",
        fontFamily: "Orbitron",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
        shadow: {
          offsetX: 0,
          offsetY: 0,
          color: "#000000",
          blur: 8,
          fill: true,
        },
      }
    );
    playerNameText.setOrigin(0.5, 1); // Anclado al bottom del texto
    playerNameText.setDepth(10); // Z-index superior

    // === PARTE DERECHA DE LA UI ZONE ===

    // Calcular el área disponible a la derecha del trainer
    const spacing = 12; // Espacio entre elementos (reducido)
    const rightAreaX = trainerLayer.x + trainerLayer.displayWidth + spacing;

    // === BARRA DE EVOLUCIÓN ===
    // Barra vertical entre el trainer layer y la zona de botones/chat
    this.evolutionBarWidth = 32;
    this.evolutionBarHeight = trainerLayer.displayHeight;
    this.evolutionBarX = rightAreaX + this.evolutionBarWidth / 2;
    this.evolutionBarY = trainerLayerY;
    this.evolutionBarBorderRadius = 8;
    this.evolutionInnerWidth = this.evolutionBarWidth - 6;
    this.evolutionInnerHeight = this.evolutionBarHeight - 6;

    // Borde de la barra de evolución
    const borderGraphics = this.add.graphics();
    borderGraphics.fillStyle(0x213b6b, 1);
    borderGraphics.fillRoundedRect(
      this.evolutionBarX - this.evolutionBarWidth / 2,
      this.evolutionBarY - this.evolutionBarHeight / 2,
      this.evolutionBarWidth,
      this.evolutionBarHeight,
      this.evolutionBarBorderRadius
    );
    borderGraphics.setDepth(2);

    // Fondo de la barra
    const bgGraphics = this.add.graphics();
    bgGraphics.fillStyle(0x333333, 1);
    bgGraphics.fillRoundedRect(
      this.evolutionBarX - this.evolutionInnerWidth / 2,
      this.evolutionBarY - this.evolutionInnerHeight / 2,
      this.evolutionInnerWidth,
      this.evolutionInnerHeight,
      this.evolutionBarBorderRadius - 2
    );
    bgGraphics.setDepth(1);

    // Crear barra de relleno sólido (azul/morado) que crece
    this.evolutionFillGraphics = this.add.graphics();
    this.evolutionFillGraphics.setDepth(2);

    // Crear el gradiente arcoíris para el tile (perfectamente continuo)
    const canvas = document.createElement("canvas");
    canvas.width = this.evolutionInnerWidth;
    canvas.height = this.evolutionInnerHeight; // Solo una altura, se repetirá
    const ctx = canvas.getContext("2d")!;

    const gradient = ctx.createLinearGradient(
      0,
      0,
      0,
      this.evolutionInnerHeight
    );
    // Gradiente que se repite perfectamente: violeta, azul oscuro, azul claro
    gradient.addColorStop(0, "#9D4EDD"); // Violeta
    gradient.addColorStop(0.33, "#5A67D8"); // Azul oscuro
    gradient.addColorStop(0.66, "#60A5FA"); // Azul claro
    gradient.addColorStop(1, "#9D4EDD"); // Violeta (mismo que el inicio para loop perfecto)

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, this.evolutionInnerWidth, this.evolutionInnerHeight);

    // Verificar si la textura ya existe y destruirla antes de crear una nueva
    if (this.textures.exists("evolutionGradient")) {
      this.textures.remove("evolutionGradient");
    }

    const gradientTexture = this.textures.createCanvas(
      "evolutionGradient",
      this.evolutionInnerWidth,
      this.evolutionInnerHeight
    );
    gradientTexture!.context.drawImage(canvas, 0, 0);
    gradientTexture!.refresh();

    // Usar TileSprite para scroll infinito perfecto (sin saltos)
    this.evolutionFillSprite = this.add.tileSprite(
      this.evolutionBarX,
      this.evolutionBarY,
      this.evolutionInnerWidth,
      this.evolutionInnerHeight,
      "evolutionGradient"
    ) as any; // Cast para compatibilidad con la propiedad
    this.evolutionFillSprite.setDepth(2);
    this.evolutionFillSprite.setVisible(false);

    // Crear máscara con el mismo tamaño que el fondo para que no se salga
    const maskGraphics = this.add.graphics();
    maskGraphics.fillStyle(0xffffff, 1);
    maskGraphics.fillRoundedRect(
      this.evolutionBarX - this.evolutionInnerWidth / 2,
      this.evolutionBarY - this.evolutionInnerHeight / 2,
      this.evolutionInnerWidth,
      this.evolutionInnerHeight,
      this.evolutionBarBorderRadius - 2
    );
    const mask = maskGraphics.createGeometryMask();
    this.evolutionFillSprite.setMask(mask);
    maskGraphics.setVisible(false);

    // Scroll infinito del TileSprite (perfecto sin saltos)
    this.time.addEvent({
      delay: 16, // ~60fps
      loop: true,
      callback: () => {
        if (
          this.evolutionFillSprite.visible &&
          (this.evolutionFillSprite as any).tilePositionY !== undefined
        ) {
          // Mover el tile hacia arriba
          (this.evolutionFillSprite as any).tilePositionY -= 1.5;
        }
      },
    });

    // Animación de brillo pulsante en el sprite
    this.tweens.add({
      targets: this.evolutionFillSprite,
      alpha: { from: 0.85, to: 1 },
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Efecto glow (resplandor) - varios rectángulos semitransparentes alrededor
    const glowGraphics = this.add.graphics();

    // Capas de glow con diferentes tamaños y opacidades - centrado en toda la barra
    const glowCenterX = this.evolutionBarX;
    const glowCenterY = this.evolutionBarY;
    const glowLayers = [
      { offset: 4, alpha: 0.6, color: 0xec4899 },
      { offset: 8, alpha: 0.4, color: 0x9d4edd },
      { offset: 12, alpha: 0.2, color: 0x5a67d8 },
    ];

    glowLayers.forEach((layer) => {
      glowGraphics.fillStyle(layer.color, layer.alpha);
      glowGraphics.fillRoundedRect(
        glowCenterX - this.evolutionBarWidth / 2 - layer.offset,
        glowCenterY - this.evolutionBarHeight / 2 - layer.offset,
        this.evolutionBarWidth + layer.offset * 2,
        this.evolutionBarHeight + layer.offset * 2,
        this.evolutionBarBorderRadius + layer.offset
      );
    });

    // Enviar el glow detrás de todo
    glowGraphics.setDepth(0);

    // Animación pulsante del glow (solo opacidad, sin movimiento)
    this.tweens.add({
      targets: glowGraphics,
      alpha: { from: 0.4, to: 0.8 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Calcular área de chat/botones después de la barra (mismo spacing que antes)
    const chatAreaX = rightAreaX + this.evolutionBarWidth + spacing;
    const rightAreaWidth = width - chatAreaX - 15; // Más margen derecho

    // Calcular posición del chat - alineado con el top del trainer layer
    const trainerTopY = trainerLayerY - trainerLayer.displayHeight / 2;
    const contentStartY = trainerTopY;
    const topMargin = contentStartY - uiZoneTop; // Margen superior del chat respecto a UI Zone

    // Chat Zone - Alineado con el top del trainer layer
    const chatZone = this.add.image(
      chatAreaX + rightAreaWidth / 2,
      contentStartY,
      "chatZone"
    );
    chatZone.setOrigin(0.5, 0);

    // Escalar chat zone - ancho normal, height muy reducido
    const chatScaleW = ((rightAreaWidth - 22) * 1.05) / chatZone.width;
    const chatScaleH = chatScaleW * 0.65; // Reducir height un 35% para más espacio de botones
    chatZone.setScale(chatScaleW, chatScaleH);

    // Texto de prueba en el chat - Blanco, alineado a la izquierda con flecha
    const chatPaddingTop = 30;
    const chatPaddingLeft = 30;
    this.battleChatText = this.add
      .text(
        chatZone.x - chatZone.displayWidth / 2 + chatPaddingLeft,
        chatZone.y + chatPaddingTop,
        "", // Inicialmente vacío
        {
          fontSize: "22px",
          color: "#ffffff", // Texto blanco
          fontFamily: "Orbitron",
          align: "left",
          wordWrap: { width: chatZone.displayWidth - chatPaddingLeft * 2 },
        }
      )
      .setOrigin(0, 0); // Alineado al top-left

    // Botones de habilidades - Grid 2x2 debajo del chat zone
    const buttonSpacingH = 8; // Espaciado horizontal reducido
    const buttonSpacingV = 8; // Espaciado vertical reducido

    const abilities = [
      { text: "Smash", row: 0, col: 0 },
      { text: "Shield", row: 0, col: 1 },
      { text: "Steal", row: 1, col: 0 },
      { text: "Special", row: 1, col: 1 },
    ];

    // Los botones deben tener el mismo ancho que el chat zone
    const totalButtonWidth = chatZone.displayWidth;
    const buttonWidth = (totalButtonWidth - buttonSpacingH) / 2;

    // Calcular altura disponible: desde fin del chat hasta el bottom menos el margen inferior
    const chatButtonSpacing = 10; // Espaciado reducido
    const availableHeight =
      height -
      (chatZone.y + chatZone.displayHeight + chatButtonSpacing) -
      topMargin;

    // Altura de cada botón: espacio disponible dividido entre 2 filas menos el espaciado
    const buttonHeight = (availableHeight - buttonSpacingV) / 2;

    const buttonsStartY =
      chatZone.y + chatZone.displayHeight + chatButtonSpacing;

    abilities.forEach((ability) => {
      const buttonX =
        chatZone.x -
        chatZone.displayWidth / 2 +
        ability.col * (buttonWidth + buttonSpacingH);
      const buttonY =
        buttonsStartY + ability.row * (buttonHeight + buttonSpacingV);

      // Usar chatZone como componente base
      const button = this.add.image(buttonX, buttonY, "chatZone");
      button.setOrigin(0, 0);

      // Escalar ancho y alto independientemente para ajustar al espacio disponible
      const buttonScaleW = buttonWidth / button.width;
      const buttonScaleH = buttonHeight / button.height;
      button.setScale(buttonScaleW, buttonScaleH);

      // Si es Special y no estamos evolucionados, aplicar efecto desactivado
      const isSpecialDisabled =
        ability.text === "Special" && !this.isPlayerEvolved;

      if (isSpecialDisabled) {
        // Reducir brillo del botón
        button.setTint(0xaaaaaa);
        button.setAlpha(0.7);
      } else {
        // Hacer el botón interactivo solo si está habilitado
        button.setInteractive();
      }

      // Texto centrado en el botón - Color blanco (o gris claro si desactivado)
      const buttonText = this.add
        .text(
          buttonX + buttonWidth / 2,
          buttonY + buttonHeight / 2,
          ability.text,
          {
            fontSize: "20px",
            color: isSpecialDisabled ? "#cccccc" : "#ffffff",
            fontFamily: "Orbitron",
            fontStyle: "bold",
          }
        )
        .setOrigin(0.5, 0.5);

      if (isSpecialDisabled) {
        buttonText.setAlpha(0.7);
      }

      // Guardar referencias al botón Special para poder activarlo después
      if (ability.text === "Special") {
        this.specialButton = button;
        this.specialButtonText = buttonText;
      }

      // Evento de click para el botón de Smash
      if (ability.text === "Smash") {
        button.on("pointerdown", () => {
          this.performAttack();
        });
      }

      // Evento de click para el botón de Shield
      if (ability.text === "Shield") {
        button.on("pointerdown", () => {
          this.performDefense();
        });
      }

      // Evento de click para el botón de Steal
      if (ability.text === "Steal") {
        button.on("pointerdown", () => {
          this.performDodge();
        });
      }

      // Evento de click para el botón de Special (solo si está habilitado)
      if (ability.text === "Special" && !isSpecialDisabled) {
        button.on("pointerdown", () => {
          this.performSpecial();
        });
      }
    });

    // Configurar event listeners del SDK
    this.setupSDKEventListeners();

    // Iniciar el sistema de combate con lanzamiento de moneda
    this.time.delayedCall(1000, () => {
      this.startBattle();
    });
  }

  setupSDKEventListeners(): void {
    if (!window.FarcadeSDK?.on) return;

    // Play again - reiniciar completamente el juego
    window.FarcadeSDK.on("play_again", () => {
      console.log("SDK: Play again solicitado - Reiniciando juego completo");

      // Detener todas las músicas activas
      this.sound.stopAll();

      // Volver a la selección de equipo inicial (reinicio completo)
      this.scene.start("CharacterSelectionScene");
    });

    // Toggle mute - silenciar/activar audio
    window.FarcadeSDK.on("toggle_mute", (data: any) => {
      console.log("SDK: Toggle mute", data.isMuted);
      this.sound.setMute(data.isMuted);
    });
  }

  // ===== SISTEMA DE COMBATE =====

  // Helper para reproducir audio de forma segura (no falla si no existe)
  private safePlaySound(
    key: string,
    config?: Phaser.Types.Sound.SoundConfig
  ): void {
    try {
      if (this.sound.get(key) || this.cache.audio.exists(key)) {
        this.sound.play(key, config);
      }
    } catch (e) {
      // Silenciar errores de audio
    }
  }

  // Helper para añadir música de forma segura
  private safeAddMusic(
    key: string,
    config?: Phaser.Types.Sound.SoundConfig
  ): Phaser.Sound.BaseSound | null {
    try {
      if (this.sound.get(key) || this.cache.audio.exists(key)) {
        return this.sound.add(key, config);
      }
    } catch (e) {
      // Silenciar errores de audio
    }
    return null;
  }

  startBattle(): void {
    if (this.battleStarted) return;
    this.battleStarted = true;
    this.resetBattleScoreTracking();

    // Lanzar moneda para decidir quién empieza
    this.coinFlip();
  }

  coinFlip(): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    overlay.setDepth(1000);

    // Crear moneda personalizada con gráficos - estilo mejorado con colores del juego
    const coinContainer = this.add.container(centerX, centerY);
    coinContainer.setDepth(1001);

    // Círculo base azul oscuro (mismo que fondo de moneda original)
    const outerCircle = this.add.circle(0, 0, 65, 0x203a6a);

    // Círculo interno un poco más claro para profundidad
    const innerCircle = this.add.circle(0, 0, 58, 0x2a4570);

    // Círculo central más claro aún
    const centerCircle = this.add.circle(0, 0, 48, 0x345580);

    // Anillo de borde cyan brillante (mismo que rival selection)
    const shineRing = this.add.circle(0, 0, 65, 0x203a6a, 0);
    shineRing.setStrokeStyle(5, 0x03eae9, 1);

    // Segundo anillo más fino para efecto de profundidad
    const innerRing = this.add.circle(0, 0, 50, 0x203a6a, 0);
    innerRing.setStrokeStyle(2, 0x03eae9, 0.5);

    // Añadir al contenedor
    coinContainer.add([
      outerCircle,
      innerCircle,
      centerCircle,
      shineRing,
      innerRing,
    ]);

    // Decidir quién empieza (50% cada uno)
    const playerStarts = Math.random() < 0.5;

    // Animación de giro de la moneda (sin texto)
    this.tweens.add({
      targets: coinContainer,
      scaleX: { from: 1, to: 0.1 },
      duration: 100,
      yoyo: true,
      repeat: 8,
      ease: "Linear",
      onComplete: () => {
        // Reproducir sonido de select cuando aparece la flecha
        this.sound.play("sfx-select", { volume: 0.5 });

        // Dibujar flecha geométrica perfectamente centrada (blanco)
        const arrowGraphic = this.add.graphics();
        arrowGraphic.setDepth(1002);
        arrowGraphic.setPosition(centerX, centerY);
        arrowGraphic.fillStyle(0xffffff, 1); // Blanco
        arrowGraphic.beginPath();
        if (playerStarts) {
          // Flecha hacia ABAJO: punta abajo en (0, 22), base en y = -14
          arrowGraphic.moveTo(0, 22);
          arrowGraphic.lineTo(-18, -14);
          arrowGraphic.lineTo(18, -14);
        } else {
          // Flecha hacia ARRIBA: punta arriba en (0, -22), base en y = 14
          arrowGraphic.moveTo(0, -22);
          arrowGraphic.lineTo(-18, 14);
          arrowGraphic.lineTo(18, 14);
        }
        arrowGraphic.closePath();
        arrowGraphic.fillPath();
        arrowGraphic.strokePath();

        // Esperar unos milisegundos y hacer desaparecer la moneda y el símbolo juntos
        this.time.delayedCall(300, () => {
          // Fade out de la moneda y la flecha simultáneamente
          this.tweens.add({
            targets: [coinContainer, arrowGraphic],
            alpha: 0,
            duration: 300,
            onComplete: () => {
              coinContainer.destroy();
              arrowGraphic.destroy();
            },
          });

          // Mostrar texto de resultado (blanco con borde negro) inmediatamente
          const resultText = playerStarts ? "You start!" : "Rival starts!";

          const flipText = this.add
            .text(centerX, centerY, resultText, {
              fontSize: "48px",
              color: "#ffffff",
              fontFamily: "Orbitron",
              fontStyle: "bold",
              stroke: "#000000",
              strokeThickness: 6,
            })
            .setOrigin(0.5, 0.5)
            .setDepth(1001);

          // Animación del texto (aparece con escala)
          this.tweens.add({
            targets: flipText,
            scale: { from: 0.5, to: 1 },
            duration: 300,
            ease: "Back.easeOut",
          });

          // Esperar unos milisegundos, destruir texto y comenzar el juego
          this.time.delayedCall(1200, () => {
            // Fade out solo del texto
            this.tweens.add({
              targets: flipText,
              alpha: 0,
              duration: 300,
              onComplete: () => {
                flipText.destroy();
                overlay.destroy();

                this.isPlayerTurn = playerStarts;
                this.startBattleTimer();

                // Notificar al SDK que el juego está listo
                if (window.FarcadeSDK?.singlePlayer?.actions?.ready) {
                  window.FarcadeSDK.singlePlayer.actions.ready();
                }

                console.log(
                  "🪙 Resultado moneda: " +
                    (playerStarts ? "JUGADOR empieza" : "RIVAL empieza")
                );

                // Crear indicadores de turno
                this.createTurnIndicators();

                if (!playerStarts) {
                  // Si empieza el rival, ejecutar su turno
                  console.log("🎬 Iniciando primer turno del rival...");
                  this.performRivalTurn();
                } else {
                  console.log("✋ Esperando acción del jugador...");
                }
              },
            });
          });
        });
      },
    });
  }

  performRivalTurn(): void {
    if (this.isPlayerTurn) {
      console.log("❌ performRivalTurn llamado pero es turno del jugador!");
      return; // Seguridad
    }

    console.log("🤖 TURNO DEL RIVAL - Turno #" + (this.rivalTurnCount + 1));

    // Asegurar que el pokémon enemigo esté visible al inicio del turno
    this.enemyPokemon.setAlpha(1);

    this.rivalTurnCount++;

    // Verificar si el rival debe evolucionar (turno 3)
    if (this.rivalTurnCount === 3 && !this.isEnemyEvolved) {
      console.log("⚡ Rival evoluciona!");

      // Mostrar mensaje de evolución en el chat
      const enemyName = this.enemyTeam.trainer.monster.name;
      this.updateBattleChat(`▶ ${enemyName} is evolving...`);

      // Evolucionar primero
      this.evolveEnemy();

      // Después de la evolución (que toma ~3 segundos), elegir y ejecutar acción
      this.time.delayedCall(3500, () => {
        this.executeRivalAction();
      });
      return; // Salir para no ejecutar la acción inmediatamente
    }

    // Si no evoluciona, ejecutar acción normalmente
    this.time.delayedCall(1500, () => {
      this.executeRivalAction();
    });
  }

  executeRivalAction(): void {
    // Elegir acción aleatoria
    let actions: string[];

    // Dark Boss nunca usa Defense, usa Steal en su lugar
    if (this.isDarkBoss) {
      actions = ["attack", "steal"];
    } else {
      actions = ["attack", "defense"];
    }

    // Si ya evolucionó, puede usar Special también
    if (this.isEnemyEvolved) {
      actions.push("special");
    }

    // Si la última acción fue defense o steal, quitarla de las opciones disponibles
    if (
      this.lastRivalAction === "defense" ||
      this.lastRivalAction === "steal"
    ) {
      actions = actions.filter(
        (action) => action !== "defense" && action !== "steal"
      );
    }

    const randomAction = Phaser.Math.RND.pick(actions);
    console.log("🎲 Rival elige: " + randomAction);
    console.log("▶️ Ejecutando acción del rival: " + randomAction);

    // Guardar la acción actual como última acción
    this.lastRivalAction = randomAction;

    switch (randomAction) {
      case "attack":
        this.performRivalAttack();
        break;
      case "defense":
        this.performRivalDefense();
        break;
      case "steal":
        this.performRivalSteal();
        break;
      case "special":
        this.performRivalSpecial();
        break;
    }
  }

  performRivalAttack(): void {
    console.log("⚔️ Rival ataca!");

    // Mostrar mensaje en el chat
    const enemyName = this.enemyTeam.trainer.monster.name;
    this.updateBattleChat(`▶ ${enemyName} uses Attack!`);

    // Mostrar minijuego de defensa para el jugador (3 círculos)
    this.showRivalAttackMinigame(3);
  }

  performRivalDefense(): void {
    console.log("🛡️ Rival se defiende!");

    // Mostrar mensaje en el chat
    const enemyName = this.enemyTeam.trainer.monster.name;
    this.updateBattleChat(`▶ ${enemyName} uses Defense!`);

    // Calcular escudo (aplicaremos después de la animación)
    const shieldGain = 2; // El rival siempre gana 2 escudos

    // Animación de defensa del pokémon rival (similar al jugador)
    // Crear un sprite duplicado del pokémon para el efecto de glow
    const glowSprite = this.add.image(
      this.enemyPokemon.x,
      this.enemyPokemon.y,
      this.enemyPokemon.texture.key
    );
    glowSprite.setScale(this.enemyPokemon.scaleX, this.enemyPokemon.scaleY);
    glowSprite.setOrigin(this.enemyPokemon.originX, this.enemyPokemon.originY);
    glowSprite.setTint(0x00bfff); // Azul brillante
    glowSprite.setAlpha(0.7);
    glowSprite.setBlendMode(Phaser.BlendModes.ADD); // Modo aditivo para efecto de glow

    // Crear una máscara que recorta el glow de abajo hacia arriba
    const maskShape = this.make.graphics({});
    maskShape.fillStyle(0xffffff);

    const pokemonBounds = this.enemyPokemon.getBounds();
    const startY = pokemonBounds.y + pokemonBounds.height;

    maskShape.fillRect(
      pokemonBounds.x,
      startY,
      pokemonBounds.width,
      pokemonBounds.height
    );

    const mask = maskShape.createGeometryMask();
    glowSprite.setMask(mask);

    // Animar la máscara de abajo hacia arriba
    this.tweens.add({
      targets: maskShape,
      y: -pokemonBounds.height,
      duration: 900,
      ease: "Linear",
      onComplete: () => {
        // Parpadeo al completar
        this.tweens.add({
          targets: glowSprite,
          alpha: 0,
          duration: 100,
          yoyo: true,
          repeat: 2,
          onComplete: () => {
            glowSprite.destroy();
            maskShape.destroy();

            // Reproducir sonido de escudo
            this.sound.play("sfx-shield", { volume: 0.6 });

            // Aplicar escudo después de la animación
            this.enemyShieldSections += shieldGain;
            this.updateEnemyHPBar(
              this.enemyHPBarX,
              this.enemyHPBarY,
              this.enemyHPBarWidth
            );
          },
        });
      },
    });

    // Efecto de brillo en el pokémon original
    this.tweens.add({
      targets: this.enemyPokemon,
      alpha: 0.85,
      duration: 450,
      yoyo: true,
      onComplete: () => {
        this.enemyPokemon.setAlpha(1);
      },
    });

    // Efecto visual de ganancia de escudo
    this.tweens.add({
      targets: this.enemyPokemon,
      scale: this.enemyPokemon.scaleX * 1.1,
      duration: 100,
      yoyo: true,
      repeat: 1,
    });

    // Cambiar turno al jugador
    this.time.delayedCall(1000, () => {
      this.switchTurn();
    });
  }

  performRivalSteal(): void {
    console.log("💰 Rival usa Steal!");

    // Mostrar mensaje en el chat
    const enemyName = this.enemyTeam.trainer.monster.name;
    this.updateBattleChat(`▶ ${enemyName} uses Steal!`);

    // Mostrar minijuego de Steal para el jugador
    this.showRivalStealMinigame();
  }

  showRivalStealMinigame(): void {
    this.isMinigameActive = true;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro de fondo
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    overlay.setDepth(2000);
    overlay.setInteractive();

    // Variables del minijuego
    let isMinigameActive = true;
    let hasCompleted = false;
    let successfulTaps = 0;
    let totalAttempts = 0;
    const totalTapsNeeded = 3;

    // Configuración de círculos
    const outerRadius = 140;
    const innerRadius = 100;
    const sphereOrbitRadius = 100;
    const sphereRadius = 12;

    let greenZoneSize = 30;
    let sphereSpeed = 3;
    let sphereDirection = 1;

    const generateGreenZone = (previousAngle?: number) => {
      if (previousAngle === undefined) {
        return Phaser.Math.Between(0, 360);
      }
      return (previousAngle + 180 + Phaser.Math.Between(-30, 30)) % 360;
    };

    let greenZoneAngle = generateGreenZone();

    // Círculo exterior grande - blanco
    const outerCircle = this.add.circle(
      centerX,
      centerY,
      outerRadius,
      0x000000,
      0
    );
    outerCircle.setStrokeStyle(8, 0xffffff, 1);
    outerCircle.setDepth(2001);

    // Círculo interior
    const innerCircle = this.add.circle(
      centerX,
      centerY,
      innerRadius,
      0x000000,
      0
    );
    innerCircle.setStrokeStyle(5, 0x444444, 1);
    innerCircle.setDepth(2001);

    // Zona verde
    const greenZone = this.add.graphics();
    greenZone.setDepth(2002);

    const drawGreenZone = () => {
      greenZone.clear();
      greenZone.lineStyle(8, 0x00ff00, 1);
      greenZone.beginPath();
      const greenZoneStart = Phaser.Math.DegToRad(
        greenZoneAngle - greenZoneSize / 2
      );
      const greenZoneEnd = Phaser.Math.DegToRad(
        greenZoneAngle + greenZoneSize / 2
      );
      greenZone.arc(
        centerX,
        centerY,
        outerRadius,
        greenZoneStart,
        greenZoneEnd,
        false
      );
      greenZone.strokePath();
    };

    drawGreenZone();

    // Flecha verde
    const arrow = this.add.graphics();
    arrow.setDepth(2003);

    const drawArrow = () => {
      arrow.clear();
      const arrowAngle = Phaser.Math.DegToRad(greenZoneAngle);
      const arrowDistance = outerRadius + 20;
      const arrowX = centerX + Math.cos(arrowAngle) * arrowDistance;
      const arrowY = centerY + Math.sin(arrowAngle) * arrowDistance;

      const arrowSize = 12;
      const angle1 = arrowAngle + Math.PI / 6;
      const angle2 = arrowAngle - Math.PI / 6;

      arrow.fillStyle(0x00ff00, 1);
      arrow.beginPath();
      arrow.moveTo(arrowX, arrowY);
      arrow.lineTo(
        arrowX + Math.cos(angle1) * arrowSize,
        arrowY + Math.sin(angle1) * arrowSize
      );
      arrow.lineTo(
        arrowX + Math.cos(angle2) * arrowSize,
        arrowY + Math.sin(angle2) * arrowSize
      );
      arrow.closePath();
      arrow.fillPath();
    };

    drawArrow();

    // Esfera que gira
    let sphereAngle = (greenZoneAngle + 180) % 360;

    const sphere = this.add.circle(
      centerX + Math.cos(Phaser.Math.DegToRad(sphereAngle)) * sphereOrbitRadius,
      centerY + Math.sin(Phaser.Math.DegToRad(sphereAngle)) * sphereOrbitRadius,
      sphereRadius,
      0xffffff,
      1
    );
    sphere.setDepth(2004);
    sphere.setBlendMode(Phaser.BlendModes.ADD);

    const sphereGlow = this.add.circle(sphere.x, sphere.y, 20, 0x00ffff, 0.5);
    sphereGlow.setDepth(2004);
    sphereGlow.setBlendMode(Phaser.BlendModes.ADD);

    const sparkParticles = this.add.particles(sphere.x, sphere.y, "pixel", {
      speed: { min: 40, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      frequency: 30,
      tint: [0x00ffff, 0x00ff00, 0xffffff],
      blendMode: "ADD",
      follow: sphere,
      quantity: 2,
    });
    sparkParticles.setDepth(2003);

    this.tweens.add({
      targets: [sphere, sphereGlow],
      scale: { from: 1, to: 1.2 },
      alpha: { from: 1, to: 0.7 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    const isSphereInGreenZone = (): boolean => {
      const normalizedAngle = ((sphereAngle % 360) + 360) % 360;
      const normalizedGreenAngle = ((greenZoneAngle % 360) + 360) % 360;

      let angleDiff = Math.abs(normalizedAngle - normalizedGreenAngle);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      return angleDiff <= greenZoneSize / 2;
    };

    const updateLoop = this.time.addEvent({
      delay: 16,
      callback: () => {
        if (!isMinigameActive || hasCompleted) {
          updateLoop.remove();
          return;
        }

        sphereAngle = (sphereAngle + sphereSpeed * sphereDirection) % 360;
        if (sphereAngle < 0) sphereAngle += 360;

        const radians = Phaser.Math.DegToRad(sphereAngle);
        const newX = centerX + Math.cos(radians) * sphereOrbitRadius;
        const newY = centerY + Math.sin(radians) * sphereOrbitRadius;

        sphere.setPosition(newX, newY);
        sphereGlow.setPosition(newX, newY);
      },
      loop: true,
    });

    const endMinigame = () => {
      if (!isMinigameActive || hasCompleted) return;
      isMinigameActive = false;
      hasCompleted = true;

      this.isMinigameActive = false;
      updateLoop.remove();

      this.time.delayedCall(800, () => {
        overlay.destroy();
        outerCircle.destroy();
        innerCircle.destroy();
        greenZone.destroy();
        arrow.destroy();
        sphere.destroy();
        sphereGlow.destroy();
        sparkParticles.destroy();

        // Ejecutar resultado con lógica invertida (daño al jugador)
        this.executeRivalStealResult(successfulTaps);
      });
    };

    const handleTap = () => {
      if (!isMinigameActive || hasCompleted || totalAttempts >= totalTapsNeeded)
        return;

      const inGreenZone = isSphereInGreenZone();

      if (inGreenZone) {
        successfulTaps++;
        totalAttempts++;

        this.sound.play("sfx-sphere-hit", { volume: 0.1 });

        const flashText = this.add.text(centerX, centerY + 80, "SUCCESS!", {
          fontSize: "36px",
          color: "#00ff00",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
        });
        flashText.setOrigin(0.5);
        flashText.setDepth(2006);

        this.tweens.add({
          targets: flashText,
          scale: { from: 1.5, to: 1 },
          alpha: { from: 1, to: 0 },
          y: centerY + 50,
          duration: 400,
          ease: "Back.easeOut",
          onComplete: () => {
            flashText.destroy();
          },
        });

        if (totalAttempts >= totalTapsNeeded) {
          endMinigame();
        } else {
          sphereDirection *= -1;

          if (totalAttempts === 1) {
            sphereSpeed = 4.5;
          } else if (totalAttempts === 2) {
            sphereSpeed = 6;
          }

          greenZoneAngle = generateGreenZone(greenZoneAngle);
          drawGreenZone();
          drawArrow();
        }
      } else {
        totalAttempts++;

        const missText = this.add.text(centerX, centerY + 80, "MISS!", {
          fontSize: "36px",
          color: "#ff0000",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
        });
        missText.setOrigin(0.5);
        missText.setDepth(2006);

        this.tweens.add({
          targets: missText,
          scale: { from: 1.5, to: 1 },
          alpha: { from: 1, to: 0 },
          y: centerY + 50,
          duration: 400,
          ease: "Back.easeOut",
          onComplete: () => {
            missText.destroy();
          },
        });

        if (totalAttempts >= totalTapsNeeded) {
          endMinigame();
        } else {
          sphereDirection *= -1;

          if (totalAttempts === 1) {
            sphereSpeed = 4.5;
          } else if (totalAttempts === 2) {
            sphereSpeed = 6;
          }

          greenZoneAngle = generateGreenZone(greenZoneAngle);
          drawGreenZone();
          drawArrow();
        }
      }
    };

    overlay.on("pointerdown", handleTap);
  }

  executeRivalStealResult(successfulTaps: number): void {
    // Lógica invertida: más aciertos del jugador = menos daño recibido
    // 3 aciertos: -1 HP al jugador
    // 2 aciertos: -2 HP al jugador, +1 HP al enemigo
    // 1 acierto: -2 HP al jugador, +2 HP al enemigo
    // 0 aciertos: -3 HP al jugador, +3 HP al enemigo

    if (successfulTaps === 3) {
      // 3 ACIERTOS: Solo 1 de daño al jugador
      this.damagePlayer(1);
      this.updateBattleChat("⚡ Defended well! Only 1 HP lost!");
    } else if (successfulTaps === 2) {
      // 2 ACIERTOS: 2 de daño al jugador + 1 vida al enemigo
      this.damagePlayer(2);

      // Curar 1 HP al enemigo
      if (this.enemyHPSections < 10) {
        this.enemyHPSections++;
      }
      this.updateEnemyHPBar(
        this.enemyHPBarX,
        this.enemyHPBarY,
        this.enemyHPBarWidth
      );

      this.updateBattleChat("⚠️ Partial defense: 2 HP lost, enemy healed 1!");
    } else if (successfulTaps === 1) {
      // 1 ACIERTO: 2 de daño al jugador + 2 vida al enemigo
      this.damagePlayer(2);

      // Curar 2 HP al enemigo
      for (let i = 0; i < 2; i++) {
        if (this.enemyHPSections < 10) {
          this.enemyHPSections++;
        }
      }
      this.updateEnemyHPBar(
        this.enemyHPBarX,
        this.enemyHPBarY,
        this.enemyHPBarWidth
      );

      this.updateBattleChat("❌ Weak defense: 2 HP lost, enemy healed 2!");
    } else {
      // 0 ACIERTOS: 3 de daño al jugador + 3 vida al enemigo
      this.damagePlayer(3);

      // Curar 3 HP al enemigo
      for (let i = 0; i < 3; i++) {
        if (this.enemyHPSections < 10) {
          this.enemyHPSections++;
        }
      }
      this.updateEnemyHPBar(
        this.enemyHPBarX,
        this.enemyHPBarY,
        this.enemyHPBarWidth
      );

      this.updateBattleChat("💀 Failed defense: 3 HP lost, enemy healed 3!");
    }

    // Efecto visual de robo
    const stealParticles = this.add.particles(
      this.playerPokemon.x,
      this.playerPokemon.y,
      "pixel",
      {
        speed: { min: 100, max: 200 },
        angle: { min: 0, max: 360 },
        scale: { start: 2, end: 0 },
        tint: [0xff0000, 0xff6600],
        lifespan: 600,
        quantity: 20,
        blendMode: "ADD",
      }
    );
    stealParticles.setDepth(100);

    this.time.delayedCall(600, () => {
      stealParticles.destroy();
    });

    // Verificar victoria/derrota y cambiar turno
    this.time.delayedCall(800, () => {
      this.checkBattleEnd();
      if (this.battleStarted) {
        this.switchTurn();
      }
    });
  }

  performRivalSpecial(): void {
    console.log("✨ Rival usa Special!");

    // Mostrar mensaje en el chat
    const enemyName = this.enemyTeam.trainer.monster.name;
    this.updateBattleChat(`▶ ${enemyName} uses Special!`);

    // Mostrar minijuego de defensa para el jugador (5 círculos)
    this.showRivalAttackMinigame(5);
  }

  launchRivalSpecialAttack(): void {
    const playerBounds = this.playerPokemon.getBounds();

    // Crear animación del sprite especial del rival si no existe
    const animKey = "rival-special-attack-anim";
    if (!this.anims.exists(animKey)) {
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers("enemySpecialAttack", {
          start: 0,
          end: 14, // 15 frames
        }),
        frameRate: 20,
        repeat: 1, // Se reproduce 2 veces (original + 1 repetición)
      });
    }

    // Obtener el frameHeight del sprite especial del rival
    const enemySpecialAbilityInfo =
      this.enemyTeam.trainer.monster.sprites.specialAbility;
    const extraOffset = enemySpecialAbilityInfo.frameHeight > 128 ? 50 : 0; // Offset adicional para sprites más altos

    // Crear el sprite del ataque especial del rival encima del jugador
    const specialSprite = this.add.sprite(
      playerBounds.centerX,
      playerBounds.centerY - 100 - extraOffset, // Empieza más arriba para sprites altos
      "enemySpecialAttack"
    );
    specialSprite.setScale(2.5); // Tamaño aumentado
    specialSprite.setAlpha(0);

    // Aparecer y caer sobre el jugador
    this.tweens.add({
      targets: specialSprite,
      alpha: 1,
      y: playerBounds.centerY - extraOffset, // Posición final ajustada
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        // Reproducir sonido del ataque especial
        this.sound.play("sfx-special", { volume: 0.6 });

        // Reproducir animación del ataque
        specialSprite.play(animKey);

        // Destruir el sprite después de la animación
        specialSprite.once("animationcomplete", () => {
          this.tweens.add({
            targets: specialSprite,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              specialSprite.destroy();

              // APLICAR DAÑO DESPUÉS DE COMPLETAR LA ANIMACIÓN
              // skipFlash = true para evitar el parpadeo durante el special
              this.damagePlayer(2, true);
            },
          });
        });
      },
    });

    // Cambiar turno al jugador (después de aplicar el daño)
    this.time.delayedCall(1500, () => {
      this.switchTurn();
    });
  }

  launchRivalSpecialAttackWithDamage(
    damageToPlayer: number,
    damageToEnemy: number = 0,
    energyGain: number = 0,
    chatMessage: string = ""
  ): void {
    const playerBounds = this.playerPokemon.getBounds();

    // Crear animación del sprite especial del rival si no existe
    const animKey = "rival-special-attack-anim";
    if (!this.anims.exists(animKey)) {
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers("enemySpecialAttack", {
          start: 0,
          end: 14, // 15 frames
        }),
        frameRate: 20,
        repeat: 1, // Se reproduce 2 veces (original + 1 repetición)
      });
    }

    // Obtener el frameHeight del sprite especial del rival
    const enemySpecialAbilityInfo =
      this.enemyTeam.trainer.monster.sprites.specialAbility;
    const extraOffset = enemySpecialAbilityInfo.frameHeight > 128 ? 50 : 0; // Offset adicional para sprites más altos

    // Crear el sprite del ataque especial del rival encima del jugador
    const specialSprite = this.add.sprite(
      playerBounds.centerX,
      playerBounds.centerY - 100 - extraOffset, // Empieza más arriba para sprites altos
      "enemySpecialAttack"
    );
    specialSprite.setScale(2.5); // Tamaño aumentado
    specialSprite.setAlpha(0);

    // Aparecer y caer sobre el jugador
    this.tweens.add({
      targets: specialSprite,
      alpha: 1,
      y: playerBounds.centerY - extraOffset, // Posición final ajustada
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        // Reproducir sonido del ataque especial
        this.sound.play("sfx-special", { volume: 0.6 });

        // Reproducir animación del ataque
        specialSprite.play(animKey);

        // Destruir el sprite después de la animación
        specialSprite.once("animationcomplete", () => {
          this.tweens.add({
            targets: specialSprite,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              specialSprite.destroy();

              // APLICAR DAÑO CALCULADO DESDE EL MINIJUEGO
              if (damageToPlayer > 0) {
                this.damagePlayer(damageToPlayer, true); // skipFlash = true para evitar el parpadeo
              }

              // Si el jugador bloqueó todo, contraatacar al rival
              if (damageToEnemy > 0) {
                this.damageEnemy(damageToEnemy);
              }

              // Ganar energía de evolución
              if (energyGain > 0) {
                this.addEvolutionEnergy(energyGain);
              }

              // Mostrar mensaje en el chat si hay
              if (chatMessage) {
                this.updateBattleChat(chatMessage);
              }
            },
          });
        });
      },
    });

    // Cambiar turno al jugador (después de aplicar el daño)
    this.time.delayedCall(1500, () => {
      this.switchTurn();
    });
  }

  switchTurn(): void {
    this.isPlayerTurn = !this.isPlayerTurn;
    this.hasUsedAbilityThisTurn = false; // Resetear flag al cambiar turno

    console.log(
      "🔄 Cambio de turno. Ahora es turno de: " +
        (this.isPlayerTurn ? "JUGADOR" : "RIVAL")
    );

    // Actualizar indicadores de turno
    this.updateTurnIndicators();

    // Si ahora es el turno del rival, ejecutarlo
    if (!this.isPlayerTurn) {
      console.log("⏰ Programando turno del rival en 500ms...");
      this.time.delayedCall(500, () => {
        this.performRivalTurn();
      });
    }
    // Si es turno del jugador, simplemente espera a que pulse un botón
  }

  createTurnIndicators(): void {
    // Flecha del jugador (apunta hacia abajo a la barra de HP)
    this.playerTurnArrow = this.add.graphics();
    this.playerTurnArrow.setDepth(100);

    // Flecha del enemigo (apunta hacia abajo a la barra de HP)
    this.enemyTurnArrow = this.add.graphics();
    this.enemyTurnArrow.setDepth(100);

    // Inicializar visibilidad
    this.updateTurnIndicators();
  }

  updateTurnIndicators(): void {
    // Limpiar flechas anteriores
    if (this.playerTurnArrow) {
      this.playerTurnArrow.clear();
    }
    if (this.enemyTurnArrow) {
      this.enemyTurnArrow.clear();
    }

    if (this.isPlayerTurn && this.playerTurnArrow) {
      // Dibujar flecha del jugador (a la IZQUIERDA de la barra, apuntando a la DERECHA)
      const arrowX = this.playerHPBarX - 40; // Más separada de la barra para animación
      const arrowY = this.playerHPBarY + 10; // Centrada con la barra

      this.playerTurnArrow.fillStyle(0x10b981, 1); // Color #10B981 (verde esmeralda)
      this.playerTurnArrow.beginPath();
      this.playerTurnArrow.moveTo(arrowX + 20, arrowY); // Punta (derecha)
      this.playerTurnArrow.lineTo(arrowX, arrowY - 15); // Arriba izquierda
      this.playerTurnArrow.lineTo(arrowX, arrowY - 8); // Medio arriba izquierda
      this.playerTurnArrow.lineTo(arrowX - 10, arrowY - 8); // Cola arriba
      this.playerTurnArrow.lineTo(arrowX - 10, arrowY + 8); // Cola abajo
      this.playerTurnArrow.lineTo(arrowX, arrowY + 8); // Medio abajo izquierda
      this.playerTurnArrow.lineTo(arrowX, arrowY + 15); // Abajo izquierda
      this.playerTurnArrow.closePath();
      this.playerTurnArrow.fillPath();

      // Borde negro
      this.playerTurnArrow.lineStyle(2, 0x000000, 1);
      this.playerTurnArrow.strokePath();

      // Animación hacia la barra de HP (de atrás hacia adelante)
      this.tweens.add({
        targets: this.playerTurnArrow,
        x: { from: -10, to: 0 }, // Empieza más atrás y va hacia la barra
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    } else if (!this.isPlayerTurn && this.enemyTurnArrow) {
      // Dibujar flecha del enemigo (a la DERECHA de la barra, apuntando a la IZQUIERDA)
      const arrowX = this.enemyHPBarX + this.enemyHPBarWidth + 40; // Más separada
      const arrowY = this.enemyHPBarY + 10; // Centrada con la barra

      this.enemyTurnArrow.fillStyle(0x10b981, 1); // Color #10B981 (verde esmeralda)
      this.enemyTurnArrow.beginPath();
      this.enemyTurnArrow.moveTo(arrowX - 20, arrowY); // Punta (izquierda)
      this.enemyTurnArrow.lineTo(arrowX, arrowY - 15); // Arriba derecha
      this.enemyTurnArrow.lineTo(arrowX, arrowY - 8); // Medio arriba derecha
      this.enemyTurnArrow.lineTo(arrowX + 10, arrowY - 8); // Cola arriba
      this.enemyTurnArrow.lineTo(arrowX + 10, arrowY + 8); // Cola abajo
      this.enemyTurnArrow.lineTo(arrowX, arrowY + 8); // Medio abajo derecha
      this.enemyTurnArrow.lineTo(arrowX, arrowY + 15); // Abajo derecha
      this.enemyTurnArrow.closePath();
      this.enemyTurnArrow.fillPath();

      // Borde negro
      this.enemyTurnArrow.lineStyle(2, 0x000000, 1);
      this.enemyTurnArrow.strokePath();

      // Animación hacia la barra de HP (de atrás hacia adelante)
      this.tweens.add({
        targets: this.enemyTurnArrow,
        x: { from: 10, to: 0 }, // Empieza más atrás y va hacia la barra
        duration: 600,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  evolveEnemy(): void {
    this.isEnemyEvolved = true;

    // Determinar las texturas correctas (front para el enemigo)
    const adultTexture = `${this.enemyTeam.id}-enemy-adult`; // Front para el enemigo

    // Calcular offset para monstruos voladores
    const flyingOffset = this.enemyTeam.trainer.monster.isFlying ? -80 : 0;

    // Posición final del adulto
    const targetX = this.ENEMY_ADULT_X;
    const targetY = this.ENEMY_ADULT_Y + flyingOffset;

    // Crear sprite overlay blanco que cubre todo el Pokémon
    const whiteGlow = this.add.image(
      this.enemyPokemon.x,
      this.enemyPokemon.y,
      this.enemyPokemon.texture.key
    );
    whiteGlow.setScale(this.enemyPokemon.scaleX, this.enemyPokemon.scaleY);
    whiteGlow.setOrigin(this.enemyPokemon.originX, this.enemyPokemon.originY);
    whiteGlow.setTint(0xffffff);
    whiteGlow.setAlpha(0);
    whiteGlow.setBlendMode(Phaser.BlendModes.ADD);
    whiteGlow.setDepth(this.enemyPokemon.depth + 1);

    // Secuencia de parpadeos cada vez más rápidos
    const flashDurations = [250, 200, 160, 120, 90, 70, 50, 35, 25, 18, 12, 8]; // Cada vez más rápido
    let currentFlash = 0;

    const doFlash = () => {
      if (currentFlash >= flashDurations.length) {
        // Flash blanco final sostenido
        this.tweens.add({
          targets: whiteGlow,
          alpha: 1,
          duration: 100,
          onComplete: () => {
            // Crear explosión de humo antes de revelar el adulto
            const smokeParticles: Phaser.GameObjects.Graphics[] = [];
            const numParticles = 15; // Número de nubes de humo

            for (let i = 0; i < numParticles; i++) {
              const angle = (Math.PI * 2 * i) / numParticles;
              const distance = 100 + Math.random() * 60; // Distancia más grande

              const smoke = this.add.graphics();
              smoke.fillStyle(0xffffff, 0.8);
              smoke.fillCircle(0, 0, 35 + Math.random() * 25); // Tamaño mucho más grande
              smoke.setPosition(this.enemyPokemon.x, this.enemyPokemon.y);
              smoke.setBlendMode(Phaser.BlendModes.NORMAL);
              smoke.setDepth(whiteGlow.depth + 1);

              smokeParticles.push(smoke);

              // Animar cada nube de humo hacia afuera
              this.tweens.add({
                targets: smoke,
                x: this.enemyPokemon.x + Math.cos(angle) * distance,
                y: this.enemyPokemon.y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 2.0, // Escala mayor para más tamaño
                duration: 500, // Más duración para que se vea mejor
                ease: "Power2",
                onComplete: () => {
                  smoke.destroy();
                },
              });
            }

            // Cambiar a adulto durante la explosión de humo
            this.time.delayedCall(150, () => {
              this.enemyPokemon.setTexture(adultTexture);
              this.enemyPokemon.setScale(this.ENEMY_ADULT_SCALE);
              this.enemyPokemon.setPosition(targetX, targetY);
              this.enemyPokemon.setAlpha(1); // Asegurar que el pokémon esté visible

              // Actualizar posición del glow
              whiteGlow.setTexture(adultTexture);
              whiteGlow.setScale(this.ENEMY_ADULT_SCALE);
              whiteGlow.setPosition(targetX, targetY);

              // Desvanecer el glow para revelar el adulto
              this.tweens.add({
                targets: whiteGlow,
                alpha: 0,
                duration: 400,
                ease: "Power2",
                onComplete: () => {
                  whiteGlow.destroy();
                },
              });
            });
          },
        });

        return;
      }

      // Parpadeo actual
      const duration = flashDurations[currentFlash];

      // Encender
      this.tweens.add({
        targets: whiteGlow,
        alpha: 0.9,
        duration: duration,
        onComplete: () => {
          // Apagar
          this.tweens.add({
            targets: whiteGlow,
            alpha: 0,
            duration: duration,
            onComplete: () => {
              currentFlash++;
              doFlash(); // Siguiente parpadeo
            },
          });
        },
      });
    };

    // Iniciar secuencia de parpadeos
    doFlash();
  }

  // ===== FIN SISTEMA DE COMBATE =====

  showSmashTutorialOverlay(
    focusCircle: { x: number; y: number },
    callback: () => void
  ): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro más opaco para que se vea mejor el tutorial
    const tutorialOverlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    tutorialOverlay.setDepth(3000);
    tutorialOverlay.setInteractive();

    // Círculo de foco estático (anillo brillante alrededor del círculo objetivo)
    const focusRing = this.add.graphics();
    focusRing.setDepth(3002);

    // Dibujar anillo brillante estático
    const spotlightRadius = 50;
    focusRing.lineStyle(4, 0x00ff00, 1);
    focusRing.strokeCircle(focusCircle.x, focusCircle.y, spotlightRadius);

    // Anillo exterior más grande con menos opacidad
    focusRing.lineStyle(2, 0x00ff00, 0.5);
    focusRing.strokeCircle(focusCircle.x, focusCircle.y, spotlightRadius + 10);

    // Texto del tutorial centrado
    const tutorialText = this.add.text(
      centerX,
      centerY - 320,
      "Tap when the sphere\npasses through the circles",
      {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Orbitron",
        fontStyle: "bold",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6,
      }
    );
    tutorialText.setOrigin(0.5);
    tutorialText.setDepth(3001);

    // Interceptar el primer tap para cerrar el tutorial
    const handleFirstTap = () => {
      // Limpiar tutorial
      tutorialOverlay.destroy();
      tutorialText.destroy();
      focusRing.destroy();

      // Marcar que ya vio el tutorial
      this.hasSeenSmashTutorial = true;

      // Guardar en el estado del juego
      if (window.FarcadeSDK?.singlePlayer?.actions?.saveGameState) {
        window.FarcadeSDK.singlePlayer.actions.saveGameState({
          gameState: {
            hasSeenSmashTutorial: true,
            hasSeenShieldTutorial: this.hasSeenShieldTutorial,
            hasSeenStealTutorial: this.hasSeenStealTutorial,
            hasSeenSpecialTutorial: this.hasSeenSpecialTutorial,
            hasSeenRivalAttackTutorial: this.hasSeenRivalAttackTutorial,
          },
        });
      }

      // Llamar al callback para que el tap también cuente en el minijuego
      callback();
    };

    // Escuchar el tap
    tutorialOverlay.once("pointerdown", handleFirstTap);
  }

  performAttack(): void {
    // Verificar que es el turno del jugador
    if (!this.isPlayerTurn) return;

    // Evitar abrir múltiples minijuegos
    if (this.isMinigameActive) return;

    // Marcar que se usó una habilidad
    this.hasUsedAbilityThisTurn = true;

    // Mostrar minijuego (con o sin tutorial)
    this.showAttackMinigame();
  }

  showAttackMinigame(totalCircles: number = 3): void {
    // Marcar que el minijuego está activo
    this.isMinigameActive = true;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro de fondo - más transparente
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.3
    );
    overlay.setDepth(2000);

    // Tamaño del polígono (triángulo para 3, pentágono para 5)
    const polygonSize = 150;
    const circleRadius = 22; // Más grande
    const hitZoneRadius = 22; // Zona de acierto intermedia (antes 30, luego 15)

    // Calcular puntos del polígono según totalCircles
    const peaks: { x: number; y: number }[] = [];
    for (let i = 0; i < totalCircles; i++) {
      const angle = (Math.PI * 2 * i) / totalCircles - Math.PI / 2; // Empezar desde arriba
      peaks.push({
        x: centerX + Math.cos(angle) * polygonSize,
        y: centerY + Math.sin(angle) * polygonSize,
      });
    }

    // Crear polígono con graphics
    const polygon = this.add.graphics();
    polygon.setDepth(2001);

    // Dibujar polígono
    polygon.lineStyle(5, 0xffffff, 1);
    polygon.beginPath();
    polygon.moveTo(peaks[0].x, peaks[0].y);
    for (let i = 1; i < peaks.length; i++) {
      polygon.lineTo(peaks[i].x, peaks[i].y);
    }
    polygon.closePath();
    polygon.strokePath();

    // Línea interior más fina para efecto de profundidad
    polygon.lineStyle(2, 0xffffff, 0.5);
    polygon.strokePath();

    // Crear círculos "focos" en cada pico - inicialmente apagados con borde verde
    const circles: Phaser.GameObjects.Arc[] = [];
    const circleGlows: Phaser.GameObjects.Arc[] = [];
    const litCircles: boolean[] = []; // Track de cuáles círculos están encendidos

    for (let i = 0; i < totalCircles; i++) {
      // Círculo apagado (transparente con borde verde visible)
      const circle = this.add.circle(
        peaks[i].x,
        peaks[i].y,
        circleRadius,
        0x000000,
        0
      );
      circle.setStrokeStyle(5, 0x00ff00, 1); // Verde brillante
      circle.setDepth(2002);
      circles.push(circle);
      litCircles.push(false);

      // Glow inicialmente invisible
      const glow = this.add.circle(
        peaks[i].x,
        peaks[i].y,
        circleRadius + 10,
        0x00ff00,
        0
      );
      glow.setDepth(2001);
      glow.setBlendMode(Phaser.BlendModes.ADD);
      circleGlows.push(glow);
    }

    // Crear la esfera de energía que se mueve - estilo "corriente eléctrica"
    const sphere = this.add.circle(peaks[0].x, peaks[0].y, 12, 0xffffff, 1);
    sphere.setDepth(2003);
    sphere.setBlendMode(Phaser.BlendModes.ADD);

    // Anillo exterior de brillo más intenso
    const sphereGlow = this.add.circle(
      peaks[0].x,
      peaks[0].y,
      20,
      0x00ffff,
      0.5
    );
    sphereGlow.setDepth(2003);
    sphereGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Partículas de rayitos/chispas eléctricas más intensas
    const sparkParticles = this.add.particles(peaks[0].x, peaks[0].y, "pixel", {
      speed: { min: 40, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      frequency: 30,
      tint: [0x00ffff, 0x00ff00, 0xffffff],
      blendMode: "ADD",
      follow: sphere,
      quantity: 2,
    });
    sparkParticles.setDepth(2002);

    // Efecto de pulso en la esfera
    this.tweens.add({
      targets: [sphere, sphereGlow],
      scale: { from: 1, to: 1.2 },
      alpha: { from: 1, to: 0.7 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Texto para feedback (inicialmente vacío)
    const feedbackText = this.add.text(
      centerX,
      centerY + polygonSize + 20,
      "",
      {
        fontSize: "42px",
        color: "#ffffff",
        fontFamily: "Orbitron",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      }
    );
    feedbackText.setOrigin(0.5, 0.5);
    feedbackText.setDepth(2004);
    feedbackText.setAlpha(0); // Inicialmente invisible

    let currentPeakIndex = 0;
    let hitsRegistered = 0;
    let badHits = 0;
    let isMinigameActive = true;
    let currentTween: Phaser.Tweens.Tween | null = null;
    let moveDuration = totalCircles === 5 ? 500 : 700; // Special más rápido (500ms vs 700ms)
    let moveDirection = Phaser.Math.Between(0, 1) === 0 ? 1 : -1; // 1 = horario, -1 = antihorario (aleatorio)

    // Función para mover la esfera secuencialmente por el borde del polígono
    const moveContinuously = () => {
      if (!isMinigameActive) return;

      // Si ya hay un tween activo, no crear otro
      if (currentTween && currentTween.isPlaying()) {
        return;
      }

      // Mover al siguiente vértice según la dirección
      const nextIndex =
        (currentPeakIndex + moveDirection + totalCircles) % totalCircles;
      const nextPeak = peaks[nextIndex];

      currentTween = this.tweens.add({
        targets: [sphere, sphereGlow],
        x: nextPeak.x,
        y: nextPeak.y,
        duration: moveDuration,
        ease: "Linear",
        onComplete: () => {
          if (!isMinigameActive) return;
          currentPeakIndex = nextIndex;
          currentTween = null; // Limpiar referencia
          moveContinuously(); // Continuar en bucle
        },
      });
    };

    // Función para verificar si está cerca de un círculo
    const checkHit = () => {
      if (!isMinigameActive || hitsRegistered >= totalCircles) return;

      const spherePos = { x: sphere.x, y: sphere.y };
      let closestPeakIndex = -1;
      let distance = Infinity;

      // Encontrar el círculo más cercano
      for (let i = 0; i < totalCircles; i++) {
        const peak = peaks[i];
        const dist = Phaser.Math.Distance.Between(
          spherePos.x,
          spherePos.y,
          peak.x,
          peak.y
        );

        if (dist < distance) {
          distance = dist;
          closestPeakIndex = i;
        }
      }

      // Determinar si es acierto (está cerca Y el foco no está ya encendido)
      if (distance <= hitZoneRadius && !litCircles[closestPeakIndex]) {
        // ACIERTO - Encender el foco
        litCircles[closestPeakIndex] = true;

        // Reproducir sonido de acierto (muy bajo)
        this.sound.play("sfx-sphere-hit", { volume: 0.15 });

        // Haptic feedback para aciertos
        if (window.FarcadeSDK?.singlePlayer?.actions?.hapticFeedback) {
          window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
        }

        // Cambiar apariencia del círculo a "encendido" con verde brillante
        circles[closestPeakIndex].setFillStyle(0x00ff00, 0.6); // Verde con transparencia
        circles[closestPeakIndex].setStrokeStyle(6, 0x00ff00, 1); // Borde más grueso cuando está encendido

        // Activar glow verde
        circleGlows[closestPeakIndex].setAlpha(0.6);
        this.tweens.add({
          targets: circleGlows[closestPeakIndex],
          scale: { from: 1, to: 1.3 },
          alpha: { from: 0.6, to: 0.3 },
          duration: 500,
          yoyo: true,
          repeat: -1,
          ease: "Sine.easeInOut",
        });

        // Efecto de explosión de partículas verdes
        const burstParticles = this.add.particles(
          peaks[closestPeakIndex].x,
          peaks[closestPeakIndex].y,
          "pixel",
          {
            speed: { min: 100, max: 200 },
            angle: { min: 0, max: 360 },
            scale: { start: 1.5, end: 0 },
            lifespan: 600,
            quantity: 20,
            tint: 0x00ff00, // Verde
            blendMode: "ADD",
          }
        );
        burstParticles.setDepth(2004);

        this.time.delayedCall(600, () => {
          burstParticles.destroy();
        });

        // Crear texto SUCCESS único para este acierto
        const successText = this.add.text(centerX, centerY + 80, "SUCCESS", {
          fontSize: "42px",
          color: "#00ff00",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
        });
        successText.setOrigin(0.5, 0.5);
        successText.setDepth(2004);

        this.tweens.add({
          targets: successText,
          alpha: 0,
          scale: 1.5,
          duration: 500,
          onComplete: () => {
            successText.destroy();
          },
        });

        this.cameras.main.shake(150, 0.005);
        moveDuration *= 0.85; // Aumentar velocidad gradualmente
      } else if (distance <= hitZoneRadius && litCircles[closestPeakIndex]) {
        // Ya está encendido - no cuenta como fallo pero tampoco como acierto
        feedbackText.setText("ALREADY LIT");
        feedbackText.setColor("#ffaa00");
        badHits++;

        feedbackText.setAlpha(1);
        feedbackText.setScale(1);

        this.tweens.add({
          targets: feedbackText,
          alpha: 0,
          scale: 1.5,
          duration: 500,
        });
      } else {
        // FALLO - no está cerca de ningún círculo
        feedbackText.setText("MISS");
        feedbackText.setColor("#ff0000");
        badHits++;

        feedbackText.setAlpha(1);
        feedbackText.setScale(1);

        this.tweens.add({
          targets: feedbackText,
          alpha: 0,
          scale: 1.5,
          duration: 500,
        });
      }

      hitsRegistered++;

      // Verificar si completó todos los intentos
      if (hitsRegistered >= totalCircles) {
        // Completó todos los intentos - detener el movimiento
        if (currentTween) {
          currentTween.stop();
          currentTween = null;
        }
        const successHits = hitsRegistered - badHits;
        this.time.delayedCall(600, () => {
          endMinigame(successHits);
        });
      }
    };

    // Función para terminar el minijuego
    const endMinigame = (successHits: number) => {
      isMinigameActive = false;

      // Resetear el flag global
      this.isMinigameActive = false;

      // Detener el tween de movimiento
      if (currentTween) {
        currentTween.stop();
        currentTween = null;
      }

      // Limpiar listeners
      this.input.keyboard?.off("keydown-SPACE", handleInput);
      this.input.off("pointerdown", handleInput);

      // Limpiar elementos
      overlay.destroy();
      polygon.destroy();
      circles.forEach((c) => c.destroy());
      circleGlows.forEach((g) => g.destroy());
      sphere.destroy();
      sphereGlow.destroy();
      sparkParticles.destroy();
      feedbackText.destroy();

      // Ejecutar ataque con el número de aciertos
      this.executeAttack(successHits, totalCircles);
    };

    // Detectar input del jugador (click o espacio)
    const handleInput = () => {
      checkHit();
    };

    // Variable para controlar si los inputs están habilitados
    let inputsEnabled = false;

    // Función para habilitar inputs
    const enableInputs = () => {
      if (!inputsEnabled) {
        inputsEnabled = true;
        this.input.keyboard?.on("keydown-SPACE", handleInput);
        this.input.on("pointerdown", handleInput);
      }
    };

    // Mostrar tutorial solo para Smash (3 círculos), no para Special
    const isSpecialMinigame = totalCircles === 5;

    console.log("Verificando tutorial de Smash:", {
      isSpecial: isSpecialMinigame,
      hasSeenSmashTutorial: this.hasSeenSmashTutorial,
      shouldShowTutorial: !isSpecialMinigame && !this.hasSeenSmashTutorial,
    });

    if (!isSpecialMinigame && !this.hasSeenSmashTutorial) {
      // Solo mostrar tutorial en Smash
      this.showSmashTutorialOverlay(peaks[0], () => {
        enableInputs();
      });
    } else {
      // Si no hay tutorial, habilitar inputs con delay normal
      this.time.delayedCall(200, () => {
        enableInputs();
      });
    } // Iniciar movimiento continuo
    moveContinuously();
  }

  executeAttack(successHits: number = 3, totalCircles: number = 3): void {
    this.recordSuccessfulHits(successHits);

    // Calcular daño según aciertos:
    // Para 3 círculos (Attack normal - Smash):
    // 3 aciertos: 3 segmentos al rival + 30 energía
    // 2 aciertos: 2 segmentos al rival + 20 energía
    // 1 acierto: 0 segmentos + 10 energía
    // 0 aciertos: 2 segmentos a uno mismo
    //
    // Para 5 círculos (Special):
    // 5 aciertos: 4 segmentos al rival
    // 4 aciertos: 3 segmentos al rival
    // 3 aciertos: 2 segmentos al rival
    // 2 aciertos: 0 segmentos
    // 1 acierto: 0 segmentos
    // 0 aciertos: 2 segmentos a uno mismo

    let damageToEnemy = 0;
    let damageToSelf = 0;
    let energyGain = 0;
    let chatMessage = "";

    if (totalCircles === 3) {
      // Attack normal - Smash
      if (successHits === 3) {
        damageToEnemy = 2;
        energyGain = 35;
        chatMessage = "💥 Perfect Smash!";
      } else if (successHits === 2) {
        damageToEnemy = 1;
        energyGain = 25;
        chatMessage = "";
      } else if (successHits === 1) {
        damageToEnemy = 0;
        energyGain = 15;
        chatMessage = "";
      } else {
        damageToSelf = 2;
        energyGain = 0;
        chatMessage = "";
      }
    } else if (totalCircles === 5) {
      // Special
      if (successHits === 5) {
        damageToEnemy = 4;
        energyGain = 35;
        chatMessage = "✨ Perfect Special!";
      } else if (successHits === 4) {
        damageToEnemy = 2;
        energyGain = 30;
        chatMessage = "";
      } else if (successHits === 3) {
        damageToEnemy = 1;
        damageToSelf = 1;
        energyGain = 25;
        chatMessage = "";
      } else if (successHits === 2) {
        damageToEnemy = 1;
        damageToSelf = 2;
        energyGain = 20;
        chatMessage = "";
      } else if (successHits === 1) {
        damageToEnemy = 0;
        damageToSelf = 2;
        energyGain = 15;
        chatMessage = "";
      } else {
        damageToSelf = 3;
        energyGain = 0;
        chatMessage = "";
      }
    }

    // Animación de ataque del pokemon del jugador
    const originalX = this.playerPokemon.x;
    const originalY = this.playerPokemon.y;

    // Reproducir sonido según el tipo de ataque
    if (totalCircles === 3) {
      // Ataque normal
      this.sound.play("sfx-attack", { volume: 0.6 });
    } else if (totalCircles === 5) {
      // Ataque especial
      this.sound.play("sfx-special", { volume: 0.6 });
    }

    // Secuencia de animación: mover hacia adelante, shake, y volver
    this.tweens.add({
      targets: this.playerPokemon,
      x: originalX + 40,
      y: originalY - 20,
      duration: 200,
      ease: "Power2",
      yoyo: false,
      onComplete: () => {
        // Shake rápido
        this.tweens.add({
          targets: this.playerPokemon,
          x: originalX + 40 - 5,
          duration: 50,
          yoyo: true,
          repeat: 3,
          onComplete: () => {
            // Volver a la posición original
            this.tweens.add({
              targets: this.playerPokemon,
              x: originalX,
              y: originalY,
              duration: 200,
              ease: "Power2",
              onComplete: () => {
                // APLICAR DAÑO DESPUÉS DE COMPLETAR LA ANIMACIÓN
                if (damageToEnemy > 0) {
                  // Si es ataque especial (5 círculos), mostrar sprite de animación
                  if (totalCircles === 5) {
                    this.showPlayerSpecialSprite(() => {
                      // Después de la animación del sprite, aplicar daño
                      this.applyDamageToEnemy(damageToEnemy);
                    });
                  } else {
                    // Flash en el enemigo cuando recibe el golpe (ataque normal)
                    this.tweens.add({
                      targets: this.enemyPokemon,
                      alpha: 0.3,
                      duration: 100,
                      yoyo: true,
                      repeat: 2,
                      onComplete: () => {
                        this.enemyPokemon.setAlpha(1);
                      },
                    });

                    // Reducir HP del enemigo usando la función que respeta el escudo
                    this.damageEnemy(damageToEnemy);

                    // Ganar energía de evolución
                    if (energyGain > 0) {
                      this.addEvolutionEnergy(energyGain);
                    }

                    // Mostrar mensaje en el chat si hay
                    if (chatMessage) {
                      this.updateBattleChat(chatMessage);
                    }

                    // Verificar victoria/derrota y cambiar turno
                    this.time.delayedCall(500, () => {
                      this.checkBattleEnd();
                      if (this.battleStarted) {
                        this.switchTurn();
                      }
                    });
                  }
                } else if (damageToSelf > 0) {
                  // Daño a uno mismo por fallar completamente
                  this.damagePlayer(damageToSelf);

                  // Verificar victoria/derrota y cambiar turno
                  this.time.delayedCall(500, () => {
                    this.checkBattleEnd();
                    if (this.battleStarted) {
                      this.switchTurn();
                    }
                  });
                } else {
                  // No hubo daño ni al enemigo ni al jugador, pero sí energía
                  if (energyGain > 0) {
                    this.addEvolutionEnergy(energyGain);
                  }

                  this.time.delayedCall(500, () => {
                    this.checkBattleEnd();
                    if (this.battleStarted) {
                      this.switchTurn();
                    }
                  });
                }
              },
            });
          },
        });
      },
    });
  }

  showPlayerSpecialSprite(onComplete: () => void): void {
    const enemyBounds = this.enemyPokemon.getBounds();

    // Crear animación del sprite especial del jugador si no existe
    const animKey = "player-special-attack-anim";
    if (!this.anims.exists(animKey)) {
      this.anims.create({
        key: animKey,
        frames: this.anims.generateFrameNumbers("specialAttack", {
          start: 0,
          end: 14, // 15 frames
        }),
        frameRate: 20,
        repeat: 1, // Se reproduce 2 veces (original + 1 repetición)
      });
    }

    // Obtener el frameHeight del sprite especial del jugador
    const playerSpecialAbilityInfo =
      this.playerTeam.trainer.monster.sprites.specialAbility;
    const extraOffset = playerSpecialAbilityInfo.frameHeight > 128 ? 50 : 0;

    // Crear el sprite del ataque especial del jugador encima del enemigo
    const specialSprite = this.add.sprite(
      enemyBounds.centerX,
      enemyBounds.centerY - 100 - extraOffset,
      "specialAttack"
    );
    specialSprite.setScale(2.5);
    specialSprite.setAlpha(0);
    specialSprite.setDepth(1000);

    // Aparecer y caer sobre el enemigo
    this.tweens.add({
      targets: specialSprite,
      alpha: 1,
      y: enemyBounds.centerY - extraOffset,
      duration: 300,
      ease: "Power2",
      onComplete: () => {
        // Reproducir animación del ataque
        specialSprite.play(animKey);

        // Destruir el sprite después de la animación
        specialSprite.once("animationcomplete", () => {
          this.tweens.add({
            targets: specialSprite,
            alpha: 0,
            duration: 200,
            onComplete: () => {
              specialSprite.destroy();
              onComplete();
            },
          });
        });
      },
    });
  }

  applyDamageToEnemy(damage: number): void {
    // Flash en el enemigo cuando recibe el golpe
    this.tweens.add({
      targets: this.enemyPokemon,
      alpha: 0.3,
      duration: 100,
      yoyo: true,
      repeat: 2,
      onComplete: () => {
        this.enemyPokemon.setAlpha(1);
      },
    });

    // Reducir HP del enemigo usando la función que respeta el escudo
    this.damageEnemy(damage);

    // Ganar energía de evolución
    this.addEvolutionEnergy(25);

    // Verificar victoria/derrota y cambiar turno
    this.time.delayedCall(500, () => {
      this.checkBattleEnd();
      if (this.battleStarted) {
        this.switchTurn();
      }
    });
  }

  showShieldTutorialOverlay(
    focusZone: { x: number; width: number; y: number; height: number },
    callback: () => void
  ): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro más opaco para que se vea mejor el tutorial
    const tutorialOverlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    tutorialOverlay.setDepth(3000);
    tutorialOverlay.setInteractive();

    // Rectángulo de foco estático (resaltando la zona verde objetivo)
    const focusRect = this.add.graphics();
    focusRect.setDepth(3002);

    // Dibujar rectángulo brillante estático
    focusRect.lineStyle(4, 0x00ff00, 1);
    focusRect.strokeRect(
      focusZone.x - 5,
      focusZone.y - 5,
      focusZone.width + 10,
      focusZone.height + 10
    );

    // Rectángulo exterior más grande con menos opacidad
    focusRect.lineStyle(2, 0x00ff00, 0.5);
    focusRect.strokeRect(
      focusZone.x - 10,
      focusZone.y - 10,
      focusZone.width + 20,
      focusZone.height + 20
    );

    // Texto del tutorial centrado
    const tutorialText = this.add.text(
      centerX,
      centerY - 320,
      "Tap when the sphere\nis inside the green zone",
      {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Orbitron",
        fontStyle: "bold",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6,
      }
    );
    tutorialText.setOrigin(0.5);
    tutorialText.setDepth(3001);

    // Interceptar el primer tap para cerrar el tutorial
    const handleFirstTap = () => {
      // Limpiar tutorial
      tutorialOverlay.destroy();
      tutorialText.destroy();
      focusRect.destroy();

      // Marcar que ya vio el tutorial
      this.hasSeenShieldTutorial = true;

      // Guardar en el estado del juego
      if (window.FarcadeSDK?.singlePlayer?.actions?.saveGameState) {
        window.FarcadeSDK.singlePlayer.actions.saveGameState({
          gameState: {
            hasSeenSmashTutorial: this.hasSeenSmashTutorial,
            hasSeenShieldTutorial: true,
            hasSeenStealTutorial: this.hasSeenStealTutorial,
            hasSeenSpecialTutorial: this.hasSeenSpecialTutorial,
            hasSeenRivalAttackTutorial: this.hasSeenRivalAttackTutorial,
          },
        });
      }

      // Llamar al callback para que el tap también cuente en el minijuego
      callback();
    };

    // Escuchar el tap
    tutorialOverlay.once("pointerdown", handleFirstTap);
  }

  performDefense(): void {
    // Verificar que es el turno del jugador
    if (!this.isPlayerTurn) return;

    // Evitar abrir múltiples minijuegos
    if (this.isMinigameActive) return;

    // Marcar que se usó una habilidad
    this.hasUsedAbilityThisTurn = true;

    // Mostrar minijuego de defensa
    this.showDefenseMinigame();
  }

  showRivalAttackTutorialOverlay(onFirstTap: () => void): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro que bloquea interacciones
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    overlay.setDepth(3000);
    overlay.setInteractive();

    // Texto de instrucción
    const tutorialText = this.add.text(
      centerX,
      centerY - 320,
      "Tap INSIDE the circle\nas soon as green matches white",
      {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Orbitron",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6,
      }
    );
    tutorialText.setOrigin(0.5, 0.5);
    tutorialText.setDepth(3001);

    const handleFirstTap = () => {
      overlay.destroy();
      tutorialText.destroy();

      this.hasSeenRivalAttackTutorial = true;

      if (window.FarcadeSDK?.singlePlayer?.actions?.saveGameState) {
        window.FarcadeSDK.singlePlayer.actions.saveGameState({
          gameState: {
            hasSeenSmashTutorial: this.hasSeenSmashTutorial,
            hasSeenShieldTutorial: this.hasSeenShieldTutorial,
            hasSeenStealTutorial: this.hasSeenStealTutorial,
            hasSeenSpecialTutorial: this.hasSeenSpecialTutorial,
            hasSeenRivalAttackTutorial: this.hasSeenRivalAttackTutorial,
          },
        });
      }

      onFirstTap();
    };

    overlay.once("pointerdown", handleFirstTap);
  }

  showDefenseMinigame(): void {
    // Marcar que el minijuego está activo
    this.isMinigameActive = true;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2 - 100; // Mover la barra más arriba

    // Overlay oscuro de fondo
    const overlay = this.add.rectangle(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.3
    );
    overlay.setDepth(2000);

    // Dimensiones de la barra
    const barWidth = 400;
    const barHeight = 40;
    const barX = centerX - barWidth / 2;
    const barY = centerY - barHeight / 2;

    // Zona objetivo (verde) - posición aleatoria inicialmente (zonas centrales)
    let targetZoneWidth = 75; // Zona intermedia (antes 100, luego 50)
    let targetZoneBorderWidth = 5; // Border inicial (igual que el triángulo)

    // Calcular posición X aleatoria en zona central (evitar esquinas)
    // Zona central: 25% a 75% de la barra
    const centralMargin = barWidth * 0.25;
    const minTargetX = barX + centralMargin + targetZoneWidth / 2;
    const maxTargetX = barX + barWidth - centralMargin - targetZoneWidth / 2;
    let targetZoneX = Phaser.Math.Between(minTargetX, maxTargetX);

    // Usar Graphics para zona verde SIN esquinas redondeadas (solo rectángulo)
    let targetZone = this.add.graphics();
    targetZone.fillStyle(0x00ff00, 0.5);
    targetZone.lineStyle(targetZoneBorderWidth, 0x00ff00, 1);
    targetZone.fillRect(
      targetZoneX - targetZoneWidth / 2,
      centerY - (barHeight - 10) / 2,
      targetZoneWidth,
      barHeight - 10
    );
    targetZone.strokeRect(
      targetZoneX - targetZoneWidth / 2,
      centerY - (barHeight - 10) / 2,
      targetZoneWidth,
      barHeight - 10
    );
    targetZone.setDepth(2001);

    // Barra de fondo (transparente con borde blanco y esquinas redondeadas) - por encima del verde
    const barBackground = this.add.graphics();
    barBackground.lineStyle(5, 0xffffff, 1);
    barBackground.strokeRoundedRect(
      centerX - barWidth / 2,
      centerY - barHeight / 2,
      barWidth,
      barHeight,
      10 // Radio de las esquinas redondeadas
    );
    barBackground.setDepth(2002);

    // Esfera que se mueve - color blanco con glow cyan como en Attack
    const sphereRadius = 12;
    const sphere = this.add.circle(barX, centerY, sphereRadius, 0xffffff);
    sphere.setDepth(2003);
    sphere.setBlendMode(Phaser.BlendModes.ADD);

    // Brillo de la esfera - cyan como en Attack
    const sphereGlow = this.add.circle(barX, centerY, 20, 0x00ffff, 0.5);
    sphereGlow.setDepth(2003);
    sphereGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Texto para feedback
    const feedbackText = this.add.text(centerX, centerY + 80, "", {
      fontSize: "42px",
      color: "#ffffff",
      fontFamily: "Orbitron",
      fontStyle: "bold",
      stroke: "#000000",
      strokeThickness: 6,
    });
    feedbackText.setOrigin(0.5, 0.5);
    feedbackText.setDepth(2004);
    feedbackText.setAlpha(0);

    // Variables del minijuego
    let hitsRegistered = 0;
    let badHits = 0;
    let isMinigameActive = true;
    let currentTween: Phaser.Tweens.Tween | null = null;
    let moveDuration = 1000; // Duración inicial del movimiento (más lento al inicio)
    let spherePassedTarget = false; // Flag para detectar si la esfera pasó la zona sin tap

    // Función para mover la esfera de lado a lado
    const moveSphereContinuously = () => {
      if (!isMinigameActive) return;

      if (currentTween && currentTween.isPlaying()) {
        return;
      }

      // Alternar entre izquierda y derecha
      const targetX = sphere.x <= centerX ? barX + barWidth : barX;

      // Reset del flag al iniciar nuevo movimiento
      spherePassedTarget = false;

      currentTween = this.tweens.add({
        targets: [sphere, sphereGlow],
        x: targetX,
        duration: moveDuration,
        ease: "Linear",
        onUpdate: () => {
          // Verificar si la esfera está pasando por la zona verde
          if (!spherePassedTarget && hitsRegistered < 3) {
            const sphereX = sphere.x;
            const targetLeft = targetZone.x - targetZoneWidth / 2;
            const targetRight = targetZone.x + targetZoneWidth / 2;

            // Si la esfera pasó completamente la zona sin hacer tap
            const isMovingRight = targetX > sphere.x;
            const passedZone = isMovingRight
              ? sphereX > targetRight
              : sphereX < targetLeft;

            // Verificar si estaba en la zona en el frame anterior
            const wasInZone =
              sphereX >= targetLeft - 10 && sphereX <= targetRight + 10;

            if (passedZone && wasInZone) {
              spherePassedTarget = true;
              registerMiss();
            }
          }
        },
        onComplete: () => {
          if (!isMinigameActive) return;
          currentTween = null;
          moveSphereContinuously(); // Continuar movimiento
        },
      });
    };

    // Función para registrar un fallo por no tapear a tiempo
    const registerMiss = () => {
      if (hitsRegistered >= 3 || !isMinigameActive) return;

      badHits++;
      hitsRegistered++;

      // Mostrar feedback FALLO
      feedbackText.setText("MISS");
      feedbackText.setColor("#ff0000");
      feedbackText.setAlpha(1);
      feedbackText.setScale(1);

      this.tweens.add({
        targets: feedbackText,
        alpha: 0,
        scale: 1.5,
        duration: 500,
      });

      // Verificar si completó los 3 intentos
      if (hitsRegistered >= 3) {
        // Completó los 3 intentos
        if (currentTween) {
          currentTween.stop();
          currentTween = null;
        }
        const successHits = hitsRegistered - badHits;
        this.time.delayedCall(600, () => {
          endMinigame(successHits);
        });
      }
    };

    // Función para verificar si la esfera está en la zona objetivo
    const checkHit = () => {
      if (!isMinigameActive || hitsRegistered >= 3 || spherePassedTarget)
        return;

      const sphereX = sphere.x;
      const targetLeft = targetZoneX - targetZoneWidth / 2;
      const targetRight = targetZoneX + targetZoneWidth / 2;

      let isHit = false;

      // Verificar si está dentro de la zona objetivo
      if (sphereX >= targetLeft && sphereX <= targetRight) {
        // Marcar que se hizo tap en la zona (ya no cuenta como miss)
        spherePassedTarget = true;
        isHit = true;

        // Reproducir sonido de acierto
        this.sound.play("sfx-sphere-hit", { volume: 0.15 });

        // ACIERTO
        feedbackText.setText("SUCCESS");
        feedbackText.setColor("#00ff00");
        this.cameras.main.shake(150, 0.005);

        // Incrementar contador de aciertos
        hitsRegistered++;

        // Mostrar feedback de acierto inmediatamente
        feedbackText.setAlpha(1);
        feedbackText.setScale(1);
        this.tweens.add({
          targets: feedbackText,
          alpha: 0,
          scale: 1.5,
          duration: 500,
        });

        // Verificar si ya completó los 3 intentos
        if (hitsRegistered >= 3) {
          // Completó los 3 intentos - detener todo
          if (currentTween) {
            currentTween.stop();
            currentTween = null;
          }

          const successHits = hitsRegistered - badHits;
          this.time.delayedCall(600, () => {
            endMinigame(successHits);
          });
          return; // Salir de la función sin modificar la zona objetivo
        }

        // Si no ha completado los 3 intentos, reducir zona y continuar
        // Reducir zona objetivo, border y aumentar velocidad
        targetZoneWidth *= 0.7; // 70% del tamaño anterior
        targetZoneBorderWidth *= 0.7; // Reducir también el border

        // Calcular nueva posición aleatoria en zona central (evitar esquinas)
        const centralMargin = barWidth * 0.25;
        const minTargetX = barX + centralMargin + targetZoneWidth / 2;
        const maxTargetX =
          barX + barWidth - centralMargin - targetZoneWidth / 2;
        targetZoneX = Phaser.Math.Between(minTargetX, maxTargetX);

        // Recrear la zona objetivo con el nuevo tamaño, border y posición (SIN esquinas redondeadas)
        targetZone.destroy();
        targetZone = this.add.graphics();
        targetZone.fillStyle(0x00ff00, 0.5);
        targetZone.lineStyle(targetZoneBorderWidth, 0x00ff00, 1);
        targetZone.fillRect(
          targetZoneX - targetZoneWidth / 2,
          centerY - (barHeight - 10) / 2,
          targetZoneWidth,
          barHeight - 10
        );
        targetZone.strokeRect(
          targetZoneX - targetZoneWidth / 2,
          centerY - (barHeight - 10) / 2,
          targetZoneWidth,
          barHeight - 10
        );
        targetZone.setDepth(2001);

        moveDuration *= 0.75; // 75% de la duración (más rápido)
      } else {
        // FALLO
        feedbackText.setText("MISS");
        feedbackText.setColor("#ff0000");
        badHits++;
        hitsRegistered++;
      }

      // Pausar la esfera momentáneamente
      if (currentTween) {
        currentTween.pause();
        this.time.delayedCall(200, () => {
          if (currentTween && isMinigameActive) {
            currentTween.resume();
          }
        });
      }

      // Mostrar feedback (solo para fallos, los aciertos ya se muestran arriba)
      if (!isHit) {
        feedbackText.setAlpha(1);
        feedbackText.setScale(1);

        this.tweens.add({
          targets: feedbackText,
          alpha: 0,
          scale: 1.5,
          duration: 500,
        });
      }

      // Verificar si completó los 3 intentos (solo para fallos, aciertos ya se verifican)
      if (!isHit && hitsRegistered >= 3) {
        // Completó las 3 veces - detener el movimiento
        if (currentTween) {
          currentTween.stop();
          currentTween = null;
        }
        const successHits = hitsRegistered - badHits;
        this.time.delayedCall(600, () => {
          endMinigame(successHits);
        });
      }
    };

    // Función para terminar el minijuego
    const endMinigame = (successHits: number) => {
      isMinigameActive = false;

      // Resetear el flag global
      this.isMinigameActive = false;

      // Detener el tween de movimiento
      if (currentTween) {
        currentTween.stop();
        currentTween = null;
      }

      // Limpiar listeners
      this.input.keyboard?.off("keydown-SPACE", handleInput);
      this.input.off("pointerdown", handleInput);

      // Limpiar elementos
      overlay.destroy();
      barBackground.destroy();
      targetZone.destroy();
      sphere.destroy();
      sphereGlow.destroy();
      feedbackText.destroy();

      // Ejecutar defensa con el número de aciertos
      this.executeDefense(successHits);
    };

    // Detectar input del jugador
    const handleInput = () => {
      checkHit();
    };

    // Variable para controlar si los inputs están habilitados
    let inputsEnabled = false;

    // Función para habilitar inputs
    const enableInputs = () => {
      if (!inputsEnabled) {
        inputsEnabled = true;
        this.input.keyboard?.on("keydown-SPACE", handleInput);
        this.input.on("pointerdown", handleInput);
      }
    };

    // Mostrar tutorial si es la primera vez
    if (!this.hasSeenShieldTutorial) {
      const focusZone = {
        x: targetZoneX - targetZoneWidth / 2,
        y: centerY - (barHeight - 10) / 2,
        width: targetZoneWidth,
        height: barHeight - 10,
      };
      this.showShieldTutorialOverlay(focusZone, () => {
        // Habilitar inputs después de cerrar el tutorial
        enableInputs();
      });
    } else {
      console.log("Shield tutorial ya fue visto, saltando...");
      // Si no hay tutorial, habilitar inputs con delay normal
      this.time.delayedCall(200, () => {
        enableInputs();
      });
    }

    // Iniciar movimiento
    moveSphereContinuously();
  }

  executeDefense(successHits: number = 3): void {
    this.recordSuccessfulHits(successHits);

    // Calcular escudo según aciertos:
    // 3 aciertos: +2 segmentos de escudo + 35 energía
    // 2 aciertos: +1 segmento de escudo + 25 energía
    // 1 acierto: -1 HP + 15 energía
    // 0 aciertos: -2 HP + 0 energía

    let shieldGain = 0;
    let damageToSelf = 0;
    let energyGain = 0;
    let chatMessage = "";

    if (successHits === 3) {
      shieldGain = 2;
      energyGain = 35;
      chatMessage = "🛡️ Perfect Shield!";
    } else if (successHits === 2) {
      shieldGain = 1;
      energyGain = 25;
      chatMessage = "";
    } else if (successHits === 1) {
      damageToSelf = 1;
      energyGain = 15;
      chatMessage = "";
    } else {
      damageToSelf = 2;
      energyGain = 0;
      chatMessage = "";
    }

    // Aplicar escudo o daño
    if (shieldGain > 0) {
      // Crear un sprite duplicado del pokémon para el efecto de glow
      const glowSprite = this.add.image(
        this.playerPokemon.x,
        this.playerPokemon.y,
        this.playerPokemon.texture.key
      );
      glowSprite.setScale(this.playerPokemon.scaleX, this.playerPokemon.scaleY);
      glowSprite.setOrigin(
        this.playerPokemon.originX,
        this.playerPokemon.originY
      );
      glowSprite.setTint(0x00bfff); // Azul brillante
      glowSprite.setAlpha(0.7);
      glowSprite.setBlendMode(Phaser.BlendModes.ADD); // Modo aditivo para efecto de glow

      // Crear una máscara que recorta el glow de abajo hacia arriba
      const maskShape = this.make.graphics({});
      maskShape.fillStyle(0xffffff);

      const pokemonBounds = this.playerPokemon.getBounds();
      const startY = pokemonBounds.y + pokemonBounds.height;

      maskShape.fillRect(
        pokemonBounds.x,
        startY,
        pokemonBounds.width,
        pokemonBounds.height
      );

      const mask = maskShape.createGeometryMask();
      glowSprite.setMask(mask);

      // Animar la máscara de abajo hacia arriba - más lento
      this.tweens.add({
        targets: maskShape,
        y: -pokemonBounds.height,
        duration: 900,
        ease: "Linear",
        onComplete: () => {
          // Parpadeo al completar
          this.tweens.add({
            targets: glowSprite,
            alpha: 0,
            duration: 100,
            yoyo: true,
            repeat: 2,
            onComplete: () => {
              glowSprite.destroy();
              maskShape.destroy();

              // Reproducir sonido de escudo
              this.sound.play("sfx-shield", { volume: 0.6 });

              // APLICAR ESCUDO DESPUÉS DE COMPLETAR LA ANIMACIÓN
              this.addPlayerShield(shieldGain);

              // Ganar energía de evolución
              if (energyGain > 0) {
                this.addEvolutionEnergy(energyGain);
              }

              // Mostrar mensaje en el chat si hay
              if (chatMessage) {
                this.updateBattleChat(chatMessage);
              }

              // Verificar victoria/derrota y cambiar turno
              this.time.delayedCall(200, () => {
                this.checkBattleEnd();
                if (this.battleStarted) {
                  this.switchTurn();
                }
              });
            },
          });
        },
      });

      // Efecto de brillo en el pokémon original
      this.tweens.add({
        targets: this.playerPokemon,
        alpha: 0.85,
        duration: 450,
        yoyo: true,
        onComplete: () => {
          this.playerPokemon.setAlpha(1);
        },
      });
    } else if (damageToSelf > 0) {
      // Daño a uno mismo por fallar
      this.damagePlayer(damageToSelf);

      // Ganar energía de evolución si tiene
      if (energyGain > 0) {
        this.addEvolutionEnergy(energyGain);
      }

      // Verificar victoria/derrota y cambiar turno
      this.time.delayedCall(500, () => {
        this.checkBattleEnd();
        if (this.battleStarted) {
          this.switchTurn();
        }
      });
    } else {
      // Sin escudo ni daño (esto no debería ocurrir con los nuevos valores)
      this.time.delayedCall(500, () => {
        this.checkBattleEnd();
        if (this.battleStarted) {
          this.switchTurn();
        }
      });
    }
  }

  showStealTutorialOverlay(callback: () => void): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro que bloquea interacciones
    const tutorialOverlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    tutorialOverlay.setDepth(3000);
    tutorialOverlay.setInteractive();

    // Texto del tutorial centrado
    const tutorialText = this.add.text(
      centerX,
      centerY - 320,
      "Tap when the sphere enters\nthe green zone (3 times)",
      {
        fontSize: "32px",
        color: "#ffffff",
        fontFamily: "Orbitron",
        fontStyle: "bold",
        align: "center",
        stroke: "#000000",
        strokeThickness: 6,
      }
    );
    tutorialText.setOrigin(0.5);
    tutorialText.setDepth(3001);

    // Interceptar el primer tap para cerrar el tutorial
    const handleFirstTap = () => {
      // Limpiar tutorial
      tutorialOverlay.destroy();
      tutorialText.destroy();

      // Marcar que ya vio el tutorial
      this.hasSeenStealTutorial = true;

      // Guardar en el estado del juego
      if (window.FarcadeSDK?.singlePlayer?.actions?.saveGameState) {
        window.FarcadeSDK.singlePlayer.actions.saveGameState({
          gameState: {
            hasSeenSmashTutorial: this.hasSeenSmashTutorial,
            hasSeenShieldTutorial: this.hasSeenShieldTutorial,
            hasSeenStealTutorial: true,
            hasSeenSpecialTutorial: this.hasSeenSpecialTutorial,
            hasSeenRivalAttackTutorial: this.hasSeenRivalAttackTutorial,
          },
        });
      }

      // Llamar al callback para que el tap también cuente en el minijuego
      callback();
    };

    // Escuchar el tap
    tutorialOverlay.once("pointerdown", handleFirstTap);
  }

  performDodge(): void {
    // Verificar que es el turno del jugador
    if (!this.isPlayerTurn) return;

    // Evitar abrir múltiples minijuegos
    if (this.isMinigameActive) return;

    // Marcar que se usó una habilidad
    this.hasUsedAbilityThisTurn = true;

    // Mostrar minijuego de Steal
    this.showStealMinigame();
  }

  showStealMinigame(): void {
    // Marcar que el minijuego está activo primero para prevenir múltiples llamadas
    this.isMinigameActive = true;

    console.log("Verificando tutorial de Steal:", {
      hasSeenStealTutorial: this.hasSeenStealTutorial,
      shouldShowTutorial: !this.hasSeenStealTutorial,
    });

    const shouldShowTutorial = !this.hasSeenStealTutorial;
    let tutorialTapHandler: (() => void) | null = null;

    // Iniciar el minijuego inmediatamente para que se vea detrás del overlay
    this.startStealMinigameLogic(
      shouldShowTutorial
        ? (tapHandler) => {
            tutorialTapHandler = tapHandler;
          }
        : undefined
    );

    if (shouldShowTutorial) {
      this.showStealTutorialOverlay(() => {
        tutorialTapHandler?.();
      });
    }
  }

  startStealMinigameLogic(onTapReady?: (tapHandler: () => void) => void): void {
    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro de fondo
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.7
    );
    overlay.setDepth(2000);
    overlay.setInteractive();

    // Variables del minijuego
    let isMinigameActive = true;
    let hasCompleted = false;
    let successfulTaps = 0; // Contador de taps acertados
    let totalAttempts = 0; // Contador total de intentos (acertados + fallidos)
    const totalTapsNeeded = 3; // Necesitamos 3 taps

    // Configuración de círculos
    const outerRadius = 140;
    const innerRadius = 100;
    const sphereOrbitRadius = 100;
    const sphereRadius = 12;

    // Zona verde más pequeña
    let greenZoneSize = 30; // Reducido de 45 a 30 grados para mayor dificultad
    let sphereSpeed = 3; // Velocidad más lenta
    let sphereDirection = 1; // 1 = sentido horario, -1 = antihorario

    // Función para generar una nueva zona verde en el lado opuesto
    const generateGreenZone = (previousAngle?: number) => {
      if (previousAngle === undefined) {
        return Phaser.Math.Between(0, 360);
      }
      // Colocar en el lado opuesto (180 grados + un margen aleatorio de ±30°)
      return (previousAngle + 180 + Phaser.Math.Between(-30, 30)) % 360;
    };

    let greenZoneAngle = generateGreenZone();

    // Círculo exterior grande - blanco
    const outerCircle = this.add.circle(
      centerX,
      centerY,
      outerRadius,
      0x000000,
      0
    );
    outerCircle.setStrokeStyle(8, 0xffffff, 1);
    outerCircle.setDepth(2001);

    // Círculo interior - más oscuro
    const innerCircle = this.add.circle(
      centerX,
      centerY,
      innerRadius,
      0x000000,
      0
    );
    innerCircle.setStrokeStyle(5, 0x444444, 1);
    innerCircle.setDepth(2001);

    // Zona verde (arco) - se redibujará cuando cambie
    const greenZone = this.add.graphics();
    greenZone.setDepth(2002);

    const drawGreenZone = () => {
      greenZone.clear();
      greenZone.lineStyle(8, 0x00ff00, 1);
      greenZone.beginPath();
      const greenZoneStart = Phaser.Math.DegToRad(
        greenZoneAngle - greenZoneSize / 2
      );
      const greenZoneEnd = Phaser.Math.DegToRad(
        greenZoneAngle + greenZoneSize / 2
      );
      greenZone.arc(
        centerX,
        centerY,
        outerRadius,
        greenZoneStart,
        greenZoneEnd,
        false
      );
      greenZone.strokePath();
    };

    drawGreenZone();

    // Flecha verde apuntando a la zona verde
    const arrow = this.add.graphics();
    arrow.setDepth(2003);

    const drawArrow = () => {
      arrow.clear();
      const arrowAngle = Phaser.Math.DegToRad(greenZoneAngle);
      const arrowDistance = outerRadius + 20;
      const arrowX = centerX + Math.cos(arrowAngle) * arrowDistance;
      const arrowY = centerY + Math.sin(arrowAngle) * arrowDistance;

      // Calcular puntos de la flecha apuntando hacia el círculo (hacia dentro)
      const arrowSize = 12;
      const angle1 = arrowAngle + Math.PI / 6;
      const angle2 = arrowAngle - Math.PI / 6;

      arrow.fillStyle(0x00ff00, 1);
      arrow.beginPath();
      arrow.moveTo(arrowX, arrowY); // Punta
      arrow.lineTo(
        arrowX + Math.cos(angle1) * arrowSize,
        arrowY + Math.sin(angle1) * arrowSize
      );
      arrow.lineTo(
        arrowX + Math.cos(angle2) * arrowSize,
        arrowY + Math.sin(angle2) * arrowSize
      );
      arrow.closePath();
      arrow.fillPath();
    };

    drawArrow();

    // Esfera que gira - empieza en el lado opuesto a la zona verde (+180°)
    let sphereAngle = (greenZoneAngle + 180) % 360;

    const sphere = this.add.circle(
      centerX + Math.cos(Phaser.Math.DegToRad(sphereAngle)) * sphereOrbitRadius,
      centerY + Math.sin(Phaser.Math.DegToRad(sphereAngle)) * sphereOrbitRadius,
      sphereRadius,
      0xffffff,
      1
    );
    sphere.setDepth(2004);
    sphere.setBlendMode(Phaser.BlendModes.ADD);

    // Glow de la esfera - cyan
    const sphereGlow = this.add.circle(sphere.x, sphere.y, 20, 0x00ffff, 0.5);
    sphereGlow.setDepth(2004);
    sphereGlow.setBlendMode(Phaser.BlendModes.ADD);

    // Partículas eléctricas
    const sparkParticles = this.add.particles(sphere.x, sphere.y, "pixel", {
      speed: { min: 40, max: 100 },
      angle: { min: 0, max: 360 },
      scale: { start: 1, end: 0 },
      lifespan: 400,
      frequency: 30,
      tint: [0x00ffff, 0x00ff00, 0xffffff],
      blendMode: "ADD",
      follow: sphere,
      quantity: 2,
    });
    sparkParticles.setDepth(2003);

    // Animación de pulso en la esfera
    this.tweens.add({
      targets: [sphere, sphereGlow],
      scale: { from: 1, to: 1.2 },
      alpha: { from: 1, to: 0.7 },
      duration: 300,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

    // Función para verificar si la esfera está en la zona verde
    const isSphereInGreenZone = (): boolean => {
      const normalizedAngle = ((sphereAngle % 360) + 360) % 360;
      const normalizedGreenAngle = ((greenZoneAngle % 360) + 360) % 360;

      let angleDiff = Math.abs(normalizedAngle - normalizedGreenAngle);
      if (angleDiff > 180) angleDiff = 360 - angleDiff;

      return angleDiff <= greenZoneSize / 2;
    };

    // Loop de actualización para mover la esfera
    const updateLoop = this.time.addEvent({
      delay: 16, // ~60fps
      callback: () => {
        if (!isMinigameActive || hasCompleted) {
          updateLoop.remove();
          return;
        }

        // Mover la esfera en la dirección actual
        sphereAngle = (sphereAngle + sphereSpeed * sphereDirection) % 360;
        if (sphereAngle < 0) sphereAngle += 360;

        const radians = Phaser.Math.DegToRad(sphereAngle);
        const newX = centerX + Math.cos(radians) * sphereOrbitRadius;
        const newY = centerY + Math.sin(radians) * sphereOrbitRadius;

        sphere.setPosition(newX, newY);
        sphereGlow.setPosition(newX, newY);
      },
      loop: true,
    });

    // Función para finalizar el minijuego
    const endMinigame = () => {
      if (!isMinigameActive || hasCompleted) return;
      isMinigameActive = false;
      hasCompleted = true;

      // Resetear flag global
      this.isMinigameActive = false;

      // Detener el loop
      updateLoop.remove();

      // Limpiar elementos después de un delay
      this.time.delayedCall(800, () => {
        overlay.destroy();
        outerCircle.destroy();
        innerCircle.destroy();
        greenZone.destroy();
        arrow.destroy();
        sphere.destroy();
        sphereGlow.destroy();
        sparkParticles.destroy();

        // Ejecutar resultado con número de taps acertados
        this.executeSteal(successfulTaps);
      });
    };

    const handleTap = () => {
      if (!isMinigameActive || hasCompleted || totalAttempts >= totalTapsNeeded)
        return;

      const inGreenZone = isSphereInGreenZone();

      if (inGreenZone) {
        // TAP ACERTADO
        successfulTaps++;
        totalAttempts++;

        // Sonido de acierto individual
        this.sound.play("sfx-sphere-hit", { volume: 0.1 });

        // Flash de feedback
        const flashText = this.add.text(centerX, centerY + 80, "SUCCESS!", {
          fontSize: "36px",
          color: "#00ff00",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
        });
        flashText.setOrigin(0.5);
        flashText.setDepth(2006);

        this.tweens.add({
          targets: flashText,
          scale: { from: 1.5, to: 1 },
          alpha: { from: 1, to: 0 },
          y: centerY + 50,
          duration: 400,
          ease: "Back.easeOut",
          onComplete: () => {
            flashText.destroy();
          },
        });

        // Verificar si completó los 3 intentos
        if (totalAttempts >= totalTapsNeeded) {
          endMinigame();
        } else {
          // Cambiar dirección de la esfera
          sphereDirection *= -1;

          // Aumentar velocidad según el número de intentos
          if (totalAttempts === 1) {
            sphereSpeed = 4.5; // Segundo intento más rápido
          } else if (totalAttempts === 2) {
            sphereSpeed = 6; // Tercer intento aún más rápido
          }

          // Nueva zona verde en el lado opuesto
          greenZoneAngle = generateGreenZone(greenZoneAngle);
          drawGreenZone();
          drawArrow();
        }
      } else {
        // TAP FUERA DE ZONA - también cuenta como intento
        totalAttempts++;

        // Flash de feedback MISS
        const missText = this.add.text(centerX, centerY + 80, "MISS!", {
          fontSize: "36px",
          color: "#ff0000",
          fontFamily: "Orbitron",
          fontStyle: "bold",
          stroke: "#000000",
          strokeThickness: 6,
        });
        missText.setOrigin(0.5);
        missText.setDepth(2006);

        this.tweens.add({
          targets: missText,
          scale: { from: 1.5, to: 1 },
          alpha: { from: 1, to: 0 },
          y: centerY + 50,
          duration: 400,
          ease: "Back.easeOut",
          onComplete: () => {
            missText.destroy();
          },
        });

        // Verificar si completó los 3 intentos
        if (totalAttempts >= totalTapsNeeded) {
          endMinigame();
        } else {
          // Cambiar dirección y continuar
          sphereDirection *= -1;

          // Aumentar velocidad según el número de intentos
          if (totalAttempts === 1) {
            sphereSpeed = 4.5;
          } else if (totalAttempts === 2) {
            sphereSpeed = 6;
          }

          // Nueva zona verde en el lado opuesto
          greenZoneAngle = generateGreenZone(greenZoneAngle);
          drawGreenZone();
          drawArrow();
        }
      }
    };

    if (onTapReady) {
      onTapReady(handleTap);
    }

    // Handler de click/tap
    overlay.on("pointerdown", handleTap);
  }

  executeSteal(successfulTaps: number): void {
    this.recordSuccessfulHits(successfulTaps);

    // Aplicar resultado según número de taps acertados
    if (successfulTaps === 3) {
      // 3 ACIERTOS: 2 segmentos de daño al rival + 2 segmentos de vida al jugador
      this.damageEnemy(2);

      // Curar 2 HP al jugador
      for (let i = 0; i < 2; i++) {
        if (this.playerHPSections < 10) {
          this.playerHPSections++;
        }
      }
      this.updatePlayerHPBar(
        this.playerHPBarX,
        this.playerHPBarY,
        this.playerHPBarWidth
      );

      // Efecto visual de robo
      const stealParticles = this.add.particles(
        this.enemyPokemon.x,
        this.enemyPokemon.y,
        "pixel",
        {
          speed: { min: 100, max: 200 },
          angle: { min: 0, max: 360 },
          scale: { start: 2, end: 0 },
          tint: [0xff0000, 0xff6600],
          lifespan: 600,
          quantity: 20,
          blendMode: "ADD",
        }
      );
      stealParticles.setDepth(100);

      this.time.delayedCall(600, () => {
        stealParticles.destroy();
      });

      this.addEvolutionEnergy(40);
      this.updateBattleChat("💀 Perfect Steal! 3/3 hits!");
    } else if (successfulTaps === 2) {
      // 2 ACIERTOS: 2 segmentos de daño al rival + 2 segmentos de daño al jugador
      this.damageEnemy(2);
      this.damagePlayer(2);

      this.addEvolutionEnergy(30);
      this.updateBattleChat("⚡ Partial Steal: 2/3 hits");
    } else if (successfulTaps === 1) {
      // 1 ACIERTO: 0 segmentos de daño al rival + 1 segmento de daño al jugador
      this.damagePlayer(1);

      this.addEvolutionEnergy(15);
      this.updateBattleChat("⚠️ Weak Steal: 1/3 hits");
    } else {
      // 0 ACIERTOS: 3 segmentos de daño al jugador
      this.damagePlayer(3);

      this.updateBattleChat("❌ Steal failed! 0/3 hits");
    }

    // Verificar victoria/derrota y cambiar turno
    this.time.delayedCall(800, () => {
      this.checkBattleEnd();
      if (this.battleStarted) {
        this.switchTurn();
      }
    });
  }

  performSpecial(): void {
    // Verificar que es el turno del jugador
    if (!this.isPlayerTurn) return;

    // Evitar abrir múltiples minijuegos
    if (this.isMinigameActive) return;

    // Marcar que se usó una habilidad
    this.hasUsedAbilityThisTurn = true;

    // Mostrar minijuego de ataque con 5 círculos
    this.showAttackMinigame(5);
  }

  // MINIJUEGO DE CÍRCULOS CRECIENTES - Reservado para uso futuro
  showGrowingCirclesMinigame(): void {
    // Marcar que el minijuego está activo
    this.isMinigameActive = true;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro de fondo
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.5
    );
    overlay.setDepth(2000);

    // Variables del minijuego
    let currentRound = 0;
    const totalRounds = 5; // 5 círculos para el especial
    let goodHits = 0;
    let badHits = 0;
    let isMinigameActive = true;

    // Zona segura (evitar bordes y zona de UI inferior del trainer - más restrictiva)
    const minX = 120;
    const maxX = this.cameras.main.width - 120;
    const minY = 100;
    const maxY = this.cameras.main.height - 350; // Evitar zona de UI del trainer

    let gameContainer: Phaser.GameObjects.Container | null = null;
    let fullScreenHitArea: Phaser.GameObjects.Rectangle | null = null;

    // Tamaños aleatorios para cada círculo (reducidos)
    const circleRadii = [45, 70, 55, 65, 60]; // Más pequeños que antes

    // Duración base que irá disminuyendo (más rápido - empezamos en 1200ms)
    let baseDuration = 1200;

    // Función para crear una ronda
    const createRound = () => {
      if (currentRound >= totalRounds) {
        // Terminar con el número de aciertos
        endMinigame(goodHits);
        return;
      } // Posición aleatoria
      const randomX = Phaser.Math.Between(minX, maxX);
      const randomY = Phaser.Math.Between(minY, maxY);

      // Limpiar contenedor anterior
      if (gameContainer) {
        gameContainer.destroy();
      }

      // Crear nuevo contenedor
      gameContainer = this.add.container(randomX, randomY);
      gameContainer.setDepth(2001);

      const targetRadius = circleRadii[currentRound]; // Tamaño diferente para cada ronda

      // Círculo objetivo (blanco, estático)
      const targetCircle = this.add.circle(0, 0, targetRadius, 0x000000, 0);
      targetCircle.setStrokeStyle(6, 0xffffff, 1);

      // Círculo creciente (verde, empieza con el mismo radio pero muy pequeño en escala)
      const growingCircle = this.add.circle(0, 0, targetRadius, 0x000000, 0);
      growingCircle.setStrokeStyle(5, 0x00ff00, 1);
      growingCircle.setScale(0.01); // Empieza muy pequeño

      gameContainer.add([targetCircle, growingCircle]);

      let canClick = true;
      let animationComplete = false;

      // Calcular duración para esta ronda (más rápido en cada ronda)
      const currentDuration = baseDuration - currentRound * 100; // Disminuye 100ms por ronda

      // Animación: crecer desde casi 0 hasta un poco más allá del objetivo
      const growTween = this.tweens.add({
        targets: growingCircle,
        scale: 1.4, // Crece hasta 1.4x el tamaño (un poco más allá)
        duration: currentDuration,
        ease: "Linear",
        onComplete: () => {
          animationComplete = true;
          if (canClick) {
            // No tapeó - MISS
            registerMiss();
          }
        },
      });

      // Limpiar hit area anterior si existe
      if (fullScreenHitArea) {
        fullScreenHitArea.destroy();
      }

      // Hacer toda la pantalla interactiva (no solo el círculo)
      fullScreenHitArea = this.add.rectangle(
        centerX,
        centerY,
        this.cameras.main.width,
        this.cameras.main.height,
        0x000000,
        0
      );
      fullScreenHitArea.setInteractive();
      fullScreenHitArea.setDepth(2000);

      fullScreenHitArea.on("pointerdown", () => {
        if (!canClick || !isMinigameActive || animationComplete) return;

        canClick = false;

        // Detener el crecimiento del círculo inmediatamente
        growTween.stop();

        // Obtener la escala actual del círculo creciente
        const currentScale = growingCircle.scaleX;

        // Calcular diferencia con la escala objetivo (1.0 = coincide perfectamente)
        const diff = Math.abs(currentScale - 1.0);

        console.log(
          "Click - CurrentScale:",
          currentScale.toFixed(2),
          "Target: 1.0",
          "Diff:",
          diff.toFixed(2)
        );

        // Margen de error intermedio: 0.075 en escala (antes 0.1, luego 0.05, ahora 0.075)
        if (diff <= 0.075) {
          // PERFECT!
          goodHits++;
          currentRound++;

          // Animación de glow en el círculo
          if (gameContainer) {
            const glowCircle = this.add.circle(
              0,
              0,
              targetRadius,
              0x00ff00,
              0.4
            );
            glowCircle.setStrokeStyle(8, 0x00ff00, 0.8);
            glowCircle.setBlendMode(Phaser.BlendModes.ADD);
            gameContainer.add(glowCircle);

            this.tweens.add({
              targets: glowCircle,
              scaleX: 1.5,
              scaleY: 1.5,
              alpha: 0,
              duration: 400,
              ease: "Cubic.easeOut",
              onComplete: () => {
                glowCircle.destroy();
              },
            });
          }

          // Partículas de explosión
          const particles = this.add.particles(randomX, randomY, "pixel", {
            speed: { min: 80, max: 150 },
            angle: { min: 0, max: 360 },
            scale: { start: 1, end: 0 },
            lifespan: 500,
            quantity: 12,
            tint: 0x00ff00,
            blendMode: "ADD",
          });
          particles.setDepth(2003);

          this.time.delayedCall(500, () => {
            particles.destroy();
          });

          // Cambiar PERFECT por símbolo de acierto
          const feedbackText = this.add.text(
            randomX,
            randomY - 100,
            "SUCCESS",
            {
              fontSize: "42px",
              color: "#00ff00",
              stroke: "#000000",
              strokeThickness: 6,
              fontStyle: "bold",
              fontFamily: "Orbitron",
            }
          );
          feedbackText.setOrigin(0.5);
          feedbackText.setDepth(2002);

          this.tweens.add({
            targets: feedbackText,
            y: randomY - 140,
            alpha: 0,
            duration: 600,
            onComplete: () => {
              feedbackText.destroy();
            },
          });

          this.cameras.main.shake(150, 0.005);

          // Siguiente ronda
          this.time.delayedCall(400, () => {
            if (gameContainer) {
              gameContainer.destroy();
              gameContainer = null;
            }
            createRound();
          });
        } else {
          // MISS
          registerMiss();
        }
      });
    };

    // Función para registrar un miss
    const registerMiss = () => {
      badHits++;
      currentRound++;

      const feedbackText = this.add.text(
        gameContainer ? gameContainer.x : centerX,
        gameContainer ? gameContainer.y - 100 : centerY - 100,
        "MISS",
        {
          fontSize: "42px",
          color: "#ff0000",
          stroke: "#000000",
          strokeThickness: 6,
          fontStyle: "bold",
          fontFamily: "Orbitron",
        }
      );
      feedbackText.setOrigin(0.5);
      feedbackText.setDepth(2002);

      this.tweens.add({
        targets: feedbackText,
        y: feedbackText.y - 40,
        alpha: 0,
        duration: 600,
        onComplete: () => {
          feedbackText.destroy();
        },
      });

      this.cameras.main.shake(100, 0.003);

      // Siguiente ronda
      this.time.delayedCall(400, () => {
        if (gameContainer) {
          gameContainer.destroy();
          gameContainer = null;
        }
        createRound();
      });
    };

    // Función para terminar el minijuego
    const endMinigame = (successHits: number) => {
      isMinigameActive = false;
      this.isMinigameActive = false;

      // Limpiar elementos
      if (gameContainer) {
        gameContainer.destroy();
      }
      if (fullScreenHitArea) {
        fullScreenHitArea.destroy();
      }
      overlay.destroy();

      // Ejecutar ataque especial con el número de aciertos
      this.executeSpecialAttack(successHits);
    };

    // Iniciar primera ronda
    createRound();
  }

  executeSpecialAttack(successHits: number = 5): void {
    // Calcular daño según aciertos:
    // 5 aciertos: -4 HP al enemigo
    // 4 aciertos: -3 HP al enemigo
    // 3 aciertos: -2 HP al enemigo
    // 2 aciertos: -1 HP a uno mismo
    // 1 acierto: -2 HP a uno mismo
    // 0 aciertos: -3 HP a uno mismo

    let damageToEnemy = 0;
    let damageToSelf = 0;

    if (successHits === 5) {
      damageToEnemy = 4;
    } else if (successHits === 4) {
      damageToEnemy = 3;
    } else if (successHits === 3) {
      damageToEnemy = 2;
    } else if (successHits === 2) {
      damageToSelf = 1;
    } else if (successHits === 1) {
      damageToSelf = 2;
    } else {
      damageToSelf = 3;
    }

    const pokemonBounds = this.playerPokemon.getBounds();
    // Color desde TeamsData
    const particleColor = parseInt(
      this.playerTeam.trainer.monster.color.replace("#", ""),
      16
    );
    const originalScale = this.playerPokemon.scaleX;

    // Duración total de la sobrecarga - REDUCIDA
    const chargeDuration = 1200; // 1.2 segundos (antes 2 segundos)
    const particleInterval = 80; // Nueva partícula cada 80ms
    const totalParticles = Math.floor(chargeDuration / particleInterval);

    // Animación de vibración del pokémon (sobrecarga)
    this.tweens.add({
      targets: this.playerPokemon,
      scaleX: originalScale * 1.08,
      scaleY: originalScale * 1.08,
      duration: 150,
      yoyo: true,
      repeat: Math.floor(chargeDuration / 300), // Repetir durante toda la sobrecarga
    });

    // Brillo pulsante del pokémon
    this.tweens.add({
      targets: this.playerPokemon,
      alpha: 0.9,
      duration: 200,
      yoyo: true,
      repeat: Math.floor(chargeDuration / 400),
      onComplete: () => {
        this.playerPokemon.setAlpha(1);
      },
    });

    // Generar partículas de energía desde posiciones aleatorias
    for (let i = 0; i < totalParticles; i++) {
      this.time.delayedCall(i * particleInterval, () => {
        // Posición aleatoria alrededor del pokémon (360 grados, distancia variable)
        const randomAngle = Math.random() * Math.PI * 2;
        const randomDistance = 80 + Math.random() * 80; // 80-160px de distancia

        const startX =
          pokemonBounds.centerX + Math.cos(randomAngle) * randomDistance;
        const startY =
          pokemonBounds.centerY + Math.sin(randomAngle) * randomDistance;

        // Crear partícula de energía
        const particle = this.add.graphics();
        particle.fillStyle(particleColor, 1);
        particle.fillCircle(0, 0, 6 + Math.random() * 8); // Tamaño 6-14px
        particle.setBlendMode(Phaser.BlendModes.ADD);
        particle.setPosition(startX, startY);

        // Efecto de brillo en la partícula
        this.tweens.add({
          targets: particle,
          scale: 1.4,
          duration: 150,
          yoyo: true,
          repeat: -1,
        });

        // Movimiento directo hacia el pokémon con velocidad aleatoria
        const travelDuration = 400 + Math.random() * 300; // 400-700ms

        this.tweens.add({
          targets: particle,
          x: pokemonBounds.centerX,
          y: pokemonBounds.centerY,
          alpha: 0,
          duration: travelDuration,
          ease: "Power2",
          onComplete: () => {
            particle.destroy();
          },
        });
      });
    }

    // Lanzar el ataque especial después de la carga
    this.time.delayedCall(chargeDuration, () => {
      this.launchSpecialAttack(damageToEnemy, damageToSelf);
    });
  }

  launchSpecialAttack(
    damageToEnemy: number = 0,
    damageToSelf: number = 0
  ): void {
    const enemyBounds = this.enemyPokemon.getBounds();

    if (damageToEnemy > 0) {
      // Crear animación del spritesheet si no existe
      if (!this.anims.exists("special-attack-anim")) {
        this.anims.create({
          key: "special-attack-anim",
          frames: this.anims.generateFrameNumbers("specialAttack", {
            start: 0,
            end: 14, // 15 frames (0-14)
          }),
          frameRate: 20, // 20 frames por segundo (más fluido)
          repeat: 1, // Se reproduce 2 veces (original + 1 repetición)
        });
      }

      // Obtener el frameHeight del sprite especial actual
      const specialAbilityInfo =
        this.playerTeam.trainer.monster.sprites.specialAbility;
      const extraOffset = specialAbilityInfo.frameHeight > 128 ? 50 : 0; // Offset adicional para sprites más altos

      // Crear el sprite de la habilidad especial encima del enemigo
      const specialSprite = this.add.sprite(
        enemyBounds.centerX,
        enemyBounds.centerY - 100 - extraOffset, // Empieza más arriba para sprites altos
        "specialAttack"
      );
      specialSprite.setScale(2.5); // Tamaño aumentado
      specialSprite.setAlpha(0);

      // Aparecer y caer sobre el enemigo
      this.tweens.add({
        targets: specialSprite,
        alpha: 1,
        y: enemyBounds.centerY - extraOffset, // Posición final ajustada
        duration: 300,
        ease: "Power2",
        onComplete: () => {
          // Reproducir animación del ataque
          specialSprite.play("special-attack-anim");

          // Destruir el sprite después de la animación
          specialSprite.once("animationcomplete", () => {
            this.tweens.add({
              targets: specialSprite,
              alpha: 0,
              duration: 200,
              onComplete: () => {
                specialSprite.destroy();

                // APLICAR DAÑO DESPUÉS DE COMPLETAR LA ANIMACIÓN
                // Reducir HP del enemigo según el daño usando la función que respeta el escudo
                // skipFlash = true para evitar el parpadeo durante el special
                this.damageEnemy(damageToEnemy, true);

                // Ganar energía de evolución
                this.addEvolutionEnergy(25);

                // Verificar victoria/derrota y cambiar turno
                this.time.delayedCall(500, () => {
                  this.checkBattleEnd();
                  if (this.battleStarted) {
                    this.switchTurn();
                  }
                });
              },
            });
          });
        },
      });
    } else if (damageToSelf > 0) {
      // Daño a uno mismo
      this.damagePlayer(damageToSelf);

      // Verificar victoria/derrota y cambiar turno
      this.time.delayedCall(500, () => {
        this.checkBattleEnd();
        if (this.battleStarted) {
          this.switchTurn();
        }
      });
    }
  }

  showRivalAttackMinigame(totalCircles: number = 3): void {
    // Marcar que el minijuego está activo
    this.isMinigameActive = true;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro de fondo
    const overlay = this.add.rectangle(
      centerX,
      centerY,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.5
    );
    overlay.setDepth(2000);

    // Variables del minijuego
    let currentRound = 0;
    let goodHits = 0;
    let badHits = 0;
    let isMinigameActive = true;

    // Zona segura (evitar bordes y zona de UI inferior del trainer)
    const minX = 120;
    const maxX = this.cameras.main.width - 120;
    const minY = 100;
    const maxY = this.cameras.main.height - 350;

    let gameContainer: Phaser.GameObjects.Container | null = null;

    // Tamaños aleatorios para cada círculo
    const circleRadii = [45, 70, 55, 65, 60];

    // Duración base que irá disminuyendo
    let baseDuration = 1200;

    const needsTutorial = !this.hasSeenRivalAttackTutorial;
    let tutorialOverlayShown = false;

    const startRound = () => {
      if (!isMinigameActive || currentRound >= totalCircles) return;

      // Limpiar container anterior
      if (gameContainer) {
        gameContainer.destroy(true);
        gameContainer = null;
      }

      // Reducir duración progresivamente
      const currentDuration = baseDuration * Math.pow(0.88, currentRound);

      // Posición aleatoria SEGURA
      const targetRadius = circleRadii[currentRound % circleRadii.length];
      const randomX = Phaser.Math.Between(
        minX + targetRadius,
        maxX - targetRadius
      );
      const randomY = Phaser.Math.Between(
        minY + targetRadius,
        maxY - targetRadius
      );

      // Crear contenedor para el círculo
      gameContainer = this.add.container(randomX, randomY);
      gameContainer.setDepth(2001);

      // Círculo objetivo (blanco, estático)
      const targetCircle = this.add.circle(0, 0, targetRadius, 0x000000, 0);
      targetCircle.setStrokeStyle(6, 0xffffff, 1);
      gameContainer.add(targetCircle);

      // Círculo creciente (verde, empieza muy pequeño)
      const growingCircle = this.add.circle(0, 0, targetRadius, 0x000000, 0);
      growingCircle.setStrokeStyle(5, 0x00ff00, 1);
      growingCircle.setScale(0.01); // Empezar con escala casi 0
      gameContainer.add(growingCircle);

      // Hacer el container interactivo con el área del círculo
      gameContainer.setInteractive(
        new Phaser.Geom.Circle(0, 0, targetRadius),
        Phaser.Geom.Circle.Contains
      );

      // Variable para rastrear si se hizo clic
      let clickHandled = false;

      const registerSuccess = () => {
        if (!isMinigameActive || clickHandled) return;

        clickHandled = true;
        goodHits++;
        currentRound++;

        // Reproducir sonido de acierto
        this.sound.play("sfx-sphere-hit", { volume: 0.15 });

        // Animación de glow en el círculo
        if (gameContainer) {
          const glowCircle = this.add.circle(0, 0, targetRadius, 0x00ff00, 0.4);
          glowCircle.setBlendMode(Phaser.BlendModes.ADD);
          gameContainer.add(glowCircle);

          this.tweens.add({
            targets: glowCircle,
            scale: { from: 1, to: 1.5 },
            alpha: 0,
            duration: 300,
            onComplete: () => {
              glowCircle.destroy();
            },
          });
        }

        showFeedback("SUCCESS", "#00ff00", randomX, randomY);
        this.cameras.main.shake(150, 0.005);

        this.time.delayedCall(300, startRound);
      };

      const registerMiss = () => {
        if (!isMinigameActive || clickHandled) return;

        clickHandled = true;
        badHits++;
        currentRound++;
        showFeedback("MISS", "#ff0000", randomX, randomY);
        this.time.delayedCall(300, startRound);
      };

      // Animación de crecimiento usando scale (crece hasta 1.4x para pasar el objetivo)
      const growTween = this.tweens.add({
        targets: growingCircle,
        scale: 1.4, // Crece hasta 1.4x el tamaño (un poco más allá del objetivo)
        duration: currentDuration,
        ease: "Linear",
        onComplete: () => {
          // Si llega al final sin clic, es MISS
          if (isMinigameActive && !clickHandled) {
            registerMiss();
          }
        },
      });

      // Evento de click en el container (solo dentro del área circular)
      gameContainer.once("pointerdown", () => {
        if (!isMinigameActive || clickHandled) return;

        // Calcular escala actual del círculo creciente
        const currentScale = growingCircle.scale;
        const diff = Math.abs(currentScale - 1);

        console.log(
          "Click - CurrentScale:",
          currentScale.toFixed(2),
          "Target: 1.0",
          "Diff:",
          diff.toFixed(2)
        );

        // Detener el tween inmediatamente
        growTween.stop();

        // Margen de error: 0.075 en escala (equivalente a ~15px dependiendo del radio)
        if (diff <= 0.075) {
          registerSuccess();
        } else {
          registerMiss();
        }
      });

      if (!tutorialOverlayShown && needsTutorial && currentRound === 0) {
        tutorialOverlayShown = true;

        // Pausar el crecimiento y dejar el círculo en el tamaño perfecto
        growTween.pause();
        growingCircle.setScale(1);

        this.showRivalAttackTutorialOverlay(() => {
          growTween.stop();
          registerSuccess();
        });
      }
    };

    const showFeedback = (
      text: string,
      color: string,
      x: number,
      y: number
    ) => {
      const feedbackText = this.add.text(x, y, text, {
        fontSize: "48px",
        color: color,
        fontFamily: "Orbitron",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
      });
      feedbackText.setOrigin(0.5, 0.5);
      feedbackText.setDepth(2003);

      this.tweens.add({
        targets: feedbackText,
        alpha: 0,
        scale: 1.5,
        y: y - 50,
        duration: 500,
        onComplete: () => {
          feedbackText.destroy();
        },
      });

      // Si completó las rondas, terminar minijuego
      if (currentRound >= totalCircles) {
        isMinigameActive = false;
        this.time.delayedCall(600, () => {
          endMinigame();
        });
      }
    };

    const endMinigame = () => {
      // Limpiar
      if (gameContainer) {
        gameContainer.destroy(true);
        gameContainer = null;
      }
      overlay.destroy();

      // Desmarcar minijuego activo
      this.isMinigameActive = false;

      // Calcular daño según aciertos y totalCircles
      let damageToPlayer = 0;
      let damageToEnemy = 0;
      let energyGain = 0;
      let chatMessage = "";

      if (totalCircles === 3) {
        // Ataque normal
        if (goodHits === 3) {
          damageToPlayer = 1;
          damageToEnemy = 1;
          energyGain = 35;
          chatMessage = "🛡️ Perfect Defense!";
        } else if (goodHits === 2) {
          damageToPlayer = 1;
          energyGain = 25;
          chatMessage = "";
        } else if (goodHits === 1) {
          damageToPlayer = 2;
          energyGain = 15;
          chatMessage = "";
        } else {
          damageToPlayer = 3;
          energyGain = 0;
          chatMessage = "";
        }
      } else if (totalCircles === 5) {
        // Ataque especial
        if (goodHits === 5) {
          damageToPlayer = 1;
          damageToEnemy = 2;
          energyGain = 35;
          chatMessage = "🛡️ Perfect Defense!";
        } else if (goodHits === 4) {
          damageToPlayer = 2;
          damageToEnemy = 1;
          energyGain = 30;
          chatMessage = "";
        } else if (goodHits === 3) {
          damageToPlayer = 2;
          energyGain = 25;
          chatMessage = "";
        } else if (goodHits === 2) {
          damageToPlayer = 3;
          energyGain = 20;
          chatMessage = "";
        } else if (goodHits === 1) {
          damageToPlayer = 4;
          energyGain = 15;
          chatMessage = "";
        } else {
          damageToPlayer = 5;
          energyGain = 0;
          chatMessage = "";
        }
      }

      // Si es ataque especial (5 círculos), usar la animación del sprite especial
      if (totalCircles === 5) {
        this.launchRivalSpecialAttackWithDamage(
          damageToPlayer,
          damageToEnemy,
          energyGain,
          chatMessage
        );
        return;
      }

      // Para ataque normal (3 círculos), usar la animación simple del enemigo
      const originalX = this.enemyPokemon.x;
      const originalY = this.enemyPokemon.y;

      // Reproducir sonido del ataque normal
      this.sound.play("sfx-attack", { volume: 0.6 });

      // Secuencia de animación: mover hacia adelante, shake, y volver
      this.tweens.add({
        targets: this.enemyPokemon,
        x: originalX - 40,
        y: originalY + 20,
        duration: 200,
        ease: "Power2",
        yoyo: false,
        onComplete: () => {
          // Shake rápido
          this.tweens.add({
            targets: this.enemyPokemon,
            x: originalX - 40 + 5,
            duration: 50,
            yoyo: true,
            repeat: 3,
            onComplete: () => {
              // Volver a la posición original
              this.tweens.add({
                targets: this.enemyPokemon,
                x: originalX,
                y: originalY,
                duration: 200,
                ease: "Power2",
                onComplete: () => {
                  // APLICAR DAÑO DESPUÉS DE COMPLETAR LA ANIMACIÓN
                  if (damageToPlayer > 0) {
                    this.damagePlayer(damageToPlayer);
                  }

                  // Si el jugador bloqueó todo, contraatacar al rival
                  if (damageToEnemy > 0) {
                    this.damageEnemy(damageToEnemy);
                  }

                  // Ganar energía de evolución
                  if (energyGain > 0) {
                    this.addEvolutionEnergy(energyGain);
                  }

                  // Mostrar mensaje en el chat si hay
                  if (chatMessage) {
                    this.updateBattleChat(chatMessage);
                  }

                  // Cambiar turno al jugador
                  this.time.delayedCall(500, () => {
                    this.switchTurn();
                  });
                },
              });
            },
          });
        },
      });
    };

    // Iniciar primera ronda (el tutorial se gestiona dentro de startRound)
    startRound();
  }

  // Métodos del sistema de evolución
  addEvolutionEnergy(amount: number): void {
    if (this.isPlayerEvolved) return; // Ya evolucionado, no ganar más energía

    this.evolutionEnergy = Math.min(100, this.evolutionEnergy + amount);
    this.updateEvolutionBar();

    // Mostrar overlay cuando se llene la barra (verificar también que no esté ya evolucionado)
    if (this.evolutionEnergy >= 100 && !this.isPlayerEvolved) {
      // Asegurarse de que el overlay se muestre incluso si ya existe una referencia
      if (!this.evolveOverlay || !this.evolveOverlay.active) {
        this.showEvolveOverlay();
      }
    }
  }

  updateEvolutionBar(): void {
    const progress = this.evolutionEnergy / 100;
    const fillHeight = this.evolutionInnerHeight * progress;

    if (progress < 1) {
      // Mientras se llena (0-99%): barra verde sólida
      this.evolutionFillSprite.setVisible(false);

      this.evolutionFillGraphics.clear();
      this.evolutionFillGraphics.fillStyle(0x10b981, 1); // Verde
      this.evolutionFillGraphics.fillRoundedRect(
        this.evolutionBarX - this.evolutionInnerWidth / 2,
        this.evolutionBarY -
          this.evolutionInnerHeight / 2 +
          (this.evolutionInnerHeight - fillHeight),
        this.evolutionInnerWidth,
        fillHeight,
        this.evolutionBarBorderRadius - 2
      );
    } else {
      // Al completar (100%): mostrar gradiente arcoíris animado
      this.evolutionFillGraphics.clear();
      this.evolutionFillSprite.setVisible(true);

      // VERIFICACIÓN ADICIONAL: Asegurar que el overlay se muestre
      // si la barra está al 100% y el jugador no ha evolucionado
      if (
        !this.isPlayerEvolved &&
        (!this.evolveOverlay || !this.evolveOverlay.active)
      ) {
        this.showEvolveOverlay();
      }
    }
  }

  showEvolveOverlay(): void {
    // SEGURIDAD: Si ya existe un overlay activo, no crear otro
    if (this.evolveOverlay && this.evolveOverlay.active) {
      return;
    }

    // Si existe pero está inactivo, limpiarlo primero
    if (this.evolveOverlay) {
      this.hideEvolveOverlay();
    }

    // Obtener dimensiones del trainer
    const trainerBounds = this.trainerImage.getBounds();

    // Crear contenedor para todo el overlay
    const overlayContainer = this.add.container(0, 0);
    overlayContainer.setDepth(1001);

    // Crear máscara usando la imagen del trainer (su silueta real)
    const maskImage = this.add.image(
      this.trainerImage.x,
      this.trainerImage.y,
      this.trainerImage.texture.key
    );
    maskImage.setOrigin(this.trainerImage.originX, this.trainerImage.originY);
    maskImage.setScale(this.trainerImage.scaleX, this.trainerImage.scaleY);
    const mask = maskImage.createBitmapMask();

    // Crear glow que se mueve de abajo hacia arriba repetidamente
    const glowHeight = 100;
    const glowWidth = trainerBounds.width + 40; // Más ancho para cubrir bien

    // Crear gradiente vertical para el glow usando canvas
    const glowCanvas = document.createElement("canvas");
    glowCanvas.width = glowWidth;
    glowCanvas.height = glowHeight;
    const ctx = glowCanvas.getContext("2d")!;

    // Crear gradiente vertical para el glow usando canvas
    const gradient = ctx.createLinearGradient(0, 0, 0, glowHeight);
    gradient.addColorStop(0, "rgba(3, 234, 233, 0)"); // Transparente arriba (cyan)
    gradient.addColorStop(0.5, "rgba(3, 234, 233, 0.5)"); // Cyan brillante en el centro
    gradient.addColorStop(1, "rgba(3, 234, 233, 0)"); // Transparente abajo

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, glowWidth, glowHeight);

    // Crear textura desde el canvas
    if (this.textures.exists("evolveGlowTexture")) {
      this.textures.remove("evolveGlowTexture");
    }

    const glowTexture = this.textures.createCanvas(
      "evolveGlowTexture",
      glowWidth,
      glowHeight
    );
    glowTexture!.context.drawImage(glowCanvas, 0, 0);
    glowTexture!.refresh();

    // Crear sprite del glow
    const glow = this.add.image(
      trainerBounds.centerX,
      trainerBounds.bottom + glowHeight / 2, // Empezar desde abajo
      "evolveGlowTexture"
    );
    glow.setBlendMode(Phaser.BlendModes.ADD);
    glow.setMask(mask); // Máscara basada en la silueta del trainer
    overlayContainer.add(glow);

    // Animar el glow de abajo hacia arriba repetidamente
    this.tweens.add({
      targets: glow,
      y: trainerBounds.top - glowHeight / 2, // Hasta arriba
      duration: 1800,
      repeat: -1,
      ease: "Linear",
      onRepeat: () => {
        // Reiniciar posición al terminar cada ciclo
        glow.y = trainerBounds.bottom + glowHeight / 2;
      },
    });

    // Posición del botón en el centro del trainer
    const buttonX = trainerBounds.centerX;
    const buttonY = trainerBounds.centerY;

    // Rectángulo oscuro detrás del botón para mejor visibilidad
    const buttonBackdrop = this.add.graphics();
    buttonBackdrop.fillStyle(0x203a6a, 0.85); // Mismo fondo que el score
    buttonBackdrop.lineStyle(3, 0x03eae9, 1); // Mismo borde cyan que el score
    buttonBackdrop.fillRoundedRect(
      buttonX - 50, // Un poco más grande que el botón
      buttonY - 32,
      100,
      64,
      12
    );
    buttonBackdrop.strokeRoundedRect(buttonX - 50, buttonY - 32, 100, 64, 12);
    buttonBackdrop.setDepth(1001.5); // Entre el glow (1001) y el botón (1002)
    overlayContainer.add(buttonBackdrop);

    // Botón simple con fondo muy transparente y bordes redondeados (más grande)
    const buttonWidth = 90;
    const buttonHeight = 55;
    const buttonBg = this.add.graphics();
    buttonBg.fillStyle(0x203a6a, 0.3); // Fondo azul oscuro semi-transparente
    buttonBg.lineStyle(2, 0x03eae9, 1); // Borde cyan
    buttonBg.fillRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10 // Radio de las esquinas redondeadas
    );
    buttonBg.strokeRoundedRect(
      buttonX - buttonWidth / 2,
      buttonY - buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      10
    );
    buttonBg.setDepth(1002);
    buttonBg.setInteractive(
      new Phaser.Geom.Rectangle(
        buttonX - buttonWidth / 2,
        buttonY - buttonHeight / 2,
        buttonWidth,
        buttonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );
    buttonBg.input!.cursor = "pointer";
    overlayContainer.add(buttonBg);

    // Texto "UP" sobre el botón
    const evolveText = this.add.text(buttonX, buttonY, "UP", {
      fontSize: "28px",
      color: "#03eae9", // Cyan brillante (mismo que el borde del score)
      fontFamily: "Orbitron",
      fontStyle: "bold",
    });
    evolveText.setOrigin(0.5, 0.5);
    evolveText.setDepth(1003);
    overlayContainer.add(evolveText);

    // Guardar referencia
    this.evolveOverlay = overlayContainer;

    // Click para evolucionar (solo si es el turno del jugador Y no ha usado habilidad)
    buttonBg.on("pointerdown", () => {
      if (!this.isPlayerTurn) {
        // Mostrar feedback de que no es tu turno
        const feedbackText = this.add.text(
          buttonX,
          buttonY - 60,
          "Not your turn!",
          {
            fontSize: "24px",
            color: "#ff0000",
            fontFamily: "Orbitron",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
          }
        );
        feedbackText.setOrigin(0.5, 0.5);
        feedbackText.setDepth(1002);

        // Animar y eliminar el texto
        this.tweens.add({
          targets: feedbackText,
          alpha: 0,
          y: feedbackText.y - 30,
          duration: 1000,
          onComplete: () => {
            feedbackText.destroy();
          },
        });
        return;
      }

      if (this.hasUsedAbilityThisTurn) {
        // Mostrar feedback de que ya usó una habilidad
        const feedbackText = this.add.text(
          buttonX,
          buttonY - 60,
          "Already used ability!",
          {
            fontSize: "24px",
            color: "#ff0000",
            fontFamily: "Orbitron",
            fontStyle: "bold",
            stroke: "#000000",
            strokeThickness: 4,
          }
        );
        feedbackText.setOrigin(0.5, 0.5);
        feedbackText.setDepth(1002);

        // Animar y eliminar el texto
        this.tweens.add({
          targets: feedbackText,
          alpha: 0,
          y: feedbackText.y - 30,
          duration: 1000,
          onComplete: () => {
            feedbackText.destroy();
          },
        });
        return;
      }

      this.hideEvolveOverlay();
      this.performEvolution();
    });
  }

  hideEvolveOverlay(): void {
    if (this.evolveOverlay) {
      // Destruir completamente el contenedor y todos sus hijos
      this.evolveOverlay.removeAll(true);
      this.evolveOverlay.destroy();
      this.evolveOverlay = undefined;
    }
  }

  performEvolution(): void {
    this.isPlayerEvolved = true;

    // Activar botón Special ahora que evolucionó
    if (this.specialButton && this.specialButtonText) {
      this.specialButton.clearTint();
      this.specialButton.setAlpha(1);
      this.specialButton.setInteractive();
      this.specialButtonText.setColor("#ffffff");
      this.specialButtonText.setAlpha(1);

      // Agregar el evento de click que estaba deshabilitado
      this.specialButton.on("pointerdown", () => {
        this.performSpecial();
      });
    }

    // Determinar las texturas correctas (front o back)
    const adultTexture = `${this.playerTeam.id}-player-adult`; // Back para el jugador

    // Calcular offset para monstruos voladores
    const flyingOffset = this.playerTeam.trainer.monster.isFlying ? -80 : 0;

    // Posición final del adulto
    const targetX = this.PLAYER_ADULT_X;
    const targetY = this.PLAYER_ADULT_Y + flyingOffset;

    // Crear sprite overlay blanco que cubre todo el Pokémon
    const whiteGlow = this.add.image(
      this.playerPokemon.x,
      this.playerPokemon.y,
      this.playerPokemon.texture.key
    );
    whiteGlow.setScale(this.playerPokemon.scaleX, this.playerPokemon.scaleY);
    whiteGlow.setOrigin(this.playerPokemon.originX, this.playerPokemon.originY);
    whiteGlow.setTint(0xffffff);
    whiteGlow.setAlpha(0);
    whiteGlow.setBlendMode(Phaser.BlendModes.ADD);
    whiteGlow.setDepth(this.playerPokemon.depth + 1);

    // Secuencia de parpadeos cada vez más rápidos
    const flashDurations = [250, 200, 160, 120, 90, 70, 50, 35, 25, 18, 12, 8]; // Cada vez más rápido
    let currentFlash = 0;

    const doFlash = () => {
      if (currentFlash >= flashDurations.length) {
        // Flash blanco final sostenido
        this.tweens.add({
          targets: whiteGlow,
          alpha: 1,
          duration: 100,
          onComplete: () => {
            // Crear explosión de humo antes de revelar el adulto
            const smokeParticles: Phaser.GameObjects.Graphics[] = [];
            const numParticles = 15; // Número de nubes de humo

            for (let i = 0; i < numParticles; i++) {
              const angle = (Math.PI * 2 * i) / numParticles;
              const distance = 100 + Math.random() * 60; // Distancia más grande

              const smoke = this.add.graphics();
              smoke.fillStyle(0xffffff, 0.8);
              smoke.fillCircle(0, 0, 35 + Math.random() * 25); // Tamaño mucho más grande
              smoke.setPosition(this.playerPokemon.x, this.playerPokemon.y);
              smoke.setBlendMode(Phaser.BlendModes.NORMAL);
              smoke.setDepth(whiteGlow.depth + 1);

              smokeParticles.push(smoke);

              // Animar cada nube de humo hacia afuera
              this.tweens.add({
                targets: smoke,
                x: this.playerPokemon.x + Math.cos(angle) * distance,
                y: this.playerPokemon.y + Math.sin(angle) * distance,
                alpha: 0,
                scale: 2.0, // Escala mayor para más tamaño
                duration: 500, // Más duración para que se vea mejor
                ease: "Power2",
                onComplete: () => {
                  smoke.destroy();
                },
              });
            }

            // Cambiar a adulto durante la explosión de humo
            this.time.delayedCall(150, () => {
              this.playerPokemon.setTexture(adultTexture);
              this.playerPokemon.setScale(this.PLAYER_ADULT_SCALE);
              this.playerPokemon.setPosition(targetX, targetY);

              // Actualizar posición del glow
              whiteGlow.setTexture(adultTexture);
              whiteGlow.setScale(this.PLAYER_ADULT_SCALE);
              whiteGlow.setPosition(targetX, targetY);

              // Desvanecer el glow para revelar el adulto
              this.tweens.add({
                targets: whiteGlow,
                alpha: 0,
                duration: 400,
                ease: "Power2",
                onComplete: () => {
                  whiteGlow.destroy();
                  // Activar el botón Special después de evolucionar
                  this.activateSpecialButton();
                },
              });
            });
          },
        });

        return;
      }

      // Parpadeo: subir y bajar alpha rápidamente
      this.tweens.add({
        targets: whiteGlow,
        alpha: 0.9,
        duration: flashDurations[currentFlash] / 2,
        yoyo: true,
        onComplete: () => {
          currentFlash++;
          doFlash();
        },
      });
    };

    // Iniciar la secuencia
    doFlash();
  }

  /**
   * Activa el botón Special después de evolucionar
   */
  private activateSpecialButton() {
    if (!this.specialButton || !this.specialButtonText) return;

    // Remover el tinte y restaurar opacidad
    this.specialButton.clearTint();
    this.specialButton.setAlpha(1);
    this.specialButtonText.setColor("#ffffff");
    this.specialButtonText.setAlpha(1);

    // Hacer el botón interactivo
    this.specialButton.setInteractive();

    // Añadir el evento de click
    this.specialButton.on("pointerdown", () => {
      this.performSpecial();
    });
  }

  /**
   * Actualiza la barra de HP del enemigo según las secciones restantes
   */
  private updateEnemyHPBar(x: number, y: number, width: number) {
    this.enemyHPGraphics.clear();

    const spacing = 3; // Espacio entre secciones para que se vean como bloques independientes
    const baseSections = 10;
    const totalSpacing = (baseSections - 1) * spacing;
    const sectionWidth = (width - totalSpacing) / baseSections;
    const height = 20;

    // Dibujar siempre 10 segmentos
    for (let i = 0; i < baseSections; i++) {
      const sectionX = x + i * (sectionWidth + spacing);

      if (i < this.enemyHPSections) {
        // Segmento de vida (verde)
        // Pero si tenemos escudo, los últimos segmentos de vida se pintan de azul
        const isShieldedHP =
          this.enemyHPSections - i <= this.enemyShieldSections;

        if (isShieldedHP) {
          // Este segmento de vida tiene escudo encima - pintar de azul
          const shieldIndex =
            this.enemyShieldSections - (this.enemyHPSections - i);
          const ratio = shieldIndex / Math.max(1, this.enemyShieldSections - 1);
          const blueLight = { r: 0x4a, g: 0x9e, b: 0xff };
          const blueDark = { r: 0x25, g: 0x63, b: 0xeb };

          const r = Math.floor(
            blueLight.r - (blueLight.r - blueDark.r) * ratio
          );
          const g = Math.floor(
            blueLight.g - (blueLight.g - blueDark.g) * ratio
          );
          const b = Math.floor(
            blueLight.b - (blueLight.b - blueDark.b) * ratio
          );
          const color = (r << 16) | (g << 8) | b;

          this.enemyHPGraphics.fillStyle(color, 1);
        } else {
          // Segmento de vida normal (verde)
          const ratio = i / Math.max(1, this.enemyHPSections - 1);
          const greenLight = 0xff;
          const greenDark = 0xcc;
          const greenValue = Math.floor(
            greenLight - (greenLight - greenDark) * ratio
          );
          const color = greenValue << 8; // 0x00GG00 (verde puro)

          this.enemyHPGraphics.fillStyle(color, 1);
        }

        this.enemyHPGraphics.fillRoundedRect(
          sectionX,
          y,
          sectionWidth,
          height,
          1
        );
      }
      // Si i >= enemyHPSections, no dibujamos nada (segmento vacío)
    }
  }

  /**
   * Actualiza la barra de HP del jugador según las secciones restantes
   */
  private updatePlayerHPBar(x: number, y: number, width: number) {
    this.playerHPGraphics.clear();

    const spacing = 3; // Espacio entre secciones para que se vean como bloques independientes
    const baseSections = 10;
    const totalSpacing = (baseSections - 1) * spacing;
    const sectionWidth = (width - totalSpacing) / baseSections;
    const height = 20;

    // Dibujar siempre 10 segmentos
    for (let i = 0; i < baseSections; i++) {
      // Determinar qué tipo de segmento es:
      // - Si i >= playerHPSections: segmento vacío o escudo
      // - Los segmentos de escudo empiezan desde la derecha (final)

      const sectionX = x + i * (sectionWidth + spacing);

      if (i < this.playerHPSections) {
        // Segmento de vida (verde)
        // Pero si tenemos escudo, los últimos segmentos de vida se pintan de azul
        const isShieldedHP =
          this.playerHPSections - i <= this.playerShieldSections;

        if (isShieldedHP) {
          // Este segmento de vida tiene escudo encima - pintar de azul
          const shieldIndex =
            this.playerShieldSections - (this.playerHPSections - i);
          const ratio =
            shieldIndex / Math.max(1, this.playerShieldSections - 1);
          const blueLight = { r: 0x4a, g: 0x9e, b: 0xff };
          const blueDark = { r: 0x25, g: 0x63, b: 0xeb };

          const r = Math.floor(
            blueLight.r - (blueLight.r - blueDark.r) * ratio
          );
          const g = Math.floor(
            blueLight.g - (blueLight.g - blueDark.g) * ratio
          );
          const b = Math.floor(
            blueLight.b - (blueLight.b - blueDark.b) * ratio
          );
          const color = (r << 16) | (g << 8) | b;

          this.playerHPGraphics.fillStyle(color, 1);
        } else {
          // Segmento de vida normal (verde)
          const ratio = i / Math.max(1, this.playerHPSections - 1);
          const greenLight = 0xff;
          const greenDark = 0xcc;
          const greenValue = Math.floor(
            greenLight - (greenLight - greenDark) * ratio
          );
          const color = greenValue << 8; // 0x00GG00 (verde puro)

          this.playerHPGraphics.fillStyle(color, 1);
        }

        this.playerHPGraphics.fillRoundedRect(
          sectionX,
          y,
          sectionWidth,
          height,
          1
        );
      }
      // Si i >= playerHPSections, no dibujamos nada (segmento vacío)
    }
  }

  // Función auxiliar para hacer daño al jugador
  damagePlayer(sections: number, skipFlash: boolean = false): void {
    // Haptic feedback cuando el jugador recibe daño
    if (window.FarcadeSDK?.singlePlayer?.actions?.hapticFeedback) {
      window.FarcadeSDK.singlePlayer.actions.hapticFeedback();
    }

    // Primero consumir escudo
    if (this.playerShieldSections > 0) {
      const shieldDamage = Math.min(sections, this.playerShieldSections);
      this.playerShieldSections -= shieldDamage;
      sections -= shieldDamage;
    }

    // Luego consumir HP si aún queda daño
    if (sections > 0 && this.playerHPSections > 0) {
      this.playerHPSections = Math.max(0, this.playerHPSections - sections);
    }

    this.updatePlayerHPBar(
      this.playerHPBarX,
      this.playerHPBarY,
      this.playerHPBarWidth
    );

    // Efecto visual de daño en el pokémon del jugador (opcional)
    if (!skipFlash) {
      this.tweens.add({
        targets: this.playerPokemon,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.playerPokemon.setAlpha(1);
        },
      });
    }

    // Verificar inmediatamente si el jugador perdió
    if (this.playerHPSections <= 0 && this.battleStarted) {
      this.time.delayedCall(300, () => {
        this.endBattle(false); // Derrota inmediata
      });
    }
  }

  // Función auxiliar para añadir escudo al jugador
  addPlayerShield(sections: number): void {
    this.playerShieldSections += sections;
    this.updatePlayerHPBar(
      this.playerHPBarX,
      this.playerHPBarY,
      this.playerHPBarWidth
    );

    // Efecto visual de ganancia de escudo
    this.tweens.add({
      targets: this.playerPokemon,
      scale: this.playerPokemon.scaleX * 1.1,
      duration: 100,
      yoyo: true,
      repeat: 1,
    });
  }

  // Función auxiliar para hacer daño al enemigo
  damageEnemy(sections: number, skipFlash: boolean = false): void {
    // Primero consumir escudo
    if (this.enemyShieldSections > 0) {
      const shieldDamage = Math.min(sections, this.enemyShieldSections);
      this.enemyShieldSections -= shieldDamage;
      sections -= shieldDamage;
    }

    // Luego consumir HP si aún queda daño
    if (sections > 0 && this.enemyHPSections > 0) {
      this.enemyHPSections = Math.max(0, this.enemyHPSections - sections);
    }

    this.updateEnemyHPBar(
      this.enemyHPBarX,
      this.enemyHPBarY,
      this.enemyHPBarWidth
    );

    // Efecto visual de daño en el pokémon enemigo (opcional)
    if (!skipFlash) {
      this.tweens.add({
        targets: this.enemyPokemon,
        alpha: 0.3,
        duration: 100,
        yoyo: true,
        repeat: 2,
        onComplete: () => {
          this.enemyPokemon.setAlpha(1);
        },
      });
    }

    // Verificar inmediatamente si el enemigo fue derrotado
    if (this.enemyHPSections <= 0 && this.battleStarted) {
      this.time.delayedCall(300, () => {
        this.endBattle(true); // Victoria inmediata
      });
    }
  }

  // Función para actualizar el texto del chat
  updateBattleChat(message: string): void {
    if (this.battleChatText) {
      this.battleChatText.setText(message);
    }
  }

  private resetBattleScoreTracking(): void {
    this.battleStartTime = 0;
    this.battleSuccessfulHits = 0;
  }

  private startBattleTimer(): void {
    this.battleStartTime = this.time.now;
  }

  private recordSuccessfulHits(amount: number): void {
    if (amount <= 0) {
      return;
    }
    this.battleSuccessfulHits += amount;
  }

  private calculateBattleScore(): {
    total: number;
    base: number;
    accuracy: number;
    time: number;
    durationSeconds: number;
  } {
    const durationSeconds = this.battleStartTime
      ? (this.time.now - this.battleStartTime) / 1000
      : 0;

    const basePoints = 500;
    const accuracyPoints = Math.max(
      0,
      Math.round(this.battleSuccessfulHits * 40)
    );
    const timeBonus = Math.max(100, Math.round(600 - durationSeconds * 8));
    const total = basePoints + accuracyPoints + timeBonus;

    return {
      total,
      base: basePoints,
      accuracy: accuracyPoints,
      time: timeBonus,
      durationSeconds,
    };
  }

  private updateScoreDisplay(): void {
    if (this.scoreText) {
      this.scoreText.setText(this.totalScore.toString());
    }
  }

  // Verificar si la batalla ha terminado
  checkBattleEnd(): void {
    if (this.playerHPSections <= 0) {
      this.endBattle(false); // Derrota
    } else if (this.enemyHPSections <= 0) {
      this.endBattle(true); // Victoria
    }
  }

  // Terminar batalla
  endBattle(playerWon: boolean): void {
    this.battleStarted = false;

    const centerX = this.cameras.main.width / 2;
    const centerY = this.cameras.main.height / 2;

    // Overlay oscuro (igual que en otras escenas)
    const overlay = this.add.rectangle(
      0,
      0,
      this.cameras.main.width,
      this.cameras.main.height,
      0x000000,
      0.85
    );
    overlay.setOrigin(0, 0);
    overlay.setDepth(2000);
    overlay.setAlpha(0);

    // Texto de resultado - estilo coherente con otras pantallas
    const resultText = playerWon ? "YOU WIN!" : "YOU LOSE!";

    const text = this.add
      .text(centerX, centerY - 100, resultText, {
        fontSize: "48px",
        color: "#ffffff",
        fontFamily: "Orbitron",
        fontStyle: "bold",
        stroke: "#000000",
        strokeThickness: 6,
        shadow: {
          offsetX: 4,
          offsetY: 4,
          color: "#000000",
          blur: 8,
          fill: true,
        },
      })
      .setOrigin(0.5, 0.5)
      .setDepth(2001)
      .setAlpha(0);

    // Fade in suave del overlay y texto
    this.tweens.add({
      targets: overlay,
      alpha: 0.85,
      duration: 500,
      ease: "Power2",
    });

    this.tweens.add({
      targets: text,
      alpha: 1,
      duration: 500,
      ease: "Power2",
    });

    // Calcular y sumar puntuación de esta batalla (victoria o derrota)
    const battleScore = this.calculateBattleScore();
    this.totalScore += battleScore.total;
    this.updateScoreDisplay();

    // Variables para actualizar rivales derrotados
    let updatedDefeatedRivals: number[] = [...this.defeatedRivals];
    let isCompleteVictory = false;

    // Si el jugador ganó, agregar bonus de victoria
    if (playerWon) {
      const victoryBonus = 200;
      this.totalScore += victoryBonus;
      this.updateScoreDisplay();

      // Verificar si derrotó a TODOS los rivales normales (sin contar Dark Boss)
      updatedDefeatedRivals = [...this.defeatedRivals, this.currentRivalIndex];
      const totalNormalRivals = TEAMS.length - 2; // Excluir jugador y Dark Boss

      // Solo es victoria completa si derrotó al Dark Boss
      if (this.isDarkBoss) {
        // ¡VICTORIA TOTAL! Derrotó al Dark Boss
        isCompleteVictory = true;
        const finalBonus = 1000; // Bonus especial por completar el juego
        this.totalScore += finalBonus;
        this.updateScoreDisplay();

        // Actualizar texto
        text.setText("VICTORY!\nDARK CHAMPION DEFEATED!");
        text.setFontSize("36px");

        // Enviar game over directamente sin mostrar modal
        if (window.FarcadeSDK?.singlePlayer?.actions?.gameOver) {
          window.FarcadeSDK.singlePlayer.actions.gameOver({
            score: this.totalScore,
          });
        }

        // Volver al menú después de un delay
        this.time.delayedCall(3000, () => {
          this.cameras.main.fadeOut(500, 0, 0, 0);
          this.cameras.main.once("camerafadeoutcomplete", () => {
            this.scene.start("MainMenuScene");
          });
        });
        return; // No mostrar botones
      }

      // Si derrotó a todos los rivales normales, mostrar botón "Final Battle"
      if (updatedDefeatedRivals.length >= totalNormalRivals) {
        text.setText("VICTORY!\nFINAL CHALLENGE AWAITS!");
        text.setFontSize("36px");
      }

      // VICTORIA: Mostrar botones para continuar o abandonar
      this.createVictoryButtons(
        centerX,
        centerY,
        updatedDefeatedRivals,
        isCompleteVictory
      );
    } else {
      // DERROTA: Pantalla estática sin animaciones
      // Mostrar overlay inmediatamente sin fade
      overlay.setAlpha(0.85);
      text.setAlpha(1);

      // Enviar gameOver en caso de derrota
      if (window.FarcadeSDK?.singlePlayer?.actions?.gameOver) {
        window.FarcadeSDK.singlePlayer.actions.gameOver({
          score: this.totalScore,
        });
      }

      // No hacer nada más - esperar a que el jugador pulse "play again" desde el SDK
      // El listener de "play_again" en create() manejará el reinicio
    }
  }

  // Crear botones de victoria (Next Battle / Quit)
  private createVictoryButtons(
    centerX: number,
    centerY: number,
    updatedDefeatedRivals: number[],
    isCompleteVictory: boolean
  ): void {
    const buttonWidth = 280;
    const buttonHeight = 70;
    const buttonSpacing = 20;
    const buttonY = centerY + 50;

    // Calcular si es la batalla final (todos los rivales normales derrotados)
    const totalNormalRivals = TEAMS.length - 2; // Excluir jugador y Dark Boss
    const isFinalBattle = updatedDefeatedRivals.length >= totalNormalRivals;
    const buttonText = isFinalBattle ? "FINAL BATTLE" : "NEXT BATTLE";

    // Botón "Next Battle" o "Final Battle" (solo si no es victoria completa)
    if (!isCompleteVictory) {
      const nextButton = this.add.container(centerX, buttonY);
      nextButton.setDepth(2002);

      const nextBg = this.add.graphics();
      nextBg.fillStyle(0x203a6a, 0.85);
      nextBg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        14
      );
      nextBg.lineStyle(3, 0x03eae9, 1);
      nextBg.strokeRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        14
      );

      const nextText = this.add
        .text(0, 0, buttonText, {
          fontSize: "28px",
          color: "#ffffff",
          fontFamily: "Orbitron",
          fontStyle: "bold",
        })
        .setOrigin(0.5, 0.5);

      nextButton.add([nextBg, nextText]);
      nextButton.setInteractive(
        new Phaser.Geom.Rectangle(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight
        ),
        Phaser.Geom.Rectangle.Contains
      );

      // Hover effect
      nextButton.on("pointerover", () => {
        nextBg.clear();
        nextBg.fillStyle(0x03eae9, 0.3);
        nextBg.fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          14
        );
        nextBg.lineStyle(3, 0x03eae9, 1);
        nextBg.strokeRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          14
        );
        nextText.setColor("#ffffff");
      });

      nextButton.on("pointerout", () => {
        nextBg.clear();
        nextBg.fillStyle(0x203a6a, 0.85);
        nextBg.fillRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          14
        );
        nextBg.lineStyle(3, 0x03eae9, 1);
        nextBg.strokeRoundedRect(
          -buttonWidth / 2,
          -buttonHeight / 2,
          buttonWidth,
          buttonHeight,
          14
        );
        nextText.setColor("#ffffff");
      });

      nextButton.on("pointerdown", () => {
        this.continueToNextBattle(updatedDefeatedRivals);
      });
    }

    // Botón "Quit" (siempre visible)
    const quitButtonY = isCompleteVictory
      ? buttonY
      : buttonY + buttonHeight + buttonSpacing;
    const quitButton = this.add.container(centerX, quitButtonY);
    quitButton.setDepth(2002);

    const quitBg = this.add.graphics();
    quitBg.fillStyle(0x203a6a, 0.85);
    quitBg.fillRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      14
    );
    quitBg.lineStyle(3, 0x03eae9, 1);
    quitBg.strokeRoundedRect(
      -buttonWidth / 2,
      -buttonHeight / 2,
      buttonWidth,
      buttonHeight,
      14
    );

    const quitText = this.add
      .text(0, 0, isCompleteVictory ? "FINISH" : "QUIT", {
        fontSize: "28px",
        color: "#ffffff",
        fontFamily: "Orbitron",
        fontStyle: "bold",
      })
      .setOrigin(0.5, 0.5);

    quitButton.add([quitBg, quitText]);
    quitButton.setInteractive(
      new Phaser.Geom.Rectangle(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight
      ),
      Phaser.Geom.Rectangle.Contains
    );

    // Hover effect
    quitButton.on("pointerover", () => {
      quitBg.clear();
      quitBg.fillStyle(0x03eae9, 0.3);
      quitBg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        14
      );
      quitBg.lineStyle(3, 0x03eae9, 1);
      quitBg.strokeRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        14
      );
      quitText.setColor("#ffffff");
    });

    quitButton.on("pointerout", () => {
      quitBg.clear();
      quitBg.fillStyle(0x203a6a, 0.85);
      quitBg.fillRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        14
      );
      quitBg.lineStyle(3, 0x03eae9, 1);
      quitBg.strokeRoundedRect(
        -buttonWidth / 2,
        -buttonHeight / 2,
        buttonWidth,
        buttonHeight,
        14
      );
      quitText.setColor("#ffffff");
    });

    quitButton.on("pointerdown", () => {
      this.quitGame();
    });
  }

  // Continuar a la siguiente batalla
  private continueToNextBattle(updatedDefeatedRivals: number[]): void {
    // Detener música de batalla antes de cambiar de escena
    const battleMusic1 = this.sound.get("music-battle");
    if (battleMusic1) {
      battleMusic1.stop();
      battleMusic1.destroy();
    }
    const battleMusic2 = this.sound.get("music-battle-2");
    if (battleMusic2) {
      battleMusic2.stop();
      battleMusic2.destroy();
    }

    // Reiniciar música de selección
    if (!this.sound.get("music-selection")) {
      this.sound.add("music-selection", { loop: true, volume: 0.6 }).play();
    } else {
      const selMusic = this.sound.get("music-selection");
      if (selMusic && !selMusic.isPlaying) {
        selMusic.play();
      }
    }

    // Fade out rápido
    this.cameras.main.fadeOut(300, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      // Volver a RivalSelectionScene con rivales derrotados actualizados
      this.scene.start("RivalSelectionScene", {
        selectedTeamIndex: this.selectedTeamIndex,
        defeatedRivals: updatedDefeatedRivals,
        currentScore: this.totalScore,
      });
    });
  }

  // Abandonar el juego (llamar al SDK gameOver)
  private quitGame(): void {
    // Notificar al SDK que el juego terminó con la puntuación final
    if (window.FarcadeSDK?.singlePlayer?.actions?.gameOver) {
      window.FarcadeSDK.singlePlayer.actions.gameOver({
        score: this.totalScore,
      });
    }

    // Volver al menú principal
    this.cameras.main.fadeOut(500, 0, 0, 0);
    this.cameras.main.once("camerafadeoutcomplete", () => {
      this.scene.start("MainMenuScene");
    });
  }
}
