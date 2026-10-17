// One-time import: turns the Lifelist Atlas seed (graph/seed/atlas-2026-10-16.json)
// into one reviewed YAML definition per experience under graph/experiences/.
// After the import, the YAML files are the source of truth (ADR 0004); edit them
// through pull requests, not by re-running this script.
//
// Usage: node scripts/import-atlas.mjs [--force]

import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { stringify } from "yaml";

const SEED = "graph/seed/atlas-2026-10-16.json";
const OUT_DIR = "graph/experiences";
const force = process.argv.includes("--force");

const atlas = JSON.parse(readFileSync(SEED, "utf8"));

// Scarcity: the Atlas tag is free text; the graph uses an enum (see contracts/experience.schema.json).
const SCARCITY = {
  once: ["eclipse-luxor", "eclipse-maroc", "eclipse-2028"],
  lottery: ["smokies", "kailash", "cwc2027", "la28", "wimbledon", "masters", "wmm"],
  permit_cap: ["gorillas", "son-doong", "antarctica", "tonga"],
  capacity: [
    "glass-igloo", "waitomo", "okavango", "komodo", "emperors", "north-pole", "zero-g",
    "patagonia", "monaco", "ascot", "comrades", "mds", "ant-marathon", "tomorrowland",
    "yi-peng", "sapporo", "tomatina",
  ],
  natural: ["vaadhoo", "sardine", "migration"],
  event: [
    "vegas", "singapore", "turkey", "derby", "tdf", "balloons", "muertos", "timkat", "eagles",
    "naadam", "fallas", "rio", "hornbill", "paro", "up-helly-aa",
  ],
  season: [
    "aurora", "atacama", "purushwadi", "uyuni", "lencois", "ice-caves", "danakil", "devils-pool",
    "churchill", "svalbard", "orcas", "ningaloo", "monarchs", "snow-leopard", "icehotel", "harbin",
  ],
};

// Safety flags drive the autonomy ladder (ADR 0002): any of the first seven makes an
// experience safety-critical. `remote_or_escorted` and `strenuous` are informational.
const SAFETY = {
  aurora: ["extreme_cold"],
  "ice-caves": ["extreme_cold"],
  atacama: ["altitude"],
  uyuni: ["altitude"],
  danakil: ["extreme_heat", "remote_or_escorted"],
  "devils-pool": ["open_water"],
  okavango: ["wildlife_on_foot"],
  gorillas: ["wildlife_on_foot", "age_or_fitness_limit"],
  churchill: ["extreme_cold"],
  svalbard: ["polar"],
  orcas: ["extreme_cold"],
  tonga: ["open_water"],
  ningaloo: ["open_water"],
  sardine: ["open_water"],
  monarchs: ["altitude"],
  "snow-leopard": ["extreme_cold", "altitude"],
  komodo: ["wildlife_on_foot"],
  emperors: ["polar"],
  antarctica: ["polar"],
  "north-pole": ["polar"],
  "son-doong": ["age_or_fitness_limit", "remote_or_escorted"],
  "zero-g": ["age_or_fitness_limit"],
  kailash: ["altitude", "age_or_fitness_limit"],
  patagonia: ["strenuous"],
  icehotel: ["extreme_cold"],
  harbin: ["extreme_cold"],
  wmm: ["strenuous"],
  comrades: ["strenuous", "age_or_fitness_limit"],
  mds: ["extreme_heat", "strenuous", "age_or_fitness_limit"],
  "ant-marathon": ["polar", "strenuous", "age_or_fitness_limit"],
  eagles: ["remote_or_escorted"],
};

