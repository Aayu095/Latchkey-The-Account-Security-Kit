import React from "react";
import {
  Column,
  Document,
  Grid,
  Heading,
  LineBreak,
  List,
  ListItem,
  PageBreak,
  PageFooter,
  PageHeader,
  PageNumber,
  Row,
  Span,
  Table,
  TableCell,
  TableRow,
  Text,
} from "@hyper-elements/react";
import { fontFaces, fonts, latchkey, palette } from "./theme";
import { Fact, Meter, Stamp, bandRange } from "./components";
import { SwissMap } from "./worldmap";
import {
  account,
  accountBand,
  accountFactors,
  accountScore,
  actionsTaken,
  events,
  failedAttempts,
  incident,
  incidentEvent,
  incidentTravel,
  product,
  recommendations,
  TRAVEL_SPEED_LIMIT_KMH,
} from "./data";

// The incident report as a printed Swiss bulletin: paper ground, black
// rules, inverted black table headers, the flat route map and the red
// verdict band on page 1; the full arithmetic on page 2.
const ev = incidentEvent;
const num = (n: number) => Math.round(n).toLocaleString("en-IN");
const pts = (n: number) => (n > 0 ? `+${n}` : n < 0 ? `−${-n}` : "0");
const timeOf = (label: string) => label.split("· ")[1] ?? label;
const coord = (lat: number, lng: number) => `${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E`;

const headCell = {
  fontFamily: fonts.mono,
  fontSize: 8.5,
  letterSpacing: 1.6,
  textTransform: "uppercase" as const,
  fontWeight: 600,
  color: palette.paper,
};
const monoCell = { fontFamily: fonts.mono, fontSize: 10, color: palette.ink };
const tableStyle = {
  border: { width: 1.5, style: "solid", color: palette.ink },
  cellPadding: [6.5, 9] as [number, number],
  rowBorder: { width: 1, style: "solid", color: palette.ink },
};

function DocSection({ index, title, right }: { index: string; title: string; right?: string }) {
  return (
    <Row style={{ gap: 10, alignItems: "end" }}>
      <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 12.5, color: palette.red, lineHeight: 1, width: 24 }}>
        {index}
      </Text>
      <Text
        style={{
          fontFamily: fonts.display,
          fontWeight: 700,
          fontSize: 12.5,
          letterSpacing: 1.1,
          textTransform: "uppercase",
          lineHeight: 1,
          flex: 1,
        }}
      >
        {title}
      </Text>
      {right ? (
        <Text style={{ fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 1, textTransform: "uppercase", lineHeight: 1 }}>
          {right}
        </Text>
      ) : null}
    </Row>
  );
}

function MetaCell({ label, value }: { label: string; value: string }) {
  return (
    <TableCell style={{ padding: [9, 12] }}>
      <Span style={{ fontFamily: fonts.mono, fontSize: 8, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
        {label}
      </Span>
      <LineBreak />
      <Span style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 12.5 }}>{value}</Span>
    </TableCell>
  );
}

