# 🎮 Platform Battlers

Juego de batalla móvil estilo Pokemon donde eliges tu plataforma gaming favorita y combates con monstruos únicos.

---

## 📋 CONCEPTO GENERAL

### Mecánica Principal

- **8 personajes/trainers** distintos (cada uno representa una plataforma gaming)
- Cada personaje tiene su **monstruo/pokemon** con 2 estados:
  - Estado **Baby** (pre-evolución)
  - Estado **Adulto** (evolucionado)
- Cada personaje tiene **habilidad especial única**
- Sistema de **batallas aleatorias** contra rivales
- **Dificultad progresiva** según avanzas
- Jugador elige personaje pero **controla al monstruo** (estilo Pokemon)

---

## 🎨 DISEÑO DE ESCENA DE BATALLA (Estilo Pokémon)

### Layout (Portrait 720x1080px)

```
┌─────────────────────────┐ 720px width
│                         │
│                         │
│   CAMPO BATALLA         │
│   (50-60%)              │ 540-648px
│                         │
│   [Monstruo Rival]      │ ← Frontal, arriba-derecha
│    HP Bar              │
│                         │
│                         │
│   [Tu Monstruo]         │ ← De espaldas, abajo-izq
│    HP Bar              │
│                         │
├──────────────┬──────────┤
│              │          │
│   MENSAJES   │  GRID    │
│   (40-50%)   │  2x2     │ 432-540px
│              │          │
│  "¿Qué hará  │  ╔═╗ ╔═╗ │
│   [Monster]?"│  ║1║ ║2║ │
│              │  ╚═╝ ╚═╝ │
│              │  ╔═╗ ╔═╗ │
│              │  ║3║ ║4║ │
│              │  ╚═╝ ╚═╝ │
└──────────────┴──────────┘
```

### Distribución por Zonas

| Zona              | Alto         | Ancho | Función                                     |
| ----------------- | ------------ | ----- | ------------------------------------------- |
| **Campo Batalla** | 55% (~594px) | 100%  | Fondo + 2 monstruos (espaldas/frontal) + HP |
| **Mensajes**      | 45% (~486px) | 50%   | Texto de combate, acciones, diálogos        |
| **Habilidades**   | 45% (~486px) | 50%   | Grid 2x2 con 4 botones de habilidades       |

---

## 📐 ESPECIFICACIONES DE ASSETS

### Dimensiones Requeridas

| Asset                      | Tamaño     | Formato            | Uso                                |
| -------------------------- | ---------- | ------------------ | ---------------------------------- |
| **Resolución juego**       | 720x1080px | -                  | Canvas base portrait               |
| **Campo/Fondo batalla**    | 720x594px  | PNG/JPG            | Background 1:1 para mejor calidad  |
| **Monstruo (Back)**        | 256x256px  | PNG (transparente) | Tu monstruo de espaldas            |
| **Monstruo (Front)**       | 256x256px  | PNG (transparente) | Monstruo rival frontal             |
| **Monstruo Evol. (Back)**  | 320x320px  | PNG (transparente) | Versión evolucionada de espaldas   |
| **Monstruo Evol. (Front)** | 320x320px  | PNG (transparente) | Versión evolucionada frontal       |
| **HP Bar**                 | 200x40px   | PNG                | Barra de vida para ambos monstruos |
| **Botón Habilidad**        | 120x120px  | PNG                | Iconos grid 2x2                    |

### Assets Totales Necesarios

**Por cada uno de los 8 personajes:**

- [ ] 1x Imagen **Monstruo Baby Back** (256x256px) - De espaldas
- [ ] 1x Imagen **Monstruo Baby Front** (256x256px) - Frontal
- [ ] 1x Imagen **Monstruo Adulto Back** (320x320px) - De espaldas
- [ ] 1x Imagen **Monstruo Adulto Front** (320x320px) - Frontal
- [ ] 4x **Iconos de habilidades** (120x120px cada uno)

**Assets Generales:**

- [ ] 1x **Campo de batalla** background (720x594px o mayor 1:1)
- [ ] 1x **HP Bar** template (200x40px)
- [ ] UI elementos (cajas de texto, efectos VFX, botones)

