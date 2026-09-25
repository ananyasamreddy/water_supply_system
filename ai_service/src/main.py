"""
FastAPI AI/ML & Hydraulic Simulation Service for Smart Water Supply Network System
Exposes REST endpoints for EPANET hydraulics, What-If analysis, Simulated Leak Localization,
Random Forest failure-risk prediction, and XGBoost water demand forecasting.
"""

import os
import json
from typing import Optional, Dict, Any
from fastapi import FastAPI, Query, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .simulation.epanet_simulator import simulator_instance
from .simulation.what_if_engine import what_if_instance
from .simulation.leak_localizer import leak_localizer_instance
from .ml.failure_prediction import predict_risk, train_model as train_rf
from .ml.demand_forecasting import forecast_demand, train_model as train_xgb

app = FastAPI(
    title="Smart Water Network AI & Hydraulic Simulation Service",
    version="1.0.0",
    description="Backend microservice for B.Tech Major Project: AI-Powered GIS Water Supply Network Monitoring System"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "models"))
DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "data"))

class PipelinePredictionRequest(BaseModel):
    pipeline_id: Optional[str] = "P_102"
    material: Optional[str] = "Cast Iron"
    age_years: Optional[int] = 38
    diameter_mm: Optional[int] = 250
    condition_score: Optional[int] = 2
    previous_failures: Optional[int] = 3
    criticality_score: Optional[int] = 4
    soil_corrosivity: Optional[int] = 4
    traffic_load: Optional[int] = 3
    mean_velocity_ms: Optional[float] = 1.35
    velocity_variance: Optional[float] = 0.42
    pressure_cycles_day: Optional[int] = 36

class WhatIfRequest(BaseModel):
    scenario_type: str = "PIPE_FAILURE"
    target_component: str = "P_102"
    parameters: Optional[Dict[str, Any]] = None
    hour_step: Optional[int] = 14

class LeakLocalizationRequest(BaseModel):
    leak_pipe_id: str = "P_102"
    simulated_leak_rate_lps: Optional[float] = 28.0

@app.get("/health")
def health_check():
    rf_ready = os.path.exists(os.path.join(MODELS_DIR, "random_forest_failure.joblib"))
    xgb_ready = os.path.exists(os.path.join(MODELS_DIR, "xgboost_demand.joblib"))
    data_ready = os.path.exists(os.path.join(DATA_DIR, "network.geojson"))
    return {
        "status": "ONLINE",
        "service": "AI & Hydraulic Simulation Engine",
        "models": {
            "random_forest_failure": "READY" if rf_ready else "NOT_FOUND",
            "xgboost_demand": "READY" if xgb_ready else "NOT_FOUND"
        },
        "datasets": {
            "network_geojson": "LOADED" if data_ready else "NOT_FOUND"
        }
    }

@app.get("/network/geojson")
def get_network_geojson():
    """Returns the full benchmark water network GeoJSON (pipelines, junctions, tanks, reservoirs)."""
    geojson_path = os.path.join(DATA_DIR, "network.geojson")
    if not os.path.exists(geojson_path):
        raise HTTPException(status_code=404, detail="Network GeoJSON not found")
    with open(geojson_path, "r") as f:
        return json.load(f)

@app.get("/simulation/hydraulic/snapshot")
def get_hydraulic_snapshot(hour: int = Query(12, ge=0, le=719, description="Hour step (0 to 719)")):
    """Returns extended period simulation results across all network components at a given hour."""
    return simulator_instance.get_simulation_state_at_hour(hour)

@app.get("/simulation/component-timeseries/{component_id}")
def get_component_timeseries(component_id: str, hours: int = Query(72, ge=1, le=720)):
    """Returns time-series profile for a specific pipe, junction, or tank."""
    return simulator_instance.get_component_timeseries(component_id, hours)

@app.post("/simulation/what-if")
def run_what_if_scenario(req: WhatIfRequest):
    """Executes a comparative what-if hydraulic simulation: Baseline vs Modified Scenario."""
    return what_if_instance.run_scenario(
        scenario_type=req.scenario_type,
        target_component=req.target_component,
        parameters=req.parameters,
        hour_step=req.hour_step
    )

@app.post("/simulation/leak-localization")
def run_leak_localization(req: LeakLocalizationRequest):
    """Executes simulated leak localization using hydraulic sensitivity matching."""
    return leak_localizer_instance.run_leak_localization(
        leak_pipe_id=req.leak_pipe_id,
        simulated_leak_rate_lps=req.simulated_leak_rate_lps
    )

@app.post("/ml/failure-risk/predict")
def predict_failure_risk(req: PipelinePredictionRequest):
    """Predicts pipeline failure risk (Low, Medium, High) using trained Random Forest Classifier."""
    return predict_risk(req.model_dump())

@app.get("/ml/demand/forecast")
def get_demand_forecast(
    zone: str = Query("ZONE_A", description="Supply zone (ZONE_A, ZONE_B, ZONE_C)"),
    horizon: int = Query(24, ge=1, le=168, description="Forecast horizon in hours (1-168)")
):
    """Generates future water demand forecast using trained XGBoost Regressor."""
    return forecast_demand(zone=zone, horizon_hours=horizon)

@app.get("/metrics/all")
def get_all_evaluation_metrics():
    """Returns actual trained evaluation metrics for Random Forest, XGBoost, and sequence models."""
    rf_metrics_path = os.path.join(MODELS_DIR, "failure_metrics.json")
    xgb_metrics_path = os.path.join(MODELS_DIR, "demand_metrics.json")
    lstm_metrics_path = os.path.join(MODELS_DIR, "lstm_metrics.json")

    res = {}
    if os.path.exists(rf_metrics_path):
        with open(rf_metrics_path, "r") as f:
            res["failure_risk_model"] = json.load(f)
    if os.path.exists(xgb_metrics_path):
        with open(xgb_metrics_path, "r") as f:
            res["demand_forecast_model"] = json.load(f)
    if os.path.exists(lstm_metrics_path):
        with open(lstm_metrics_path, "r") as f:
            res["lstm_sequence_model"] = json.load(f)

    return res

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("ai_service.src.main:app", host="0.0.0.0", port=8000, reload=True)
