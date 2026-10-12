import { useState, useEffect, useRef } from "react"

const API = "http://127.0.0.1:8000"

// Safe operating ranges for each sensor (from AI4I 2020 dataset analysis)
const SENSOR_CONFIG = {
  Air_temperature_K: {
    label: "Air Temperature",
    unit: "K",
    min: 295,
    max: 305,
    safe: [296, 302],
    warning: [295, 304],
    default: 298,
    step: 0.1,
  },
  Process_temperature_K: {
    label: "Process Temperature",
    unit: "K",
    min: 305,
    max: 315,
    safe: [306, 313],
    warning: [305, 314],
    default: 308,
    step: 0.1,
  },
  Rotational_speed_rpm: {
    label: "Rotational Speed",
    unit: "RPM",
    min: 1000,
    max: 3000,
    safe: [1200, 2000],
    warning: [1100, 2500],
    default: 1500,
    step: 10,
  },
  Torque_Nm: {
    label: "Torque",
    unit: "Nm",
    min: 0,
    max: 80,
    safe: [10, 55],
    warning: [5, 65],
    default: 35,
    step: 0.1,
  },
  Tool_wear_min: {
    label: "Tool Wear",
    unit: "min",
    min: 0,
    max: 260,
    safe: [0, 150],
    warning: [150, 200],
    default: 80,
    step: 1,
  },
}

const getZone = (value, config) => {
  if (value >= config.safe[0] && value <= config.safe[1]) return "safe"
  if (value >= config.warning[0] && value <= config.warning[1]) return "warning"
  return "danger"
}

const ZONE_STYLES = {
  safe:    { text: "text-emerald-400", bar: "bg-emerald-500", border: "border-emerald-700/40", bg: "bg-emerald-900/20", label: "NOMINAL" },
  warning: { text: "text-yellow-400",  bar: "bg-yellow-500",  border: "border-yellow-700/40",  bg: "bg-yellow-900/20",  label: "WARNING" },
  danger:  { text: "text-red-400",     bar: "bg-red-500",     border: "border-red-700/40",     bg: "bg-red-900/20",     label: "DANGER"  },
}

const FAILURE_COLORS = {
  "No Failure":               "text-emerald-400",
  "Tool Wear Failure":        "text-yellow-400",
  "Heat Dissipation Failure": "text-blue-400",
  "Power Failure":            "text-red-400",
  "Overstrain Failure":       "text-orange-400",
  "Random Failure":           "text-purple-400",
}

function ArcGauge({ value, config, zone }) {
  const pct    = Math.min(1, Math.max(0, (value - config.min) / (config.max - config.min)))
  const angle  = pct * 180 // 0 to 180 degrees
  const r      = 54
  const cx     = 70
  const cy     = 70
  const startX = cx - r
  const startY = cy
  const endX   = cx + r
  const endY   = cy

  // Arc endpoint
  const rad    = ((angle - 180) * Math.PI) / 180
  const arcX   = cx + r * Math.cos(rad)
  const arcY   = cy + r * Math.sin(rad)

  const trackColor  = "#1f2937"
  const activeColor = zone === "safe" ? "#10b981" : zone === "warning" ? "#eab308" : "#ef4444"

  // Safe zone arc (green band)
  const safePct0 = (config.safe[0] - config.min) / (config.max - config.min)
  const safePct1 = (config.safe[1] - config.min) / (config.max - config.min)
  const safeAngle0 = safePct0 * 180 - 180
  const safeAngle1 = safePct1 * 180 - 180
  const sx0 = cx + r * Math.cos((safeAngle0 * Math.PI) / 180)
  const sy0 = cy + r * Math.sin((safeAngle0 * Math.PI) / 180)
  const sx1 = cx + r * Math.cos((safeAngle1 * Math.PI) / 180)
  const sy1 = cy + r * Math.sin((safeAngle1 * Math.PI) / 180)

  return (
    <svg viewBox="0 0 140 80" className="w-full">
      {/* Track */}
      <path
        d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${endX} ${endY}`}
        fill="none" stroke={trackColor} strokeWidth="8" strokeLinecap="round"
      />
      {/* Safe zone band */}
      <path
        d={`M ${sx0} ${sy0} A ${r} ${r} 0 0 1 ${sx1} ${sy1}`}
        fill="none" stroke="#064e3b" strokeWidth="8"
      />
      {/* Active arc */}
      {pct > 0 && (
        <path
          d={`M ${startX} ${startY} A ${r} ${r} 0 0 1 ${arcX} ${arcY}`}
          fill="none" stroke={activeColor} strokeWidth="8" strokeLinecap="round"
          style={{ filter: zone === "danger" ? `drop-shadow(0 0 4px ${activeColor})` : "none" }}
        />
      )}
      {/* Needle dot */}
      <circle cx={arcX} cy={arcY} r="5" fill={activeColor} />
      {/* Min/Max labels */}
      <text x={startX} y={cy + 16} fill="#4b5563" fontSize="8" textAnchor="middle">{config.min}</text>
      <text x={endX}   y={cy + 16} fill="#4b5563" fontSize="8" textAnchor="middle">{config.max}</text>
    </svg>
  )
}

function SensorCard({ sensorKey, config, value, onChange }) {
  const zone   = getZone(value, config)
  const styles = ZONE_STYLES[zone]
  const pct    = Math.min(100, Math.max(0, ((value - config.min) / (config.max - config.min)) * 100))

  return (
    <div className={`border rounded-sm p-4 transition-colors ${styles.bg} ${styles.border}`}>
      <div className="flex justify-between items-start mb-1">
        <span className="text-[10px] text-gray-500 uppercase tracking-wider">{config.label}</span>
        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-sm border ${styles.border} ${styles.text}`}>
          {styles.label}
        </span>
      </div>

      {/* Arc gauge */}
      <ArcGauge value={value} config={config} zone={zone} />

      {/* Value display */}
      <div className="text-center mb-3">
        <span className={`text-2xl font-black ${styles.text}`}>{value}</span>
        <span className="text-xs text-gray-500 ml-1">{config.unit}</span>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={config.min}
        max={config.max}
        step={config.step}
        value={value}
        onChange={(e) => onChange(sensorKey, Number(e.target.value))}
        className="w-full accent-orange-500 cursor-pointer"
      />

      {/* Safe range indicator */}
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-emerald-600">Safe: {config.safe[0]}–{config.safe[1]}</span>
        <span className="text-[8px] text-gray-600">{config.unit}</span>
      </div>
    </div>
  )
}

