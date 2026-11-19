import React from "react";
import {
  Button,
  Column,
  Email,
  Grid,
  Heading,
  List,
  ListItem,
  Row,
  Section,
  Span,
  Text,
} from "@hyper-elements/react";
import { fonts, latchkey, palette } from "./theme";
import { Fact, Stamp, Wordmark } from "./components";
import {
  account,
  actionsTaken,
  demoBaseUrl,
  incident,
  incidentEvent,
  incidentTravel,
  product,
  securityCenterUrl,
} from "./data";

// The sign-in alert as a Swiss bulletin, in email-safe tables: masthead
// strip, huge Archivo headline, the ruled event record with a flat
// segmented meter, the red verdict band, square buttons. No Svg — the
// bulletin language is type, rules and one red.
const ev = incidentEvent;
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const dateOf = (label: string) => label.split(" · ")[0];
const timeOf = (label: string) => label.split(" · ")[1] ?? label;
const SEGMENTS = 20;
const filled = Math.round((ev.risk / 100) * SEGMENTS);
const firedLine = ev.signals
  .filter((s) => s.fired)
  .map((s) => `${s.label.toLowerCase()} ${s.weightLabel}`)
  .join(" · ");

/** A hard black rule, built as a strip section (email-safe). */
function RuleStrip({ height = 3 }: { height?: number }) {
  return (
    <Section style={{ backgroundColor: palette.ink, padding: [0, 40] }}>
      <Text style={{ fontSize: height, lineHeight: 1, color: palette.ink }}>·</Text>
    </Section>
  );
}

const metaText = {
  fontFamily: fonts.mono,
  fontSize: 9.5,
  letterSpacing: 1.6,
  textTransform: "uppercase" as const,
  fontWeight: 600,
};

