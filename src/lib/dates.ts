// Date helpers shared by server and client. All dates are local "YYYY-MM-DD".

export const toIso = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

export const fromIso = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};

export const isIsoDate = (s: unknown): s is string =>
  typeof s === "string" && /^\d{4}-\d{2}-\d{2}$/.test(s) && toIso(fromIso(s)) === s;

export const nightsBetween = (from: string, to: string) =>
  Math.round((fromIso(to).getTime() - fromIso(from).getTime()) / 86_400_000);

/** True if [aFrom, aTo) and [bFrom, bTo) share at least one night. */
export const rangesOverlap = (aFrom: string, aTo: string, bFrom: string, bTo: string) =>
  aFrom < bTo && bFrom < aTo;

export function formatDate(iso: string, localeTag: string, opts?: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(localeTag, opts ?? { day: "numeric", month: "short", year: "numeric" }).format(
    fromIso(iso),
  );
}

export function formatRange(from: string, to: string, localeTag: string) {
  const sameYear = from.slice(0, 4) === to.slice(0, 4);
  const a = formatDate(from, localeTag, sameYear ? { day: "numeric", month: "short" } : undefined);
  const b = formatDate(to, localeTag);
  return `${a} – ${b}`;
}