**TOTAL ASSETS**:

- 32 sprites de monstruos (8 personajes × 2 formas × 2 ángulos)
- 32 iconos habilidades (4 por personaje)
- 1 campo de batalla
- 1 HP bar template
- Elementos UI (cajas de mensaje, marcos, efectos)
- 1 campo de batalla
- 2 plataformas

---

## 🎮 SISTEMA DE COMBATE

### Estado: ⏳ PENDIENTE DE DEFINIR

**Opciones Evaluadas:**

1. **Piedra-Papel-Tijera Avanzado** - Sistema de contraataques
2. **Energy Management** - Gestión de recursos (estilo Clash Royale)
3. **Timing/Reacción** - Skill-based con parries (estilo Smash Bros)
4. **Combo Chain System** ⭐ RECOMENDADO - Encadenar habilidades
5. **Turnos con Momentum** - Sistema por turnos rápidos

### Requisitos Confirmados:

- ✅ Sistema de **Ataque, Defensa, Esquivar**
- ✅ Debe tener **estrategia y sentido táctico**
- ✅ **Sin ventajas** entre personajes (totalmente balanceado)
- ✅ Grid de **4 habilidades** por personaje en UI
- ✅ Cada habilidad con **cooldown** visual
- ✅ Habilidad **especial/ultimate** única por personaje

### Sistema Propuesto (Combo Chain):

```
Mecánica:
- 4 botones: Ataque, Defensa, Especial, Support
- Cada uno se recarga en 1-3 segundos
- Combos: Usar en orden correcto = bonus daño
  Ejemplo: Ataque → Ataque → Especial = x2.5 daño
- Perfect timing en defensa = contraataque

Stats:
- HP: 100 para ambos monstruos
- Ataque básico: 15 de daño
- Defensa: Reduce 50% daño por 1 segundo
- Esquivar: 0.8s invulnerable + 0.5s fatiga
- Especial: Único por personaje, se carga con combos
```

---

## 🏗️ ESTRUCTURA DEL PROYECTO

```
g3-test/
├── src/
│   ├── main.ts                    # Entry point
│   ├── config/
│   │   └── GameSettings.ts        # Configuración resolución, etc
│   ├── scenes/
│   │   ├── MenuScene.ts           # TODO: Selección personaje
│   │   ├── BattleScene.ts         # ✅ Escena principal combate
│   │   └── ResultScene.ts         # TODO: Victoria/Derrota
│   ├── objects/
│   │   ├── Monster.ts             # TODO: Clase monstruo
│   │   ├── HPBar.ts               # TODO: Barra de vida
│   │   ├── MessageBox.ts          # TODO: Caja de mensajes
│   │   └── AbilityButton.ts       # TODO: Botón de habilidad
│   ├── systems/
│   │   ├── CombatSystem.ts        # TODO: Lógica de combate
│   │   ├── ComboSystem.ts         # TODO: Sistema de combos
│   │   └── AIController.ts        # TODO: IA del rival
│   └── utils/
│       └── Constants.ts           # TODO: Constantes del juego
├── assets/                        # TODO: Crear carpeta
│   ├── backgrounds/               # Campos de batalla
│   ├── monsters/
│   │   ├── back/                  # Sprites de espaldas
│   │   └── front/                 # Sprites frontales
│   ├── abilities/                 # 32 iconos
│   └── ui/                        # Elementos interfaz (HP bars, etc)
├── index.html
├── package.json
└── README.md
```

---

## 📱 CONFIGURACIÓN TÉCNICA

- **Engine**: Phaser 3 (ya configurado)
- **Framework**: Remix Dev
- **Orientación**: Portrait (vertical) 720x1280px
- **Plataforma Target**: Móvil (iOS/Android)
- **Controles**: Touch/Tap únicamente
- **Lenguaje**: TypeScript
- **Build**: Vite + Phaser

---

## 🚀 ROADMAP DE DESARROLLO

### Fase 1: Setup Base ⏳

- [ ] Crear BattleScene con layout básico
- [ ] Implementar grid sistema (header, campo, UI)
- [ ] Añadir placeholders para monstruos
- [ ] Crear UI con 4 botones de habilidades
- [ ] Sistema de coordenadas y posicionamiento

