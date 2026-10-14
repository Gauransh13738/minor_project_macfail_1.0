"""Ontology reasoner for INDUSTRA AI / MacFail.

Reads factory_ontology.ttl and uses it for three jobs:

1. Root-cause lookup   - get_root_causes(failure_type)
2. Rule execution      - fire_rules(features, machine_type); the diagnostic rules and
                         their thresholds are stored in the ontology, not in this file.
3. Hybrid decision     - hybrid_decision(proba, features, machine_type), which combines
                         the ML class probabilities with the ontology:
     * a fired rule is a sufficient condition, so it decides the failure mode;
     * if no rule fires, modes whose rules are declared 'complete' (necessary as well as
       sufficient) are rejected, as are modes declared unpredictable (random failures);
       the best remaining ML class wins.
"""
import math
import os

from rdflib import Graph, Namespace, RDF

MF = Namespace("http://macfail.org/ontology#")

_HERE = os.path.dirname(os.path.abspath(__file__))
g = Graph()
g.parse(os.path.join(_HERE, "factory_ontology.ttl"), format="turtle")

FAILURE_MAP = {
    "Tool Wear Failure":        MF.ToolWearFailure,
    "Heat Dissipation Failure": MF.HeatDissipationFailure,
    "Power Failure":            MF.PowerFailure,
    "Overstrain Failure":       MF.OverstrainFailure,
    "Random Failure":           MF.RandomFailure,
}

# class index used by the ML model -> ontology node
FAILURE_CLASS = {
    1: MF.ToolWearFailure,
    2: MF.HeatDissipationFailure,
    3: MF.PowerFailure,
    4: MF.OverstrainFailure,
    5: MF.RandomFailure,
}
_CLASS_OF = {node: cls for cls, node in FAILURE_CLASS.items()}

_OPS = {
    "<":  lambda a, b: a < b,
    "<=": lambda a, b: a <= b,
    ">":  lambda a, b: a > b,
    ">=": lambda a, b: a >= b,
}


# ── 1. Root-cause lookup ────────────────────────────────────────────────
def get_root_causes(failure_type: str, fired_rules: list | None = None) -> list[dict]:
    failure_node = FAILURE_MAP.get(failure_type)
    if not failure_node:
        return []

    # Root causes that a fired rule explains are evidence-backed; if no fired rule
    # explains any cause of this failure mode, every cause is returned as a candidate.
    supported = {}
    for rule in fired_rules or []:
        for cause_id in rule["explains"]:
            supported.setdefault(cause_id, []).append(rule["id"])

    causes = list(g.objects(failure_node, MF.caused_by))
    backed = [c for c in causes if str(c).split("#")[-1] in supported]

    results = []
    for cause in (backed or causes):
        cause_id   = str(cause).split("#")[-1]
        cause_desc = str(g.value(cause, MF.description) or cause_id)
        action     = str(g.value(cause, MF.action) or "No action defined.")
        sensors    = [str(g.value(s, MF.description) or s)
                      for s in g.objects(cause, MF.measured_by)]
        results.append({
            "root_cause":         cause_desc,
            "sensors_involved":   sensors,
            "recommended_action": action,
            "evidence":           "rule" if cause_id in supported else "candidate",
            "evidenced_by":       supported.get(cause_id, []),
        })
    return results


# ── 2. Rule execution ───────────────────────────────────────────────────
def _num(literal) -> float:
    return float(literal.toPython())


def _load_rules() -> list[dict]:
    rules = []
    for rule in g.subjects(RDF.type, MF.Rule):
        failure = g.value(rule, MF.indicates)
        conditions = [
            (str(g.value(c, MF.feature)), str(g.value(c, MF.operator)), _num(g.value(c, MF.threshold)))
            for c in g.objects(rule, MF.hasCondition)
        ]
        rtype = g.value(rule, MF.appliesToType)
        prio = g.value(failure, MF.priority)
        rules.append({
            "id":            str(rule).split("#")[-1],
            "failure_class": _CLASS_OF[failure],
            "failure_type":  next(k for k, v in FAILURE_MAP.items() if v == failure),
            "conditions":    conditions,
            "machine_type":  str(rtype) if rtype is not None else None,
            "priority":      int(prio.toPython()) if prio is not None else 99,
            "description":   str(g.value(rule, MF.description) or ""),
            "explains":      [str(c).split("#")[-1] for c in g.objects(rule, MF.explains)],
        })
    rules.sort(key=lambda r: (r["priority"], r["id"]))
    return rules


RULES = _load_rules()

