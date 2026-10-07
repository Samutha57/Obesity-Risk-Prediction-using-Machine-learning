from __future__ import annotations

import json
import pickle
from pathlib import Path
from typing import Any

import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR.parent / "models"

CLASS_ORDER = [
    "Underweight",
    "Normal",
    "Overweight",
    "Obese Type I",
    "Obese Type II",
    "Obese Type III",
]

MODEL_FILES = {
    "LightGBM": "lgbm.pkl",
    "Decision Tree": "decision_tree.pkl",
    "Extra Trees": "extra_trees.pkl",
    "Random Forest": "random_forest.pkl",
}

RECOMMENDATIONS: dict[str, dict[str, list[str]]] = {
    "Underweight": {
        "diet_tips": [
            "Eat nutrient-dense meals with healthy fats and lean protein.",
            "Add small snacks between meals to increase calorie intake safely.",
        ],
        "lifestyle_tips": [
            "Include gentle strength training to build lean mass.",
            "Consult a clinician if unintentional weight loss persists.",
        ],
    },
    "Normal": {
        "diet_tips": [
            "Maintain balanced plates: vegetables, whole grains, and lean protein.",
            "Stay hydrated and limit sugary drinks.",
        ],
        "lifestyle_tips": [
            "Keep at least 150 minutes of moderate activity per week.",
            "Prioritize sleep and stress management.",
        ],
    },
    "Overweight": {
        "diet_tips": [
            "Reduce added sugar and ultra-processed foods.",
            "Use smaller portions and track meals for awareness.",
        ],
        "lifestyle_tips": [
            "Increase cardio (walking, cycling) most days of the week.",
            "Add two strength sessions weekly to support metabolism.",
        ],
    },
    "Obese Type I": {
        "diet_tips": [
            "Follow a structured eating plan with a calorie deficit guided by a professional.",
            "Emphasize vegetables, lean protein, and high-fiber foods.",
        ],
        "lifestyle_tips": [
            "Build up to 200+ minutes/week of moderate exercise.",
            "Set gradual weight goals and monitor progress weekly.",
        ],
    },
    "Obese Type II": {
        "diet_tips": [
            "Work with a dietitian on a medically appropriate meal plan.",
            "Limit sugary beverages and refined carbs; focus on whole foods.",
        ],
        "lifestyle_tips": [
            "Combine low-impact cardio with supervised strength training.",
            "Seek clinical support for comorbidity screening (blood pressure, glucose).",
        ],
    },
    "Obese Type III": {
        "diet_tips": [
            "Use a clinician-led nutrition plan; consider medically supervised programs.",
            "Prioritize protein and vegetables to improve satiety within prescribed calories.",
        ],
        "lifestyle_tips": [
            "Start with gentle daily movement and increase duration as tolerated.",
            "Discuss comprehensive care options with your healthcare team.",
        ],
    },
}


def load_pickle(path: Path) -> Any:
    with open(path, "rb") as f:
        return pickle.load(f)


def load_artifacts() -> None:
    global preprocessor, label_encoder, models, metrics
    pre_path = MODELS_DIR / "preprocessor.pkl"
    le_path = MODELS_DIR / "label_encoder.pkl"
    met_path = MODELS_DIR / "metrics.json"
    if not pre_path.exists() or not le_path.exists() or not met_path.exists():
        raise FileNotFoundError(
            "Model artifacts missing. Run: python scripts/train_models.py from obesity-app folder."
        )
    preprocessor = load_pickle(pre_path)
    label_encoder = load_pickle(le_path)
    models = {}
    for name, fname in MODEL_FILES.items():
        p = MODELS_DIR / fname
        if not p.exists():
            raise FileNotFoundError(f"Missing model file: {p}")
        models[name] = load_pickle(p)
    with open(met_path, encoding="utf-8") as f:
        metrics = json.load(f)


preprocessor = None
label_encoder = None
models = {}
metrics = {}

app = FastAPI(title="Obesity Risk Prediction API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    load_artifacts()


class PredictIn(BaseModel):
    age: int = Field(..., ge=1, le=120)
    gender: str = Field(..., min_length=1, max_length=20)
    height_cm: float = Field(..., gt=50, lt=300)
    weight_kg: float = Field(..., gt=10, lt=400)
    physical_activity: str
    eating_habits: str
    family_history: str


class RecommendIn(BaseModel):
    obesity_level: str


class LoginIn(BaseModel):
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)


class SignupIn(BaseModel):
    name: str = Field(..., min_length=2)
    email: str = Field(..., min_length=3)
    password: str = Field(..., min_length=4)


USER_DATABASE: dict[str, dict[str, str]] = {
    "demo@example.com": {
        "name": "Alex Morgan",
        "password": "password123",
    }
}


