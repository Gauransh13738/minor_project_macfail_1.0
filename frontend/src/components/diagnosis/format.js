// Small formatting helpers shared by the diagnosis screens and the printable report.

export const num = (value, digits = 0) =>
  Number(value).toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits })

export const pct = (p) => `${Math.round(Number(p) * 100)}%`

// "Heat Dissipation Failure" -> "Heat dissipation failure"
export const sentence = (s = "") => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : "")

export const lower = (s = "") => s.toLowerCase()

export const lowerFirst = (s = "") => (s ? s.charAt(0).toLowerCase() + s.slice(1) : "")

export const opWord = (operator) => (operator === "<" || operator === "<=" ? "below" : "above")

// "Rule_HDF" -> "Rule HDF", "Rule_PWF_Low" -> "Rule PWF low", "Rule_OSF_L" -> "Rule OSF (type L)"
export function ruleName(id = "") {
  const [family, ...rest] = id.replace(/^Rule_/, "").split("_")
  if (rest.length === 1 && /^[LMH]$/.test(rest[0])) return `Rule ${family} (type ${rest[0]})`
  return ["Rule", family, ...rest.map((r) => r.toLowerCase())].join(" ")
}

export const escapeHtml = (value) =>
  String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]))
