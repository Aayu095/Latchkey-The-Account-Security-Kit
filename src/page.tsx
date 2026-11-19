import React from "react";
import { Column, Divider, Grid, Page, Row, Section, Span, Text } from "@hyper-elements/react";
import { fontFaces, fonts, latchkey, palette } from "./theme";
import { FactorRow, Masthead, Meter, SectionLabel, SignalTag, bandInk, monoLabel } from "./components";
import { SwissMap } from "./worldmap";
import {
  account,
  accountBand,
  accountScore,
  checklist,
  checklistDone,
  checklistProgress,
  disclaimer,
  events,
  incident,
  incidentEvent,
  incidentTravel,
  peakEvent,
  product,
  sessions,
  TRAVEL_SPEED_LIMIT_KMH,
} from "./data";

// The Security Center as a printed Swiss bulletin: masthead, then
// numbered sections divided by hard rules — the alert, the route, the
// full record, the sessions, the recovery. No cards anywhere.
const ev = incidentEvent;
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const coord = (lat: number, lng: number) => `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;
const dateOf = (label: string) => label.split(" · ")[0];
const timeOf = (label: string) => label.split(" · ")[1] ?? label;
const prevSuccess = events.filter((e) => e.result === "success" && e.utcMs < ev.utcMs).at(-1)!;

function StripFact({ label, value, red = false }: { label: string; value: string; red?: boolean }) {
  return (
    <Column style={{ gap: 6 }}>
      <Text style={{ ...monoLabel, fontSize: 9.5, letterSpacing: 2, fontWeight: 600 }}>{label}</Text>
      <Text
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 16,
          color: red ? palette.red : palette.ink,
        }}
      >
        {value}
      </Text>
    </Column>
  );
}

export default function SecurityCenterPage() {
  const rows = [...events].reverse();
  return (
    <Page
      theme={latchkey}
      width={1120}
      title={`Security Center — ${account.holder} — Latchkey`}
      description="Latchkey Security Center: a suspicious sign-in traced on the route map, the computed risk behind it, and the recovery checklist — set as a Swiss bulletin."
      fonts={fontFaces}
      style={{ backgroundColor: palette.paper, gap: 0 }}
    >
      <Section style={{ backgroundColor: palette.paper, padding: [48, 64, 56] }}>
        <Column style={{ gap: 0 }}>
          <Masthead
            right={`Security Bulletin — ${incident.id}`}
            metaLeft={`Issued — ${dateOf(ev.timeLabel)} · ${timeOf(ev.timeLabel)}`}
            metaCenter={`Account — ${account.holder} · ${account.homeCity.name}`}
            metaRight={
              <>
                {"Status — "}
                <Span style={{ color: palette.red, fontWeight: 600 }}>
                  {accountBand.key === "high" ? "Action required" : accountBand.label}
                </Span>
              </>
            }
          />

          {/* ——— 01 · The alert ——— */}
          <Column style={{ gap: 20, padding: [32, 0, 0] }}>
            <SectionLabel index="01" label="The alert" right={`Sign-in ${ev.id}`} rightWidth={200} />
            <Row style={{ gap: 44 }}>
              <Column style={{ flex: 1.85, gap: 20 }}>
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
                  A sign-in we <Span style={{ color: palette.red }}>don’t recognize.</Span>
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 16, lineHeight: 1.55, maxWidth: 580 }}>
                  At {timeOf(ev.timeLabel)}, an unrecognized Windows device signed in from{" "}
                  {ev.cityInfo.name}, {ev.cityInfo.country} — {incidentTravel.minutes} minutes
                  after your own sign-in from {incidentTravel.fromCity.name}. The route below
                  is the journey that sign-in claims to have made. Both cannot be you. This
                  page is the whole file: what happened, how the risk was scored, and how to
                  close it.
                </Text>
              </Column>
              <Column
                style={{
                  flex: 1,
                  gap: 8,
                  border: { left: { width: 2, style: "solid", color: palette.ink } },
                  padding: [2, 0, 0, 28],
                }}
              >
                <Text style={{ ...monoLabel, fontSize: 11.5, letterSpacing: 1.5 }}>Event risk — {ev.id}</Text>
                <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 84, lineHeight: 0.95, color: palette.red }}>
                  {ev.risk}
                  <Span style={{ fontSize: 24, fontWeight: 700, color: palette.ink }}> / 100</Span>
                </Text>
                <Divider style={{ borderTop: { width: 1, style: "solid", color: palette.ink } }} />
                <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 19, textTransform: "uppercase", letterSpacing: 0.3, padding: [4, 0, 2] }}>
                  {ev.cityInfo.name}, {ev.cityInfo.country}
                </Text>
                <FactorRow label="Time" value={timeOf(ev.timeLabel)} first labelSize={13} valueSize={12.5} />
                <FactorRow label="Date" value={dateOf(ev.timeLabel)} labelSize={13} valueSize={12.5} />
                <FactorRow label="Device" value={ev.device} labelSize={13} valueSize={12.5} />
                <FactorRow label="Browser" value={ev.browser} labelSize={13} valueSize={12.5} />
                <FactorRow label="IP address" value={ev.ip} labelSize={13} valueSize={12.5} />
                <FactorRow label="Local time" value={ev.localLabel} labelSize={13} valueSize={12.5} />
              </Column>
            </Row>
            <Column style={{ gap: 16, padding: [16, 0, 0] }}>
              <Divider style={{ borderTop: { width: 2, style: "solid", color: palette.ink } }} />
              <Grid columns={4} style={{ gap: 24 }}>
                <StripFact label="Incident" value={incident.id} />
                <StripFact label="Opened" value={incident.openedLabel} />
                <StripFact label="Peak event risk" value={`${peakEvent.risk} · ${peakEvent.band.label}`} red />
                <StripFact label="Account risk" value={`${accountScore} · ${accountBand.label}`} red />
              </Grid>
            </Column>
          </Column>

          {/* ——— 02 · The route ——— */}
          <Column style={{ gap: 16, padding: [40, 0, 0] }}>
            <SectionLabel
              index="02"
              label="The route"
              right={`${incidentTravel.fromCity.name} to ${incidentTravel.toCity.name} — positions from lat/lon`}
              rightWidth={430}
            />
            <SwissMap width={988} />
            <Row style={{ gap: 16, alignItems: "center" }}>
              <Row style={{ gap: 8, alignItems: "center", flex: 1 }}>
                <Column style={{ width: 8, height: 8, backgroundColor: palette.red, flex: "none" }} />
                <Text style={{ ...monoLabel, fontSize: 11, letterSpacing: 0.8 }}>
                  {ev.cityInfo.name}, {ev.cityInfo.country} — Threat · {coord(ev.cityInfo.lat, ev.cityInfo.lng)} · {timeOf(ev.timeLabel)}
                </Text>
              </Row>
              <Row style={{ gap: 8, alignItems: "center" }}>
                <Column style={{ width: 8, height: 8, backgroundColor: palette.ink, flex: "none" }} />
                <Text style={{ ...monoLabel, fontSize: 11, letterSpacing: 0.8 }}>
                  {prevSuccess.cityInfo.name}, {prevSuccess.cityInfo.country} — Home · {coord(prevSuccess.cityInfo.lat, prevSuccess.cityInfo.lng)} · {timeOf(prevSuccess.timeLabel)}
                </Text>
              </Row>
            </Row>
            <Column style={{ backgroundColor: palette.red, padding: [14, 24] }}>
              <Text
                style={{
                  color: palette.paper,
                  fontFamily: fonts.display,
                  fontWeight: 700,
                  fontSize: 20,
                  letterSpacing: 0.5,
                  textTransform: "uppercase",
                  lineHeight: 1.2,
                }}
              >
                {num(incidentTravel.distanceKm)} km in {incidentTravel.minutes} minutes = {num(incidentTravel.speedKmh)} km/h — Impossible travel
              </Text>
            </Column>
            <Text style={{ fontFamily: fonts.mono, fontSize: 12 }}>
              {num(incidentTravel.distanceKm)} km ÷ {incidentTravel.hours.toFixed(2)} h = {num(incidentTravel.speedKmh)} km/h
              &gt; {TRAVEL_SPEED_LIMIT_KMH} km/h limit → signal IMPOSSIBLE_TRAVEL fires (+30). Distance by haversine
              between the two sign-ins’ coordinates.
            </Text>
          </Column>

          {/* ——— 03 · The record ——— */}
          <Column style={{ gap: 12, padding: [40, 0, 0] }}>
            <SectionLabel index="03" label="The record" right={`${events.length} sign-ins · 24 h · newest first`} rightWidth={300} />
            <Row style={{ gap: 20, padding: [12, 0, 10] }}>
              <Text style={{ ...monoLabel, fontSize: 9.5, letterSpacing: 2, fontWeight: 600, width: 148 }}>Time · IST</Text>
              <Text style={{ ...monoLabel, fontSize: 9.5, letterSpacing: 2, fontWeight: 600, flex: 1 }}>Event</Text>
              <Text style={{ ...monoLabel, fontSize: 9.5, letterSpacing: 2, fontWeight: 600, width: 288 }}>Signals fired</Text>
              <Text style={{ ...monoLabel, fontSize: 9.5, letterSpacing: 2, fontWeight: 600, width: 104, textAlign: "right" }}>Risk</Text>
            </Row>
            <Divider style={{ borderTop: { width: 2, style: "solid", color: palette.ink } }} />
            {rows.map((e) => {
              const isIncident = e.id === ev.id;
              const tags = e.signals.filter((s) => s.fired);
              return (
                <Row
                  key={e.id}
                  style={{
                    gap: 20,
                    padding: [20, 0],
                    alignItems: "center",
                    border: { bottom: { width: 1, style: "solid", color: palette.ink } },
                  }}
                >
                  <Column style={{ width: 148, gap: 4 }}>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 13.5, fontWeight: 600 }}>{timeOf(e.timeLabel)}</Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>{dateOf(e.timeLabel)}</Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 10.5 }}>{e.id}</Text>
                  </Column>
                  <Column style={{ flex: 1, gap: 6 }}>
                    <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 17 }}>
                      {e.result === "failed" ? (
                        "Failed password attempt"
                      ) : isIncident ? (
                        <>
                          Signed in — <Span style={{ color: palette.red }}>the incident</Span>
                        </>
                      ) : (
                        "Signed in"
                      )}
                    </Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 12 }}>
                      {e.cityInfo.name}, {e.cityInfo.country} · {e.device} · {e.browser} · IP {e.ip}
                    </Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>
                      {coord(e.cityInfo.lat, e.cityInfo.lng)} · {e.localLabel} local
                    </Text>
                  </Column>
                  <Column style={{ width: 288 }}>
                    {tags.length > 0 ? (
                      <Row style={{ gap: 7, flexWrap: "wrap" }}>
                        {tags.map((t) => (
                          <SignalTag key={t.key} label={t.label} accent={isIncident} />
                        ))}
                      </Row>
                    ) : (
                      <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>— No signals</Text>
                    )}
                  </Column>
                  <Column style={{ width: 104, gap: 1, alignItems: "end" }}>
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontWeight: 900,
                        fontSize: 38,
                        lineHeight: 1,
                        color: isIncident ? palette.red : palette.ink,
                      }}
                    >
                      {e.risk}
                    </Text>
                    <Text style={{ ...monoLabel, fontSize: 10, fontWeight: 600, color: bandInk(e.band) }}>{e.band.label}</Text>
                  </Column>
                </Row>
              );
            })}
          </Column>

          {/* ——— 04 · Sessions ——— */}
          <Column style={{ gap: 12, padding: [40, 0, 0] }}>
            <SectionLabel index="04" label="Sessions" right="States derived from the sign-in record" rightWidth={330} />
            <Divider style={{ borderTop: { width: 2, style: "solid", color: palette.ink } }} />
            {sessions.map((s) => {
              const suspicious = s.state === "suspicious";
              return (
                <Row
                  key={s.device}
                  style={{
                    gap: 20,
                    padding: [20, 0],
                    alignItems: "center",
                    border: { bottom: { width: 1, style: "solid", color: palette.ink } },
                  }}
                >
                  <Column style={{ flex: 1, gap: 6 }}>
                    <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 17 }}>{s.device}</Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 12 }}>
                      {s.city.name}, {s.city.country} · {s.browser}
                    </Text>
                    <Text style={{ fontFamily: fonts.mono, fontSize: 11 }}>
                      {coord(s.city.lat, s.city.lng)} — {s.city.tzLabel}
                    </Text>
                  </Column>
                  <Text style={{ fontFamily: fonts.mono, fontSize: 11, width: 130 }}>SESSION · {s.linkedEventId}</Text>
                  <Column style={{ width: 250, gap: 4, alignItems: "end" }}>
                    <Text
                      style={{
                        ...monoLabel,
                        fontSize: 12,
                        fontWeight: 600,
                        textAlign: "right",
                        color: suspicious ? palette.red : palette.ink,
                      }}
                    >
                      {suspicious ? "■ " : ""}
                      {s.stateLabel}
                    </Text>
                    <Text style={{ fontFamily: fonts.body, fontSize: 12.5, textAlign: "right" }}>
                      {s.lastActiveLabel}
                      {suspicious ? " — flagged by this incident" : ""}
                    </Text>
                  </Column>
                </Row>
              );
            })}
            <Text style={{ fontFamily: fonts.body, fontSize: 14, lineHeight: 1.55, maxWidth: 740, padding: [20, 0, 0] }}>
              A session’s state is derived from the sign-in that opened it: the {ev.cityInfo.name}{" "}
              session belongs to the incident event, so it is marked suspicious and has already
              been signed out. Your own devices are untouched.
            </Text>
          </Column>

          {/* ——— 05 · Recovery ——— */}
          <Column style={{ gap: 20, padding: [40, 0, 0] }}>
            <SectionLabel index="05" label="Recovery" right={`Computed — ${checklistDone} of ${checklist.length} done`} rightWidth={260} />
            <Row style={{ gap: 44 }}>
              <Column style={{ width: 360, gap: 16 }}>
                <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 31, lineHeight: 1.05, textTransform: "uppercase" }}>
                  Close the door, step by step.
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 14.5, lineHeight: 1.55 }}>
                  Two steps are already done — one by you, one by {product.name}. Three remain,
                  and the first of them matters most: that password is retired as of tonight.
                </Text>
                <Column style={{ gap: 8 }}>
                  <Meter value={checklistProgress} width={330} height={12} />
                  <Text style={{ ...monoLabel, fontSize: 11 }}>
                    Recovery — {checklistProgress}% complete · {checklistDone} of {checklist.length} steps done
                  </Text>
                </Column>
              </Column>
              <Column style={{ flex: 1 }}>
                {checklist.map((step, i) => (
                  <Row
                    key={step.title}
                    style={{
                      gap: 18,
                      padding: [18, 0],
                      alignItems: "center",
                      border: { top: { width: i === 0 ? 2 : 1, style: "solid", color: palette.ink } },
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: fonts.display,
                        fontWeight: 900,
                        fontSize: 24,
                        lineHeight: 1,
                        width: 34,
                        color: step.done ? palette.ink : palette.red,
                      }}
                    >
                      {i + 1}
                    </Text>
                    <Column style={{ flex: 1, gap: 4 }}>
                      <Grid columns={2} style={{ gap: 12, alignItems: "center" }}>
                        <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 16, textTransform: "uppercase" }}>
                          {step.title}
                        </Text>
                        <Text
                          style={{
                            ...monoLabel,
                            fontSize: 9.5,
                            letterSpacing: 1.6,
                            fontWeight: 600,
                            textAlign: "right",
                            color: step.done ? palette.ink : palette.red,
                          }}
                        >
                          {step.done ? "■ Done" : step.by === "latchkey" ? "By Latchkey" : "By you"}
                        </Text>
                      </Grid>
                      <Text style={{ fontFamily: fonts.body, fontSize: 13.5, lineHeight: 1.45 }}>{step.text}</Text>
                    </Column>
                  </Row>
                ))}
                <Divider style={{ borderTop: { width: 2, style: "solid", color: palette.ink } }} />
              </Column>
            </Row>
          </Column>

          {/* ——— Footer ——— */}
          <Column style={{ gap: 12, padding: [48, 0, 0] }}>
            <Divider style={{ borderTop: { width: 3, style: "solid", color: palette.ink } }} />
            <Row style={{ gap: 16 }}>
              <Text style={{ ...monoLabel, fontSize: 10.5, flex: 1 }}>
                {product.name} — {product.tagline}
              </Text>
              <Text style={{ ...monoLabel, fontSize: 10.5, textAlign: "right" }}>
                End of bulletin · {incident.id}
              </Text>
            </Row>
            <Text style={{ fontFamily: fonts.body, fontSize: 12, lineHeight: 1.5, maxWidth: 780 }}>{disclaimer}</Text>
          </Column>
        </Column>
      </Section>
    </Page>
  );
}
