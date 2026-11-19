import React from "react";
import { Column, Divider, Grid, Rect, Row, Svg, Text } from "@hyper-elements/react";
import { fonts, palette, space } from "./theme";
import type { Band } from "./data";

// Shared blocks for Latchkey v4 — Swiss Bulletin. Flat, square, ruled:
// hard black rules divide numbered sections; Archivo 900 does the
// shouting; JetBrains Mono whispers the data. No Svg in the Wordmark or
// the Stamp, so both are safe in the Email root as well.

/** Display colour for a verdict band, Swiss-style: HIGH is the one red;
 *  LOW and GUARDED are black typographic treatments. (data.ts keeps its
 *  own band record; only the presentation colour changes.) */
export const bandInk = (band: Band) => (band.key === "high" ? palette.red : palette.ink);

/** The band's score range, for captions ("Band 60–100 = High"). */
export const bandRange = (band: Band) =>
  band.key === "high" ? "60–100" : band.key === "guarded" ? "30–59" : "0–29";

const pt = (n: number) => Math.round(n * 10) / 10;

/** Small mono data label — the bulletin's quiet voice. */
export const monoLabel = {
  fontFamily: fonts.mono,
  fontSize: 11,
  letterSpacing: 1.2,
  textTransform: "uppercase" as const,
};

/** The ■ + LATCHKEY wordmark. Type and blocks only — no Svg. */
export function Wordmark({ fontSize = 29 }: { fontSize?: number }) {
  const sq = Math.round(fontSize * 0.55);
  return (
    <Row style={{ gap: Math.round(fontSize * 0.42), alignItems: "center" }}>
      <Column style={{ width: sq, height: sq, backgroundColor: palette.ink, flex: "none" }} />
      <Text style={{ fontWeight: 900, fontSize, letterSpacing: 2, lineHeight: 1, fontFamily: fonts.display }}>
        LATCHKEY
      </Text>
    </Row>
  );
}

/**
 * The bulletin masthead: wordmark + right-hand mono line, a 3px rule,
 * then a three-cell meta strip (issued / account / status).
 */
export function Masthead({
  right,
  metaLeft,
  metaCenter,
  metaRight,
  wordmarkSize = 29,
}: {
  right: React.ReactNode;
  metaLeft: React.ReactNode;
  metaCenter?: React.ReactNode;
  metaRight?: React.ReactNode;
  wordmarkSize?: number;
}) {
  return (
    <Column style={{ gap: space.lg }}>
      <Row style={{ gap: 12, alignItems: "center" }}>
        <Wordmark fontSize={wordmarkSize} />
        <Column style={{ flex: 1 }} />
        <Text style={{ ...monoLabel, fontSize: 12, letterSpacing: 1.5 }}>{right}</Text>
      </Row>
      <Divider style={{ borderTop: { width: 3, style: "solid", color: palette.ink } }} />
      <Row style={{ gap: 16 }}>
        <Text style={{ ...monoLabel, flex: 1 }}>{metaLeft}</Text>
        {metaCenter ? (
          <Text style={{ ...monoLabel, flex: 1, textAlign: "center" }}>{metaCenter}</Text>
        ) : null}
        {metaRight ? (
          <Text style={{ ...monoLabel, flex: 1, textAlign: "right" }}>{metaRight}</Text>
        ) : null}
      </Row>
    </Column>
  );
}

/** Numbered section label: red index, black caps label, mono right note. */
export function SectionLabel({
  index,
  label,
  right,
  rightWidth = 340,
}: {
  index: string;
  label: string;
  right?: string;
  rightWidth?: number;
}) {
  return (
    <Row style={{ gap: 12, alignItems: "end" }}>
      <Text style={{ fontWeight: 900, fontSize: 15, color: palette.red, lineHeight: 1, width: 30, fontFamily: fonts.display }}>
        {index}
      </Text>
      <Text
        style={{
          fontWeight: 700,
          fontSize: 15,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          lineHeight: 1,
          flex: 1,
          textAlign: "left",
          fontFamily: fonts.display,
        }}
      >
        {label}
      </Text>
      {right ? (
        <Text style={{ ...monoLabel, fontSize: 10.5, letterSpacing: 1, lineHeight: 1, width: rightWidth, textAlign: "right" }}>
          {right}
        </Text>
      ) : null}
    </Row>
  );
}

