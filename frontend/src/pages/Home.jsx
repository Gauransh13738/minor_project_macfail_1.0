import { Link } from "react-router-dom"
import { LimitTrack } from "../components/diagnosis/LimitTracks"

const RESULTS = [
  { system: "ML model alone",    accuracy: "90.8%", macroF1: "0.520", falseAlarms: "8.5%" },
  { system: "ML + ontology",     accuracy: "97.1%", macroF1: "0.681", falseAlarms: "2.5%", highlight: true },
  { system: "Ontology rules alone", accuracy: "99.4%", macroF1: "0.663", falseAlarms: "0.0%" },
]

const STEPS = [
  {
    title: "The model reads patterns",
    text: "A Random Forest trained on the AI4I 2020 dataset estimates which failure, if any, a set of sensor readings points to.",
  },
  {
    title: "The ontology checks limits",
    text: "Rules stored in an OWL ontology test the readings against engineering limits. A rule that fires settles the diagnosis, and the ontology can reject model guesses that no rule supports.",
  },
  {
    title: "The page shows its work",
    text: "Each verdict lists the rule that fired, the readings against their limits, and the causes and actions linked to that rule.",
  },
]

export default function Home() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <section className="grid items-center gap-12 py-16 lg:grid-cols-[1.15fr_1fr] lg:py-24">
        <div>
          <h1 className="display text-5xl text-gray-50 sm:text-6xl">See what's failing, and why.</h1>
          <p className="mt-6 max-w-[56ch] text-lg leading-relaxed text-gray-300">
            Industra AI pairs a machine learning model with engineering rules written in an ontology.
            Every diagnosis comes with the reading, the limit and the rule behind it.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link
              to="/tools"
              className="rounded-md bg-gray-50 px-5 py-3 font-semibold text-gray-950 transition-colors hover:bg-white"
            >
              Run a diagnosis
            </Link>
            <Link
              to="/dashboard"
              className="rounded-md border border-gray-700 px-5 py-3 font-semibold text-gray-100 transition-colors hover:border-gray-500"
            >
              Watch live sensors
            </Link>
          </div>
        </div>

        <figure className="rounded-lg border border-gray-800 bg-gray-900 p-6">
          <figcaption className="font-semibold text-gray-50">Heat dissipation rule</figcaption>
          <p className="mt-1 text-sm text-gray-400">
            It fires when the gap between process and air temperature is small and the machine is turning slowly.
          </p>
          <div className="mt-5 space-y-4">
            <LimitTrack feature="temp_delta" value={7.9} regions={[{ operator: "<", threshold: 8.6, met: true }]} tone="warn" />
            <LimitTrack feature="rpm" value={1350} regions={[{ operator: "<", threshold: 1380, met: true }]} tone="warn" />
          </div>
          <p className="mt-4 text-sm text-gray-300">Both readings are past their limits, so the rule fires.</p>
        </figure>
      </section>

      <section aria-labelledby="how-title" className="border-t border-gray-800 py-16">
        <h2 id="how-title" className="text-2xl font-semibold text-gray-50">How it works</h2>
        <div className="mt-8 grid gap-10 md:grid-cols-3">
          {STEPS.map((s) => (
            <div key={s.title}>
              <h3 className="font-semibold text-gray-50">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-gray-300">{s.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="results-title" className="border-t border-gray-800 py-16">
        <h2 id="results-title" className="text-2xl font-semibold text-gray-50">Results on AI4I 2020</h2>
        <p className="mt-2 max-w-[68ch] text-gray-300">
          Mean of 10 random 80/20 splits. The ontology rules alone score highest on accuracy because this
          dataset's failures follow threshold rules. The hybrid's edge in macro-F1 comes from tool-wear
          failures that no rule covers.
        </p>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <caption className="sr-only">Accuracy, macro-F1 and false alarm rate for three systems</caption>
            <thead>
              <tr className="border-b border-gray-700 text-sm text-gray-400">
                <th scope="col" className="py-3 pr-4 font-medium">System</th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">Accuracy</th>
                <th scope="col" className="py-3 pr-4 text-right font-medium">Macro-F1</th>
                <th scope="col" className="py-3 text-right font-medium">False alarms</th>
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {RESULTS.map((r) => (
                <tr key={r.system} className={`border-b border-gray-800 ${r.highlight ? "bg-gray-900" : ""}`}>
                  <th scope="row" className={`py-4 pr-4 pl-3 font-medium ${r.highlight ? "text-rule" : "text-gray-100"}`}>{r.system}</th>
                  <td className="py-4 pr-4 text-right text-gray-100">{r.accuracy}</td>
                  <td className="py-4 pr-4 text-right text-gray-100">{r.macroF1}</td>
                  <td className="py-4 pr-3 text-right text-gray-100">{r.falseAlarms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-[68ch] text-sm text-gray-400">
          False alarms are healthy machines flagged as failing. The dataset is synthetic, so these numbers show
          the value of encoding domain rules, not performance on a real plant. Run <code className="text-gray-300">python evaluate.py</code> to
          reproduce them.
        </p>
        <Link to="/tools?tab=performance" className="mt-5 inline-block font-semibold text-rule hover:underline">
          See the full comparison
        </Link>
      </section>
    </div>
  )
}
