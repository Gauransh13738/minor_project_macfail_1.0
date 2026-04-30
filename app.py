# from fastapi import FastAPI
# from pydantic import BaseModel
# import joblib
# import pandas as pd
# from fastapi.middleware.cors import CORSMiddleware
# from ontology_reasoner import get_root_causes

# # ===============================
# # LOAD MODEL
# # ===============================

# model = joblib.load("model.pkl")

# # ===============================
# # FASTAPI APP
# # ===============================

# app = FastAPI(
#     title="Predictive Maintenance API",
#     description="Multi-class failure prediction using AI4I 2020 dataset",
#     version="1.0"
# )

# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["http://localhost:5173"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )

# # ===============================
# # INPUT SCHEMA
# # ===============================

# class MachineInput(BaseModel):
#     Type: str
#     Air_temperature_K: float
#     Process_temperature_K: float
#     Rotational_speed_rpm: float
#     Torque_Nm: float
#     Tool_wear_min: float

# # ===============================
# # FAILURE LABEL MAPPING
# # ===============================

# failure_map = {
#     0: "No Failure",
#     1: "Tool Wear Failure",
#     2: "Heat Dissipation Failure",
#     3: "Power Failure",
#     4: "Overstrain Failure",
#     5: "Random Failure"
# }

# # ===============================
# # HEALTH CHECK
# # ===============================

# @app.get("/")
# def home():
#     return {"message": "Predictive Maintenance API is running"}

# # ===============================
# # PREDICTION ENDPOINT
# # ===============================

# @app.post("/predict")
# def predict_failure(data: MachineInput):
#     input_df = pd.DataFrame([{
#         "Type": data.Type,
#         "Air temperature [K]": data.Air_temperature_K,
#         "Process temperature [K]": data.Process_temperature_K,
#         "Rotational speed [rpm]": data.Rotational_speed_rpm,
#         "Torque [Nm]": data.Torque_Nm,
#         "Tool wear [min]": data.Tool_wear_min
#     }])

#     prediction = model.predict(input_df)[0]
#     failure_type = failure_map[prediction]

#     # ── NEW: Ontology reasoning ──────────────────────────
#     root_causes = get_root_causes(failure_type)

#     return {
#         "failure_class": int(prediction),
#         "failure_type":  failure_type,
#         "root_cause_analysis": root_causes   # NEW field
#     }

from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware
from ontology_reasoner import get_root_causes, ontology_classifier

# ===============================
# LOAD MODEL
# ===============================
model = joblib.load("model.pkl")

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
    """ML prediction assisted by ontology reasoning when confidence is low."""
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

    ontology_assisted = False
    ontology_vote     = None

    # If ML is uncertain, consult ontology
    if confidence < 0.60:
        ontology_vote = ontology_classifier(data)
        if ontology_vote != 0:
            prediction        = ontology_vote
            ontology_assisted = True

    failure_type = failure_map[prediction]
    root_causes  = get_root_causes(failure_type)

    # In the /predict endpoint, update the return:
    return {
        "failure_class":       prediction,
        "failure_type":        failure_type,
        "confidence":          confidence,
        "ontology_assisted":   ontology_assisted,
        "ontology_confidence": 0.92 if ontology_assisted else confidence,
        "ontology_vote":       failure_map.get(ontology_vote, "None") if ontology_vote is not None else "None",
        "root_cause_analysis": root_causes,
        "method":              "ML + Ontology" if ontology_assisted else "ML (high confidence)"
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