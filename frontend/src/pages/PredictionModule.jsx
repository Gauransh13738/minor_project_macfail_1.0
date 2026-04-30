// import { useState } from "react"

// const API = "http://127.0.0.1:8000"

// const FAILURE_COLORS = {
//   "No Failure":               { text: "text-neutral-400",  bar: "bg-neutral-500",  glow: "" },
//   "Tool Wear Failure":        { text: "text-yellow-400",   bar: "bg-yellow-400",   glow: "shadow-[0_0_8px_rgba(250,204,21,0.4)]" },
//   "Heat Dissipation Failure": { text: "text-blue-400",     bar: "bg-blue-400",     glow: "shadow-[0_0_8px_rgba(96,165,250,0.4)]" },
//   "Power Failure":            { text: "text-red-400",      bar: "bg-red-400",      glow: "shadow-[0_0_8px_rgba(248,113,113,0.4)]" },
//   "Overstrain Failure":       { text: "text-orange-400",   bar: "bg-orange-400",   glow: "shadow-[0_0_8px_rgba(251,146,60,0.4)]" },
//   "Random Failure":           { text: "text-purple-400",   bar: "bg-purple-400",   glow: "shadow-[0_0_8px_rgba(192,132,252,0.4)]" },
// }

// // Feature 3: Severity config
// const SEVERITY = {
//   "No Failure":               { label: "SAFE",     bg: "bg-emerald-900/30", border: "border-emerald-700/40", text: "text-emerald-400", dot: "bg-emerald-400" },
//   "Tool Wear Failure":        { label: "WARNING",  bg: "bg-yellow-900/30",  border: "border-yellow-700/40",  text: "text-yellow-400",  dot: "bg-yellow-400"  },
//   "Heat Dissipation Failure": { label: "WARNING",  bg: "bg-yellow-900/30",  border: "border-yellow-700/40",  text: "text-yellow-400",  dot: "bg-yellow-400"  },
//   "Power Failure":            { label: "CRITICAL", bg: "bg-red-900/30",     border: "border-red-700/40",     text: "text-red-400",     dot: "bg-red-400 animate-pulse" },
//   "Overstrain Failure":       { label: "CRITICAL", bg: "bg-red-900/30",     border: "border-red-700/40",     text: "text-red-400",     dot: "bg-red-400 animate-pulse" },
//   "Random Failure":           { label: "WARNING",  bg: "bg-yellow-900/30",  border: "border-yellow-700/40",  text: "text-yellow-400",  dot: "bg-yellow-400"  },
// }

// const DEFAULT_FORM = {
//   Type: "M",
//   Air_temperature_K: "",
//   Process_temperature_K: "",
//   Rotational_speed_rpm: "",
//   Torque_Nm: "",
//   Tool_wear_min: "",
// }

// const getOntologyConfidence = (data, failureType) => {
//   if (!data) return 92
//   const toolWear  = Number(data.Tool_wear_min)
//   const torque    = Number(data.Torque_Nm)
//   const airTemp   = Number(data.Air_temperature_K)
//   const procTemp  = Number(data.Process_temperature_K)
//   const rpm       = Number(data.Rotational_speed_rpm)
//   const tempDelta = procTemp - airTemp
//   const power     = torque * rpm

//   if (failureType === "Tool Wear Failure") {
//     return Math.min(99, Math.round(85 + ((toolWear - 200) / 50) * 14))
//   }
//   if (failureType === "Heat Dissipation Failure") {
//     return Math.min(99, Math.round(85 + ((8.6 - tempDelta) / 8.6) * 14))
//   }
//   if (failureType === "Power Failure") {
//     const distFromSafe = power > 9000 ? power - 9000 : 3500 - power
//     return Math.min(99, Math.round(85 + (distFromSafe / 5000) * 14))
//   }
//   if (failureType === "Overstrain Failure") {
//     return Math.min(99, Math.round(85 + ((toolWear * torque - 11000) / 5000) * 14))
//   }
//   return 92
// }

// function PredictionModule({ setHistory }) {
//   const [formData, setFormData]       = useState(DEFAULT_FORM)
//   const [mlResult, setMlResult]       = useState(null)
//   const [hybridResult, setHybridResult] = useState(null)
//   const [loading, setLoading]         = useState(false)
//   const [error, setError]             = useState(null)
//   const [analyzed, setAnalyzed]       = useState(false)

//   const handleChange = (e) => {
//     setFormData({ ...formData, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e) => {
//     e.preventDefault()
//     setLoading(true)
//     setError(null)

//     const payload = {
//       ...formData,
//       Air_temperature_K:    Number(formData.Air_temperature_K),
//       Process_temperature_K: Number(formData.Process_temperature_K),
//       Rotational_speed_rpm: Number(formData.Rotational_speed_rpm),
//       Torque_Nm:            Number(formData.Torque_Nm),
//       Tool_wear_min:        Number(formData.Tool_wear_min),
//     }

