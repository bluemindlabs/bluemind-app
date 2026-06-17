export function cleanText(text: string) {
  if (!text) return "";

  return text
    .replace(/\\u2014/g, "—")
    .replace(/\\u2013/g, "–")
    .replace(/\\u2026/g, "…")
    .replace(/\\u00b7/g, "·")
    .replace(/\\n/g, " ")
    .trim();
}

export function cleanAIText<T extends Record<string, any>>(obj: T): T {
  if (!obj) return obj;

  const clean = (v: any) =>
    typeof v === "string"
      ? v
          .replace(/\\u2014/g, "-")
          .replace(/\\u2013/g, "-")
          .replace(/—/g, "-")
          .replace(/–/g, "-")
          .trim()
      : v;

  return Object.fromEntries(
    Object.entries(obj).map(([k, v]) => [k, clean(v)])
  ) as T;
}