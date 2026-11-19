// Latchkey — one fictional account record drives every output.
// The risk story is COMPUTED here, never hard-coded in the templates:
// signal weights are applied per event, impossible travel is detected with
// a real haversine calculation between consecutive successful sign-ins,
// event risk is the sum of an event's fired signals, and the account risk
// score blends the peak event risk with standing account factors.
// Change any event below and every output re-derives its score, verdict,
// travel flag and session states.

// ——— Signal weights (named constants — the scoring model) ———
export const WEIGHTS = {
  NEW_DEVICE: 20,
  NEW_COUNTRY: 35,
  VPN_EXIT_NODE: 15,
  UNUSUAL_HOUR: 10,
  FAILED_ATTEMPT_EACH: 5,
  FAILED_ATTEMPT_CAP: 15,
  IMPOSSIBLE_TRAVEL: 30,
} as const;

/** Faster than any commercial flight's average — travel above this
 *  required speed between two successful sign-ins is impossible. */
export const TRAVEL_SPEED_LIMIT_KMH = 900;
const FAILED_WINDOW_MS = 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

// ——— Geography ———
export interface City {
  name: string;
  country: string;
  lat: number;
  lng: number;
  /** Minutes east of UTC, for computing the local time of a sign-in. */
  tzOffsetMin: number;
  tzLabel: string;
}

export const cities = {
  bengaluru: { name: "Bengaluru", country: "India", lat: 12.9716, lng: 77.5946, tzOffsetMin: 330, tzLabel: "IST" },
  lagos: { name: "Lagos", country: "Nigeria", lat: 6.5244, lng: 3.3792, tzOffsetMin: 60, tzLabel: "WAT" },
  frankfurt: { name: "Frankfurt", country: "Germany", lat: 50.1109, lng: 8.6821, tzOffsetMin: 60, tzLabel: "CET" },
} as const satisfies Record<string, City>;

export type CityKey = keyof typeof cities;

// ——— Verdict bands ———
export type BandKey = "low" | "guarded" | "high";
export interface Band {
  key: BandKey;
  label: string;
  stamp: string;
  color: string;
}

const BANDS: Record<BandKey, Omit<Band, "key">> = {
  low: { label: "LOW", stamp: "LOW RISK — NO ACTION NEEDED", color: "#0E7C66" },
  guarded: { label: "GUARDED", stamp: "GUARDED — REVIEW ADVISED", color: "#B97A0F" },
  high: { label: "HIGH", stamp: "HIGH RISK — ACTION NEEDED", color: "#C93A22" },
};

export function bandFor(score: number): Band {
  const key: BandKey = score >= 60 ? "high" : score >= 30 ? "guarded" : "low";
  return { key, ...BANDS[key] };
}

// ——— Time helpers (arithmetic on the city's UTC offset — deterministic) ———
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const pad2 = (n: number) => String(n).padStart(2, "0");

function localParts(utcMs: number, tzOffsetMin: number) {
  const d = new Date(utcMs + tzOffsetMin * 60000);
  return {
    year: d.getUTCFullYear(),
    month: d.getUTCMonth(),
    day: d.getUTCDate(),
    hour: d.getUTCHours(),
    minute: d.getUTCMinutes(),
  };
}

function fmtTime(utcMs: number, city: City): string {
  const p = localParts(utcMs, city.tzOffsetMin);
  return `${pad2(p.hour)}:${pad2(p.minute)}`;
}

function fmtDate(utcMs: number, city: City): string {
  const p = localParts(utcMs, city.tzOffsetMin);
  return `${p.day} ${MONTHS[p.month]} ${p.year}`;
}

/** "19 Nov 2026 · 02:47 IST" in the account's home timezone. */
function fmtHome(utcMs: number): string {
  const home = cities.bengaluru;
  return `${fmtDate(utcMs, home)} · ${fmtTime(utcMs, home)} ${home.tzLabel}`;
}

// ——— The account ———
export const product = {
  name: "Latchkey",
  tagline: "Every sign-in, accounted for.",
};

