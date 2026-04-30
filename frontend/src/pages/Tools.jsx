// import { useState } from "react"
// import PredictionModule from "./PredictionModule"
// import AnalyticsModule from "./AnalyticsModule"

// function Tools() {

//   const [activeTab, setActiveTab] = useState("prediction")
//   const [history, setHistory] = useState([])

//   return (
//     <div className="max-w-7xl mx-auto px-6 py-16">
      
//       <h1 className="text-3xl font-bold mb-10">
//         Tools Dashboard
//       </h1>

//       {/* Summary Cards */}
//       <div className="grid md:grid-cols-3 gap-6 mb-10">

//         {/* Total Predictions */}
//         <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//           <p className="text-gray-400 text-sm mb-2">
//             Total Predictions
//           </p>

//           <p className="text-3xl font-bold">
//             {history.length}
//           </p>
//         </div>


//         {/* Failure Rate */}
//         <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//           <p className="text-gray-400 text-sm mb-2">
//             Failure Rate
//           </p>

//           <p className="text-3xl font-bold text-red-400">
//             {history.length === 0
//               ? "0%"
//               : Math.round(
//                   (history.filter(h => h.failure_class !== 0).length /
//                     history.length) * 100
//                 ) + "%"}
//           </p>
//         </div>


//         {/* Last Prediction */}
//         <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
//           <p className="text-gray-400 text-sm mb-2">
//             Last Prediction
//           </p>

//           <p className="text-lg font-semibold text-yellow-400">
//             {history.length === 0
//               ? "No predictions yet"
//               : history[0].failure_type}
//           </p>
//        </div>

//       </div>

//       {/* Tabs */}
//       <div className="flex space-x-6 border-b border-gray-800 mb-10">

//         <button
//           onClick={() => setActiveTab("prediction")}
//           className={`pb-3 transition ${
//             activeTab === "prediction"
//               ? "border-b-2 border-white text-white"
//               : "text-gray-400 hover:text-white"
//           }`}
//         >
//           Prediction
//         </button>

//         <button
//           onClick={() => setActiveTab("analysis")}
//           className={`pb-3 transition ${
//             activeTab === "analysis"
//               ? "border-b-2 border-white text-white"
//               : "text-gray-400 hover:text-white"
//           }`}
//         >
//           Analysis
//         </button>

//         <button
//           onClick={() => setActiveTab("history")}
//           className={`pb-3 transition ${
//             activeTab === "history"
//               ? "border-b-2 border-white text-white"
//               : "text-gray-400 hover:text-white"
//           }`}
//         >
//           History
//         </button>

//       </div>

//       {/* Dynamic Content Area */}
//       <div className="bg-gray-900 border border-gray-800 rounded-xl p-8">

//         {activeTab === "prediction" && (
//           <PredictionModule setHistory={setHistory} />
//         )}
        
//         {activeTab === "analysis" && (
//           <AnalyticsModule history={history} />
//         )}

//         {activeTab === "history" && (
//           <div>
//             <h2 className="text-xl font-semibold mb-6">
//               Prediction History
//             </h2>

//             {history.length === 0 ? (
//               <p className="text-gray-400">No predictions yet.</p>
//             ) : (
//               <div className="overflow-x-auto">
//                 <table className="w-full text-sm text-left border border-gray-800">
//                   <thead className="bg-gray-800 text-gray-300">
//                     <tr>
//                       <th className="px-4 py-2">Time</th>
//                       <th className="px-4 py-2">Type</th>
//                       <th className="px-4 py-2">Air Temp</th>
//                       <th className="px-4 py-2">Process Temp</th>
//                       <th className="px-4 py-2">Speed</th>
//                       <th className="px-4 py-2">Torque</th>
//                       <th className="px-4 py-2">Tool Wear</th>
//                       <th className="px-4 py-2">Failure Type</th>
//                     </tr>
//                   </thead>

