// Measured with `python evaluate.py`: mean of 10 random 80/20 splits of AI4I 2020.
// If you re-run the evaluation, update these numbers.
export const RUNS = 10

// toFixed(1) rounds 99.35 down to 99.3 because of float error; round half up instead.
export const r1 = (v) => (Math.round(v * 10 + 1e-9) / 10).toFixed(1)

export const SYSTEMS = {
  ml:       { name: "ML model alone",       accuracy: 90.82, macroF1: 0.5201, falseAlarms: 8.52 },
  hybrid:   { name: "ML + ontology",        accuracy: 97.13, macroF1: 0.6811, falseAlarms: 2.50 },
  rules:    { name: "Ontology rules alone", accuracy: 99.35, macroF1: 0.6628, falseAlarms: 0.0 },
}

// Paired comparison of macro-F1, hybrid against ML alone, per split.
export const PAIRED = { meanDiff: 0.161, wins: 10, total: 10 }

export const METRICS = [
  { key: "accuracy",    label: "Accuracy",     hint: "Share of machines diagnosed correctly",             higherIsBetter: true,  max: 100, fmt: (v) => `${r1(v)}%`, gap: (d) => `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} points` },
  { key: "macroF1",     label: "Macro-F1",     hint: "Average F1 across all six classes, rare failures count equally", higherIsBetter: true,  max: 1,   fmt: (v) => v.toFixed(3),       gap: (d) => `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(3)}` },
  { key: "falseAlarms", label: "False alarms", hint: "Healthy machines wrongly flagged as failing (lower is better)", higherIsBetter: false, max: 10,  fmt: (v) => `${r1(v)}%`, gap: (d) => `${d >= 0 ? "+" : "−"}${Math.abs(d).toFixed(1)} points` },
]
