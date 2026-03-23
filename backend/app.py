import os
import pandas as pd
import pickle
import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')

from flask import Flask, render_template, request
from sklearn.ensemble import RandomForestClassifier, ExtraTreesClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, confusion_matrix
from sklearn.model_selection import train_test_split

# LightGBM
from lightgbm import LGBMClassifier

app = Flask(__name__)

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
static_path = os.path.join(BASE_DIR, "static")

if not os.path.exists(static_path):
    os.makedirs(static_path)

# -------- LOAD MODEL --------
model = pickle.load(open(os.path.join(BASE_DIR, "model.pkl"), "rb"))
columns = pickle.load(open(os.path.join(BASE_DIR, "columns.pkl"), "rb"))

# -------- LOAD DATASET --------
csv_path = os.path.join(BASE_DIR, "Obesity prediction.csv")
df = pd.read_csv(csv_path)

# -------- TARGET DETECTION --------
target = [c for c in df.columns if c.lower() in ["nobeyesdad", "obesity"]][0]

X = pd.get_dummies(df.drop(target, axis=1))
y = df[target]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

# -------- RECOMMENDATION FUNCTION --------
def get_recommendation(prediction):
    recommendations = {
        "Normal_Weight": [
            "Maintain a balanced diet with fruits, vegetables, and protein",
            "Exercise regularly (at least 30 minutes/day)",
            "Stay hydrated and sleep well"
        ],

        "Insufficient_Weight": [
            "Increase calorie intake with healthy foods",
            "Eat more frequently (5-6 meals/day)",
            "Include protein-rich foods like milk, eggs, and nuts",
            "Do strength training"
        ],

        "Overweight_Level_I": [
            "Reduce sugar and junk food intake",
            "Start regular physical activity (walking/jogging)",
            "Increase fiber intake (vegetables, fruits)",
            "Control portion sizes"
        ],

        "Overweight_Level_II": [
            "Follow a structured diet plan",
            "Exercise daily (cardio + light strength training)",
            "Avoid processed and fried foods",
            "Track your calorie intake"
        ],

        "Obesity_Type_I": [
            "Adopt a low-calorie, high-fiber diet",
            "Exercise at least 45 minutes daily",
            "Avoid sugary drinks and fast food",
            "Monitor weight weekly"
        ],

        "Obesity_Type_II": [
            "Strict diet control with professional guidance",
            "Regular physical activity is essential",
            "Increase fiber and protein intake",
            "Consult a nutritionist or doctor"
        ],

        "Obesity_Type_III": [
            "Immediate medical supervision is recommended",
            "Follow a personalized diet plan",
            "Start with low-impact exercises (walking, yoga)",
            "Lifestyle and behavioral changes are crucial"
        ]
    }

    return recommendations.get(prediction, ["No recommendation available"])

# -------- HOME --------
@app.route('/')
def home():
    return render_template("index.html")

# -------- PREDICT --------
@app.route('/predict', methods=['GET', 'POST'])
def predict():
    if request.method == 'POST':
        data = request.form.to_dict()
        df_input = pd.DataFrame([data])

        for col in df_input.columns:
            try:
                df_input[col] = pd.to_numeric(df_input[col])
            except:
                pass

        df_input = pd.get_dummies(df_input)
        df_input = df_input.reindex(columns=X.columns, fill_value=0)

        prediction = model.predict(df_input)[0]

        # ✅ Recommendation added
        recommendation = get_recommendation(prediction)

        return render_template("result.html",
                               prediction=prediction,
                               recommendation=recommendation)

    return render_template("predict.html")

# -------- ANALYSIS --------
@app.route('/analysis')
def analysis():

    models = {
        "Random Forest": RandomForestClassifier(),
        "Extra Trees": ExtraTreesClassifier(),
        "Decision Tree": DecisionTreeClassifier(),
        "LightGBM": LGBMClassifier(verbose=-1)   # ✅ Warning removed
    }

    accuracies = {}

    for name, m in models.items():
        m.fit(X_train, y_train)
        y_pred = m.predict(X_test)
        acc = accuracy_score(y_test, y_pred) * 100
        accuracies[name] = acc

    # -------- ACCURACY GRAPH --------
    plt.figure()
    plt.bar(accuracies.keys(), accuracies.values())
    plt.title("Algorithm Comparison")
    plt.xticks(rotation=20)
    plt.savefig(os.path.join(static_path, "accuracy.png"))
    plt.close()

    # -------- CONFUSION MATRIX --------
    best_model = RandomForestClassifier()
    best_model.fit(X_train, y_train)
    y_pred = best_model.predict(X_test)

    cm = confusion_matrix(y_test, y_pred)

    plt.figure(figsize=(5,5))
    plt.imshow(cm, cmap='Blues')
    plt.title("Confusion Matrix")
    plt.colorbar()
    plt.savefig(os.path.join(static_path, "confusion.png"))
    plt.close()

    return render_template("analysis.html", accuracies=accuracies)

# -------- UPLOAD --------
@app.route('/upload', methods=['GET', 'POST'])
def upload():
    if request.method == 'POST':
        file = request.files['file']
        df_up = pd.read_csv(file)

        return render_template("upload.html",
                               tables=[df_up.head().to_html(classes='data')],
                               titles=df_up.columns.values)

    return render_template("upload.html")

# -------- RUN --------
if __name__ == "__main__":
    app.run(debug=True)