export const account = {
  holder: "Kabir Anand",
  firstName: "Kabir",
  age: 29,
  occupation: "Product designer",
  email: "kabir.anand@postbox.example",
  idSince: 2023,
  homeCity: cities.bengaluru,
  /** Standing factors — ages and states are computed at incident time. */
  passwordChangedAt: "2025-08-14T09:30:00Z",
  mfaEnabled: true,
  recoveryEmail: "kabir.anand.recovery@postbox.example",
  recoveryEmailVerified: false,
};

export const demoBaseUrl = "https://latchkey-account-security-kit.vercel.app/";
export const securityCenterUrl = `${demoBaseUrl}security-center.html`;

// ——— Raw sign-in events (the only hand-written facts) ———
export interface RawEvent {
  id: string;
  at: string; // ISO, UTC
  city: CityKey;
  device: string;
  browser: string;
  ip: string;
  result: "success" | "failed";
  knownDevice: boolean;
  vpn: boolean;
}

const rawEvents: RawEvent[] = [
  { id: "EV-01", at: "2026-11-18T03:42:00Z", city: "bengaluru", device: "MacBook Pro", browser: "Safari", ip: "203.0.113.10", result: "success", knownDevice: true, vpn: false },
  { id: "EV-02", at: "2026-11-18T15:44:00Z", city: "bengaluru", device: "iPhone 15", browser: "Latchkey app", ip: "203.0.113.10", result: "success", knownDevice: true, vpn: false },
  { id: "EV-03", at: "2026-11-18T20:36:00Z", city: "bengaluru", device: "MacBook Pro", browser: "Safari", ip: "203.0.113.10", result: "success", knownDevice: true, vpn: false },
  { id: "EV-04", at: "2026-11-18T21:01:00Z", city: "frankfurt", device: "Unknown device", browser: "Chrome · Windows", ip: "198.51.100.23", result: "failed", knownDevice: false, vpn: true },
  { id: "EV-05", at: "2026-11-18T21:08:00Z", city: "frankfurt", device: "Unknown device", browser: "Chrome · Windows", ip: "198.51.100.23", result: "failed", knownDevice: false, vpn: true },
  { id: "EV-06", at: "2026-11-18T21:14:00Z", city: "frankfurt", device: "Unknown device", browser: "Chrome · Windows", ip: "198.51.100.23", result: "failed", knownDevice: false, vpn: true },
  { id: "EV-07", at: "2026-11-18T21:17:00Z", city: "lagos", device: "Unrecognized device", browser: "Chrome · Windows", ip: "203.0.113.44", result: "success", knownDevice: false, vpn: false },
];

// ——— Signal evaluation ———
export interface SignalHit {
  key: string;
  label: string;
  weightLabel: string;
  fired: boolean;
  points: number;
  detail: string;
}

export interface TravelFact {
  fromCity: City;
  toCity: City;
  distanceKm: number;
  hours: number;
  minutes: number;
  speedKmh: number;
  impossible: boolean;
}

export interface SignInEvent extends RawEvent {
  utcMs: number;
  cityInfo: City;
  timeLabel: string; // home-tz "19 Nov 2026 · 02:47 IST"
  localLabel: string; // at the sign-in's own location "22:17 WAT"
  signals: SignalHit[];
  risk: number;
  band: Band;
  travel: TravelFact | null;
}

function haversineKm(a: City, b: City): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