### Fase 2: Sistema de Combate ⏳

- [ ] Definir mecánica final de combate
- [ ] Implementar sistema de HP
- [ ] Crear sistema de ataques básicos
- [ ] Añadir defensa y esquiva
- [ ] Sistema de cooldowns en botones
- [ ] Implementar combos (si se elige ese sistema)

### Fase 3: Personajes y Monstruos ⏳

- [ ] Crear clase base Monster
- [ ] Sistema de evolución (Baby → Adulto)
- [ ] Crear clase Trainer
- [ ] Definir 8 personajes con stats
- [ ] Definir habilidades únicas por personaje
- [ ] Implementar especiales/ultimates

### Fase 4: IA y Progresión ⏳

- [ ] Sistema de IA básica
- [ ] Dificultad progresiva (scaling)
- [ ] Sistema de matchmaking aleatorio
- [ ] Patrones de comportamiento por rival

### Fase 5: Assets e Integración ⏳

- [ ] Integrar assets finales de personajes
- [ ] Añadir sprites de monstruos
- [ ] Implementar animaciones de ataque
- [ ] VFX de habilidades
- [ ] UI/UX pulido y feedback visual
- [ ] Sonidos y música

### Fase 6: Menús y Meta ⏳

- [ ] Escena de selección de personaje
- [ ] Pantalla de resultados
- [ ] Sistema de puntuación/score
- [ ] Guardado de progreso (localStorage)
- [ ] Tutorial/onboarding

### Fase 7: Polish y Testing ⏳

- [ ] Balanceo de personajes
- [ ] Testing en dispositivos reales
- [ ] Optimización de rendimiento
- [ ] Ajustes de dificultad
- [ ] Bug fixing

---

## 🎮 COMANDOS DE DESARROLLO

### Desarrollo

```bash
npm run dev
```

- Live reload automático
- Dashboard de desarrollo
- Testing móvil via QR
- Monitoring de performance

### Build Producción

```bash
npm run build
```

Genera HTML único en carpeta `dist/`

### Preview

```bash
npm run preview
```

Vista previa del build de producción

---

## 📚 RECURSOS

- [Phaser 3 Docs](https://photonstorm.github.io/phaser3-docs/)
- [Phaser Examples](https://phaser.io/examples)
- [Remix Dev Framework](https://github.com/insidethesim/remix-dev)

---

## 📝 NOTAS DE DISEÑO

### Estilo Visual Pokémon

- Campo de batalla ocupa 50-60% superior de la pantalla
- Monstruo del jugador: **De espaldas**, posición inferior-izquierda
- Monstruo rival: **Frontal**, posición superior-derecha
- HP Bars visible sobre cada monstruo
- Caja de mensajes estilo Pokémon (inferior izquierda)
- Grid 2x2 de habilidades (inferior derecha)

### Consideraciones Móvil

- Botones mínimo 120x120px para touch accuracy
- Grid 2x2 con espaciado de 16-20px entre botones
- Caja de mensajes legible (fuente grande, buen contraste)
- Todo controlable con pulgar (one-handed)
- Área de batalla no obstruida por UI

### Balanceo

- Todos los personajes tienen stats base idénticos
- Diferenciación solo por habilidades especiales
- Sin sistema de ventajas tipo/elemento
- Skill > Stats (recompensa buena ejecución)

### Sistema de Combate

- UI de mensajes muestra acciones y resultados
- Habilidades en grid claramente identificadas
- Feedback visual inmediato (animaciones, efectos)
- HP bars actualizadas en tiempo real
- Sistema de turnos o tiempo real (por definir)

### Monetización Futura (Opcional)

- Skins de monstruos
- Efectos visuales premium
- Nuevos personajes/monstruos
- Battle Pass system

---

**Estado Actual**: 🎨 Rediseño a estilo Pokémon  
**Próximo Paso**: Implementar nueva BattleScene con assets

- [Remix Dev Framework](https://github.com/insidethesim/remix-dev)

## 🔄 Updating

Get the latest features and fixes:

```bash
npm update @insidethesim/remix-dev
```