//                   <tbody>
//                     {history.map((item, index) => (
//                       <tr key={index} className="border-t border-gray-800">
//                         <td className="px-4 py-2">{item.timestamp}</td>
//                         <td className="px-4 py-2">{item.Type}</td>
//                         <td className="px-4 py-2">{item.Air_temperature_K}</td>
//                         <td className="px-4 py-2">{item.Process_temperature_K}</td>
//                         <td className="px-4 py-2">{item.Rotational_speed_rpm}</td>
//                         <td className="px-4 py-2">{item.Torque_Nm}</td>
//                         <td className="px-4 py-2">{item.Tool_wear_min}</td>
//                         <td className="px-4 py-2">{item.failure_type}</td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//               </div>
//             )}
//           </div>
//         )}

//       </div>

//     </div>
//   )
// }

// export default Tools

import { useState } from "react"
import PredictionModule from "./PredictionModule"
import AnalyticsModule from "./AnalyticsModule"

const FAILURE_COLORS = {
  "No Failure":               "text-emerald-400",
  "Tool Wear Failure":        "text-yellow-400",
  "Heat Dissipation Failure": "text-blue-400",
  "Power Failure":            "text-red-400",
  "Overstrain Failure":       "text-orange-400",
  "Random Failure":           "text-purple-400",
}

const SEVERITY_COLORS = {
  "No Failure":               { bg: "bg-emerald-900/20", border: "border-emerald-800/40", badge: "bg-emerald-900/40 text-emerald-400 border-emerald-700/40" },
  "Tool Wear Failure":        { bg: "bg-yellow-900/10",  border: "border-yellow-800/40",  badge: "bg-yellow-900/40 text-yellow-400 border-yellow-700/40"   },
  "Heat Dissipation Failure": { bg: "bg-blue-900/10",    border: "border-blue-800/40",    badge: "bg-blue-900/40 text-blue-400 border-blue-700/40"         },
  "Power Failure":            { bg: "bg-red-900/20",     border: "border-red-800/40",     badge: "bg-red-900/40 text-red-400 border-red-700/40"            },
  "Overstrain Failure":       { bg: "bg-orange-900/10",  border: "border-orange-800/40",  badge: "bg-orange-900/40 text-orange-400 border-orange-700/40"   },
  "Random Failure":           { bg: "bg-purple-900/10",  border: "border-purple-800/40",  badge: "bg-purple-900/40 text-purple-400 border-purple-700/40"   },
}

const SEVERITY_LABEL = {
  "No Failure":               "SAFE",
  "Tool Wear Failure":        "WARNING",
  "Heat Dissipation Failure": "WARNING",
  "Power Failure":            "CRITICAL",
  "Overstrain Failure":       "CRITICAL",
  "Random Failure":           "WARNING",
}