//     try {
//       const [mlRes, hybridRes] = await Promise.all([
//         fetch(`${API}/predict/ml-only`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }),
//         fetch(`${API}/predict`, {
//           method: "POST",
//           headers: { "Content-Type": "application/json" },
//           body: JSON.stringify(payload),
//         }),
//       ])

//       const ml     = await mlRes.json()
//       const hybrid = await hybridRes.json()

//       setMlResult(ml)
//       setHybridResult(hybrid)
//       setAnalyzed(true)

//       setHistory(prev => [{
//         ...formData,
//         ...hybrid,
//         timestamp: new Date().toLocaleString(),
//       }, ...prev])

//     } catch (err) {
//       setError("Cannot connect to API. Make sure uvicorn is running on port 8000.")
//     }

//     setLoading(false)
//   }

//   const mlColor     = mlResult     ? (FAILURE_COLORS[mlResult.failure_type]     || FAILURE_COLORS["No Failure"]) : null
//   const hybridColor = hybridResult ? (FAILURE_COLORS[hybridResult.failure_type] || FAILURE_COLORS["No Failure"]) : null
//   const mlConf      = mlResult     ? Math.round(mlResult.confidence * 100) : 0
//   const hybridConf  = hybridResult
//     ? hybridResult.ontology_assisted
//       ? getOntologyConfidence(formData, hybridResult.failure_type)
//       : Math.round(hybridResult.confidence * 100)
//     : 0

//   // Feature 5: confidence delta
//   const confidenceDelta = analyzed ? hybridConf - mlConf : 0

//   // Feature 3: severity
//   const severity = hybridResult
//     ? (SEVERITY[hybridResult.failure_type] || SEVERITY["No Failure"])
//     : null

//   const ontologyIntervened = analyzed &&
//     mlResult && hybridResult &&
//     (mlResult.failure_type !== hybridResult.failure_type || hybridResult.ontology_assisted)

//   return (
//     <div style={{ fontFamily: "'Roboto Mono', monospace" }}>

//       {/* Title row */}
//       <div className="flex items-center gap-3 mb-6">
//         <h2 className="text-xs text-gray-500 uppercase tracking-widest">// ML vs Ontology Comparison</h2>
//         <div className="flex-1 h-px bg-gray-800" />
//         {/* Feature 3: Severity badge in title row after analysis */}
//         {analyzed && severity && (
//           <div className={`flex items-center gap-2 px-3 py-1 rounded-sm border ${severity.bg} ${severity.border}`}>
//             <div className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
//             <span className={`text-[10px] font-black uppercase tracking-widest ${severity.text}`}>
//               {severity.label}
//             </span>
//           </div>
//         )}
//       </div>

//       {/* Input form */}
//       <form onSubmit={handleSubmit}>
//         <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end mb-4">
//           <div className="flex flex-col gap-1">
//             <label className="text-[10px] text-gray-500 uppercase tracking-wider">Type</label>
//             <select
//               name="Type"
//               value={formData.Type}
//               onChange={handleChange}
//               className="bg-gray-950 border border-gray-700 text-gray-100 h-9 px-2 text-xs focus:border-orange-500 outline-none rounded-sm"
//             >
//               <option value="M">M — Medium</option>
//               <option value="L">L — Low</option>
//               <option value="H">H — Heavy</option>
//             </select>
//           </div>

//           {[
//             { label: "Air Temp [K]",     name: "Air_temperature_K" },
//             { label: "Process Temp [K]", name: "Process_temperature_K" },
//             { label: "RPM",              name: "Rotational_speed_rpm" },
//             { label: "Torque [Nm]",      name: "Torque_Nm" },
//             { label: "Tool Wear [min]",  name: "Tool_wear_min" },
//           ].map(({ label, name }) => (
//             <div key={name} className="flex flex-col gap-1">
//               <label className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</label>
//               <input
//                 type="number"
//                 name={name}
//                 value={formData[name]}
//                 onChange={handleChange}
//                 required
//                 placeholder="—"
//                 className="bg-gray-950 border border-gray-700 text-gray-100 h-9 px-2 text-xs font-mono focus:border-orange-500 outline-none rounded-sm w-full"
//               />
//             </div>
//           ))}

//           <button
//             type="submit"
//             disabled={loading}
//             className="bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black text-xs uppercase tracking-widest h-9 px-4 transition-colors active:scale-95 rounded-sm"
//           >
//             {loading ? "···" : "ANALYZE"}
//           </button>
//         </div>

//         {error && (
//           <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 px-3 py-2 mb-4 rounded-sm">
//             ⚠ {error}
//           </div>
//         )}
//       </form>

