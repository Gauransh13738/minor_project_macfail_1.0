from rdflib import Graph, Namespace
from rdflib.namespace import RDFS

MF = Namespace("http://macfail.org/ontology#")

FAILURE_MAP = {
    "Tool Wear Failure":        MF.ToolWearFailure,
    "Heat Dissipation Failure": MF.HeatDissipationFailure,
    "Power Failure":            MF.PowerFailure,
    "Overstrain Failure":       MF.OverstrainFailure,
    "Random Failure":           MF.RandomFailure,
}

g = Graph()
g.parse("factory_ontology.ttl", format="turtle")


def get_root_causes(failure_type: str) -> list[dict]:
    failure_node = FAILURE_MAP.get(failure_type)
    if not failure_node:
        return []

    results = []
    for cause in g.objects(failure_node, MF.caused_by):
        cause_desc = str(g.value(cause, MF.description) or cause.split("#")[-1])
        action     = str(g.value(cause, MF.action) or "No action defined.")
        sensors    = [str(g.value(s, MF.description) or s)
                      for s in g.objects(cause, MF.measured_by)]
        results.append({
            "root_cause":           cause_desc,
            "sensors_involved":     sensors,
            "recommended_action":   action
        })
    return results


def ontology_classifier(data) -> int:
    tool_wear    = data.Tool_wear_min
    torque       = data.Torque_Nm
    air_temp     = data.Air_temperature_K
    process_temp = data.Process_temperature_K
    rpm          = data.Rotational_speed_rpm
    machine_type = data.Type

    temp_delta  = process_temp - air_temp
    power       = torque * rpm
    wear_torque = tool_wear * torque

    # OSF: high wear + high torque + high wear_torque
    # 23 false positives → acceptable
    # if tool_wear > 177 and torque > 46 and wear_torque > 11000:
    #     return 4

    # TWF: high wear + high wear_torque
    # Tightened: wear_torque > 9000 cuts false positives 724 → 257
    # while keeping 33/46 actual TWF cases
    # if tool_wear > 198 and wear_torque > 9000:
    #     return 1

    # HDF: perfect rule — 0 false positives
    if temp_delta < 8.6 and rpm < 1380:
        return 2

    # PWF: perfect rule — 0 false positives
    if power < 20000 or power > 90000:
        return 3

    return 0