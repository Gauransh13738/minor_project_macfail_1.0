// Printable diagnosis report: a light, paper-friendly page opened in a new tab.
import { FEATURES, FIELDS, SEVERITY, toneOf } from "./constants"
import { firesWhen, confidenceLine, DECISION_NOTE, outcomeOf, summaryFor } from "./explain"
import { escapeHtml as h, num, pct, ruleName, sentence } from "./format"

const TONE_COLOR = { ok: "#41607f", warn: "#a86b00", crit: "#c23a2b" }

function groupedChecks(checks = []) {
  const byMode = new Map()
  for (const rule of checks) {
    if (!byMode.has(rule.failure_type)) byMode.set(rule.failure_type, [])
    byMode.get(rule.failure_type).push(rule)
  }
  return [...byMode]
}

export function openReport(values, result) {
  const now = new Date().toLocaleString()
  const { kind, final, ml, mlProb, rules } = outcomeOf(result)
  const tone = toneOf(final)
  const color = TONE_COLOR[SEVERITY[final] || "ok"]

  const readings = FIELDS.map((f) => `<tr><th>${h(f.label)}</th><td>${h(values[f.name])} ${h(f.unit)}</td></tr>`).join("")
  const derived = Object.entries(result.features ?? {})
    .filter(([k]) => FEATURES[k])
    .map(([k, v]) => `<tr><th>${h(FEATURES[k].label)} (calculated)</th><td>${h(num(v, FEATURES[k].digits))} ${h(FEATURES[k].unit)}</td></tr>`)
    .join("")

  const checks = groupedChecks(result.rule_checks)
    .map(([mode, group]) => {
      const fired = group.some((r) => r.fired)
      return `<tr><th>${h(sentence(mode))}</th><td>${h(firesWhen(group, values.Type))} <strong>${fired ? "Rule fired." : "Within limits."}</strong></td></tr>`
    })
    .join("")

  const causes = (result.root_cause_analysis ?? [])
    .map((c) => `
      <div class="cause">
        <div class="tag">${c.evidence === "rule" ? `Confirmed by ${h((c.evidenced_by ?? []).map(ruleName).join(" and "))}` : "Possible cause"}</div>
        <div class="cause-title">${h(c.root_cause)}</div>
        <div class="muted">Measured by: ${h((c.sensors_involved ?? []).join(", "))}</div>
        <div class="action"><strong>Recommended action.</strong> ${h(c.recommended_action)}</div>
      </div>`)
    .join("") || `<p class="muted">${final === "No Failure" ? "No fault detected. Nothing to fix for these readings." : "No root causes recorded for this failure type."}</p>`

  const html = `<!DOCTYPE html>
<html lang="en"><head><meta charset="utf-8"/>
<title>Diagnosis report — ${h(sentence(final))}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: system-ui, -apple-system, "Segoe UI", sans-serif; color: #12202f; margin: 0; padding: 40px; max-width: 820px; line-height: 1.5; }
  h1 { font-size: 30px; margin: 4px 0 8px; letter-spacing: -0.01em; }
  h2 { font-size: 15px; margin: 32px 0 10px; padding-bottom: 6px; border-bottom: 1px solid #d3dee8; }
  .top { display: flex; justify-content: space-between; color: #4a6a8a; font-size: 13px; border-bottom: 3px solid ${color}; padding-bottom: 10px; }
  .sev { color: ${color}; font-weight: 700; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th { text-align: left; font-weight: 600; width: 36%; padding: 6px 12px 6px 0; vertical-align: top; color: #284664; }
  td { padding: 6px 0; vertical-align: top; }
  tr + tr th, tr + tr td { border-top: 1px solid #e8eef4; }
  .muted { color: #4a6a8a; font-size: 13px; }
  .cause { border: 1px solid #d3dee8; border-radius: 6px; padding: 14px 16px; margin-bottom: 12px; break-inside: avoid; }
  .tag { font-size: 12px; font-weight: 600; color: #1a7fa3; margin-bottom: 4px; }
  .cause-title { font-weight: 600; }
  .action { margin-top: 10px; background: #f4f7fa; padding: 10px 12px; border-radius: 4px; font-size: 14px; }
  footer { margin-top: 36px; padding-top: 12px; border-top: 1px solid #d3dee8; font-size: 12px; color: #4a6a8a; }
</style></head>
<body>
  <div class="top"><span><strong>Industra AI</strong> diagnosis report</span><span>${h(now)}</span></div>
  <p class="sev">${h(tone.label)}</p>
  <h1>${h(sentence(final))}</h1>
  <p>${h(summaryFor(result))}</p>

  <h2>How the decision was made</h2>
  <table>
    <tr><th>ML model</th><td>${h(sentence(ml))}, ${h(pct(mlProb))} probability</td></tr>
    <tr><th>Ontology rules</th><td>${rules.length ? h(rules.map((r) => ruleName(r.id)).join(", ")) + " fired" : "No rule fired"}</td></tr>
    <tr><th>Final decision</th><td>${h(sentence(final))}. ${h(DECISION_NOTE[kind])}. ${h(confidenceLine(result))}.</td></tr>
  </table>

  <h2>Readings</h2>
  <table>
    <tr><th>Product quality variant</th><td>${h(values.Type)}</td></tr>
    ${readings}
    ${derived}
  </table>

  <h2>Rule checks</h2>
  <table>${checks}</table>

  <h2>${result.root_cause_basis === "rule_evidence" ? "Cause and recommended action" : "Possible causes and recommended actions"}</h2>
  ${causes}

  <footer>Rule precision is measured on the AI4I 2020 dataset, which is synthetic. It is not a guarantee for a real machine.</footer>
</body></html>`

  const win = window.open("", "_blank")
  if (!win) return false
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 400)
  return true
}