/** A ruled meter: black outline track, black fill to the value. */
export function Meter({ value, width, height = 14 }: { value: number; width: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} title={`Meter — ${value} of 100`}>
      <Rect x={1} y={1} width={width - 2} height={height - 2} style={{ fill: palette.paper, stroke: palette.ink, strokeWidth: 2 }} />
      <Rect x={3.5} y={3.5} width={pt(Math.max(0, (width - 7) * (value / 100)))} height={height - 7} style={{ fill: palette.ink }} />
    </Svg>
  );
}

/** A ruled fact row: caps label left, mono value right, hairline above
 *  (except the first). The bulletin's table substitute. */
export function FactorRow({
  label,
  value,
  red = false,
  first = false,
  labelSize = 15,
  valueSize = 13,
}: {
  label: string;
  value: string;
  red?: boolean;
  first?: boolean;
  labelSize?: number;
  valueSize?: number;
}) {
  return (
    <Grid
      columns={2}
      style={{
        gap: 16,
        padding: [10, 0],
        border: first ? undefined : { top: { width: 1, style: "solid", color: palette.ink } },
      }}
    >
      <Text style={{ fontWeight: 500, fontSize: labelSize, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: fonts.display }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: valueSize,
          fontWeight: 600,
          color: red ? palette.red : palette.ink,
          textAlign: "right",
        }}
      >
        {value}
      </Text>
    </Grid>
  );
}

/**
 * The verdict stamp: a double-ruled rectangle in the band's ink (red for
 * HIGH, black otherwise), mono caps inside. Column-based — no Svg — so
 * the Email can use it too. (Rotation isn't in the style system; the
 * double rule carries the effect, as in print.)
 */
export function Stamp({ band, small = false }: { band: Band; small?: boolean }) {
  const color = bandInk(band);
  return (
    <Column style={{ border: { width: 2.5, style: "solid", color }, padding: 3.5, alignItems: "center" }}>
      <Column
        style={{
          border: { width: 1, style: "solid", color },
          padding: small ? [6, 12] : [9, 18],
          alignItems: "center",
        }}
      >
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: small ? 11 : 13.5,
            fontWeight: 600,
            letterSpacing: 2,
            color,
            textAlign: "center",
          }}
        >
          {band.stamp}
        </Text>
      </Column>
    </Column>
  );
}

/** A fired-signal tag: flat square chip, 1.5px rule, mono caps. */
export function SignalTag({ label, accent = false }: { label: string; accent?: boolean }) {
  const color = accent ? palette.red : palette.ink;
  return (
    <Column
      style={{
        border: { width: 1.5, style: "solid", color },
        padding: [4, 9],
        alignItems: "center",
        flex: "none",
      }}
    >
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: 1.2,
          textTransform: "uppercase",
          color,
        }}
      >
        {label}
      </Text>
    </Column>
  );
}

/** Label + value fact for ruled records (Document / Email). */
export function Fact({
  label,
  value,
  valueSize = 14.5,
  accent = false,
}: {
  label: string;
  value: string;
  valueSize?: number;
  accent?: boolean;
}) {
  return (
    <Column style={{ gap: space.xs }}>
      <Text style={{ ...monoLabel, fontSize: 9.5, letterSpacing: 2, fontWeight: 600 }}>{label}</Text>
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: valueSize,
          fontWeight: 600,
          color: accent ? palette.red : palette.ink,
        }}
      >
        {value}
      </Text>
    </Column>
  );
}
