from fastapi import FastAPI
from pydantic import BaseModel
import joblib
import pandas as pd
from fastapi.middleware.cors import CORSMiddleware

# ===============================
# LOAD MODEL
# ===============================

model = joblib.load("model.pkl")

# ===============================
# FASTAPI APP
# ===============================

app = FastAPI(
    title="Predictive Maintenance API",
    description="Multi-class failure prediction using AI4I 2020 dataset",
    version="1.0"
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
    return {"message": "Predictive Maintenance API is running"}

# ===============================
# PREDICTION ENDPOINT
# ===============================

@app.post("/predict")
def predict_failure(data: MachineInput):

    input_df = pd.DataFrame([{
        "Type": data.Type,
        "Air temperature [K]": data.Air_temperature_K,
        "Process temperature [K]": data.Process_temperature_K,
        "Rotational speed [rpm]": data.Rotational_speed_rpm,
        "Torque [Nm]": data.Torque_Nm,
        "Tool wear [min]": data.Tool_wear_min
    }])

    prediction = model.predict(input_df)[0]

    return {
        "failure_class": int(prediction),
        "failure_type": failure_map[prediction]
    }