//       {/* Ontology intervention banner */}
//       {ontologyIntervened && (
//         <div className="mb-5 bg-emerald-900/20 border border-emerald-700/40 px-4 py-2.5 flex items-center gap-3 rounded-sm">
//           <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
//           <span className="text-xs text-emerald-400 uppercase tracking-wider">
//             Ontology intervened —{" "}
//             <span className="text-gray-400 line-through">{mlResult.failure_type}</span>
//             {" → "}
//             <span className="text-emerald-300 font-bold">{hybridResult.failure_type}</span>
//           </span>
//         </div>
//       )}

//       {/* Comparison cards */}
//       {analyzed && (
//         <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">

//           {/* Center divider with Feature 5: delta callout */}
//           <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 flex-col items-center justify-center z-10 pointer-events-none gap-2">
//             <div className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest text-gray-300 whitespace-nowrap">
//               ONTOLOGY ASSIST
//             </div>
//             <div className="w-px h-8 bg-gradient-to-b from-gray-700 to-transparent" />
//             {/* Feature 5: Delta badge */}
//             {confidenceDelta !== 0 && (
//               <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-sm border ${
//                 confidenceDelta > 0
//                   ? "bg-emerald-900/40 border-emerald-700/50"
//                   : "bg-red-900/40 border-red-700/50"
//               }`}>
//                 <span className={`text-lg font-black ${confidenceDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
//                   {confidenceDelta > 0 ? "+" : ""}{confidenceDelta}%
//                 </span>
//                 <span className="text-[8px] uppercase tracking-widest text-gray-500">
//                   confidence
//                 </span>
//               </div>
//             )}
//             <div className="w-px h-8 bg-gradient-to-t from-gray-700 to-transparent" />
//           </div>

//           {/* ML Only Card */}
//           <div className="bg-gray-950 border border-gray-800 relative overflow-hidden rounded-sm">
//             <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
//             <div className="p-5 pl-6">
//               <div className="flex justify-between items-start mb-5">
//                 <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">ML Only</h3>
//                 <span className="text-[9px] bg-purple-900/30 border border-purple-700/40 text-purple-300 px-2 py-0.5 uppercase tracking-wider rounded-sm">BASELINE</span>
//               </div>
//               <div className="bg-black/40 border border-gray-800 p-4 mb-4 rounded-sm">
//                 <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Identified Failure</div>
//                 <div className={`text-sm font-bold uppercase ${mlColor?.text}`}>{mlResult?.failure_type}</div>
//               </div>
//               <div className="space-y-2 mb-5">
//                 <div className="flex justify-between items-end">
//                   <span className="text-[9px] text-gray-500 uppercase tracking-wider">Confidence</span>
//                   <span className={`text-2xl font-black ${mlColor?.text}`}>{mlConf}%</span>
//                 </div>
//                 <div className="h-1.5 bg-black border border-gray-800 overflow-hidden rounded-full">
//                   <div className={`h-full transition-all duration-700 ${mlColor?.bar}`} style={{ width: `${mlConf}%` }} />
//                 </div>
//               </div>
//               <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
//                 <span className="text-[9px] text-gray-600">ENGINE: RF_MODEL_V2.0</span>
//                 <span className="text-[9px] text-gray-400 uppercase tracking-wider">{mlResult?.method}</span>
//               </div>
//             </div>
//           </div>

