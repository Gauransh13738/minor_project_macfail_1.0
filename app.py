from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
import os
from ontology_reasoner import (
    get_root_causes, derive_features, hybrid_decision, empirical_rule_precision,
    evaluate_rules,
)

# ===============================
# LOAD MODEL
# ===============================
model = joblib.load("model.pkl")

# Empirical precision of each ontology rule family on AI4I (used as the reported
# confidence when a rule decides, so the number is measured, not invented).
try:
    RULE_PRECISION = empirical_rule_precision(
        os.path.join(os.path.dirname(os.path.abspath(__file__)), "ai4i2020.csv"))
except Exception:
    RULE_PRECISION = {}

# ===============================
# FASTAPI APP
# ===============================
app = FastAPI(
    title="Predictive Maintenance API",
    description="Multi-class failure prediction using AI4I 2020 dataset + Ontology-assisted reasoning",
    version="2.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ===============================
# INPUT SCHEMA
# ===============================
class MachineInput(BaseModel):
    Type: str
    Air_temperature_K: float
    Process_temperature_K: float
    Rotational_speed_rpm: float
    Torque_Nm: float
    Tool_wear_min: float

# ===============================
# FAILURE LABEL MAPPING
# ===============================
failure_map = {
    0: "No Failure",
    1: "Tool Wear Failure",
    2: "Heat Dissipation Failure",
    3: "Power Failure",
    4: "Overstrain Failure",
    5: "Random Failure"
}

# ===============================
# HEALTH CHECK
# ===============================
@app.get("/")
def home():
    return {"message": "Predictive Maintenance API v2.0 running"}

# ===============================
# PREDICTION — ML ONLY (baseline)
# ===============================
@app.post("/predict/ml-only")
def predict_ml_only(data: MachineInput):
    """Pure ML prediction — no ontology assistance."""
    input_df = pd.DataFrame([{
        "Type": data.Type,
        "Air temperature [K]": data.Air_temperature_K,
        "Process temperature [K]": data.Process_temperature_K,
        "Rotational speed [rpm]": data.Rotational_speed_rpm,
        "Torque [Nm]": data.Torque_Nm,
        "Tool wear [min]": data.Tool_wear_min
    }])

    proba      = model.predict_proba(input_df)[0]
    prediction = int(proba.argmax())
    confidence = round(float(proba[prediction]), 4)

    return {
        "failure_class":  prediction,
        "failure_type":   failure_map[prediction],
        "confidence":     confidence,
        "method":         "ML Only"
    }

# ===============================
# PREDICTION — ML + ONTOLOGY
# ===============================
@app.post("/predict")
def predict_with_ontology(data: MachineInput):
    input_df = pd.DataFrame([{
        "Type": data.Type,
        "Air temperature [K]": data.Air_temperature_K,
        "Process temperature [K]": data.Process_temperature_K,
        "Rotational speed [rpm]": data.Rotational_speed_rpm,
        "Torque [Nm]": data.Torque_Nm,
        "Tool wear [min]": data.Tool_wear_min
    }])

    proba      = model.predict_proba(input_df)[0]
    ml_pred       = int(proba.argmax())
    ml_confidence = round(float(proba[ml_pred]), 4)

    # Ontology-constrained decision (rules live in factory_ontology.ttl):
    #  - a fired rule decides the failure mode
    #  - otherwise ML's pick is rejected if the ontology rules it out
    features = derive_features(
        data.Tool_wear_min, data.Torque_Nm, data.Air_temperature_K,
        data.Process_temperature_K, data.Rotational_speed_rpm)
    decision   = hybrid_decision(proba, features, data.Type)
    final_pred = decision["final_class"]
    source     = decision["source"]
    assisted   = source != "ml"

    # Reported confidence: measured rule precision when a rule decides,
    # otherwise the ML probability of the class that was chosen.
    if source == "ontology_rule" and RULE_PRECISION.get(final_pred) is not None:
        confidence = round(float(RULE_PRECISION[final_pred]), 4)
    else:
        confidence = round(float(proba[final_pred]), 4)

    failure_type = failure_map[final_pred]
    # Root causes tied to a fired rule are evidence-backed; otherwise they are only candidates.
    root_causes  = get_root_causes(failure_type, decision["fired_rules"])

    methods = {
        "ontology_rule": "Ontology rule",
        "ontology_veto": "ML + Ontology veto",
        "ml":            "ML (ontology consistent)",
    }

    return {
        "failure_class":       final_pred,
        "failure_type":        failure_type,
        "confidence":          confidence,
        "ontology_assisted":   assisted,
        "decision_source":     source,
        "ml_prediction":       failure_map[ml_pred],
        "ml_confidence":       ml_confidence,
        "confidence_basis":    ("rule_precision"
                                if source == "ontology_rule" and RULE_PRECISION.get(final_pred) is not None
                                else "ml_probability"),
        "rules_fired":         [{"id": r["id"], "failure_type": r["failure_type"],
                                 "description": r["description"]}
                                for r in decision["fired_rules"]],
        "rule_checks":         evaluate_rules(features, data.Type),
        "features":            {k: round(v, 2) for k, v in features.items()},
        "vetoed":              [failure_map[c] for c in decision["vetoed"]],
        "root_cause_analysis": root_causes,
        "root_cause_basis":    ("rule_evidence"
                                if any(c["evidence"] == "rule" for c in root_causes)
                                else "candidates"),
        "method":              methods[source],
    }
    
@app.post("/debug/proba")
def debug_proba(data: MachineInput):
    input_df = pd.DataFrame([{
        "Type": data.Type,
        "Air temperature [K]": data.Air_temperature_K,
        "Process temperature [K]": data.Process_temperature_K,
        "Rotational speed [rpm]": data.Rotational_speed_rpm,
        "Torque [Nm]": data.Torque_Nm,
        "Tool wear [min]": data.Tool_wear_min
    }])
    proba = model.predict_proba(input_df)[0]
    return {
        "No Failure":             round(float(proba[0]), 4),
        "Tool Wear Failure":      round(float(proba[1]), 4),
        "Heat Dissipation":       round(float(proba[2]), 4),
        "Power Failure":          round(float(proba[3]), 4),
        "Overstrain Failure":     round(float(proba[4]), 4),
        "Random Failure":         round(float(proba[5]), 4),
        "predicted_class":        int(proba.argmax()),
        "confidence":             round(float(proba.max()), 4)
    }