function Tools() {
  const [activeTab, setActiveTab] = useState("prediction")
  const [history, setHistory]     = useState([])

  const failureCount  = history.filter(h => h.failure_class !== 0).length
  const failureRate   = history.length === 0 ? 0 : Math.round((failureCount / history.length) * 100)
  const criticalCount = history.filter(h => ["Power Failure", "Overstrain Failure"].includes(h.failure_type)).length

  return (
    <div className="max-w-7xl mx-auto px-6 py-16" style={{ fontFamily: "'Roboto Mono', monospace" }}>

      <h1 className="text-2xl font-bold mb-2 tracking-tight">Tools Dashboard</h1>
      <p className="text-xs text-gray-500 uppercase tracking-widest mb-10">// Predictive Maintenance · Neuro-Symbolic Engine</p>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4 mb-10">
        <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Total Predictions</p>
          <p className="text-3xl font-black">{history.length}</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Failure Rate</p>
          <p className={`text-3xl font-black ${failureRate > 50 ? "text-red-400" : failureRate > 20 ? "text-yellow-400" : "text-emerald-400"}`}>
            {failureRate}%
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Critical Alerts</p>
          <p className={`text-3xl font-black ${criticalCount > 0 ? "text-red-400" : "text-emerald-400"}`}>
            {criticalCount}
          </p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-sm p-5">
          <p className="text-[10px] text-gray-500 uppercase tracking-wider mb-2">Last Prediction</p>
          <p className={`text-sm font-bold ${FAILURE_COLORS[history[0]?.failure_type] || "text-gray-400"}`}>
            {history.length === 0 ? "None yet" : history[0].failure_type}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-0 border-b border-gray-800 mb-8">
        {["prediction", "analysis", "history"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-xs uppercase tracking-widest transition-colors ${
              activeTab === tab
                ? "border-b-2 border-orange-500 text-orange-400"
                : "text-gray-500 hover:text-gray-300"
            }`}
          >
            {tab}
            {tab === "history" && history.length > 0 && (
              <span className="ml-2 bg-gray-800 text-gray-400 text-[9px] px-1.5 py-0.5 rounded-full">
                {history.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-gray-900 border border-gray-800 rounded-sm p-8">

        {activeTab === "prediction" && (
          <PredictionModule setHistory={setHistory} />
        )}

        {activeTab === "analysis" && (
          <AnalyticsModule history={history} />
        )}

        {/* Feature 1: Upgraded History Timeline */}
        {activeTab === "history" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xs text-gray-500 uppercase tracking-widest">// Prediction Timeline</h2>
                <div className="h-px w-16 bg-gray-800" />
              </div>
              {history.length > 0 && (
                <button
                  onClick={() => setHistory([])}
                  className="text-[9px] text-gray-600 hover:text-red-400 uppercase tracking-widest border border-gray-800 hover:border-red-900 px-3 py-1 transition-colors rounded-sm"
                >
                  Clear History
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="text-4xl mb-4 opacity-10 font-black select-none">📋</div>
                <p className="text-gray-600 text-xs uppercase tracking-widest">No predictions yet</p>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {history.map((item, index) => {
                  const colors  = SEVERITY_COLORS[item.failure_type] || SEVERITY_COLORS["No Failure"]
                  const sevLabel = SEVERITY_LABEL[item.failure_type]  || "UNKNOWN"
                  const textCol = FAILURE_COLORS[item.failure_type]   || "text-gray-400"
                  const isFirst = index === 0

                  return (
                    <div
                      key={index}
                      className={`relative border rounded-sm p-4 transition-colors ${colors.bg} ${colors.border} ${isFirst ? "ring-1 ring-orange-500/20" : ""}`}
                    >
                      {isFirst && (
                        <div className="absolute top-3 right-3">
                          <span className="text-[8px] bg-orange-900/40 border border-orange-700/40 text-orange-400 px-2 py-0.5 rounded-sm uppercase tracking-widest">
                            Latest
                          </span>
                        </div>
                      )}

                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div className="flex items-center gap-3">
                          {/* Severity badge */}
                          <span className={`text-[9px] border px-2 py-0.5 rounded-sm uppercase tracking-widest font-black ${colors.badge}`}>
                            {sevLabel}
                          </span>
                          {/* Failure type */}
                          <span className={`text-sm font-bold uppercase ${textCol}`}>
                            {item.failure_type}
                          </span>
                        </div>
                        <span className="text-[9px] text-gray-600 flex-shrink-0">{item.timestamp}</span>
                      </div>

                      {/* Sensor readings row */}
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                        {[
                          { label: "Type",         value: item.Type },
                          { label: "Air [K]",      value: item.Air_temperature_K },
                          { label: "Process [K]",  value: item.Process_temperature_K },
                          { label: "RPM",          value: item.Rotational_speed_rpm },
                          { label: "Torque [Nm]",  value: item.Torque_Nm },
                          { label: "Wear [min]",   value: item.Tool_wear_min },
                        ].map(({ label, value }) => (
                          <div key={label} className="bg-black/30 border border-gray-800/50 px-2 py-1.5 rounded-sm">
                            <div className="text-[8px] text-gray-600 uppercase tracking-wider mb-0.5">{label}</div>
                            <div className="text-xs font-mono text-gray-300">{value}</div>
                          </div>
                        ))}
                      </div>

                      {/* Ontology assisted indicator */}
                      {item.ontology_assisted && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="w-1 h-1 rounded-full bg-emerald-400" />
                          <span className="text-[8px] text-emerald-500 uppercase tracking-wider">Ontology assisted</span>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  )
}

export default Tools