//           {/* ML + Ontology Card */}
//           <div className="bg-gray-950 border border-gray-800 ring-1 ring-emerald-500/20 relative overflow-hidden rounded-sm">
//             <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
//             <div className="p-5 pl-6">
//               <div className="flex justify-between items-start mb-5">
//                 <div className="flex items-center gap-2">
//                   <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">ML + Ontology</h3>
//                   {hybridResult?.ontology_assisted && (
//                     <span className="text-[9px] bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 px-1.5 py-0.5 uppercase tracking-wider rounded-sm">✓ ASSISTED</span>
//                   )}
//                 </div>
//                 <span className="text-[9px] bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 px-2 py-0.5 uppercase tracking-wider rounded-sm">ENHANCED</span>
//               </div>
//               <div className="bg-black/40 border border-gray-800 p-4 mb-4 rounded-sm">
//                 <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Identified Failure</div>
//                 <div className={`text-sm font-bold uppercase ${hybridColor?.text}`}>{hybridResult?.failure_type}</div>
//               </div>
//               <div className="space-y-2 mb-5">
//                 <div className="flex justify-between items-end">
//                   <span className="text-[9px] text-gray-500 uppercase tracking-wider">Confidence</span>
//                   <span className={`text-2xl font-black ${hybridColor?.text}`}>{hybridConf}%</span>
//                 </div>
//                 <div className="h-1.5 bg-black border border-gray-800 overflow-hidden rounded-full">
//                   <div className={`h-full transition-all duration-700 ${hybridColor?.bar} ${hybridColor?.glow}`} style={{ width: `${hybridConf}%` }} />
//                 </div>
//               </div>
//               <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
//                 <span className="text-[9px] text-gray-600">ENGINE: HYBRID_SEMANTIC_01</span>
//                 <span className="text-[9px] text-gray-400 uppercase tracking-wider">{hybridResult?.method}</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Root Cause Analysis */}
//       {analyzed && hybridResult?.root_cause_analysis?.length > 0 && (
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div className="hidden md:block" />
//           <div>
//             <div className="flex items-center gap-3 mb-4">
//               <span className="text-[10px] text-gray-500 uppercase tracking-widest">Root Cause Analysis</span>
//               <div className="flex-1 h-px bg-gray-800" />
//               <span className="text-[9px] text-emerald-500 uppercase tracking-wider">ONTOLOGY LAYER</span>
//             </div>
//             <div className="flex flex-col gap-3">
//               {hybridResult.root_cause_analysis.map((cause, i) => (
//                 <div key={i} className="bg-gray-900 border border-gray-800 hover:border-emerald-800/50 transition-colors p-4 rounded-sm">
//                   <div className="flex justify-between items-start mb-3 gap-3">
//                     <h4 className="text-xs font-semibold text-gray-100 leading-snug">{cause.root_cause}</h4>
//                     <div className="flex flex-wrap gap-1 flex-shrink-0">
//                       {cause.sensors_involved.map((s, j) => (
//                         <span key={j} className="text-[9px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 whitespace-nowrap rounded-sm">{s}</span>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex items-start gap-2 bg-black/40 p-3 border-l-2 border-orange-500 rounded-sm">
//                     <span className="text-orange-500 text-xs flex-shrink-0 mt-0.5">▶</span>
//                     <div>
//                       <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Recommended Action</div>
//                       <p className="text-xs text-gray-300">{cause.recommended_action}</p>
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Empty state */}
//       {!analyzed && (
//         <div className="flex flex-col items-center justify-center py-16 text-center">
//           <div className="text-5xl mb-4 opacity-10 font-black select-none">⚙</div>
//           <p className="text-gray-600 text-xs uppercase tracking-widest">Enter sensor values and click ANALYZE to run comparison</p>
//         </div>
//       )}

//     </div>
//   )
// }

// export default PredictionModule

import { useState } from "react"

const API = "http://127.0.0.1:8000"

const FAILURE_COLORS = {
  "No Failure":               { text: "text-neutral-400",  bar: "bg-neutral-500",  glow: "" },
  "Tool Wear Failure":        { text: "text-yellow-400",   bar: "bg-yellow-400",   glow: "shadow-[0_0_8px_rgba(250,204,21,0.4)]" },
  "Heat Dissipation Failure": { text: "text-blue-400",     bar: "bg-blue-400",     glow: "shadow-[0_0_8px_rgba(96,165,250,0.4)]" },
  "Power Failure":            { text: "text-red-400",      bar: "bg-red-400",      glow: "shadow-[0_0_8px_rgba(248,113,113,0.4)]" },
  "Overstrain Failure":       { text: "text-orange-400",   bar: "bg-orange-400",   glow: "shadow-[0_0_8px_rgba(251,146,60,0.4)]" },
  "Random Failure":           { text: "text-purple-400",   bar: "bg-purple-400",   glow: "shadow-[0_0_8px_rgba(192,132,252,0.4)]" },
}

const SEVERITY = {
  "No Failure":               { label: "SAFE",     bg: "bg-emerald-900/30", border: "border-emerald-700/40", text: "text-emerald-400", dot: "bg-emerald-400" },
  "Tool Wear Failure":        { label: "WARNING",  bg: "bg-yellow-900/30",  border: "border-yellow-700/40",  text: "text-yellow-400",  dot: "bg-yellow-400"  },
  "Heat Dissipation Failure": { label: "WARNING",  bg: "bg-yellow-900/30",  border: "border-yellow-700/40",  text: "text-yellow-400",  dot: "bg-yellow-400"  },
  "Power Failure":            { label: "CRITICAL", bg: "bg-red-900/30",     border: "border-red-700/40",     text: "text-red-400",     dot: "bg-red-400 animate-pulse" },
  "Overstrain Failure":       { label: "CRITICAL", bg: "bg-red-900/30",     border: "border-red-700/40",     text: "text-red-400",     dot: "bg-red-400 animate-pulse" },
  "Random Failure":           { label: "WARNING",  bg: "bg-yellow-900/30",  border: "border-yellow-700/40",  text: "text-yellow-400",  dot: "bg-yellow-400"  },
}

const DEFAULT_FORM = {
  Type: "M",
  Air_temperature_K: "",
  Process_temperature_K: "",
  Rotational_speed_rpm: "",
  Torque_Nm: "",
  Tool_wear_min: "",
}

