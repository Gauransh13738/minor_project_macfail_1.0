import { ruleName } from "./format"

export default function Causes({ result }) {
  const causes = result.root_cause_analysis ?? []

  if (causes.length === 0) {
    return (
      <section aria-labelledby="causes-title" className="mt-12">
        <h3 id="causes-title" className="text-lg font-semibold text-gray-50">What to do</h3>
        <p className="mt-2 max-w-[64ch] text-gray-300">
          {result.failure_type === "No Failure"
            ? "No fault detected, so there is nothing to fix for these readings. Keep monitoring."
            : "The ontology has no root causes recorded for this failure type."}
        </p>
      </section>
    )
  }

  const confirmed = result.root_cause_basis === "rule_evidence"

  return (
    <section aria-labelledby="causes-title" className="mt-12">
      <h3 id="causes-title" className="text-lg font-semibold text-gray-50">
        {confirmed ? "Cause and recommended action" : "Possible causes"}
      </h3>
      <p className="mt-1 max-w-[64ch] text-sm text-gray-400">
        {confirmed
          ? "Only the causes that the rule that fired can speak to are listed."
          : "No rule fired, so these are the known causes of this failure type. None of them is confirmed by your readings."}
      </p>

      <ul className={`mt-5 grid gap-4 ${causes.length > 1 ? "md:grid-cols-2" : ""}`}>
        {causes.map((cause) => (
          <li key={cause.root_cause} className="rounded-lg border border-gray-800 bg-gray-900 p-5">
            <p className={`text-sm font-medium ${cause.evidence === "rule" ? "text-rule" : "text-gray-400"}`}>
              {cause.evidence === "rule"
                ? `Confirmed by ${cause.evidenced_by.map(ruleName).join(" and ")}`
                : "Possible cause"}
            </p>
            <p className="mt-2 font-semibold leading-snug text-gray-50">{cause.root_cause}</p>
            {cause.sensors_involved?.length > 0 && (
              <p className="mt-2 text-sm text-gray-400">Measured by: {cause.sensors_involved.join(", ")}</p>
            )}
            <div className="mt-4 rounded-md bg-gray-950 p-4">
              <p className="text-sm font-medium text-gray-300">Recommended action</p>
              <p className="mt-1 leading-relaxed text-gray-100">{cause.recommended_action}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  )
}