function evaluateEvents(raw: RawEvent[]): SignInEvent[] {
  const sorted = [...raw].sort((a, b) => Date.parse(a.at) - Date.parse(b.at));
  const out: SignInEvent[] = [];
  let prevSuccess: SignInEvent | null = null;

  for (const ev of sorted) {
    const utcMs = Date.parse(ev.at);
    const cityInfo = cities[ev.city];
    const signals: SignalHit[] = [];

    // Countries seen on earlier successful sign-ins from known devices,
    // plus the account's home country, count as "known".
    const knownCountries = new Set<string>([account.homeCity.country]);
    for (const past of out) {
      if (past.result === "success" && past.knownDevice) knownCountries.add(past.cityInfo.country);
    }
    const newCountry = !knownCountries.has(cityInfo.country);
    signals.push({
      key: "NEW_COUNTRY",
      label: "New country",
      weightLabel: `+${WEIGHTS.NEW_COUNTRY}`,
      fired: newCountry,
      points: newCountry ? WEIGHTS.NEW_COUNTRY : 0,
      detail: newCountry
        ? `${cityInfo.country} has never appeared on a trusted device`
        : `${cityInfo.country} is a known sign-in country`,
    });

    signals.push({
      key: "NEW_DEVICE",
      label: "New device",
      weightLabel: `+${WEIGHTS.NEW_DEVICE}`,
      fired: !ev.knownDevice,
      points: ev.knownDevice ? 0 : WEIGHTS.NEW_DEVICE,
      detail: ev.knownDevice ? "A device this account knows" : "Never seen on this account before",
    });

    // Impossible travel — consecutive successful sign-ins only.
    let travel: TravelFact | null = null;
    if (ev.result === "success" && prevSuccess) {
      const distanceKm = haversineKm(prevSuccess.cityInfo, cityInfo);
      const hours = (utcMs - prevSuccess.utcMs) / 3600000;
      const speedKmh = hours > 0 ? distanceKm / hours : 0;
      const impossible = speedKmh > TRAVEL_SPEED_LIMIT_KMH;
      travel = {
        fromCity: prevSuccess.cityInfo,
        toCity: cityInfo,
        distanceKm,
        hours,
        minutes: Math.round(hours * 60),
        speedKmh,
        impossible,
      };
      signals.push({
        key: "IMPOSSIBLE_TRAVEL",
        label: "Impossible travel",
        weightLabel: `+${WEIGHTS.IMPOSSIBLE_TRAVEL}`,
        fired: impossible,
        points: impossible ? WEIGHTS.IMPOSSIBLE_TRAVEL : 0,
        detail: impossible
          ? `${prevSuccess.cityInfo.name} → ${cityInfo.name} needs ${Math.round(speedKmh).toLocaleString("en-IN")} km/h`
          : `Reachable from ${prevSuccess.cityInfo.name} in the time available`,
      });
    }

    signals.push({
      key: "VPN_EXIT_NODE",
      label: "VPN exit node",
      weightLabel: `+${WEIGHTS.VPN_EXIT_NODE}`,
      fired: ev.vpn,
      points: ev.vpn ? WEIGHTS.VPN_EXIT_NODE : 0,
      detail: ev.vpn ? "IP is a known VPN exit node" : "IP is not a known VPN exit node",
    });

    const localHour = localParts(utcMs, cityInfo.tzOffsetMin).hour;
    const unusualHour = localHour >= 0 && localHour < 5;
    signals.push({
      key: "UNUSUAL_HOUR",
      label: "Unusual hour",
      weightLabel: `+${WEIGHTS.UNUSUAL_HOUR}`,
      fired: unusualHour,
      points: unusualHour ? WEIGHTS.UNUSUAL_HOUR : 0,
      detail: unusualHour
        ? `${fmtTime(utcMs, cityInfo)} local — inside 00:00–05:00`
        : `${fmtTime(utcMs, cityInfo)} local — outside 00:00–05:00`,
    });

    const priorFailures = out.filter(
      (p) => p.result === "failed" && p.ip === ev.ip && utcMs - p.utcMs <= FAILED_WINDOW_MS && p.utcMs < utcMs,
    ).length;
    const failedPoints = Math.min(WEIGHTS.FAILED_ATTEMPT_CAP, priorFailures * WEIGHTS.FAILED_ATTEMPT_EACH);
    signals.push({
      key: "FAILED_ATTEMPTS",
      label: "Failed attempts before it",
      weightLabel: `+${WEIGHTS.FAILED_ATTEMPT_EACH} each, cap +${WEIGHTS.FAILED_ATTEMPT_CAP}`,
      fired: priorFailures > 0,
      points: failedPoints,
      detail:
        priorFailures > 0
          ? `${priorFailures} failed attempt${priorFailures > 1 ? "s" : ""} from this IP in the prior hour`
          : "No failed attempts from this IP in the prior hour",
    });

    const risk = Math.max(0, Math.min(100, signals.reduce((sum, s) => sum + s.points, 0)));
    const full: SignInEvent = {
      ...ev,
      utcMs,
      cityInfo,
      timeLabel: fmtHome(utcMs),
      localLabel: `${fmtTime(utcMs, cityInfo)} ${cityInfo.tzLabel}`,
      signals,
      risk,
      band: bandFor(risk),
      travel,
    };
    out.push(full);
    if (ev.result === "success") prevSuccess = full;
  }
  return out;
}