const getOntologyConfidence = (data, failureType) => {
  if (!data) return 92
  const toolWear  = Number(data.Tool_wear_min)
  const torque    = Number(data.Torque_Nm)
  const airTemp   = Number(data.Air_temperature_K)
  const procTemp  = Number(data.Process_temperature_K)
  const rpm       = Number(data.Rotational_speed_rpm)
  const tempDelta = procTemp - airTemp
  const power     = torque * rpm

  if (failureType === "Tool Wear Failure")
    return Math.min(99, Math.round(85 + ((toolWear - 200) / 50) * 14))
  if (failureType === "Heat Dissipation Failure")
    return Math.min(99, Math.round(85 + ((8.6 - tempDelta) / 8.6) * 14))
  if (failureType === "Power Failure") {
    const distFromSafe = power > 9000 ? power - 9000 : 3500 - power
    return Math.min(99, Math.round(85 + (distFromSafe / 5000) * 14))
  }
  if (failureType === "Overstrain Failure")
    return Math.min(99, Math.round(85 + ((toolWear * torque - 11000) / 5000) * 14))
  return 92
}

// PDF generator — pure HTML/CSS printed via browser
const generatePDF = (formData, mlResult, hybridResult, mlConf, hybridConf) => {
  const now      = new Date().toLocaleString()
  const severity = SEVERITY[hybridResult.failure_type]?.label || "UNKNOWN"
  const delta    = hybridConf - mlConf

  const causesHTML = hybridResult.root_cause_analysis?.map(c => `
    <div style="border:1px solid #333;padding:12px;margin-bottom:10px;border-radius:4px;">
      <div style="font-weight:bold;margin-bottom:6px;">${c.root_cause}</div>
      <div style="margin-bottom:6px;">
        ${c.sensors_involved.map(s => `<span style="background:#222;border:1px solid #444;padding:2px 6px;font-size:11px;margin-right:4px;border-radius:2px;">${s}</span>`).join("")}
      </div>
      <div style="border-left:3px solid #f97316;padding-left:10px;font-size:12px;color:#aaa;">
        <div style="font-size:10px;color:#666;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px;">Recommended Action</div>
        ${c.recommended_action}
      </div>
    </div>
  `).join("") || "<p style='color:#666'>No root causes identified.</p>"

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8"/>
      <title>Maintenance Report — ${now}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Courier New', monospace; background: #0a0a0a; color: #e5e5e5; padding: 40px; }
        .header { border-bottom: 2px solid #f97316; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: flex-start; }
        .logo { font-size: 22px; font-weight: 900; color: #f97316; letter-spacing: -1px; }
        .meta { font-size: 10px; color: #666; text-align: right; line-height: 1.8; }
        .section-title { font-size: 10px; color: #555; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 12px; border-bottom: 1px solid #222; padding-bottom: 6px; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px; }
        .card { background: #111; border: 1px solid #222; border-radius: 4px; padding: 16px; }
        .card-label { font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
        .card-value { font-size: 20px; font-weight: 900; }
        .card-sub { font-size: 10px; color: #666; margin-top: 4px; }
        .sensor-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 24px; }
        .sensor-item { background: #111; border: 1px solid #222; padding: 10px; border-radius: 4px; }
        .sensor-label { font-size: 9px; color: #555; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        .sensor-value { font-size: 14px; font-weight: bold; }
        .badge { display: inline-block; padding: 2px 8px; border-radius: 2px; font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; }
        .badge-critical { background: #450a0a; border: 1px solid #7f1d1d; color: #f87171; }
        .badge-warning  { background: #422006; border: 1px solid #78350f; color: #fbbf24; }
        .badge-safe     { background: #052e16; border: 1px solid #14532d; color: #4ade80; }
        .delta { color: #4ade80; font-weight: 900; }
        .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #222; font-size: 9px; color: #444; display: flex; justify-content: space-between; }
        @media print { body { background: white; color: black; } .card { background: #f9f9f9; } }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">INDUSTRA AI</div>
          <div style="font-size:11px;color:#666;margin-top:4px;">Predictive Maintenance Report</div>
        </div>
        <div class="meta">
          Generated: ${now}<br/>
          Engine: HYBRID_SEMANTIC_01<br/>
          Machine Type: ${formData.Type}
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <div class="section-title">Diagnosis Summary</div>
        <div class="grid2">
          <div class="card" style="border-left: 4px solid #a855f7;">
            <div class="card-label">ML Only — Baseline</div>
            <div class="card-value" style="color:#a855f7;">${mlResult.failure_type}</div>
            <div class="card-sub">Confidence: ${mlConf}%</div>
          </div>
          <div class="card" style="border-left: 4px solid #10b981;">
            <div class="card-label">ML + Ontology — Enhanced &nbsp;
              ${hybridResult.ontology_assisted ? '<span class="badge badge-safe">Assisted</span>' : ""}
            </div>
            <div class="card-value" style="color:#10b981;">${hybridResult.failure_type}</div>
            <div class="card-sub">
              Confidence: ${hybridConf}%
              ${delta > 0 ? `&nbsp;<span class="delta">▲ +${delta}%</span>` : ""}
            </div>
          </div>
        </div>

        <div style="display:flex;gap:12px;align-items:center;margin-bottom:24px;">
          <span class="badge ${severity === "CRITICAL" ? "badge-critical" : severity === "WARNING" ? "badge-warning" : "badge-safe"}">${severity}</span>
          ${hybridResult.ontology_assisted
            ? `<span style="font-size:11px;color:#4ade80;">✓ Ontology intervened — corrected from <s>${mlResult.failure_type}</s> → ${hybridResult.failure_type}</span>`
            : `<span style="font-size:11px;color:#666;">ML model was high confidence — no ontology intervention needed</span>`
          }
        </div>
      </div>

      <div style="margin-bottom:24px;">
        <div class="section-title">Sensor Readings at Time of Prediction</div>
        <div class="sensor-grid">
          <div class="sensor-item"><div class="sensor-label">Machine Type</div><div class="sensor-value">${formData.Type}</div></div>
          <div class="sensor-item"><div class="sensor-label">Air Temp</div><div class="sensor-value">${formData.Air_temperature_K} K</div></div>
          <div class="sensor-item"><div class="sensor-label">Process Temp</div><div class="sensor-value">${formData.Process_temperature_K} K</div></div>
          <div class="sensor-item"><div class="sensor-label">Rotational Speed</div><div class="sensor-value">${formData.Rotational_speed_rpm} RPM</div></div>
          <div class="sensor-item"><div class="sensor-label">Torque</div><div class="sensor-value">${formData.Torque_Nm} Nm</div></div>
          <div class="sensor-item"><div class="sensor-label">Tool Wear</div><div class="sensor-value">${formData.Tool_wear_min} min</div></div>
        </div>
      </div>

      <div>
        <div class="section-title">Root Cause Analysis — Ontology Layer</div>
        ${causesHTML}
      </div>

      <div class="footer">
        <span>INDUSTRA AI · Predictive Maintenance System v2.0</span>
        <span>Powered by Random Forest + OWL/RDF Semantic Reasoner</span>
      </div>
    </body>
    </html>
  `

  const win = window.open("", "_blank")
  win.document.write(html)
  win.document.close()
  setTimeout(() => win.print(), 500)
}

function PredictionModule({ setHistory }) {
  const [formData, setFormData]         = useState(DEFAULT_FORM)
  const [mlResult, setMlResult]         = useState(null)
  const [hybridResult, setHybridResult] = useState(null)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState(null)
  const [analyzed, setAnalyzed]         = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const payload = {
      ...formData,
      Air_temperature_K:     Number(formData.Air_temperature_K),
      Process_temperature_K: Number(formData.Process_temperature_K),
      Rotational_speed_rpm:  Number(formData.Rotational_speed_rpm),
      Torque_Nm:             Number(formData.Torque_Nm),
      Tool_wear_min:         Number(formData.Tool_wear_min),
    }

    try {
      const [mlRes, hybridRes] = await Promise.all([
        fetch(`${API}/predict/ml-only`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch(`${API}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
      ])

      const ml     = await mlRes.json()
      const hybrid = await hybridRes.json()

      setMlResult(ml)
      setHybridResult(hybrid)
      setAnalyzed(true)

      setHistory(prev => [{
        ...formData,
        ...hybrid,
        timestamp: new Date().toLocaleString(),
      }, ...prev])

    } catch (err) {
      setError("Cannot connect to API. Make sure uvicorn is running on port 8000.")
    }

    setLoading(false)
  }

  const mlColor     = mlResult     ? (FAILURE_COLORS[mlResult.failure_type]     || FAILURE_COLORS["No Failure"]) : null
  const hybridColor = hybridResult ? (FAILURE_COLORS[hybridResult.failure_type] || FAILURE_COLORS["No Failure"]) : null
  const mlConf      = mlResult     ? Math.round(mlResult.confidence * 100) : 0
  const hybridConf  = hybridResult
    ? hybridResult.ontology_assisted
      ? getOntologyConfidence(formData, hybridResult.failure_type)
      : Math.round(hybridResult.confidence * 100)
    : 0

  const confidenceDelta = analyzed ? hybridConf - mlConf : 0
  const severity        = hybridResult ? (SEVERITY[hybridResult.failure_type] || SEVERITY["No Failure"]) : null
  const ontologyIntervened = analyzed && mlResult && hybridResult &&
    (mlResult.failure_type !== hybridResult.failure_type || hybridResult.ontology_assisted)

  return (
    <div style={{ fontFamily: "'Roboto Mono', monospace" }}>

      {/* Title row */}
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-xs text-gray-500 uppercase tracking-widest">// ML vs Ontology Comparison</h2>
        <div className="flex-1 h-px bg-gray-800" />
        {analyzed && severity && (
          <div className={`flex items-center gap-2 px-3 py-1 rounded-sm border ${severity.bg} ${severity.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${severity.dot}`} />
            <span className={`text-[10px] font-black uppercase tracking-widest ${severity.text}`}>{severity.label}</span>
          </div>
        )}
        {/* PDF export button */}
        {analyzed && hybridResult && (
          <button
            onClick={() => generatePDF(formData, mlResult, hybridResult, mlConf, hybridConf)}
            className="flex items-center gap-1.5 text-[9px] uppercase tracking-widest border border-gray-700 hover:border-orange-600 text-gray-400 hover:text-orange-400 px-3 py-1.5 transition-colors rounded-sm"
          >
            <span>↓</span> Export PDF
          </button>
        )}
      </div>

      {/* Input form */}
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 md:grid-cols-7 gap-3 items-end mb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] text-gray-500 uppercase tracking-wider">Type</label>
            <select
              name="Type"
              value={formData.Type}
              onChange={handleChange}
              className="bg-gray-950 border border-gray-700 text-gray-100 h-9 px-2 text-xs focus:border-orange-500 outline-none rounded-sm"
            >
              <option value="M">M — Medium</option>
              <option value="L">L — Low</option>
              <option value="H">H — Heavy</option>
            </select>
          </div>

          {[
            { label: "Air Temp [K]",     name: "Air_temperature_K" },
            { label: "Process Temp [K]", name: "Process_temperature_K" },
            { label: "RPM",              name: "Rotational_speed_rpm" },
            { label: "Torque [Nm]",      name: "Torque_Nm" },
            { label: "Tool Wear [min]",  name: "Tool_wear_min" },
          ].map(({ label, name }) => (
            <div key={name} className="flex flex-col gap-1">
              <label className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</label>
              <input
                type="number"
                name={name}
                value={formData[name]}
                onChange={handleChange}
                required
                placeholder="—"
                className="bg-gray-950 border border-gray-700 text-gray-100 h-9 px-2 text-xs font-mono focus:border-orange-500 outline-none rounded-sm w-full"
              />
            </div>
          ))}

          <button
            type="submit"
            disabled={loading}
            className="bg-orange-500 hover:bg-orange-400 disabled:bg-gray-700 disabled:text-gray-500 text-black font-black text-xs uppercase tracking-widest h-9 px-4 transition-colors active:scale-95 rounded-sm"
          >
            {loading ? "···" : "ANALYZE"}
          </button>
        </div>

        {error && (
          <div className="text-xs text-red-400 bg-red-900/20 border border-red-800 px-3 py-2 mb-4 rounded-sm">
            ⚠ {error}
          </div>
        )}
      </form>

      {/* Ontology intervention banner */}
      {ontologyIntervened && (
        <div className="mb-5 bg-emerald-900/20 border border-emerald-700/40 px-4 py-2.5 flex items-center gap-3 rounded-sm">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
          <span className="text-xs text-emerald-400 uppercase tracking-wider">
            Ontology intervened —{" "}
            <span className="text-gray-400 line-through">{mlResult.failure_type}</span>
            {" → "}
            <span className="text-emerald-300 font-bold">{hybridResult.failure_type}</span>
          </span>
        </div>
      )}

      {/* Comparison cards */}
      {analyzed && (
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="hidden md:flex absolute inset-y-0 left-1/2 -translate-x-1/2 flex-col items-center justify-center z-10 pointer-events-none gap-2">
            <div className="bg-gray-800 border border-gray-700 px-3 py-1 rounded-full text-[9px] uppercase tracking-widest text-gray-300 whitespace-nowrap">
              ONTOLOGY ASSIST
            </div>
            <div className="w-px h-8 bg-gradient-to-b from-gray-700 to-transparent" />
            {confidenceDelta !== 0 && (
              <div className={`flex flex-col items-center gap-1 px-3 py-2 rounded-sm border ${
                confidenceDelta > 0 ? "bg-emerald-900/40 border-emerald-700/50" : "bg-red-900/40 border-red-700/50"
              }`}>
                <span className={`text-lg font-black ${confidenceDelta > 0 ? "text-emerald-400" : "text-red-400"}`}>
                  {confidenceDelta > 0 ? "+" : ""}{confidenceDelta}%
                </span>
                <span className="text-[8px] uppercase tracking-widest text-gray-500">confidence</span>
              </div>
            )}
            <div className="w-px h-8 bg-gradient-to-t from-gray-700 to-transparent" />
          </div>

          {/* ML Only */}
          <div className="bg-gray-950 border border-gray-800 relative overflow-hidden rounded-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-purple-500" />
            <div className="p-5 pl-6">
              <div className="flex justify-between items-start mb-5">
                <h3 className="text-xs font-bold uppercase tracking-widest text-purple-400">ML Only</h3>
                <span className="text-[9px] bg-purple-900/30 border border-purple-700/40 text-purple-300 px-2 py-0.5 uppercase tracking-wider rounded-sm">BASELINE</span>
              </div>
              <div className="bg-black/40 border border-gray-800 p-4 mb-4 rounded-sm">
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Identified Failure</div>
                <div className={`text-sm font-bold uppercase ${mlColor?.text}`}>{mlResult?.failure_type}</div>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">Confidence</span>
                  <span className={`text-2xl font-black ${mlColor?.text}`}>{mlConf}%</span>
                </div>
                <div className="h-1.5 bg-black border border-gray-800 overflow-hidden rounded-full">
                  <div className={`h-full transition-all duration-700 ${mlColor?.bar}`} style={{ width: `${mlConf}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                <span className="text-[9px] text-gray-600">ENGINE: RF_MODEL_V2.0</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-wider">{mlResult?.method}</span>
              </div>
            </div>
          </div>

          {/* ML + Ontology */}
          <div className="bg-gray-950 border border-gray-800 ring-1 ring-emerald-500/20 relative overflow-hidden rounded-sm">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-400" />
            <div className="p-5 pl-6">
              <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-emerald-400">ML + Ontology</h3>
                  {hybridResult?.ontology_assisted && (
                    <span className="text-[9px] bg-emerald-900/40 border border-emerald-700/40 text-emerald-400 px-1.5 py-0.5 uppercase tracking-wider rounded-sm">✓ ASSISTED</span>
                  )}
                </div>
                <span className="text-[9px] bg-emerald-900/30 border border-emerald-700/40 text-emerald-300 px-2 py-0.5 uppercase tracking-wider rounded-sm">ENHANCED</span>
              </div>
              <div className="bg-black/40 border border-gray-800 p-4 mb-4 rounded-sm">
                <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-2">Identified Failure</div>
                <div className={`text-sm font-bold uppercase ${hybridColor?.text}`}>{hybridResult?.failure_type}</div>
              </div>
              <div className="space-y-2 mb-5">
                <div className="flex justify-between items-end">
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider">Confidence</span>
                  <span className={`text-2xl font-black ${hybridColor?.text}`}>{hybridConf}%</span>
                </div>
                <div className="h-1.5 bg-black border border-gray-800 overflow-hidden rounded-full">
                  <div className={`h-full transition-all duration-700 ${hybridColor?.bar} ${hybridColor?.glow}`} style={{ width: `${hybridConf}%` }} />
                </div>
              </div>
              <div className="pt-3 border-t border-gray-800 flex justify-between items-center">
                <span className="text-[9px] text-gray-600">ENGINE: HYBRID_SEMANTIC_01</span>
                <span className="text-[9px] text-gray-400 uppercase tracking-wider">{hybridResult?.method}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Root Cause Analysis */}
      {analyzed && hybridResult?.root_cause_analysis?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="hidden md:block" />
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-[10px] text-gray-500 uppercase tracking-widest">Root Cause Analysis</span>
              <div className="flex-1 h-px bg-gray-800" />
              <span className="text-[9px] text-emerald-500 uppercase tracking-wider">ONTOLOGY LAYER</span>
            </div>
            <div className="flex flex-col gap-3">
              {hybridResult.root_cause_analysis.map((cause, i) => (
                <div key={i} className="bg-gray-900 border border-gray-800 hover:border-emerald-800/50 transition-colors p-4 rounded-sm">
                  <div className="flex justify-between items-start mb-3 gap-3">
                    <h4 className="text-xs font-semibold text-gray-100 leading-snug">{cause.root_cause}</h4>
                    <div className="flex flex-wrap gap-1 flex-shrink-0">
                      {cause.sensors_involved.map((s, j) => (
                        <span key={j} className="text-[9px] bg-gray-800 text-gray-400 border border-gray-700 px-2 py-0.5 whitespace-nowrap rounded-sm">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-start gap-2 bg-black/40 p-3 border-l-2 border-orange-500 rounded-sm">
                    <span className="text-orange-500 text-xs flex-shrink-0 mt-0.5">▶</span>
                    <div>
                      <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-1">Recommended Action</div>
                      <p className="text-xs text-gray-300">{cause.recommended_action}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!analyzed && (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <div className="text-5xl mb-4 opacity-10 font-black select-none">⚙</div>
          <p className="text-gray-600 text-xs uppercase tracking-widest">Enter sensor values and click ANALYZE to run comparison</p>
        </div>
      )}
    </div>
  )
}

export default PredictionModule