export default function SensorDashboard() {
  const [machineType, setMachineType] = useState("M")
  const [values, setValues] = useState({
    Air_temperature_K:    298,
    Process_temperature_K: 308,
    Rotational_speed_rpm:  1500,
    Torque_Nm:             35,
    Tool_wear_min:         80,
  })
  const [result, setResult]   = useState(null)
  const [loading, setLoading] = useState(false)
  const debounceRef           = useRef(null)

  const handleChange = (key, val) => {
    setValues(prev => ({ ...prev, [key]: val }))
  }

  // Auto-predict on value change with debounce
  useEffect(() => {
    clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setLoading(true)
      try {
        const res = await fetch(`${API}/predict`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ Type: machineType, ...values }),
        })
        const data = await res.json()
        setResult(data)
      } catch {}
      setLoading(false)
    }, 600)
    return () => clearTimeout(debounceRef.current)
  }, [values, machineType])

  const dangerCount  = Object.entries(values).filter(([k, v]) => k !== "Type" && SENSOR_CONFIG[k] && getZone(v, SENSOR_CONFIG[k]) === "danger").length
  const warningCount = Object.entries(values).filter(([k, v]) => k !== "Type" && SENSOR_CONFIG[k] && getZone(v, SENSOR_CONFIG[k]) === "warning").length
  const resultColor  = result ? (FAILURE_COLORS[result.failure_type] || "text-gray-400") : "text-gray-400"

  return (
    <div className="max-w-7xl mx-auto px-6 py-12" style={{ fontFamily: "'Roboto Mono', monospace" }}>

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-2xl font-black tracking-tight">Sensor Dashboard</h1>
          <p className="text-xs text-gray-500 uppercase tracking-widest mt-1">// Live monitoring · Auto-predict on change</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Machine type selector */}
          <div className="flex flex-col gap-1">
            <label className="text-[9px] text-gray-500 uppercase tracking-wider">Machine Type</label>
            <select
              value={machineType}
              onChange={e => setMachineType(e.target.value)}
              className="bg-gray-900 border border-gray-700 text-gray-100 h-8 px-2 text-xs focus:border-orange-500 outline-none rounded-sm"
            >
              <option value="M">M — Medium</option>
              <option value="L">L — Low</option>
              <option value="H">H — Heavy</option>
            </select>
          </div>
          {/* Status indicators */}
          <div className="flex flex-col gap-1 text-right">
            <span className="text-[9px] text-red-400 uppercase tracking-wider">{dangerCount} sensor{dangerCount !== 1 ? "s" : ""} in danger</span>
            <span className="text-[9px] text-yellow-400 uppercase tracking-wider">{warningCount} in warning</span>
          </div>
        </div>
      </div>

      {/* Live prediction banner */}
      <div className={`mb-8 border rounded-sm px-5 py-4 flex items-center justify-between transition-all ${
        result?.failure_class === 0
          ? "bg-emerald-900/20 border-emerald-800/40"
          : result
          ? "bg-red-900/20 border-red-800/40"
          : "bg-gray-900 border-gray-800"
      }`}>
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${loading ? "bg-orange-400 animate-pulse" : result?.failure_class === 0 ? "bg-emerald-400" : "bg-red-400 animate-pulse"}`} />
          <div>
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Live Prediction</div>
            <div className={`text-lg font-black uppercase ${resultColor}`}>
              {loading ? "Analyzing..." : result ? result.failure_type : "Waiting..."}
            </div>
          </div>
        </div>
        {result && !loading && (
          <div className="text-right">
            <div className="text-[9px] text-gray-500 uppercase tracking-wider mb-0.5">Confidence</div>
            <div className={`text-2xl font-black ${resultColor}`}>
              {Math.round(result.confidence * 100)}%
            </div>
          </div>
        )}
      </div>

      {/* Gauge Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
        {Object.entries(SENSOR_CONFIG).map(([key, config]) => (
          <SensorCard
            key={key}
            sensorKey={key}
            config={config}
            value={values[key]}
            onChange={handleChange}
          />
        ))}
      </div>

      {/* Root cause if failure detected */}
      {result?.root_cause_analysis?.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-[10px] text-gray-500 uppercase tracking-widest">Root Cause Analysis</span>
            <div className="flex-1 h-px bg-gray-800" />
            <span className="text-[9px] text-emerald-500 uppercase tracking-wider">ONTOLOGY LAYER</span>
          </div>
          <div className="grid md:grid-cols-2 gap-3">
            {result.root_cause_analysis.map((cause, i) => (
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
      )}

    </div>
  )
}