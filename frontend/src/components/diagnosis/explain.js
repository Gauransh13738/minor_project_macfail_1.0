// Turns an API result into the plain-language story the page tells.
import { FEATURES } from "./constants"
import { lower, lowerFirst, num, opWord, pct, ruleName } from "./format"

// kind:
//   confirmed  an ontology rule fired and the model said the same thing
//   corrected  an ontology rule fired and overrode a different model prediction
//   vetoed     no rule fired, but the ontology rejected the model's pick
//   ml         no rule applies; the model decides
export function outcomeOf(result) {
  const final  = result.failure_type
  const ml     = result.ml_prediction ?? final
  const source = result.decision_source ?? "ml"
  const kind =
    source === "ontology_rule" ? (ml === final ? "confirmed" : "corrected")
    : source === "ontology_veto" ? "vetoed"
    : "ml"
  return {
    kind,
    final,
    ml,
    mlProb: result.ml_confidence ?? result.confidence,
    rules: result.rules_fired ?? [],
  }
}

function vetoReason(mlName) {
  return mlName === "Random Failure"
    ? "random failures can't be predicted from sensor readings"
    : `the rules for ${lower(mlName)} are complete and none of them fired`
}

export function summaryFor(result) {
  const { kind, final, ml, mlProb, rules } = outcomeOf(result)
  const rule = rules[0]
  const why = rule ? `${ruleName(rule.id)} fired: ${lowerFirst(rule.description)}` : ""

  switch (kind) {
    case "confirmed":
      return `${why}. The ML model reached the same conclusion with ${pct(mlProb)} probability.`
    case "corrected":
      return `The ML model predicted ${lower(ml)} (${pct(mlProb)} probability), but ${lowerFirst(why)}. A fired rule outranks the model.`
    case "vetoed":
      return `The ML model predicted ${lower(ml)}, but the ontology rejected it because ${vetoReason(ml)}. The next most likely class, ${lower(final)}, was chosen.`
    default:
      return final === "No Failure"
        ? `No ontology rule fired and the ML model sees a healthy machine (${pct(mlProb)} probability).`
        : `No ontology rule covers this failure, so the result rests on the ML model alone (${pct(mlProb)} probability).` +
          (mlProb < 0.6 ? " The model is not confident, so double-check the readings." : "")
  }
}

export const DECISION_NOTE = {
  confirmed: "Rule and model agree",
  corrected: "The rule overrides the model",
  vetoed:    "The ontology rejected the model's pick",
  ml:        "No rule applies, so the model decides",
}

// One line saying how sure the system is, labelled by what the number actually is.
export function confidenceLine(result) {
  return result.confidence_basis === "rule_precision"
    ? `Rule precision on AI4I 2020: ${pct(result.confidence)}`
    : `Model probability: ${pct(result.confidence)}`
}

export const CONFIDENCE_HELP =
  "Rule precision is how often this rule fired on a machine that really had this failure in the AI4I 2020 dataset. Model probability is the Random Forest's own estimate."

// "Fires when the temperature gap is below 8.6 K and rotational speed is below 1,380 rpm."
export function firesWhen(rules, machineType) {
  const phrase = (c) => {
    const meta = FEATURES[c.feature]
    return `${opWord(c.operator)} ${num(c.threshold, meta?.digits ?? 0)} ${meta?.unit ?? ""}`.trim()
  }
  const noun = (feature) => FEATURES[feature]?.noun ?? feature
  const suffix = (feature) => (feature === "wear_torque" && machineType ? ` for type ${machineType}` : "")

  const parts = []
  const singles = new Map()
  for (const rule of rules) {
    if (rule.conditions.length === 1) {
      const c = rule.conditions[0]
      singles.set(c.feature, [...(singles.get(c.feature) ?? []), phrase(c)])
    } else {
      parts.push(rule.conditions.map((c) => `${noun(c.feature)} is ${phrase(c)}`).join(" and "))
    }
  }
  for (const [feature, phrases] of singles) {
    phrases.sort((a, b) => (a.startsWith("below") ? -1 : 0) - (b.startsWith("below") ? -1 : 0))
    parts.push(`${noun(feature)} is ${phrases.join(" or ")}${suffix(feature)}`)
  }
  return `Fires when ${parts.join(", or ")}.`
}
