# 🏭 INDUSTRA AI — Predictive Maintenance with Ontology-Assisted Root Cause Analysis

> A neuro-symbolic predictive maintenance system that combines machine learning with semantic ontology reasoning to detect machine failures, explain why they occur, and recommend corrective actions.

---

## 🎯 Project Overview

Standard ML-based predictive maintenance systems tell you **what** will fail. This system tells you **what**, **why**, and **what to do about it** — by combining a Random Forest classifier with an OWL/RDF knowledge graph reasoner.

### The Core Innovation

When the ML model is uncertain (confidence < 60%), the ontology layer acts as a rule-based fallback derived from domain knowledge, correcting misclassifications on rare failure classes. This is a **neuro-symbolic architecture** — combining statistical learning with symbolic reasoning.

---

## 🗂️ Project Structure
## Project Structure

```
minor_project_macfail_1.0/
├── app.py                    # FastAPI backend — two endpoints: /predict and /predict/ml-only
├── ontology_reasoner.py      # OWL ontology traversal + confidence-guided classifier
├── factory_ontology.ttl      # OWL/RDF ontology (SSN standard) — machines, sensors, failure modes
├── eda.ipynb                 # Model training notebook — run this to generate model.pkl
├── ai4i2020.csv              # AI4I 2020 Predictive Maintenance Dataset (UCI)
├── requirements.txt
└── frontend/
    └── src/
        ├── App.jsx
        ├── components/
        │   ├── Header.jsx
        │   └── Banner.jsx
        └── pages/
            ├── Home.jsx
            ├── Tools.jsx               # Prediction + Analysis + History tabs
            ├── PredictionModule.jsx    # ML vs Ontology comparison panel
            ├── AnalyticsModule.jsx     # Charts and analytics
            ├── SensorDashboard.jsx     # Live gauge dashboard with auto-predict
            └── Documentation.jsx
```
---

## ⚙️ Tech Stack

| Layer | Technology |
|---|---|
| ML Model | Random Forest · scikit-learn · SMOTE oversampling |
| Ontology | OWL/RDF · Turtle format · rdflib · SSN standard |
| Backend | FastAPI · Python 3.11 · uvicorn |
| Frontend | React · Vite · TailwindCSS · Recharts |
| Dataset | AI4I 2020 Predictive Maintenance (UCI) |

---

## 🚀 Setup & Run

### 1. Clone the repo
```bash
git clone https://github.com/Gauransh13738/minor_project_macfail_1.0.git
cd minor_project_macfail_1.0
```

### 2. Create virtual environment
```bash
python3 -m venv venv
source venv/bin/activate        # Mac/Linux
venv\Scripts\activate           # Windows
```

### 3. Install dependencies
```bash
pip install -r requirements.txt
```

### 4. Generate model.pkl
> model.pkl is not included in the repo (too large for git). Generate it by running eda.ipynb.

```bash
pip install jupyter
jupyter notebook eda.ipynb
# Run All Cells — model.pkl will be saved to the project root
```

### 5. Start the backend
```bash
uvicorn app:app --reload
# Running on http://127.0.0.1:8000
# API docs at http://127.0.0.1:8000/docs
```

### 6. Start the frontend
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

---

## 🔌 API Endpoints

### `POST /predict` — ML + Ontology (full pipeline)
```json
{
  "Type": "L",
  "Air_temperature_K": 298.8,
  "Process_temperature_K": 308.9,
  "Rotational_speed_rpm": 1455,
  "Torque_Nm": 41.3,
  "Tool_wear_min": 208
}
```

**Response:**
```json
{
  "failure_class": 1,
  "failure_type": "Tool Wear Failure",
  "confidence": 0.87,
  "ontology_assisted": false,
  "root_cause_analysis": [
    {
      "root_cause": "Tool has exceeded its operational lifespan",
      "sensors_involved": ["Tool wear in minutes"],
      "recommended_action": "Replace cutting tool immediately. Implement scheduled replacement at 200 min intervals."
    }
  ],
  "method": "ML (high confidence)"
}
```

### `POST /predict/ml-only` — Baseline ML only (no ontology)

---

## 📊 Model Performance

| Metric | Value |
|---|---|
| Overall Accuracy | 92.75% |
| OSF (Overstrain) Recall | 100% |
| HDF (Heat Dissipation) Recall | 91.3% |
| PWF (Power Failure) Recall | 77.8% |
| TWF (Tool Wear) Recall | 55.6% |
| Training Strategy | SMOTE oversampling + balanced class weights |

### Before vs After Ontology

| Scenario | ML Only | ML + Ontology |
|---|---|---|
| High confidence predictions | 92.75% accurate | 92.75% accurate |
| Low confidence predictions | Defaults to No Failure ❌ | Ontology corrects it ✅ |
| Root cause provided | ❌ | ✅ |
| Recommended action | ❌ | ✅ |

---

## 🧠 Ontology Structure

Built on the W3C **Semantic Sensor Network (SSN)** standard:
```
Machine → has_sensor → Sensor
FailureMode → caused_by → RootCause
RootCause → measured_by → Sensor
RootCause → has_action → "Recommended maintenance action"
```
**Failure modes modelled:**
- Tool Wear Failure (TWF)
- Heat Dissipation Failure (HDF)
- Power Failure (PWF)
- Overstrain Failure (OSF)
- Random Failure (RNF)

---

## ✨ Features

- **ML vs Ontology comparison panel** — side-by-side with confidence delta callout
- **Confidence-guided hybrid engine** — ontology assists when ML confidence < 60%
- **Root cause analysis** — sensors implicated + recommended action per cause
- **Severity badges** — CRITICAL / WARNING / SAFE per prediction
- **Live sensor dashboard** — 5 arc gauges with safe/warning/danger zones, auto-predicts on slider change
- **Prediction history timeline** — color-coded cards with severity and ontology-assist indicators
- **PDF maintenance report** — one-click export with full diagnosis

---

## 📁 Dataset

**AI4I 2020 Predictive Maintenance Dataset**
- Source: [UCI Machine Learning Repository](https://archive.ics.uci.edu/ml/datasets/AI4I+2020+Predictive+Maintenance+Dataset)
- 10,000 samples · 6 features · 6 classes
- Class imbalance: ~96% No Failure, <4% failure events

---

## 👥 Team

- Gauransh — Project lead, backend, ontology
- Gouri — Frontend, ML pipeline, model training

---

## 📄 License

MIT
EOF

git add README.md
git commit -m "docs: add comprehensive README"
git push origin main