export const events: SignInEvent[] = evaluateEvents(rawEvents);

/** The incident: the highest-risk successful sign-in. */
export const incidentEvent: SignInEvent = events
  .filter((e) => e.result === "success")
  .reduce((a, b) => (b.risk > a.risk ? b : a));

export const incidentTravel: TravelFact = incidentEvent.travel!;
export const failedAttempts: SignInEvent[] = events.filter((e) => e.result === "failed");

export const incident = {
  id: "INC-2026-1147",
  event: incidentEvent,
  openedLabel: fmtHome(incidentEvent.utcMs),
};

// ——— Account risk: peak event in 24 h, blended with standing factors ———
export interface AccountFactor {
  label: string;
  weightLabel: string;
  fired: boolean;
  points: number;
  detail: string;
}

const dayBefore = incidentEvent.utcMs - DAY_MS;
export const peakEvent: SignInEvent = events
  .filter((e) => e.utcMs > dayBefore)
  .reduce((a, b) => (b.risk > a.risk ? b : a));

export const passwordAgeDays = Math.floor(
  (incidentEvent.utcMs - Date.parse(account.passwordChangedAt)) / DAY_MS,
);

export const accountFactors: AccountFactor[] = [
  {
    label: "Peak event risk (24 h)",
    weightLabel: "base",
    fired: true,
    points: peakEvent.risk,
    detail: `${peakEvent.id} — the ${incidentEvent.cityInfo.name} sign-in`,
  },
  {
    label: "Password older than a year",
    weightLabel: "+5",
    fired: passwordAgeDays > 365,
    points: passwordAgeDays > 365 ? 5 : 0,
    detail: `Password is ${passwordAgeDays} days old`,
  },
  {
    label: "MFA switched on",
    weightLabel: "−10",
    fired: account.mfaEnabled,
    points: account.mfaEnabled ? -10 : 0,
    detail: account.mfaEnabled ? "Second factor is active on this account" : "No second factor on this account",
  },
  {
    label: "Recovery email verified",
    weightLabel: "−5",
    fired: account.recoveryEmailVerified,
    points: account.recoveryEmailVerified ? -5 : 0,
    detail: account.recoveryEmailVerified
      ? "Recovery address confirmed"
      : "Recovery address has never been verified",
  },
];

export const accountScore = Math.max(
  0,
  Math.min(100, accountFactors.reduce((sum, f) => sum + f.points, 0)),
);
export const accountBand: Band = bandFor(accountScore);

// ——— Timeline for the Page: consecutive failed attempts from one IP are
//     grouped into a single row whose risk is the group's peak ———
export interface TimelineItem {
  kind: "event" | "failedGroup";
  events: SignInEvent[];
  risk: number;
  band: Band;
  label: string;
  sub: string;
  tags: string[];
}

function buildTimeline(evs: SignInEvent[]): TimelineItem[] {
  const items: TimelineItem[] = [];
  for (const ev of evs) {
    const last = items[items.length - 1];
    if (ev.result === "failed" && last?.kind === "failedGroup" && last.events[0].ip === ev.ip) {
      last.events.push(ev);
      last.risk = Math.max(...last.events.map((e) => e.risk));
      last.band = bandFor(last.risk);
      last.label = `${last.events.length} failed password attempts`;
      last.sub = `${last.events[0].cityInfo.name}, ${last.events[0].cityInfo.country} · ${last.events[0].device} · IP ${ev.ip}`;
      last.tags = [...new Set(last.events.flatMap((e) => e.signals.filter((s) => s.fired).map((s) => s.label)))];
      continue;
    }
    if (ev.result === "failed") {
      items.push({
        kind: "failedGroup",
        events: [ev],
        risk: ev.risk,
        band: ev.band,
        label: "1 failed password attempt",
        sub: `${ev.cityInfo.name}, ${ev.cityInfo.country} · ${ev.device} · IP ${ev.ip}`,
        tags: ev.signals.filter((s) => s.fired).map((s) => s.label),
      });
      continue;
    }
    items.push({
      kind: "event",
      events: [ev],
      risk: ev.risk,
      band: ev.band,
      label: ev.id === incidentEvent.id ? "Signed in — the incident" : "Signed in",
      sub: `${ev.cityInfo.name}, ${ev.cityInfo.country} · ${ev.device} · ${ev.browser}`,
      tags: ev.signals.filter((s) => s.fired).map((s) => s.label),
    });
  }
  return items;
}

