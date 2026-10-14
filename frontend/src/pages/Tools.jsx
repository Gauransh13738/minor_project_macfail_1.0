import { useState } from "react"
import { useSearchParams } from "react-router-dom"
import PredictionModule from "./PredictionModule"
import AnalyticsModule from "./AnalyticsModule"
import Performance from "./Performance"
import { toneOf } from "../components/diagnosis/constants"
import { ruleName, sentence } from "../components/diagnosis/format"

const TABS = [
  { id: "prediction", label: "Diagnose" },
  { id: "performance", label: "Performance" },
  { id: "analysis",   label: "Analysis" },
  { id: "history",    label: "History"  },
]

function sourceOf(item) {
  if (item.decision_source === "ontology_rule") return `Decided by ${ruleName(item.rules_fired?.[0]?.id)}`
  if (item.decision_source === "ontology_veto") return "Ontology rejected the model's pick"
  if (item.decision_source === "ml")            return "Model only"
  return item.ontology_assisted ? "Ontology assisted" : "Model only"
}

function History({ history, onClear }) {
  if (history.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-gray-700 p-10 text-center">
        <p className="font-semibold text-gray-100">No diagnoses yet</p>
        <p className="mt-1 text-gray-400">Run one on the Diagnose tab and it will be listed here.</p>
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-gray-50">Diagnoses this session</h2>
        <button
          type="button"
          onClick={onClear}
          className="rounded-md border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:text-gray-50"
        >
          Clear history
        </button>
      </div>

      <ul className="mt-4 divide-y divide-gray-800 rounded-lg border border-gray-800 bg-gray-900 px-5">
        {history.map((item, index) => {
          const tone = toneOf(item.failure_type)
          return (
            <li key={index} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <p className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
                  <span className="flex items-center gap-2 font-semibold text-gray-50">
                    <span className={`size-2 shrink-0 rounded-full ${tone.dot}`} />
                    {sentence(item.failure_type)}
                  </span>
                  <span className="text-sm text-gray-400">{sourceOf(item)}</span>
                </p>
                <time className="text-sm text-gray-500">{item.timestamp}</time>
              </div>
              <p className="mt-1 text-sm text-gray-400 tabular-nums">
                Type {item.Type}, air {item.Air_temperature_K} K, process {item.Process_temperature_K} K,{" "}
                {item.Rotational_speed_rpm} rpm, {item.Torque_Nm} Nm, wear {item.Tool_wear_min} min
              </p>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

function Tools() {
  const [params] = useSearchParams()
  const wanted = params.get("tab")
  const [activeTab, setActiveTab] = useState(TABS.some((t) => t.id === wanted) ? wanted : "prediction")
  const [history, setHistory]     = useState([])

  const faults   = history.filter((h) => h.failure_class !== 0).length
  const critical = history.filter((h) => ["Power Failure", "Overstrain Failure"].includes(h.failure_type)).length

  const sessionSummary =
    history.length === 0
      ? "No diagnoses yet this session"
      : `${history.length} ${history.length === 1 ? "diagnosis" : "diagnoses"} this session, ${faults} with a fault, ${critical} critical`

  return (
    <div className="mx-auto max-w-7xl px-6 py-10 lg:py-14">
      <h1 className="display text-3xl text-gray-50 sm:text-4xl">Machine diagnosis</h1>
      <p className="mt-3 max-w-[60ch] text-gray-300">
        Enter a machine's sensor readings. The ML model and the ontology rules each give a view, and the page
        shows how they were combined.
      </p>

      <div className="mt-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 border-b border-gray-800">
        <div role="tablist" aria-label="Tools" className="-mx-2 flex max-w-full gap-0 overflow-x-auto sm:mx-0 sm:gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTab === tab.id}
              aria-controls={`panel-${tab.id}`}
              onClick={() => setActiveTab(tab.id)}
              className={`-mb-px border-b-2 shrink-0 px-3 py-3 text-sm font-medium transition-colors sm:px-4 ${
                activeTab === tab.id
                  ? "border-gray-50 text-gray-50"
                  : "border-transparent text-gray-400 hover:text-gray-100"
              }`}
            >
              {tab.label}
              {tab.id === "history" && history.length > 0 && (
                <span className="ml-2 rounded-full bg-gray-800 px-2 py-0.5 text-xs tabular-nums text-gray-300">{history.length}</span>
              )}
            </button>
          ))}
        </div>
        <p className="pb-3 text-sm text-gray-500">{sessionSummary}</p>
      </div>

      <div className="pt-8">
        {/* The diagnosis page stays mounted so switching tabs doesn't lose the readings or the result. */}
        <div role="tabpanel" id="panel-prediction" aria-labelledby="tab-prediction" hidden={activeTab !== "prediction"}>
          <PredictionModule setHistory={setHistory} />
        </div>

        {activeTab === "performance" && (
          <div role="tabpanel" id="panel-performance" aria-labelledby="tab-performance">
            <Performance />
          </div>
        )}

        {activeTab === "analysis" && (
          <div role="tabpanel" id="panel-analysis" aria-labelledby="tab-analysis">
            <AnalyticsModule history={history} />
          </div>
        )}

        {activeTab === "history" && (
          <div role="tabpanel" id="panel-history" aria-labelledby="tab-history">
            <History history={history} onClear={() => setHistory([])} />
          </div>
        )}
      </div>
    </div>
  )
}

export default Tools
