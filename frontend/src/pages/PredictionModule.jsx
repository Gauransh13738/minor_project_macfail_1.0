import { useRef, useState } from "react"
import { CircleAlert } from "lucide-react"
import Causes from "../components/diagnosis/Causes"
import DecisionTrace from "../components/diagnosis/DecisionTrace"
import LimitTracks, { LimitTrack } from "../components/diagnosis/LimitTracks"
import ReadingsForm from "../components/diagnosis/ReadingsForm"
import Verdict from "../components/diagnosis/Verdict"
import { API, EMPTY_FORM } from "../components/diagnosis/constants"
import { openReport } from "../components/diagnosis/report"

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-gray-700 p-8 sm:p-10">
      <h2 className="display text-3xl text-gray-50 sm:text-4xl">Enter readings to see a diagnosis.</h2>
      <p className="mt-4 max-w-[58ch] leading-relaxed text-gray-300">
        You get a verdict, the ML model's view next to the ontology's, each reading plotted against the
        limit that matters, and what to do about it. Load an example on the left to start.
      </p>
      <div className="mt-8 max-w-md">
        <LimitTrack
          feature="temp_delta"
          value={7.9}
          regions={[{ operator: "<", threshold: 8.6, met: true }]}
          tone="warn"
        />
        <p className="mt-2 text-sm text-gray-500">A sample reading: a 7.9 K gap is under the 8.6 K limit.</p>
      </div>
    </div>
  )
}

function ErrorState({ error, onRetry }) {
  return (
    <div role="alert" className="rounded-lg border border-crit/40 bg-crit/10 p-5">
      <p className="flex items-center gap-2 font-semibold text-crit">
        <CircleAlert size={18} aria-hidden="true" />
        {error.title}
      </p>
      <p className="mt-2 max-w-[64ch] text-gray-200">{error.detail}</p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-md border border-gray-600 px-3.5 py-2 text-sm font-medium text-gray-100 transition-colors hover:border-gray-400"
      >
        Try again
      </button>
    </div>
  )
}

function PredictionModule({ setHistory }) {
  const [values, setValues]   = useState(EMPTY_FORM)
  const [result, setResult]   = useState(null)
  const [shown, setShown]     = useState(null)   // the readings the result was computed from
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState(null)
  const [runId, setRunId]     = useState(0)
  const latest = useRef(0)

  const handleChange = (e) => setValues((prev) => ({ ...prev, [e.target.name]: e.target.value }))

  const run = async (readings) => {
    const ticket = ++latest.current
    setLoading(true)
    setError(null)

    const payload = {
      Type: readings.Type,
      Air_temperature_K:     Number(readings.Air_temperature_K),
      Process_temperature_K: Number(readings.Process_temperature_K),
      Rotational_speed_rpm:  Number(readings.Rotational_speed_rpm),
      Torque_Nm:             Number(readings.Torque_Nm),
      Tool_wear_min:         Number(readings.Tool_wear_min),
    }

    try {
      const res = await fetch(`${API}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (!res.ok) {
        throw Object.assign(new Error("http"), { status: res.status })
      }
      const data = await res.json()
      if (ticket !== latest.current) return   // a newer request is already in flight

      setResult(data)
      setRunId((n) => n + 1)
      setShown({ ...readings })
      setHistory((prev) => [{ ...readings, ...data, timestamp: new Date().toLocaleString() }, ...prev])
    } catch (err) {
      if (ticket !== latest.current) return
      setError(
        err.status === 422
          ? { title: "The service rejected these readings", detail: "Check that every field holds a number, then run the diagnosis again." }
          : err.status
          ? { title: "The diagnosis service returned an error", detail: `It answered with status ${err.status}. Check the terminal where the API is running.` }
          : { title: "Can't reach the diagnosis service", detail: `Start the API from the project folder with "uvicorn app:app --reload", then run the diagnosis again. Looking for it at ${API}.` }
      )
    } finally {
      if (ticket === latest.current) setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    run(values)
  }

  const handleExample = (example) => {
    setValues(example.values)
    run(example.values)
  }

  const handleExport = () => {
    if (!openReport(shown ?? values, result)) {
      setError({ title: "The report was blocked", detail: "Allow pop-ups for this site, then choose Export report again." })
    }
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10">
      <div className="lg:sticky lg:top-20">
        <ReadingsForm
          values={values}
          onChange={handleChange}
          onSubmit={handleSubmit}
          onClear={() => setValues(EMPTY_FORM)}
          onExample={handleExample}
          loading={loading}
        />
      </div>

      <div aria-live="polite" aria-busy={loading} className="min-w-0">
        {error && <ErrorState error={error} onRetry={() => run(values)} />}

        {!result && !error && <EmptyState />}

        {result && (
          // Keyed on the result so the limit markers replay their slide-in for each new diagnosis.
          <div key={runId} className={loading ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <Verdict result={result} onExport={handleExport} />
            <DecisionTrace result={result} machineType={shown?.Type ?? values.Type} />
            <LimitTracks checks={result.rule_checks} machineType={shown?.Type ?? values.Type} />
            <Causes result={result} />
          </div>
        )}
      </div>
    </div>
  )
}

export default PredictionModule
