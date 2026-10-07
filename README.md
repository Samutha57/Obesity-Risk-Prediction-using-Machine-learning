# Obesity Risk Prediction System

Full-stack app: **FastAPI** backend with four scikit-learn / LightGBM models, **React** (Vite) frontend with **Tailwind CSS** and **Recharts**.

## Prerequisites

- Python 3.10+ and Node.js 18+
- Windows: PowerShell

## 1. Train models (required once)

From the `obesity-app` folder:

```powershell
cd c:\Users\samut\OneDrive\Desktop\OBESITY\obesity-app\backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cd ..
python scripts\train_models.py
```

This writes:

- `data/obesity_synthetic.csv` — synthetic dataset (~12k rows, tuned label noise + hyperparameters for stronger holdout accuracy)  
- `models/*.pkl` — preprocessor, label encoder, and four classifiers  
- `models/metrics.json` — accuracy, precision, recall (macro), confusion matrices, feature importance  

## 2. Run the backend

```powershell
cd c:\Users\samut\OneDrive\Desktop\OBESITY\obesity-app\backend
.\.venv\Scripts\Activate.ps1
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/predict` | User features → predictions from all models, final prediction, probabilities |
| GET | `/compare` | Accuracy, precision, recall per model |
| GET | `/feature-importance` | Top feature importances per model |
| GET | `/confusion-matrix` | Confusion matrices per model |
| POST | `/recommend` | `{ "obesity_level": "<label>" }` → diet and lifestyle tips |

Optional: copy `frontend/.env.example` to `frontend/.env` and set `VITE_API_URL` if the API is not on `http://localhost:8000`.

## 3. Run the frontend

```powershell
cd c:\Users\samut\OneDrive\Desktop\OBESITY\obesity-app\frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Stack

- **Backend:** FastAPI, pandas, scikit-learn, LightGBM  
- **Frontend:** React, React Router, Tailwind CSS v4, Recharts  

## Project layout

```
obesity-app/
  backend/           # FastAPI app
  frontend/          # Vite + React
  scripts/           # train_models.py
  data/              # CSV (generated)
  models/            # pickles + metrics.json (generated)
```

## Notes

- Metrics use **macro** precision/recall across six obesity classes.  
- **LightGBM** often ranks highest on this tabular task; the UI highlights the best model by validation accuracy from training.  
- If LightGBM fails to install on your machine, use a conda environment or install a prebuilt wheel from [PyPI](https://pypi.org/project/lightgbm/).
