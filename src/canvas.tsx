import React from "react";
import { Canvas, Column, Divider, LineBreak, Row, Span, Text } from "@hyper-elements/react";
import { fonts, latchkey, palette } from "./theme";
import { FactorRow, Masthead, Meter, SectionLabel, bandRange } from "./components";
import { SwissMap } from "./worldmap";
import {
  account,
  accountBand,
  accountFactors,
  accountScore,
  checklist,
  checklistDone,
  checklistProgress,
  events,
  incident,
  incidentEvent,
  incidentTravel,
  passwordAgeDays,
  peakEvent,
  pendingSteps,
  product,
} from "./data";

// The recovery card as a Swiss bulletin — the production port of
// samples/swiss-poster.tsx (the sample Aayushi approved), with every
// value read from src/data.ts instead of written in by hand.
const ev = incidentEvent;
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const coord = (lat: number, lng: number) => `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
const dateOf = (label: string) => label.split(" · ")[0];
const timeOf = (label: string) => label.split(" · ")[1] ?? label;

// The sign-in before the incident — Kabir's own, from Bengaluru.
const prevSuccess = events.filter((e) => e.result === "success" && e.utcMs < ev.utcMs).at(-1)!;
const peakFactor = accountFactors[0];

export default function RecoveryCanvas() {
  return (
    <Canvas
      theme={latchkey}
      width={1080}
      height={1350}
      title={`Latchkey — security bulletin ${incident.id}`}
      style={{ backgroundColor: palette.paper, padding: [40, 64], gap: 0 }}
    >
      {/* ——— Masthead ——— */}
      <Masthead
        right={`Security Bulletin — ${incident.id}`}
        metaLeft={`Issued — ${dateOf(ev.timeLabel)} · ${timeOf(ev.timeLabel)}`}
        metaCenter={`Account — ${account.holder} · ${account.homeCity.name}`}
        metaRight={
          <>
            {"Status — "}
            <Span style={{ color: palette.red, fontWeight: 600 }}>
              {accountBand.key === "high" ? "Action required" : accountBand.label}
            </Span>
          </>
        }
      />

      {/* ——— 01 · The alert ——— */}
      <Column style={{ gap: 16, padding: [16, 0, 0] }}>
        <SectionLabel index="01" label="The alert" right={`Sign-in ${ev.id}`} />
        <Row style={{ gap: 40 }}>
          <Column style={{ flex: 1.85 }}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontWeight: 900,
                fontSize: 66,
                lineHeight: 1.0,
                letterSpacing: -0.5,
                textTransform: "uppercase",
              }}
            >
              A sign-in
              <LineBreak />
              we <Span style={{ color: palette.red }}>don’t</Span>
              <LineBreak />
              <Span style={{ color: palette.red }}>recognize.</Span>
            </Text>
          </Column>
          <Column
            style={{
              flex: 1,
              gap: 8,
              border: { left: { width: 2, style: "solid", color: palette.ink } },
              padding: [2, 0, 0, 24],
            }}
          >
            <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, letterSpacing: 1.5, textTransform: "uppercase" }}>
              Event risk — {ev.id}
            </Text>
            <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 76, lineHeight: 0.95, color: palette.red }}>
              {ev.risk}
              <Span style={{ fontSize: 26, fontWeight: 700, color: palette.ink }}> / 100</Span>
            </Text>
            <Divider style={{ borderTop: { width: 1, style: "solid", color: palette.ink } }} />
            <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 19, textTransform: "uppercase", letterSpacing: 0.3 }}>
              {ev.cityInfo.name}, {ev.cityInfo.country}
            </Text>
            <Column style={{ gap: 3 }}>
              <Text style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 13.5, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {timeOf(ev.timeLabel)} · {dateOf(ev.timeLabel)}
              </Text>
              <Text style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 13.5, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {ev.device}
              </Text>
              <Text style={{ fontFamily: fonts.display, fontWeight: 500, fontSize: 13.5, textTransform: "uppercase", letterSpacing: 0.4 }}>
                {ev.browser.split(" · ")[0]} · IP {ev.ip}
              </Text>
            </Column>
          </Column>
        </Row>
      </Column>

      {/* ——— 02 · The route ——— */}
      <Column style={{ gap: 12, padding: [16, 0, 0] }}>
        <SectionLabel
          index="02"
          label="The route"
          right={`${incidentTravel.fromCity.name} to ${incidentTravel.toCity.name} — positions from lat/lon`}
        />
        <SwissMap width={756} />
        <Row style={{ gap: 16, alignItems: "center" }}>
          <Row style={{ gap: 8, alignItems: "center", flex: 1 }}>
            <Column style={{ width: 8, height: 8, backgroundColor: palette.red, flex: "none" }} />
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>
              {ev.cityInfo.name}, {ev.cityInfo.country} — Threat · {coord(ev.cityInfo.lat, ev.cityInfo.lng)} · {timeOf(ev.timeLabel)}
            </Text>
          </Row>
          <Row style={{ gap: 8, alignItems: "center" }}>
            <Column style={{ width: 8, height: 8, backgroundColor: palette.ink, flex: "none" }} />
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 0.8, textTransform: "uppercase" }}>
              {prevSuccess.cityInfo.name}, {prevSuccess.cityInfo.country} — Home · {coord(prevSuccess.cityInfo.lat, prevSuccess.cityInfo.lng)} · {timeOf(prevSuccess.timeLabel)}
            </Text>
          </Row>
        </Row>
      </Column>

      {/* ——— Verdict band ——— */}
      <Column style={{ padding: [14, 0, 0, 0] }}>
        <Column style={{ backgroundColor: palette.red, padding: [12, 20] }}>
          <Text
            style={{
              color: palette.paper,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 21,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              lineHeight: 1.2,
            }}
          >
            {num(incidentTravel.distanceKm)} km in {incidentTravel.minutes} minutes = {num(incidentTravel.speedKmh)} km/h — Impossible travel
          </Text>
        </Column>
      </Column>

      {/* ——— 03 · Account risk ——— */}
      <Column style={{ gap: 14, padding: [14, 0, 0] }}>
        <SectionLabel index="03" label="Account risk" right={`Computed from ${events.length} sign-ins · 24 h`} />
        <Row style={{ gap: 40 }}>
          <Column style={{ gap: 12 }}>
            <Row style={{ gap: 14, alignItems: "end" }}>
              <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 86, lineHeight: 0.9 }}>
                {accountScore}
              </Text>
              <Column style={{ gap: 2, padding: [0, 0, 8] }}>
                <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 21, lineHeight: 1 }}>/ 100</Text>
                <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 33, lineHeight: 1, color: palette.red }}>
                  {accountBand.label}
                </Text>
              </Column>
            </Row>
            <Meter value={accountScore} width={440} />
            <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase" }}>
              Band {bandRange(accountBand)} = {accountBand.label} · Peak event {peakEvent.risk}
            </Text>
          </Column>
          <Column style={{ flex: 1, border: { left: { width: 2, style: "solid", color: palette.ink } }, padding: [0, 0, 0, 24] }}>
            <FactorRow label="Peak event (24 h)" value={`${peakFactor.points}`} first />
            <FactorRow label="Password age" value={`${passwordAgeDays} days`} />
            <FactorRow label="Multi-factor auth" value={account.mfaEnabled ? "On" : "Off"} />
            <FactorRow
              label="Recovery email"
              value={account.recoveryEmailVerified ? "Verified" : "Unverified"}
              red={!account.recoveryEmailVerified}
            />
          </Column>
        </Row>
      </Column>

      {/* ——— 04 · Recovery ——— */}
      <Column style={{ gap: 14, padding: [12, 0, 0] }}>
        <SectionLabel index="04" label="Recovery — three steps now" right="Then two more" />
        <Row style={{ gap: 0 }}>
          {pendingSteps.slice(0, 3).map((step, i) => (
            <Column
              key={step.title}
              style={{
                flex: 1,
                gap: 8,
                border: i > 0 ? { left: { width: 2, style: "solid", color: palette.ink } } : undefined,
                padding: i === 0 ? [0, 22, 0, 0] : i === 1 ? [0, 22, 0, 22] : [0, 0, 0, 22],
              }}
            >
              <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 30, lineHeight: 1, color: palette.red }}>
                {i + 1}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fontSize: 18,
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                }}
              >
                {step.title}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontWeight: 500, fontSize: 14, lineHeight: 1.42 }}>{step.text}</Text>
            </Column>
          ))}
        </Row>
        <Column style={{ gap: 8, padding: [4, 0, 0] }}>
          <Meter value={checklistProgress} width={952} height={12} />
          <Row style={{ gap: 16 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase", flex: 1 }}>
              Recovery — {checklistProgress}% complete
            </Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 11, letterSpacing: 1.2, textTransform: "uppercase" }}>
              {checklistDone} of {checklist.length} steps done
            </Text>
          </Row>
        </Column>
      </Column>

      {/* ——— Footer ——— */}
      <Column style={{ gap: 12, padding: [14, 0, 0] }}>
        <Divider style={{ borderTop: { width: 3, style: "solid", color: palette.ink } }} />
        <Row style={{ gap: 16 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", flex: 1 }}>
            {product.name} — {product.tagline}
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 10.5, letterSpacing: 1.2, textTransform: "uppercase", textAlign: "right" }}>
            Sample template · All names, devices and events are fictional
          </Text>
        </Row>
      </Column>
    </Canvas>
  );
}