// ISO 3166-1 alpha-2 codes the traveller must enter (AQ for Antarctica). Feasibility
// looks up visa constraints by these.
const COUNTRIES = {
  "eclipse-luxor": ["EG"], "eclipse-maroc": ["MA", "ES"], "eclipse-2028": ["AU", "NZ"],
  aurora: ["NO", "SE", "FI", "IS"], "glass-igloo": ["FI"], atacama: ["CL"], vaadhoo: ["MV"],
  waitomo: ["NZ"], smokies: ["US"], purushwadi: ["IN"], uyuni: ["BO"], lencois: ["BR"],
  "ice-caves": ["IS"], danakil: ["ET"], "devils-pool": ["ZM"], okavango: ["BW"],
  migration: ["KE", "TZ"], gorillas: ["RW", "UG"], churchill: ["CA"], svalbard: ["NO"],
  orcas: ["NO"], tonga: ["TO"], ningaloo: ["AU"], monarchs: ["MX"], "snow-leopard": ["IN"],
  komodo: ["ID"], emperors: ["AR", "AQ"], sardine: ["ZA"], antarctica: ["AR", "AQ"],
  "son-doong": ["VN"], "north-pole": ["NO"], "zero-g": ["US"], kailash: ["CN"],
  patagonia: ["CL"], icehotel: ["SE"], cwc2027: ["ZA", "ZW", "NA"], la28: ["US"],
  monaco: ["FR", "MC"], vegas: ["US"], singapore: ["SG"], turkey: ["TR"], wimbledon: ["GB"],
  masters: ["US"], ascot: ["GB"], derby: ["US"], tdf: ["FR"], wmm: ["JP", "US", "GB", "DE"],
  comrades: ["ZA"], mds: ["MA"], "ant-marathon": ["AR", "AQ"], "up-helly-aa": ["GB"],
  balloons: ["US"], muertos: ["MX"], timkat: ["ET"], eagles: ["MN"], naadam: ["MN"],
  "yi-peng": ["TH"], harbin: ["CN"], sapporo: ["JP"], tomatina: ["ES"], fallas: ["ES"],
  rio: ["BR"], hornbill: ["IN"], tomorrowland: ["BE"], paro: ["BT"],
};

// Known pairings from the build plan; more come from the Pairing Miner.
const PAIRINGS = {
  cwc2027: [{ with: "devils-pool", reason: "India plays Zimbabwe at Victoria Falls on 24 Oct 2027, inside Devil's Pool's low-water season." }],
  aurora: [{ with: "orcas", reason: "Tromsø in Nov–Jan gives whales by day and aurora by night." }],
  "glass-igloo": [{ with: "icehotel", reason: "Finnish and Swedish Lapland share the Dec–Mar season; one Schengen visa covers both." }],
  migration: [{ with: "gorillas", reason: "Jul–Oct river crossings in Kenya pair with a dry-season gorilla trek in Rwanda, a short flight away." }],
};

const SEGMENTS = { A: "affluent", Y: "young", N: "nri" };
const VISA_EFFORT = { none: "none", low: "low", med: "medium", high: "high" };

const scarcityOf = (id) => {
  for (const [type, ids] of Object.entries(SCARCITY)) if (ids.includes(id)) return type;
  throw new Error(`No scarcity type mapped for ${id}`);
};

mkdirSync(OUT_DIR, { recursive: true });
let written = 0;
for (const d of atlas.experiences) {
  if (!COUNTRIES[d.id]) throw new Error(`No countries mapped for ${d.id}`);
  const def = {
    id: d.id,
    name: d.n,
    lane: d.lane,
    hook: d.hook,
    place: { label: d.w, countries: COUNTRIES[d.id] },
    season_months: [...d.m].sort((a, b) => a - b),
    window_note: d.win,
    ...(d.date ? { fixed_dates: [{ start: d.date }] } : {}),
    scarcity: { type: scarcityOf(d.id), note: d.s },
    lead_time_note: d.lead,
    budget_band: d.b,
    segments: [...d.seg].map((s) => SEGMENTS[s]),
    safety_flags: SAFETY[d.id] ?? [],
    ...(PAIRINGS[d.id] ? { pairings: PAIRINGS[d.id] } : {}),
    status: "live",
    // Volatile facts start here as unverified seeds; the loader writes them to Postgres
    // with confidence "low" so the Verifier re-checks them before anything is shown.
    seed: {
      visa_in_passport: { effort: VISA_EFFORT[d.v], ...(d.vn ? { note: d.vn } : {}) },
      // Free text from the Atlas; Lane Scouts turn it into Offer records with links.
      where_to_book: d.via,
    },
    provenance: {
      source_url: atlas.source,
      checked_at: "2026-10-16",
      verified_by: "atlas-seed",
      confidence: "low",
    },
  };
  const path = `${OUT_DIR}/${d.id}.yaml`;
  if (existsSync(path) && !force) continue;
  writeFileSync(path, stringify(def, { lineWidth: 0 }));
  written++;
}
console.log(`Wrote ${written} of ${atlas.experiences.length} definitions to ${OUT_DIR}/`);
