// Shared constants for the diagnosis screens.

export const API = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

// Severity of each failure mode. "ok" is deliberately the quietest tone: colour is
// reserved for things that need attention.
export const SEVERITY = {
  "No Failure":               "ok",
  "Tool Wear Failure":        "warn",
  "Heat Dissipation Failure": "warn",
  "Random Failure":           "warn",
  "Power Failure":            "crit",
  "Overstrain Failure":       "crit",
}

// Full class names are written out so Tailwind can see them.
export const TONE = {
  ok:   { label: "Normal",   text: "text-gray-100", dot: "bg-gray-400", edge: "border-gray-500", hex: "#93A9C0" },
  warn: { label: "Warning",  text: "text-warn",     dot: "bg-warn",     edge: "border-warn",     hex: "#F6B73C" },
  crit: { label: "Critical", text: "text-crit",     dot: "bg-crit",     edge: "border-crit",     hex: "#FF6F61" },
}

export const toneOf = (failureType) => TONE[SEVERITY[failureType] || "ok"]

// The derived readings that ontology rules are written against. `domain` only sets the
// visible scale of a limit track; the limits themselves come from the ontology.
export const FEATURES = {
  temp_delta:  { label: "Process minus air temperature", noun: "the temperature gap", unit: "K",      domain: [0, 16],      digits: 1 },
  rpm:         { label: "Rotational speed",              noun: "rotational speed",    unit: "rpm",    domain: [1000, 3000], digits: 0 },
  power_W:     { label: "Mechanical power",              noun: "mechanical power",    unit: "W",      domain: [0, 12000],   digits: 0 },
  wear_torque: { label: "Tool wear × torque",            noun: "tool wear × torque",  unit: "min·Nm", domain: [0, 16000],   digits: 0 },
}
export const FEATURE_ORDER = ["temp_delta", "rpm", "power_W", "wear_torque"]

export const FIELDS = [
  { name: "Air_temperature_K",     label: "Air temperature",     unit: "K",   placeholder: "298.1" },
  { name: "Process_temperature_K", label: "Process temperature", unit: "K",   placeholder: "308.6" },
  { name: "Rotational_speed_rpm",  label: "Rotational speed",    unit: "rpm", placeholder: "1551"  },
  { name: "Torque_Nm",             label: "Torque",              unit: "Nm",  placeholder: "42.8"  },
  { name: "Tool_wear_min",         label: "Tool wear",           unit: "min", placeholder: "0"     },
]

// AI4I 2020 "Type" is the product quality variant.
export const TYPES = [
  { value: "L", name: "Low" },
  { value: "M", name: "Medium" },
  { value: "H", name: "High" },
]

export const EMPTY_FORM = {
  Type: "M",
  Air_temperature_K: "",
  Process_temperature_K: "",
  Rotational_speed_rpm: "",
  Torque_Nm: "",
  Tool_wear_min: "",
}

// Starting points for a demo. The first three are decided by an ontology rule whatever
// the trained model says; the last one has no rule, so the model decides.
export const EXAMPLES = [
  { id: "healthy", label: "Healthy run",
    values: { Type: "M", Air_temperature_K: "298.0", Process_temperature_K: "308.5", Rotational_speed_rpm: "1550", Torque_Nm: "38",   Tool_wear_min: "40" } },
  { id: "heat", label: "Heat dissipation",
    values: { Type: "L", Air_temperature_K: "302.0", Process_temperature_K: "309.9", Rotational_speed_rpm: "1350", Torque_Nm: "40",   Tool_wear_min: "50" } },
  { id: "power", label: "Power failure",
    values: { Type: "L", Air_temperature_K: "298.0", Process_temperature_K: "309.0", Rotational_speed_rpm: "1400", Torque_Nm: "5",    Tool_wear_min: "30" } },
  { id: "strain", label: "Overstrain",
    values: { Type: "L", Air_temperature_K: "298.0", Process_temperature_K: "309.0", Rotational_speed_rpm: "1400", Torque_Nm: "56",   Tool_wear_min: "200" } },
  { id: "wear", label: "High tool wear",
    values: { Type: "L", Air_temperature_K: "298.8", Process_temperature_K: "308.9", Rotational_speed_rpm: "1455", Torque_Nm: "41.3", Tool_wear_min: "208" } },
]