export const timeline: TimelineItem[] = buildTimeline(events);

// ——— Sessions: state is derived from the linked event ———
export interface Session {
  device: string;
  browser: string;
  city: City;
  linkedEventId: string;
  lastActiveLabel: string;
  state: "current" | "trusted" | "suspicious";
  stateLabel: string;
}

function deriveSessions(): Session[] {
  const byId = new Map(events.map((e) => [e.id, e]));
  const raw: Array<Omit<Session, "state" | "stateLabel">> = [
    { device: "MacBook Pro", browser: "Safari", city: cities.bengaluru, linkedEventId: "EV-03", lastActiveLabel: "Active now" },
    { device: "iPhone 15", browser: "Latchkey app", city: cities.bengaluru, linkedEventId: "EV-02", lastActiveLabel: "3 hours ago" },
    { device: "Unrecognized device", browser: "Chrome · Windows", city: cities.lagos, linkedEventId: "EV-07", lastActiveLabel: "Signed out by Latchkey" },
  ];
  // The current session is the most recent one on a known device that is
  // not the incident; the incident's session is suspicious by derivation.
  const currentId = raw
    .filter((s) => s.linkedEventId !== incidentEvent.id && byId.get(s.linkedEventId)?.knownDevice)
    .sort((a, b) => (byId.get(a.linkedEventId)?.utcMs ?? 0) - (byId.get(b.linkedEventId)?.utcMs ?? 0))
    .at(-1)?.linkedEventId;
  return raw.map((s) => {
    const state: Session["state"] =
      s.linkedEventId === incidentEvent.id ? "suspicious" : s.linkedEventId === currentId ? "current" : "trusted";
    return {
      ...s,
      state,
      stateLabel: state === "suspicious" ? "Suspicious" : state === "current" ? "This device" : "Trusted",
    };
  });
}

export const sessions: Session[] = deriveSessions();

// ——— Recovery checklist: progress is computed ———
export interface ChecklistStep {
  title: string;
  text: string;
  done: boolean;
  by: "you" | "latchkey";
}

export const checklist: ChecklistStep[] = [
  { title: "Review this sign-in", text: "You opened this alert and read the incident summary.", done: true, by: "you" },
  { title: "Sign out the Lagos session", text: "Latchkey flagged the session and signed it out on every service.", done: true, by: "latchkey" },
  { title: "Change your password", text: `Your password is ${passwordAgeDays} days old. Choose a new one you use nowhere else.`, done: false, by: "you" },
  { title: "Verify your recovery email", text: `${account.recoveryEmail} has never been verified — without it, recovery is closed to you.`, done: false, by: "you" },
  { title: "Add a passkey", text: "A passkey would have stopped this sign-in outright — it cannot be typed into a fake page.", done: false, by: "you" },
];

export const checklistDone = checklist.filter((s) => s.done).length;
export const checklistProgress = Math.round((checklistDone / checklist.length) * 100);
export const pendingSteps: ChecklistStep[] = checklist.filter((s) => !s.done);

// ——— Response record ———
export const actionsTaken: string[] = [
  "The Lagos session was flagged as suspicious and signed out everywhere.",
  "Step-up verification is now required on every new device that signs in.",
  `This incident was logged as ${incident.id} and attached to your account record.`,
];

export const recommendations: string[] = [
  "Change your password today — at 15 months old, it has likely been reused somewhere.",
  "Verify your recovery email; until you do, account recovery stays closed.",
  "Add a passkey. It is the one step that makes this exact incident impossible.",
  "Glance at your active sessions once a month — two minutes, and nights like this surface early.",
];

export const disclaimer =
  "Sample data — not a real security alert. All names, devices, IP addresses and events in this template are fictional. IP addresses use reserved documentation ranges (203.0.113.x / 198.51.100.x).";
