// Deterministic checks for golden items, run against a tool's output after normalize().
//
// Paths: dot-separated keys; `name[]` maps over an array, e.g. `windows[].starts_on`
// yields every window's start date. Ops:
//   equals        value === expected (deep for arrays/objects)
//   one_of        value is one of expected[]
//   includes      array value contains expected (or every item of expected[] when given an array)
//   excludes      array value contains none of expected (scalar or array)
//   set_equals    array value has exactly the expected members, any order
//   length_gte    array value has at least expected items
//   exists        path resolves to a non-null value (expected: true) or to null/undefined (false)

export function normalize(v) {
  if (Array.isArray(v)) return v.map(normalize);
  if (v && typeof v === "object") {
    if (v.unknown === true && "last_checked_at" in v) return null;
    if ("value" in v && "provenance" in v && Object.keys(v).length === 2) return normalize(v.value);
    return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, normalize(x)]));
  }
  return v;
}

export function resolve(obj, path) {
  let current = [obj];
  let mapped = false;
  for (const part of path.split(".")) {
    const isArray = part.endsWith("[]");
    const key = isArray ? part.slice(0, -2) : part;
    current = current.flatMap((o) => {
      const next = o == null ? undefined : o[key];
      if (isArray) return Array.isArray(next) ? next : [];
      return [next];
    });
    if (isArray) mapped = true;
  }
  return mapped ? current : current[0];
}

const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const asList = (x) => (Array.isArray(x) ? x : [x]);

export function check(output, { path, op, value }) {
  const actual = resolve(output, path);
  let ok;
  switch (op) {
    case "equals": ok = same(actual, value); break;
    case "one_of": ok = value.some((v) => same(actual, v)); break;
    case "includes": ok = Array.isArray(actual) && asList(value).every((v) => actual.some((a) => same(a, v))); break;
    case "excludes": ok = Array.isArray(actual) && asList(value).every((v) => !actual.some((a) => same(a, v))); break;
    case "set_equals":
      ok = Array.isArray(actual) && actual.length === new Set(actual.map((a) => JSON.stringify(a))).size &&
        actual.length === value.length && value.every((v) => actual.some((a) => same(a, v)));
      break;
    case "length_gte": ok = Array.isArray(actual) && actual.length >= value; break;
    case "exists": ok = value ? actual !== null && actual !== undefined : actual === null || actual === undefined; break;
    default: throw new Error(`Unknown op '${op}'`);
  }
  return { ok, actual };
}