export default function SecurityAlertEmail() {
  return (
    <Email
      theme={latchkey}
      width={600}
      title="Latchkey — a sign-in we don't recognize"
      previewText={`Suspicious sign-in: ${ev.cityInfo.name}, ${ev.cityInfo.country} at ${timeOf(ev.timeLabel)} — event risk ${ev.risk} (${ev.band.label}). If this wasn't you, secure your account.`}
      style={{ backgroundColor: palette.paper, gap: 0 }}
    >
      {/* Masthead */}
      <Section style={{ backgroundColor: palette.paper, padding: [32, 40, 20] }}>
        <Column style={{ gap: 12 }}>
          <Grid columns={2} style={{ gap: 12, alignItems: "center" }}>
            <Wordmark fontSize={23} />
            <Text style={{ ...metaText, textAlign: "right" }}>
              Security Bulletin — {incident.id}
            </Text>
          </Grid>
        </Column>
      </Section>
      <RuleStrip height={3} />
      <Section style={{ backgroundColor: palette.paper, padding: [12, 40, 6] }}>
        <Grid columns={2} style={{ gap: 10 }}>
          <Text style={metaText}>
            Issued — {dateOf(ev.timeLabel)} · {timeOf(ev.timeLabel)}
          </Text>
          <Text style={{ ...metaText, textAlign: "right" }}>
            Status — <Span style={{ color: palette.red }}>Action required</Span>
          </Text>
        </Grid>
      </Section>

      {/* Headline + intro */}
      <Section style={{ backgroundColor: palette.paper, padding: [24, 40, 8] }}>
        <Column style={{ gap: 16 }}>
          <Heading level={1} style={{ fontSize: 39, lineHeight: 1.02, textTransform: "uppercase", letterSpacing: -0.3 }}>
            A sign-in we <Span style={{ color: palette.red }}>don’t recognize.</Span>
          </Heading>
          <Text style={{ fontFamily: fonts.body, fontSize: 15, lineHeight: 1.55 }}>
            {account.firstName}, someone signed in to your Latchkey account from a device and a
            place we have never seen — minutes after your own sign-in, an ocean away. Here is
            exactly what we recorded.
          </Text>
        </Column>
      </Section>

      {/* The event record */}
      <Section style={{ backgroundColor: palette.paper, padding: [28, 40, 8] }}>
        <Column style={{ gap: 18 }}>
          <Grid columns={2} style={{ gap: 10 }}>
            <Text style={{ ...metaText, fontSize: 10.5, letterSpacing: 2 }}>
              Sign-in record — {ev.id}
            </Text>
            <Text style={{ ...metaText, fontSize: 10.5, letterSpacing: 2, textAlign: "right", color: palette.red }}>
              Event risk {ev.risk}
            </Text>
          </Grid>
          <Row style={{ gap: 12, alignItems: "end" }}>
            <Text
              style={{
                fontFamily: fonts.display,
                fontWeight: 900,
                fontSize: 62,
                lineHeight: 0.95,
                color: palette.red,
                flex: "none",
              }}
            >
              {ev.risk}
            </Text>
            <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 16, flex: "none", padding: [0, 0, 7] }}>
              / 100 · {ev.band.label}
            </Text>
          </Row>
          <Column style={{ gap: 9 }}>
            <Row style={{ gap: 3 }}>
              {Array.from({ length: SEGMENTS }, (_, i) => (
                <Column
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: i < filled ? palette.ink : palette.paper,
                    border: {
                      top: { width: 1.5, style: "solid", color: palette.ink },
                      bottom: { width: 1.5, style: "solid", color: palette.ink },
                      ...(i === 0 ? { left: { width: 1.5, style: "solid", color: palette.ink } } : {}),
                      ...(i === SEGMENTS - 1 ? { right: { width: 1.5, style: "solid", color: palette.ink } } : {}),
                    },
                    padding: [5, 0],
                  }}
                >
                  <Text style={{ fontSize: 6, color: i < filled ? palette.ink : palette.paper }}>.</Text>
                </Column>
              ))}
            </Row>
            <Grid columns={4} style={{ gap: 6 }}>
              <Text style={{ ...metaText, fontSize: 8.5 }}>0 · Low</Text>
              <Text style={{ ...metaText, fontSize: 8.5 }}>30 · Guarded</Text>
              <Text style={{ ...metaText, fontSize: 8.5 }}>60 · High</Text>
              <Text style={{ ...metaText, fontSize: 8.5, textAlign: "right" }}>100</Text>
            </Grid>
          </Column>
          <Column
            style={{
              border: { top: { width: 2, style: "solid", color: palette.ink } },
              padding: [18, 0, 0],
            }}
          >
            <Grid columns={2} style={{ gap: 16, rowGap: 18 }}>
              <Fact label="Device" value={`${ev.device} · ${ev.browser}`} valueSize={13} />
              <Fact label="Location" value={`${ev.cityInfo.name}, ${ev.cityInfo.country}`} valueSize={13} />
              <Fact label="IP address" value={ev.ip} valueSize={13} />
              <Fact label="Time" value={ev.timeLabel} valueSize={13} />
            </Grid>
          </Column>
        </Column>
      </Section>

      {/* Verdict band */}
      <Section style={{ backgroundColor: palette.red, padding: [20, 40, 22] }}>
        <Column style={{ gap: 8 }}>
          <Text
            style={{
              color: palette.paper,
              fontFamily: fonts.display,
              fontWeight: 700,
              fontSize: 16.5,
              letterSpacing: 0.4,
              textTransform: "uppercase",
              lineHeight: 1.25,
            }}
          >
            {num(incidentTravel.distanceKm)} km in {incidentTravel.minutes} minutes = {num(incidentTravel.speedKmh)} km/h — Impossible travel
          </Text>
          <Text style={{ color: palette.paper, fontFamily: fonts.body, fontSize: 12.5, lineHeight: 1.5 }}>
            Your {incidentTravel.fromCity.name} sign-in and this one cannot both be you. Signals
            fired: {firedLine}.
          </Text>
        </Column>
      </Section>

      {/* Stamp + actions */}
      <Section style={{ backgroundColor: palette.paper, padding: [28, 40, 8] }}>
        <Column style={{ gap: 20 }}>
          <Row style={{ justifyContent: "center" }}>
            <Stamp band={ev.band} small />
          </Row>
          <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 16, textAlign: "center" }}>
            Was this you?
          </Text>
          <Row style={{ gap: 12, justifyContent: "center" }}>
            <Button href={securityCenterUrl}>No — secure my account</Button>
            <Button
              href={demoBaseUrl}
              style={{
                backgroundColor: palette.paper,
                color: palette.ink,
                border: { width: 2, style: "solid", color: palette.ink },
                hover: { backgroundColor: palette.paper },
              }}
            >
              Yes, it was me
            </Button>
          </Row>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 1.5, textAlign: "center" }}>
            If it was you, there is nothing to do — we will learn this device. If it wasn’t,
            choose “secure my account” and we will walk you through recovery.
          </Text>
        </Column>
      </Section>

      {/* Response log */}
      <Section style={{ backgroundColor: palette.paper, padding: [28, 40, 16] }}>
        <Column style={{ gap: 14 }}>
          <Text style={{ ...metaText, fontSize: 10.5, letterSpacing: 2 }}>
            Response log — what we’ve already done
          </Text>
          <List style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 1.5 }}>
            {actionsTaken.map((a) => (
              <ListItem key={a}>{a}</ListItem>
            ))}
          </List>
        </Column>
      </Section>

      {/* Footer */}
      <RuleStrip height={3} />
      <Section style={{ backgroundColor: palette.paper, padding: [22, 40, 36] }}>
        <Column style={{ gap: 10, alignItems: "center" }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 11.5, fontWeight: 600, textAlign: "center" }}>
            {incident.id} · Sent to {account.email}
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12, lineHeight: 1.5, textAlign: "center" }}>
            {product.name} — {product.tagline} This is a sample template — all names, devices
            and events are fictional.
          </Text>
        </Column>
      </Section>
    </Email>
  );
}