# failure classes whose rules are declared complete / that cannot be predicted
COMPLETE_CLASSES = {
    _CLASS_OF[f] for f in g.subjects(MF.ruleCoverage, None)
    if str(g.value(f, MF.ruleCoverage)) == "complete"
}
UNPREDICTABLE_CLASSES = {
    _CLASS_OF[f] for f in g.subjects(MF.predictable, None)
    if g.value(f, MF.predictable).toPython() is False
}


def derive_features(tool_wear, torque, air_temp, process_temp, rpm) -> dict:
    return {
        "tool_wear":   float(tool_wear),
        "torque":      float(torque),
        "rpm":         float(rpm),
        "temp_delta":  float(process_temp) - float(air_temp),
        "power_W":     float(torque) * float(rpm) * 2 * math.pi / 60,
        "wear_torque": float(tool_wear) * float(torque),
    }


def fire_rules(features: dict, machine_type: str) -> list[dict]:
    """Rules whose conditions all hold, ordered by failure-mode priority."""
    fired = []
    for r in RULES:
        if r["machine_type"] is not None and r["machine_type"] != machine_type:
            continue
        if all(_OPS[op](features[feat], thr) for feat, op, thr in r["conditions"]):
            fired.append(r)
    return fired


def evaluate_rules(features: dict, machine_type: str) -> list[dict]:
    """Every rule that applies to this machine type, with each condition's measured
    value and whether it is met. Lets a UI show how close a reading is to a limit."""
    checks = []
    for r in RULES:
        if r["machine_type"] is not None and r["machine_type"] != machine_type:
            continue
        conditions = []
        for feat, op, thr in r["conditions"]:
            value = features[feat]
            conditions.append({
                "feature":   feat,
                "operator":  op,
                "threshold": thr,
                "value":     round(value, 2),
                "met":       bool(_OPS[op](value, thr)),
            })
        checks.append({
            "id":            r["id"],
            "failure_class": r["failure_class"],
            "failure_type":  r["failure_type"],
            "description":   r["description"],
            "fired":         all(c["met"] for c in conditions),
            "conditions":    conditions,
        })
    return checks


def ontology_classifier(data) -> int:
    """Rule-only vote (0 = no rule fired). Kept for backwards compatibility."""
    feats = derive_features(data.Tool_wear_min, data.Torque_Nm, data.Air_temperature_K,
                            data.Process_temperature_K, data.Rotational_speed_rpm)
    fired = fire_rules(feats, data.Type)
    return fired[0]["failure_class"] if fired else 0


# ── 3. Hybrid decision ──────────────────────────────────────────────────
def hybrid_decision(proba, features: dict, machine_type: str) -> dict:
    """Combine ML class probabilities with the ontology.

    Returns dict(final_class, source, fired_rules, ml_class, vetoed) where source is
    'ontology_rule' (a rule decided), 'ontology_veto' (ML's pick was rejected by the
    ontology and the next admissible class chosen) or 'ml' (ML pick stands).
    """
    ml_class = max(range(len(proba)), key=lambda c: proba[c])
    fired = fire_rules(features, machine_type)
    if fired:
        return {"final_class": fired[0]["failure_class"], "source": "ontology_rule",
                "fired_rules": fired, "ml_class": ml_class, "vetoed": []}

    blocked = COMPLETE_CLASSES | UNPREDICTABLE_CLASSES
    allowed = [c for c in range(len(proba)) if c not in blocked]
    final = max(allowed, key=lambda c: proba[c])
    return {"final_class": final,
            "source": "ml" if final == ml_class else "ontology_veto",
            "fired_rules": [], "ml_class": ml_class,
            "vetoed": [ml_class] if final != ml_class else []}


# ── Empirical rule precision (used as an honest confidence for rule decisions) ──
def empirical_rule_precision(csv_path: str) -> dict:
    """Precision of each failure mode's rules on the AI4I data: {class: precision}."""
    import pandas as pd
    df = pd.read_csv(csv_path, encoding="utf-8-sig")
    flag = {2: "HDF", 3: "PWF", 4: "OSF"}
    hits, total = {c: 0 for c in flag}, {c: 0 for c in flag}
    for row in df.itertuples(index=False):
        feats = derive_features(row[7], row[6], row[3], row[4], row[5])
        fired = fire_rules(feats, row[2])
        if not fired:
            continue
        cls = fired[0]["failure_class"]
        if cls in flag:
            total[cls] += 1
            hits[cls] += int(getattr(row, flag[cls]) == 1)
    return {c: (hits[c] / total[c] if total[c] else None) for c in flag}
