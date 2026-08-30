---
name: Roberto Verdecia S?nchez
description: Portafolio-cotizador; pizarra de mercado sobre losa de obsidiana
colors:
  obsidian: "#0b0c0e"
  obsidian-2: "#141416"
  obsidian-3: "#1c1d20"
  bone: "#e8e6e3"
  bone-dim: "#b7b2a8"
  brass: "#c4a574"
  brass-ink: "#3d2e16"
  plaster: "#e7f6f0"
  plaster-2: "#ffffff"
  ink: "#25272c"
  ink-dim: "#55616a"
  mint: "#b8f7e4"
  graphite: "#25272c"
  line: "#2a2b2e"
  danger: "#c45c3e"
  board: "#090a0b"
  board-text: "#efe6d4"
typography:
  display:
    fontFamily: "Bricolage Grotesque, Segoe UI, sans-serif"
    fontSize: "clamp(1.8rem, 4vw, 2.8rem)"
    fontWeight: 700
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  hero:
    fontFamily: "Bricolage Grotesque, Segoe UI, sans-serif"
    fontSize: "clamp(2.2rem, 6vw, 4.4rem)"
    fontWeight: 800
    lineHeight: 1.12
    letterSpacing: "-0.03em"
  body:
    fontFamily: "Source Sans 3, Segoe UI, sans-serif"
    fontSize: "1.05rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
rounded:
  sm: "10px"
  md: "14px"
  pill: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "48px"
  section: "88px"
components:
  button-primary:
    backgroundColor: "{colors.brass}"
    textColor: "{colors.brass-ink}"
    rounded: "{rounded.pill}"
    padding: "12px 18px"
    height: "44px"
  button-secondary:
    backgroundColor: "{colors.obsidian-3}"
    textColor: "{colors.bone}"
    rounded: "{rounded.pill}"
    padding: "12px 18px"
    height: "44px"
  board:
    backgroundColor: "{colors.board}"
    textColor: "{colors.board-text}"
    rounded: "{rounded.md}"
    padding: "22px"
---

## Overview

Sitio ?nico de persuasi?n. El mundo es una **pizarra de mercado** grabada en **obsidiana**: el visitante anota el alcance y el rango aparece como precio de puesto, no como tres paquetes. Claro = muro de yeso del mismo puesto. Semilla `a7f3c2e1`, candidato grounded 7; el roll de Impeccable corri? degradado (sin challengers). El brief ancla el oscuro obsidian y el cotizador en vivo.

## Colors

Oscuro: fondo `#0b0c0e`, superficies `#141416` / `#1c1d20`, texto hueso `#e8e6e3`, acento lat?n `#c4a574`. Claro: fondo Sky Mint tenue `#e7f6f0`, superficies blancas, tinta Graphite `#25272c`; los botones primarios son Graphite con texto claro y la pizarra clara es Graphite con el total y los realces en Sky Mint `#B8F7E4`. Un solo acento; el rango vive en la pizarra, no en un recuadro ne?n.

## Typography

R?tulos: Bricolage Grotesque. Cuerpo: Source Sans 3. Sin Inter de display. Tracking de titulares ?0.03em. Cifras tabulares en la pizarra.

## Layout

Ancho `min(1120px, 100% ? 40px)`. Hero en dos columnas (lema + pizarra de muestra). Cotizador en dos columnas (controles + pizarra viva). Galer?a 3 / 2 / 1 columnas. Secci?n 88px; en m?vil 64px. Header sticky.

## Elevation & Depth

Una sombra por superficie (`8px 16px 32px ?14px`). La pizarra se distingue por color de losa, no por halo. Bordes 1px `edge`.

## Shapes

Radio 14px en paneles y pizarra. Pastillas 999px en botones y nav. Controles 44px de alto.

## Components

- **Pizarra:** lista con rayas discontinuas y total con filete lat?n.
- **Bot?n primario:** lat?n, texto oscuro.
- **Campos:** label visible, nunca placeholder como ?nico nombre.
- **Iconos:** SVG de trazo (men?, tema, sol/luna). Interruptor de idioma muestra ES/EN.
- **Aviso de sistema:** bloque coral cuando el tipo es CRM/SaaS.

## Do's and Don'ts

- Hablar yo ? t?. No vender paquetes fijos.
- Declarar que el rango no es precio final y que dominio/hosting van aparte.
- No usar emoji como icono ni degradados en t?tulos.
- No inventar testimonios. La galer?a es trabajo representativo (p?steres SVG de sitios reales cuando no hay captura fotogr?fica).

## Motion

Tesis: la pizarra de mercado se escribe al marcar opciones. El rango destella en lat?n; las l?neas del desglose aparecen como tiza. El hero entra como un letrero que se cuelga. Los p?sters de trabajo se clavan en el muro al hacer scroll. Header con blur fuerte para que el texto de detr?s no se lea. IntersectionObserver + CSS con un count-up del estimado, sin dependencias de CDN; si el JS falla, el contenido sigue visible. `prefers-reduced-motion` apaga animaci?n.