def normalize_gender(g: str) -> str:
    g = g.strip()
    if g.lower() in ("male", "m"):
        return "M"
    if g.lower() in ("female", "f"):
        return "F"
    return g


def row_to_frame(body: PredictIn) -> pd.DataFrame:
    h_m = body.height_cm / 100.0
    bmi = body.weight_kg / (h_m**2)
    gender = normalize_gender(body.gender)
    return pd.DataFrame(
        [
            {
                "age": body.age,
                "gender": gender,
                "height_cm": body.height_cm,
                "weight_kg": body.weight_kg,
                "bmi": round(bmi, 2),
                "physical_activity": body.physical_activity,
                "eating_habits": body.eating_habits,
                "family_history": body.family_history,
            }
        ]
    )


def proba_to_list(clf: Any, X_t: np.ndarray) -> list[dict[str, float]]:
    if not hasattr(clf, "predict_proba"):
        return []
    probs = clf.predict_proba(X_t)[0]
    classes = clf.classes_
    out = []
    for c, p in zip(classes, probs):
        if isinstance(c, (int, np.integer)) or (isinstance(c, str) and c.isdigit()):
            label = label_encoder.inverse_transform(np.array([int(c)]))[0]
        else:
            label = str(c)
        out.append({"label": str(label), "value": round(float(p), 4)})
    # Sort by class order for consistent UI
    order = {l: i for i, l in enumerate(CLASS_ORDER)}
    out.sort(key=lambda x: order.get(x["label"], 99))
    return out


@app.post("/predict")
def predict(body: PredictIn) -> dict[str, Any]:
    if not models or preprocessor is None or label_encoder is None:
        load_artifacts()

    df = row_to_frame(body)
    X_t = preprocessor.transform(df)

    predictions: dict[str, str] = {}
    for name, clf in models.items():
        pred_idx = clf.predict(X_t)[0]
        if isinstance(pred_idx, (int, np.integer)) or (isinstance(pred_idx, str) and pred_idx.isdigit()):
            pred_label = label_encoder.inverse_transform(np.array([int(pred_idx)]))[0]
        else:
            pred_label = str(pred_idx)
        predictions[name] = str(pred_label)

    best_name = metrics.get("best_model_name", "Random Forest")
    if best_name not in models:
        best_name = next(iter(models.keys()))

    best_clf = models[best_name]
    final_pred = predictions.get(best_name, next(iter(predictions.values())))
    probabilities = proba_to_list(best_clf, X_t)

    return {
        "predictions": predictions,
        "final_prediction": final_pred,
        "best_model_name": best_name,
        "probabilities": probabilities,
    }


@app.get("/compare")
def compare() -> dict[str, Any]:
    if not metrics:
        load_artifacts()
    return {"models": metrics.get("models", [])}


@app.get("/feature-importance")
def feature_importance() -> dict[str, Any]:
    if not metrics:
        load_artifacts()
    return {"models": metrics.get("feature_importance", [])}


@app.get("/confusion-matrix")
def confusion_matrix_ep() -> dict[str, Any]:
    if not metrics:
        load_artifacts()
    return {"models": metrics.get("confusion_matrices", [])}


@app.post("/recommend")
def recommend(body: RecommendIn) -> dict[str, Any]:
    level = body.obesity_level.strip()
    matched_key = None
    for k in RECOMMENDATIONS:
        if k.lower() == level.lower():
            matched_key = k
            break
    if not matched_key:
        raise HTTPException(
            status_code=422,
            detail=f"Unknown obesity level: '{level}'. Expected one of: {list(RECOMMENDATIONS.keys())}",
        )
    return {"obesity_level": matched_key, **RECOMMENDATIONS[matched_key]}


@app.post("/login")
def login_ep(body: LoginIn) -> dict[str, Any]:
    email = body.email.strip().lower()
    password = body.password

    # Check database or allow demo login
    user_info = USER_DATABASE.get(email)
    if user_info and user_info["password"] == password:
        name = user_info["name"]
    elif email and len(password) >= 4:
        # Dynamic sign-in for valid format
        name = email.split("@")[0].replace(".", " ").title()
        USER_DATABASE[email] = {"name": name, "password": password}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = f"token_{hash(email + password)}"
    return {
        "status": "success",
        "message": "Login successful",
        "user": {
            "name": name,
            "email": email,
            "token": token,
        },
    }


@app.post("/signup")
def signup_ep(body: SignupIn) -> dict[str, Any]:
    email = body.email.strip().lower()
    name = body.name.strip()
    password = body.password

    if email in USER_DATABASE:
        raise HTTPException(status_code=400, detail="Account with this email already exists")

    USER_DATABASE[email] = {"name": name, "password": password}
    token = f"token_{hash(email + password)}"

    return {
        "status": "success",
        "message": "Account created successfully",
        "user": {
            "name": name,
            "email": email,
            "token": token,
        },
    }


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
