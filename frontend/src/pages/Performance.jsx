import { useState } from "react"
import { METRICS, PAIRED, RUNS, SYSTEMS, r1 } from "../data/results"

const SERIES = [
  { id: "ml",     bar: "bg-gray-500", swatch: "bg-gray-500" },
  { id: "hybrid", bar: "bg-rule",     swatch: "bg-rule" },
]

function MetricCard({ metric }) {
  const ml = SYSTEMS.ml[metric.key]
  const hy = SYSTEMS.hybrid[metric.key]
  const diff = hy - ml
  const better = metric.higherIsBetter ? diff > 0 : diff < 0
  const wide = (v) => `${Math.max(0.5, (v / metric.max) * 100)}%`

  return (
    <li className="rounded-lg border border-gray-800 bg-gray-900 p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="font-semibold text-gray-50">{metric.label}</h3>
        <span className={`text-sm font-semibold tabular-nums ${better ? "text-rule" : "text-warn"}`}>
          {metric.gap(diff)}
        </span>
      </div>
      <p className="mt-1 min-h-[2.5rem] text-sm text-gray-400">{metric.hint}</p>

      <div className="mt-5 space-y-4">
        {SERIES.map((s) => {
          const value = SYSTEMS[s.id][metric.key]
          return (
            <div key={s.id}>
              <div className="flex items-baseline justify-between text-sm">
                <span className="text-gray-300">{SYSTEMS[s.id].name}</span>
                <span className="font-semibold text-gray-50 tabular-nums">{metric.fmt(value)}</span>
              </div>
              <div className="mt-1.5 h-3 overflow-hidden rounded-r-sm bg-gray-800" aria-hidden="true">
                <div
                  className={`h-full rounded-r-sm ${s.bar} transition-[width] duration-700 ease-out`}
                  style={{ width: wide(value) }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </li>
  )
}

function DataTable() {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full min-w-[480px] text-left">
        <caption className="sr-only">Accuracy, macro-F1 and false alarm rate for three systems</caption>
        <thead>
          <tr className="border-b border-gray-700 text-sm text-gray-400">
            <th scope="col" className="py-3 pr-4 font-medium">System</th>
            {METRICS.map((m) => (
              <th key={m.key} scope="col" className="py-3 pr-4 text-right font-medium last:pr-0">{m.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="tabular-nums">
          {Object.values(SYSTEMS).map((sys) => (
            <tr key={sys.name} className="border-b border-gray-800">
              <th scope="row" className="py-3 pr-4 font-medium text-gray-100">{sys.name}</th>
              {METRICS.map((m) => (
                <td key={m.key} className="py-3 pr-4 text-right text-gray-100 last:pr-0">{m.fmt(sys[m.key])}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default function Performance() {
  const [showTable, setShowTable] = useState(true)
  const gain = SYSTEMS.hybrid.macroF1 - SYSTEMS.ml.macroF1

  return (
    <div>
      <h2 className="display text-2xl text-gray-50 sm:text-3xl">
        The ontology lifts the model from 0.52 to 0.68 macro-F1.
      </h2>
      <p className="mt-3 max-w-[66ch] text-gray-300">
        Adding the ontology rules to the Random Forest raises accuracy by {(SYSTEMS.hybrid.accuracy - SYSTEMS.ml.accuracy).toFixed(1)} points
        and cuts false alarms from {SYSTEMS.ml.falseAlarms.toFixed(1)}% to {SYSTEMS.hybrid.falseAlarms.toFixed(1)}%.
        Macro-F1 improved in {PAIRED.wins} of {PAIRED.total} random splits, by {gain.toFixed(3)} on average.
      </p>

      <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-gray-300">
        {SERIES.map((s) => (
          <span key={s.id} className="flex items-center gap-2">
            <span className={`size-3 rounded-sm ${s.swatch}`} aria-hidden="true" />
            {SYSTEMS[s.id].name}
          </span>
        ))}
      </div>

      <ul className="mt-5 grid gap-4 md:grid-cols-3">
        {METRICS.map((m) => <MetricCard key={m.key} metric={m} />)}
      </ul>

      <div className="mt-10 flex items-center justify-between gap-4">
        <h3 className="text-lg font-semibold text-gray-50">All three systems</h3>
        <button
          type="button"
          onClick={() => setShowTable((v) => !v)}
          aria-expanded={showTable}
          className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:text-gray-50"
        >
          {showTable ? "Hide table" : "Show as table"}
        </button>
      </div>
      {showTable && <DataTable />}

      <div className="mt-8 max-w-[72ch] space-y-3 border-t border-gray-800 pt-6 text-sm leading-relaxed text-gray-400">
        <p>
          <span className="text-gray-200">Reading the numbers.</span> The ontology rules on their own score highest on accuracy
          ({r1(SYSTEMS.rules.accuracy)}%) because AI4I 2020 labels failures with threshold rules. The hybrid's advantage
          in macro-F1 ({SYSTEMS.hybrid.macroF1.toFixed(3)} against {SYSTEMS.rules.macroF1.toFixed(3)}) comes from tool-wear
          failures, which no rule covers and the model still catches.
        </p>
        <p>
          <span className="text-gray-200">Limits.</span> The dataset is synthetic, so these results show the value of encoding
          domain rules, not performance on a real plant. Figures are the mean of {RUNS} random 80/20 splits. Run{" "}
          <code className="text-gray-300">python evaluate.py</code> to reproduce them.
        </p>
      </div>
    </div>
  )
}
