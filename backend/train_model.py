# Step 1: Import libraries
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import pickle

# Step 2: Load dataset
df = pd.read_csv("Obesity prediction.csv")

# Step 3: Print columns (for confirmation)
print("Columns in dataset:\n", df.columns)

# Step 4: Correct target column
target = "Obesity"   # ✅ FIXED

# Step 5: Split features and target
X = df.drop(target, axis=1)
y = df[target]

# Step 6: Convert categorical features
X = pd.get_dummies(X)

# Step 7: Train-test split
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Step 8: Train model
model = RandomForestClassifier()
model.fit(X_train, y_train)

# Step 9: Save model
with open("model.pkl", "wb") as f:
    pickle.dump(model, f)

# Step 10: Save columns
with open("columns.pkl", "wb") as f:
    pickle.dump(X.columns.tolist(), f)

print("✅ Model trained successfully!")