export default function IncidentReportDocument() {
  return (
    <Document
      theme={latchkey}
      size="A4"
      margin={46}
      title={`Incident report ${incident.id} — ${account.holder} — Latchkey`}
      fonts={fontFaces}
      style={{ backgroundColor: palette.paper, gap: 0 }}
    >
      <PageHeader
        style={{
          padding: [6, 2, 8],
          border: { bottom: { width: 3, style: "solid", color: palette.ink } },
        }}
      >
        <Row style={{ gap: 10, alignItems: "center" }}>
          <Column style={{ width: 11, height: 11, backgroundColor: palette.ink, flex: "none" }} />
          <Text style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 900, letterSpacing: 2.5, flex: 1 }}>
            LATCHKEY
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 9, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
            Incident report · {incident.id}
          </Text>
        </Row>
      </PageHeader>

      <PageFooter
        style={{
          padding: [8, 0, 0],
          border: { top: { width: 1, style: "solid", color: palette.ink } },
        }}
      >
        <Row style={{ gap: 12, alignItems: "center" }}>
          <Text style={{ fontSize: 8.5, flex: 1 }}>
            Sample data — all names, devices, IP addresses and events are fictional. {product.name} ·
            incident report {incident.id}.
          </Text>
          <Text style={{ fontSize: 9, fontWeight: 600 }}>
            Page <PageNumber /> of <PageNumber total />
          </Text>
        </Row>
      </PageFooter>

      {/* ——— Page 1 ——— */}
      <Column style={{ gap: 14 }}>
        <Column style={{ gap: 7 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
            Incident report · {incident.id} · Evidence enclosed
          </Text>
          <Heading level={1} style={{ fontSize: 27, textTransform: "uppercase", letterSpacing: -0.3 }}>
            A sign-in we <Span style={{ color: palette.red }}>don’t recognize.</Span>
          </Heading>
          <Text style={{ fontFamily: fonts.body, fontSize: 11.5, lineHeight: 1.5 }}>
            At {timeOf(ev.timeLabel)} on {ev.timeLabel.split(" · ")[0]}, an unrecognized Windows
            device signed in to {account.holder}’s account from {ev.cityInfo.name},{" "}
            {ev.cityInfo.country} — {incidentTravel.minutes} minutes after the account’s own
            sign-in from {incidentTravel.fromCity.name}, and after {failedAttempts.length} failed
            password attempts through a VPN exit node. The sign-in succeeded on a correct
            password. This report is the complete record.
          </Text>
          <Text style={{ fontFamily: fonts.mono, fontSize: 9.5 }}>
            ACCOUNT {account.email} · LATCHKEY ID SINCE {account.idSince} · OPENED {incident.openedLabel.toUpperCase()}
          </Text>
        </Column>

        {/* Verdict row — the computed account score + the stamp */}
        <Row style={{ gap: 22, alignItems: "center", padding: [6, 0] }}>
          <Column style={{ gap: 7 }}>
            <Text style={{ fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
              Account risk — computed
            </Text>
            <Row style={{ gap: 10, alignItems: "end" }}>
              <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 46, lineHeight: 0.9 }}>
                {accountScore}
              </Text>
              <Column style={{ gap: 1, padding: [0, 0, 3] }}>
                <Text style={{ fontFamily: fonts.display, fontWeight: 700, fontSize: 13, lineHeight: 1 }}>/ 100</Text>
                <Text style={{ fontFamily: fonts.display, fontWeight: 900, fontSize: 19, lineHeight: 1, color: palette.red }}>
                  {accountBand.label}
                </Text>
              </Column>
            </Row>
            <Meter value={accountScore} width={176} height={10} />
          </Column>
          <Column style={{ flex: 1 }} />
          <Column style={{ width: 300, alignItems: "end" }}>
            <Stamp band={accountBand} small />
          </Column>
        </Row>

        {/* 01 · The route */}
        <Column style={{ gap: 10 }}>
          <DocSection index="01" title="The route — the impossible journey" right="Positions computed from lat/lon" />
          <SwissMap width={492} />
          <Row style={{ gap: 14, alignItems: "center" }}>
            <Row style={{ gap: 7, alignItems: "center", flex: 1 }}>
              <Column style={{ width: 7, height: 7, backgroundColor: palette.red, flex: "none" }} />
              <Text style={{ fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 0.6, textTransform: "uppercase" }}>
                {ev.cityInfo.name} — Threat · {coord(ev.cityInfo.lat, ev.cityInfo.lng)}
              </Text>
            </Row>
            <Row style={{ gap: 7, alignItems: "center" }}>
              <Column style={{ width: 7, height: 7, backgroundColor: palette.ink, flex: "none" }} />
              <Text style={{ fontFamily: fonts.mono, fontSize: 8.5, letterSpacing: 0.6, textTransform: "uppercase" }}>
                {incidentTravel.fromCity.name} — Home · {coord(incidentTravel.fromCity.lat, incidentTravel.fromCity.lng)}
              </Text>
            </Row>
          </Row>
          <Column style={{ backgroundColor: palette.red, padding: [10, 14] }}>
            <Text
              style={{
                color: palette.paper,
                fontFamily: fonts.display,
                fontWeight: 700,
                fontSize: 13.5,
                letterSpacing: 0.4,
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              {num(incidentTravel.distanceKm)} km in {incidentTravel.minutes} minutes = {num(incidentTravel.speedKmh)} km/h — Impossible travel
            </Text>
          </Column>
          <Grid columns={3} style={{ gap: 14 }}>
            <Fact label="Distance (haversine)" value={`${num(incidentTravel.distanceKm)} km`} valueSize={12.5} />
            <Fact label="Elapsed" value={`${incidentTravel.minutes} min (${incidentTravel.hours.toFixed(2)} h)`} valueSize={12.5} />
            <Fact label="Required speed" value={`${num(incidentTravel.speedKmh)} km/h`} valueSize={12.5} accent />
          </Grid>
          <Text style={{ fontFamily: fonts.mono, fontSize: 9.5 }}>
            {num(incidentTravel.distanceKm)} km ÷ {incidentTravel.hours.toFixed(2)} h ={" "}
            {num(incidentTravel.speedKmh)} km/h &gt; {TRAVEL_SPEED_LIMIT_KMH} km/h limit → signal
            IMPOSSIBLE_TRAVEL fires (+30).
          </Text>
        </Column>

        {/* 02 · Event log */}
        <Column style={{ gap: 10 }}>
          <DocSection index="02" title="Event log — 24 hours, all times IST" />
          <Table style={tableStyle}>
            <TableRow header style={{ backgroundColor: palette.ink }}>
              <TableCell style={{ ...headCell, width: 72 }}>Time</TableCell>
              <TableCell style={{ ...headCell, width: 112 }}>Location</TableCell>
              <TableCell style={headCell}>Device</TableCell>
              <TableCell style={{ ...headCell, width: 94 }}>IP</TableCell>
              <TableCell style={{ ...headCell, width: 64 }}>Result</TableCell>
              <TableCell style={{ ...headCell, width: 44, textAlign: "right" }}>Risk</TableCell>
            </TableRow>
            {events.map((e) => (
              <TableRow key={e.id}>
                <TableCell style={monoCell}>{timeOf(e.timeLabel)}</TableCell>
                <TableCell style={{ fontSize: 10.5, fontWeight: e.id === ev.id ? 700 : 400 }}>
                  {e.cityInfo.name}
                  {e.id === ev.id ? " — incident" : ""}
                </TableCell>
                <TableCell style={{ fontSize: 10.5 }}>{e.device}</TableCell>
                <TableCell style={monoCell}>{e.ip}</TableCell>
                <TableCell
                  style={{
                    ...monoCell,
                    fontWeight: 600,
                    color: e.result === "success" ? palette.ink : palette.red,
                  }}
                >
                  {e.result === "success" ? "SUCCESS" : "FAILED"}
                </TableCell>
                <TableCell
                  style={{
                    ...monoCell,
                    fontWeight: 600,
                    textAlign: "right",
                    color: e.id === ev.id ? palette.red : palette.ink,
                  }}
                >
                  {e.risk}
                </TableCell>
              </TableRow>
            ))}
          </Table>
        </Column>

        <Table
          style={{
            border: { width: 1.5, style: "solid", color: palette.ink },
            cellPadding: 0,
            rowBorder: { width: 1, style: "solid", color: palette.ink },
          }}
        >
          <TableRow>
            <MetaCell label="Account holder" value={`${account.holder}, ${account.age}`} />
            <MetaCell label="Peak event risk" value={`${ev.risk} / 100 · ${ev.band.label}`} />
            <MetaCell label="Account risk score" value={`${accountScore} / 100 · ${accountBand.label}`} />
          </TableRow>
        </Table>
      </Column>

      <PageBreak />

      {/* ——— Page 2 ——— */}
      <Column style={{ gap: 15 }}>
        <Column style={{ gap: 7 }}>
          <Text style={{ fontFamily: fonts.mono, fontSize: 9.5, letterSpacing: 2, textTransform: "uppercase", fontWeight: 600 }}>
            Page two · How the score was built
          </Text>
          <Heading level={2} style={{ fontSize: 24, textTransform: "uppercase", letterSpacing: -0.3 }}>
            The arithmetic, in full.
          </Heading>
          <Text style={{ fontFamily: fonts.body, fontSize: 11.5, lineHeight: 1.5 }}>
            Every point below is computed from the event record on page one. Change the record —
            a city, an hour, a device — and this page rebuilds itself. Nothing is placed by hand.
          </Text>
        </Column>

        <Column style={{ gap: 10 }}>
          <DocSection index="03" title={`Incident event ${ev.id} — signal by signal`} />
          <Table style={tableStyle}>
            <TableRow header style={{ backgroundColor: palette.ink }}>
              <TableCell style={{ ...headCell, width: 128 }}>Signal</TableCell>
              <TableCell style={{ ...headCell, width: 76 }}>Weight</TableCell>
              <TableCell style={{ ...headCell, width: 46 }}>Fired</TableCell>
              <TableCell style={headCell}>Evidence</TableCell>
              <TableCell style={{ ...headCell, width: 48, textAlign: "right" }}>Points</TableCell>
            </TableRow>
            {ev.signals.map((s) => (
              <TableRow key={s.key}>
                <TableCell style={{ fontSize: 10.5, fontWeight: 600 }}>{s.label}</TableCell>
                <TableCell style={monoCell}>{s.weightLabel}</TableCell>
                <TableCell style={{ ...monoCell, fontWeight: 600, color: s.fired ? palette.red : palette.ink }}>
                  {s.fired ? "YES" : "—"}
                </TableCell>
                <TableCell style={{ fontSize: 10 }}>{s.detail}</TableCell>
                <TableCell style={{ ...monoCell, fontWeight: 600, textAlign: "right" }}>{pts(s.points)}</TableCell>
              </TableRow>
            ))}
            <TableRow style={{ backgroundColor: palette.ink }}>
              <TableCell style={{ fontFamily: fonts.display, fontSize: 11, fontWeight: 700, color: palette.paper }}>
                Event risk
              </TableCell>
              <TableCell style={{ ...monoCell, color: palette.paper }}>sum</TableCell>
              <TableCell style={{ ...monoCell, color: palette.paper }}>—</TableCell>
              <TableCell style={{ fontSize: 10, color: palette.paper }}>
                Band {ev.band.label} ({bandRange(ev.band)})
              </TableCell>
              <TableCell
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 900,
                  fontSize: 13,
                  textAlign: "right",
                  color: palette.paper,
                }}
              >
                {ev.risk}
              </TableCell>
            </TableRow>
          </Table>
        </Column>

        <Column style={{ gap: 10 }}>
          <DocSection index="04" title="Account risk — the blend" />
          <Table style={tableStyle}>
            <TableRow header style={{ backgroundColor: palette.ink }}>
              <TableCell style={{ ...headCell, width: 160 }}>Factor</TableCell>
              <TableCell style={{ ...headCell, width: 80 }}>Weight</TableCell>
              <TableCell style={headCell}>Evidence</TableCell>
              <TableCell style={{ ...headCell, width: 48, textAlign: "right" }}>Points</TableCell>
            </TableRow>
            {accountFactors.map((f) => (
              <TableRow key={f.label}>
                <TableCell style={{ fontSize: 10.5, fontWeight: 600 }}>{f.label}</TableCell>
                <TableCell style={monoCell}>{f.weightLabel}</TableCell>
                <TableCell style={{ fontSize: 10 }}>{f.detail}</TableCell>
                <TableCell style={{ ...monoCell, fontWeight: 600, textAlign: "right" }}>{pts(f.points)}</TableCell>
              </TableRow>
            ))}
            <TableRow style={{ backgroundColor: palette.ink }}>
              <TableCell style={{ fontFamily: fonts.display, fontSize: 11, fontWeight: 700, color: palette.paper }}>
                Account risk score
              </TableCell>
              <TableCell style={{ ...monoCell, color: palette.paper }}>clamped</TableCell>
              <TableCell style={{ fontSize: 10, color: palette.paper }}>
                Band {accountBand.label} ({bandRange(accountBand)})
              </TableCell>
              <TableCell
                style={{
                  fontFamily: fonts.display,
                  fontWeight: 900,
                  fontSize: 13,
                  textAlign: "right",
                  color: palette.paper,
                }}
              >
                {accountScore}
              </TableCell>
            </TableRow>
          </Table>
        </Column>

        <Column style={{ gap: 10 }}>
          <DocSection index="05" title="Actions taken" />
          <List>
            {actionsTaken.map((a) => (
              <ListItem key={a} style={{ fontFamily: fonts.body, fontSize: 11.5, lineHeight: 1.5 }}>{a}</ListItem>
            ))}
          </List>
        </Column>

        <Column style={{ gap: 10 }}>
          <DocSection index="06" title="Recommendations" />
          <List type="number">
            {recommendations.map((r) => (
              <ListItem key={r} style={{ fontFamily: fonts.body, fontSize: 11.5, lineHeight: 1.5 }}>{r}</ListItem>
            ))}
          </List>
        </Column>

        <Row style={{ gap: 20, alignItems: "center", padding: [10, 0, 0] }}>
          <Column style={{ flex: 1, gap: 2 }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 15, fontWeight: 700 }}>
              Filed by {product.name} Security
            </Text>
            <Text style={{ fontFamily: fonts.mono, fontSize: 9.5 }}>
              Automated incident report · generated {incident.openedLabel} · every figure above
              computed from the event record.
            </Text>
          </Column>
          <Stamp band={accountBand} small />
        </Row>
      </Column>
    </Document>
  );
}
