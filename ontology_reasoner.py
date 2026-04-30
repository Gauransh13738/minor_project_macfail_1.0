# # ontology_reasoner.py
# from rdflib import Graph, Namespace, RDF
# from rdflib.namespace import RDFS

# MF = Namespace("http://macfail.org/ontology#")

# # Map your ML model's output labels to ontology individuals
# FAILURE_MAP = {
#     "Tool Wear Failure":        MF.ToolWearFailure,
#     "Heat Dissipation Failure": MF.HeatDissipationFailure,
#     "Power Failure":            MF.PowerFailure,
#     "Overstrain Failure":       MF.OverstrainFailure,
#     "Random Failure":           MF.RandomFailure,
# }

# # Load ontology once at module level
# g = Graph()
# g.parse("factory_ontology.ttl", format="turtle")


# def get_root_causes(failure_type: str) -> list[dict]:
#     """
#     Given a failure type string from ML model,
#     returns list of root causes with sensors and actions.
#     """
#     failure_node = FAILURE_MAP.get(failure_type)
#     if not failure_node:
#         return []

#     results = []
#     for cause in g.objects(failure_node, MF.caused_by):
#         cause_desc = str(g.value(cause, MF.description) or cause.split("#")[-1])
#         action     = str(g.value(cause, MF.action) or "No action defined.")
#         sensors    = [str(g.value(s, MF.description) or s) 
#                       for s in g.objects(cause, MF.measured_by)]
#         results.append({
#             "root_cause":       cause_desc,
#             "sensors_involved": sensors,
#             "recommended_action": action
#         })
#     return results

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
    """
    Rule-based classifier derived from ontology knowledge.
    Used to assist ML model when confidence is low.
    Returns failure class integer, 0 = no failure detected.
    """
    tool_wear    = data.Tool_wear_min
    torque       = data.Torque_Nm
    air_temp     = data.Air_temperature_K
    process_temp = data.Process_temperature_K
    rpm          = data.Rotational_speed_rpm
    machine_type = data.Type

    temp_delta = process_temp - air_temp
    power      = torque * rpm

    # Thresholds derived from AI4I 2020 dataset analysis
    # TWF: tool wear exceeds lifespan threshold
    if tool_wear > 200:
        return 1

    # HDF: insufficient temperature differential (poor heat dissipation)
    if temp_delta < 8.6:
        return 2

    # PWF: power out of safe operating range
    if power > 9000 or power < 3500:
        return 3

    # OSF: mechanical overstrain from worn tool under high torque
    type_torque_limits = {"L": 10000, "M": 11000, "H": 12000}
    limit = type_torque_limits.get(machine_type, 11000)
    if tool_wear * torque > limit:
        return 4

    return 0