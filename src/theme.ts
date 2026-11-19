import { defineTheme } from "@hyper-elements/react";

// Latchkey v4 — "Swiss Bulletin" (picked by Aayushi from rendered samples,
// 2026-11-19). A Swiss bank notice meets an Interpol bulletin meets an
// aviation safety card: warm off-white paper, ink black, ONE pure red.
// Flat everything — square corners, no shadows, no gradients, no glow.
// Archivo (900/700/500) for display and numerals, Inter for prose,
// JetBrains Mono only for small data labels. Risk is communicated by
// numerals, rules and red — never by extra hues: LOW and GUARDED are
// black/grey typographic treatments, HIGH is red.
export const palette = {
  paper: "#F7F4EC", // warm off-white ground
  ink: "#111111", // the black
  red: "#E2001A", // the one red — threat, verdicts, HIGH
};

export const fonts = {
  display: "Archivo, Helvetica, Arial, sans-serif",
  body: "Inter, Arial, Helvetica, sans-serif",
  mono: "JetBrains Mono, 'Courier New', Courier, monospace",
};

// The kit's spacing scale (v4.1 spacing pass — Aayushi: "proper space in
// every design, so they look good"). Every structural gap and padding in
// every template is one of these steps, so the Page, the poster, the
// report and the email all breathe at the same rhythm: sections separate
// at xxxl/huge, blocks group at lg/xl, rows pad at md, labels sit xs/sm
// from their values. Micro type gaps (2–7) and ruled-row padding (10)
// stay literal half-steps, used consistently.
export const space = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  huge: 40,
  max: 48,
} as const;

// Webfont faces for the HTML outputs (Page / Document print HTML), served
// from the Fontsource CDN — the same SIL OFL files kept in assets/fonts/.
const face = (family: string, file: string, weight: number) => ({
  family,
  src: `https://cdn.jsdelivr.net/fontsource/fonts/${file}.woff`,
  format: "woff" as const,
  weight,
});

export const fontFaces = [
  face("Archivo", "archivo@latest/latin-500-normal", 500),
  face("Archivo", "archivo@latest/latin-700-normal", 700),
  face("Archivo", "archivo@latest/latin-900-normal", 900),
  face("Inter", "inter@latest/latin-400-normal", 400),
  face("Inter", "inter@latest/latin-500-normal", 500),
  face("Inter", "inter@latest/latin-600-normal", 600),
  face("Inter", "inter@latest/latin-700-normal", 700),
  face("JetBrains Mono", "jetbrains-mono@latest/latin-400-normal", 400),
  face("JetBrains Mono", "jetbrains-mono@latest/latin-600-normal", 600),
];

export const latchkey = defineTheme({
  colors: {
    background: palette.paper,
    foreground: palette.ink,
    primary: palette.ink,
    primaryForeground: palette.paper,
    muted: palette.ink,
    border: palette.ink,
    paper: palette.paper,
    ink: palette.ink,
    red: palette.red,
  },
  fonts: {
    body: fonts.body,
    heading: fonts.display,
  },
  fontSizes: { body: 16 },
  lineHeights: { body: 1.5 },
  elements: {
    Heading: {
      fontFamily: fonts.display,
      fontWeight: 900,
      lineHeight: 1.0,
      by: {
        level: {
          1: { fontSize: 40 },
          2: { fontSize: 29 },
          3: { fontSize: 20, fontWeight: 700 },
        },
      },
    },
    Text: { lineHeight: 1.5 },
    Button: {
      backgroundColor: palette.ink,
      color: palette.paper,
      borderRadius: 0,
      padding: [14, 26],
      fontWeight: 700,
      fontSize: 15,
      hover: { backgroundColor: palette.red },
    },
    Divider: { borderTop: { width: 2, style: "solid", color: palette.ink } },
  },
  styles: {
    chip: { borderRadius: 0, padding: [4, 9] },
  },
});
