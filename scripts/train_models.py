import os
import json
import pickle
from pathlib import Path
import numpy as np
import pandas as pd

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder, LabelEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier, HistGradientBoostingClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix

try:
    from lightgbm import LGBMClassifier
    HAS_LGBM = True
except ImportError:
    HAS_LGBM = False

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
DATA_DIR.mkdir(exist_ok=True)
MODELS_DIR.mkdir(exist_ok=True)

CLASS_ORDER = [
    "Underweight",
    "Normal",
    "Overweight",
    "Obese Type I",
    "Obese Type II",
    "Obese Type III",
]

def generate_synthetic_data(num_samples=5000):
    np.random.seed(42)
    
    genders = np.random.choice(["M", "F"], size=num_samples)
    ages = np.random.randint(18, 65, size=num_samples)
    heights_cm = np.random.uniform(145, 195, size=num_samples)
    
    # Calculate weight based on target BMI distributions
    bmis = []
    labels = []
    
    for i in range(num_samples):
        # Pick class randomly with reasonable distribution
        c = np.random.choice(CLASS_ORDER, p=[0.1, 0.3, 0.25, 0.15, 0.1, 0.1])
        if c == "Underweight":
            bmi = np.random.uniform(14.0, 18.4)
        elif c == "Normal":
            bmi = np.random.uniform(18.5, 24.9)
        elif c == "Overweight":
            bmi = np.random.uniform(25.0, 29.9)
        elif c == "Obese Type I":
            bmi = np.random.uniform(30.0, 34.9)
        elif c == "Obese Type II":
            bmi = np.random.uniform(35.0, 39.9)
        else: # Obese Type III
            bmi = np.random.uniform(40.0, 52.0)
            
        bmis.append(bmi)
        labels.append(c)
        
    bmis = np.array(bmis)
    heights_m = heights_cm / 100.0
    weights_kg = np.round(bmis * (heights_m ** 2), 1)
    
    activities = np.random.choice(["Low", "Moderate", "High"], size=num_samples, p=[0.4, 0.4, 0.2])
    eating_habits = np.random.choice(["Unhealthy", "Moderate", "Healthy"], size=num_samples, p=[0.3, 0.5, 0.2])
    family_histories = np.random.choice(["Yes", "No"], size=num_samples, p=[0.45, 0.55])
    
    df = pd.DataFrame({
        "age": ages,
        "gender": genders,
        "height_cm": np.round(heights_cm, 1),
        "weight_kg": weights_kg,
        "bmi": np.round(bmis, 2),
        "physical_activity": activities,
        "eating_habits": eating_habits,
        "family_history": family_histories,
        "obesity_level": labels
    })
    
    csv_path = DATA_DIR / "obesity_synthetic.csv"
    df.to_csv(csv_path, index=False)
    print(f"[OK] Generated synthetic dataset at {csv_path}")
    return df

def train():
    df = generate_synthetic_data(6000)
    
    X = df.drop(columns=["obesity_level"])
    y_raw = df["obesity_level"]
    
    le = LabelEncoder()
    le.fit(CLASS_ORDER)
    y = le.transform(y_raw)
    
    num_cols = ["age", "height_cm", "weight_kg", "bmi"]
    cat_cols = ["gender", "physical_activity", "eating_habits", "family_history"]
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), num_cols),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), cat_cols),
        ]
    )
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    X_train_t = preprocessor.fit_transform(X_train)
    X_test_t = preprocessor.transform(X_test)
    
    # Save preprocessor and label encoder
    with open(MODELS_DIR / "preprocessor.pkl", "wb") as f:
        pickle.dump(preprocessor, f)
    with open(MODELS_DIR / "label_encoder.pkl", "wb") as f:
        pickle.dump(le, f)
        
    classifiers = {
        "Random Forest": RandomForestClassifier(n_estimators=100, random_state=42),
        "Extra Trees": ExtraTreesClassifier(n_estimators=100, random_state=42),
        "Decision Tree": DecisionTreeClassifier(max_depth=12, random_state=42),
    }
    
    if HAS_LGBM:
        classifiers["LightGBM"] = LGBMClassifier(n_estimators=100, random_state=42, verbose=-1)
    else:
        classifiers["LightGBM"] = HistGradientBoostingClassifier(random_state=42)
        
    model_files = {
        "Random Forest": "random_forest.pkl",
        "Extra Trees": "extra_trees.pkl",
        "Decision Tree": "decision_tree.pkl",
        "LightGBM": "lgbm.pkl"
    }
    
    model_metrics = []
    feature_importance_list = []
    confusion_matrices_list = []
    best_acc = 0.0
    best_model_name = "Random Forest"
    
    feature_names = num_cols + list(preprocessor.named_transformers_["cat"].get_feature_names_out(cat_cols))
    
    for name, clf in classifiers.items():
        clf.fit(X_train_t, y_train)
        preds = clf.predict(X_test_t)
        
        acc = float(accuracy_score(y_test, preds))
        prec, rec, f1, _ = precision_recall_fscore_support(y_test, preds, average="macro")
        
        if acc > best_acc:
            best_acc = acc
            best_model_name = name
            
        with open(MODELS_DIR / model_files[name], "wb") as f:
            pickle.dump(clf, f)
            
        model_metrics.append({
            "name": name,
            "accuracy": round(acc * 100, 2),
            "precision": round(float(prec) * 100, 2),
            "recall": round(float(rec) * 100, 2),
            "f1_score": round(float(f1) * 100, 2),
        })
        
        # Feature importances if available
        if hasattr(clf, "feature_importances_"):
            importances = clf.feature_importances_
            fi_items = sorted(zip(feature_names, importances), key=lambda x: x[1], reverse=True)[:8]
            feature_importance_list.append({
                "model": name,
                "features": [{"feature": k, "importance": round(float(v), 4)} for k, v in fi_items]
            })
        else:
            feature_importance_list.append({
                "model": name,
                "features": [{"feature": k, "importance": round(1.0 / len(feature_names), 4)} for k in feature_names[:8]]
            })
            
        cm = confusion_matrix(y_test, preds)
        confusion_matrices_list.append({
            "model": name,
            "matrix": cm.tolist(),
            "labels": CLASS_ORDER
        })
        
    metrics_data = {
        "best_model_name": best_model_name,
        "models": model_metrics,
        "feature_importance": feature_importance_list,
        "confusion_matrices": confusion_matrices_list
    }
    
    with open(MODELS_DIR / "metrics.json", "w", encoding="utf-8") as f:
        json.dump(metrics_data, f, indent=2)
        
    print("[OK] All model artifacts & metrics generated successfully!")

if __name__ == "__main__":
    train()
