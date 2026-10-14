import { toneOf } from "./constants"
import { CONFIDENCE_HELP, DECISION_NOTE, confidenceLine, outcomeOf } from "./explain"
import { pct, ruleName, sentence } from "./format"

function Step({ index, title, result, detail, extra, resultClass = "text-gray-50", help }) {
  return (
    <li className="p-5">
      <p className="flex items-baseline gap-2 text-sm text-gray-400">
        <span className="tabular-nums text-gray-500">{index}</span>
        {title}
      </p>
      <p className={`mt-2 font-semibold leading-snug ${resultClass}`}>{result}</p>
      <p className="mt-1 text-sm text-gray-400">{detail}</p>
      {extra && (
        <p className="mt-3 text-sm text-gray-300" title={help}>
          {extra}
        </p>
      )}
    </li>
  )
}

export default function DecisionTrace({ result, machineType }) {
  const { kind, final, ml, mlProb, rules } = outcomeOf(result)
  const checked = result.rule_checks?.length
  const tone = toneOf(final)

  return (
    <section aria-labelledby="trace-title" className="mt-12">
      <h3 id="trace-title" className="text-lg font-semibold text-gray-50">How the decision was made</h3>
      <ol className="mt-5 grid divide-y divide-gray-800 overflow-hidden rounded-lg border border-gray-800 bg-gray-900 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        <Step
          index="1"
          title="ML model"
          result={sentence(ml)}
          detail={`${pct(mlProb)} probability`}
        />
        <Step
          index="2"
          title="Ontology rules"
          result={rules.length ? rules.map((r) => ruleName(r.id)).join(", ") + " fired" : "No rule fired"}
          resultClass={rules.length ? "text-rule" : "text-gray-50"}
          detail={checked ? `${checked} rules checked for type ${machineType}` : "Rules checked against your readings"}
        />
        <Step
          index="3"
          title="Final decision"
          result={sentence(final)}
          resultClass={tone.text}
          detail={DECISION_NOTE[kind]}
          extra={confidenceLine(result)}
          help={CONFIDENCE_HELP}
        />
      </ol>
    </section>
  )
}
