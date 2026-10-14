import { Loader2 } from "lucide-react"
import { EXAMPLES, FIELDS, TYPES } from "./constants"
import { num } from "./format"

const inputClass =
  "w-full rounded-md border border-gray-700 bg-gray-950 py-2.5 pl-3 pr-12 text-gray-50 tabular-nums " +
  "placeholder:text-gray-600 focus:border-rule " +
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"

// What the ontology rules will actually look at, worked out from the inputs.
function derived(values) {
  const air = parseFloat(values.Air_temperature_K)
  const proc = parseFloat(values.Process_temperature_K)
  const rpm = parseFloat(values.Rotational_speed_rpm)
  const torque = parseFloat(values.Torque_Nm)
  const wear = parseFloat(values.Tool_wear_min)
  const rows = []
  if (Number.isFinite(air) && Number.isFinite(proc)) rows.push(["Temperature gap", `${num(proc - air, 1)} K`])
  if (Number.isFinite(rpm) && Number.isFinite(torque)) rows.push(["Mechanical power", `${num((torque * rpm * 2 * Math.PI) / 60)} W`])
  if (Number.isFinite(wear) && Number.isFinite(torque)) rows.push(["Tool wear × torque", `${num(wear * torque)} min·Nm`])
  return rows
}

export default function ReadingsForm({ values, onChange, onSubmit, onClear, onExample, loading }) {
  const calculated = derived(values)

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-gray-800 bg-gray-900 p-5">
      <h2 className="text-lg font-semibold text-gray-50">Machine readings</h2>
      <p className="mt-1 text-sm text-gray-400">Five sensor values from one machine at one moment.</p>

      <fieldset className="mt-5">
        <legend className="text-sm font-medium text-gray-300">Product quality variant</legend>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {TYPES.map((t) => (
            <label key={t.value} className="relative cursor-pointer">
              <input
                type="radio"
                name="Type"
                value={t.value}
                checked={values.Type === t.value}
                onChange={onChange}
                className="peer sr-only"
              />
              <span className="block rounded-md border border-gray-700 px-2 py-2 text-center text-sm text-gray-300 transition-colors hover:border-gray-500 peer-checked:border-gray-50 peer-checked:bg-gray-50 peer-checked:text-gray-950 peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rule">
                <span className="font-semibold">{t.value}</span>
                <span className="ml-1.5 text-xs opacity-80">{t.name}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-5 space-y-4">
        {FIELDS.map((f) => (
          <div key={f.name}>
            <label htmlFor={f.name} className="text-sm font-medium text-gray-300">{f.label}</label>
            <div className="relative mt-1.5">
              <input
                id={f.name}
                name={f.name}
                type="number"
                inputMode="decimal"
                step="any"
                min="0"
                required
                value={values[f.name]}
                onChange={onChange}
                placeholder={f.placeholder}
                className={inputClass}
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">{f.unit}</span>
            </div>
          </div>
        ))}
      </div>

      {calculated.length > 0 && (
        <dl className="mt-5 space-y-1 border-t border-gray-800 pt-4 text-sm">
          <dt className="sr-only">Calculated from your inputs</dt>
          {calculated.map(([label, value]) => (
            <div key={label} className="flex justify-between gap-3">
              <dt className="text-gray-400">{label}</dt>
              <dd className="text-gray-200 tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-md bg-gray-50 px-4 py-3 font-semibold text-gray-950 transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70"
      >
        {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
        {loading ? "Running diagnosis" : "Run diagnosis"}
      </button>
      <button
        type="button"
        onClick={onClear}
        className="mt-2 w-full rounded-md px-4 py-2 text-sm text-gray-400 transition-colors hover:text-gray-100"
      >
        Clear readings
      </button>

      <div className="mt-5 border-t border-gray-800 pt-5">
        <p className="text-sm font-medium text-gray-300">Load an example</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EXAMPLES.map((ex) => (
            <button
              key={ex.id}
              type="button"
              onClick={() => onExample(ex)}
              className="rounded-full border border-gray-700 px-3 py-1.5 text-sm text-gray-300 transition-colors hover:border-gray-500 hover:text-gray-50"
            >
              {ex.label}
            </button>
          ))}
        </div>
      </div>
    </form>
  )
}
