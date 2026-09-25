"""
Pipeline Failure-Risk Prediction using Random Forest Classifier
Trains on structured pipeline physical, environmental, and hydraulic features.
Evaluates accuracy, precision, recall, F1-score, and confusion matrix.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "models"))
os.makedirs(MODELS_DIR, exist_ok=True)

MODEL_PATH = os.path.join(MODELS_DIR, "random_forest_failure.joblib")
METRICS_PATH = os.path.join(MODELS_DIR, "failure_metrics.json")

NUMERICAL_FEATURES = [
    "age_years",
    "diameter_mm",
    "condition_score",
    "previous_failures",
    "criticality_score",
    "soil_corrosivity",
    "traffic_load",
    "mean_velocity_ms",
    "velocity_variance",
    "pressure_cycles_day"
]

CATEGORICAL_FEATURES = [
    "material"
]

TARGET = "failure_risk_class"
CLASS_NAMES = ["Low Risk", "Medium Risk", "High Risk"]

def train_model():
    print("[*] Training Random Forest Pipeline Failure-Risk Model...")
    csv_path = os.path.join(DATA_DIR, "pipeline_features.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(f"Pipeline features CSV not found at {csv_path}")

    df = pd.read_csv(csv_path)
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df[TARGET]

    # Stratified split to maintain class balance
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.25, random_state=42, stratify=y
    )

    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )

    clf = RandomForestClassifier(
        n_estimators=120,
        max_depth=8,
        min_samples_split=4,
        min_samples_leaf=2,
        class_weight="balanced",
        random_state=42
    )

    pipeline = Pipeline(steps=[
        ("preprocessor", preprocessor),
        ("classifier", clf)
    ])

    pipeline.fit(X_train, y_train)

    # Evaluation on unseen test set
    y_pred = pipeline.predict(X_test)
    acc = float(accuracy_score(y_test, y_pred))
    prec, rec, f1, support = precision_recall_fscore_support(y_test, y_pred, labels=CLASS_NAMES, zero_division=0)
    cm = confusion_matrix(y_test, y_pred, labels=CLASS_NAMES).tolist()

    # Extract feature importances
    preprocessor_fitted = pipeline.named_steps["preprocessor"]
    cat_cols = list(preprocessor_fitted.named_transformers_["cat"].get_feature_names_out(CATEGORICAL_FEATURES))
    all_feature_names = NUMERICAL_FEATURES + cat_cols
    importances = pipeline.named_steps["classifier"].feature_importances_.tolist()
    feature_importance_map = [
        {"feature": name, "importance": round(float(imp), 4)}
        for name, imp in sorted(zip(all_feature_names, importances), key=lambda x: x[1], reverse=True)
    ]

    metrics = {
        "model_name": "Random Forest Classifier",
        "algorithm": "ensemble.RandomForestClassifier",
        "total_samples": len(df),
        "train_samples": len(X_train),
        "test_samples": len(X_test),
        "overall_accuracy": round(acc, 4),
        "classes": CLASS_NAMES,
        "per_class_metrics": {
            cls: {
                "precision": round(float(p), 4),
                "recall": round(float(r), 4),
                "f1_score": round(float(f), 4),
                "test_support": int(s)
            }
            for cls, p, r, f, s in zip(CLASS_NAMES, prec, rec, f1, support)
        },
        "confusion_matrix": {
            "labels": CLASS_NAMES,
            "matrix": cm
        },
        "top_feature_importances": feature_importance_map[:10]
    }

    # Save artifacts
    joblib.dump(pipeline, MODEL_PATH)
    with open(METRICS_PATH, "w") as f:
        json.dump(metrics, f, indent=2)

    print(f"[OK] Random Forest Model trained successfully!")
    print(f"     Test Accuracy: {acc * 100:.2f}%")
    print(f"     Confusion Matrix:\n{np.array(cm)}")
    print(f"     Model saved to: {MODEL_PATH}")
    print(f"     Metrics saved to: {METRICS_PATH}")
    return pipeline, metrics

def predict_risk(input_features: dict):
    """
    Inference endpoint: takes a dictionary of pipeline features and returns:
    - predicted_class: "Low Risk" | "Medium Risk" | "High Risk"
    - probabilities: {Low Risk: p1, Medium Risk: p2, High Risk: p3}
    - top_contributing_factors: List of features pushing toward risk
    """
    if not os.path.exists(MODEL_PATH):
        pipeline, _ = train_model()
    else:
        pipeline = joblib.load(MODEL_PATH)

    df_input = pd.DataFrame([input_features])
    pred_class = pipeline.predict(df_input)[0]
    probs = pipeline.predict_proba(df_input)[0]
    classes = list(pipeline.classes_)

    prob_dict = {cls: round(float(p), 4) for cls, p in zip(classes, probs)}

    # Engineering rule explanation of risk factors
    reasons = []
    age = input_features.get("age_years", 0)
    cond = input_features.get("condition_score", 5)
    fails = input_features.get("previous_failures", 0)
    mat = input_features.get("material", "Ductile Iron")
    cycles = input_features.get("pressure_cycles_day", 20)

    if age > 35:
        reasons.append(f"Pipeline age ({age} years) exceeds standard 30-year design benchmark")
    if cond <= 2:
        reasons.append(f"Severe physical condition score of {cond}/5 indicating wall thinning")
    if fails >= 2:
        reasons.append(f"High historical recurrence with {fails} recorded structural bursts")
    if mat in ["Cast Iron", "Asbestos Cement"]:
        reasons.append(f"Material '{mat}' has high brittleness and susceptibility to graphitization")
    if cycles > 35:
        reasons.append(f"Elevated diurnal pressure transients ({cycles} cycles/day) accelerating fatigue")

    return {
        "pipeline_id": input_features.get("pipeline_id", "CUSTOM"),
        "predicted_risk": pred_class,
        "probabilities": prob_dict,
        "risk_factors": reasons if reasons else ["Pipeline is operating within standard safety limits"]
    }

if __name__ == "__main__":
    train_model()
