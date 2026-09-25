# Smart Water Supply Network: Project Datasets Overview

This folder contains the exact datasets utilized across the AI-Powered GIS-Based Smart Water Supply Network Monitoring & Predictive Maintenance System.

---

## 1. Pipeline Failure & Degradation Records
* **File**: `pipeline_features.csv`
* **Size**: 48.9 KB | **Rows**: 502 pipeline segments
* **Used by**: **Random Forest Classifier** (`ai_service/src/ml/failure_prediction.py`)
* **Purpose**: Trains and evaluates the structural degradation model to predict pipe failure risk (`Low Risk`, `Medium Risk`, `High Risk`).
* **Key Features**:
  - `pipe_id`: Identifier of monitored pipeline (e.g. `P_101` to `P_217`)
  - `material`: Pipe material (Cast Iron, Ductile Iron, PVC, HDPE)
  - `age_years`: Installation age (1 to 55 years)
  - `diameter_mm`: Internal pipe diameter (150 mm to 750 mm)
  - `condition_score`: Structural physical integrity assessment (1 to 5)
  - `soil_corrosivity`: Surrounding soil corrosivity index (1 to 10)
  - `pressure_cycles`: Daily pumping pressure surges
  - `previous_failures`: Number of historical bursts repaired on this pipe
  - `criticality`: Proximity to hospitals, schools, and major junctions (1 to 5)
  - `failure_risk`: Ground truth classification target (`LOW`, `MEDIUM`, `HIGH`)

---

## 2. Hourly Water Demand Consumption Time-Series
* **File**: `demand_timeseries.csv`
* **Size**: 272.8 KB | **Rows**: 2,162 hourly timestamps (covering 90 days across 3 municipal zones)
* **Used by**: **XGBoost Regressor** (`ai_service/src/ml/demand_forecasting.py`)
* **Purpose**: Multi-step time series forecasting of upcoming 24-hour municipal water demand ($R^2 = 0.9809$).
* **Key Features**:
  - `timestamp`: Hourly observation datetime
  - `zone_id`: Municipal supply zone (`ZONE_A`, `ZONE_B`, `ZONE_C`)
  - `actual_demand_m3h`: Measured consumption in cubic meters per hour
  - `hour_of_day`: Diurnal feature (0 to 23)
  - `day_of_week`: Day index (0 to 6)
  - `is_weekend`: Binary flag for residential usage spikes
  - `lag_1h`, `lag_2h`, `lag_24h`, `lag_168h`: Autoregressive temporal lags
  - `rolling_mean_6h`, `rolling_mean_24h`: Moving average indicators

---

## 3. Extended-Period Hydraulic Simulation Telemetry
* **File**: `hydraulic_timeseries.csv`
* **Size**: 8.1 MB | **Rows**: 123,122 nodal simulation observations
* **Used by**: **EPANET Simulator & Timeline Scrubber** (`ai_service/src/simulation/epanet_simulator.py`)
* **Purpose**: Generates realistic SCADA telemetry across 30 days (720 hours) for 92 junctions and 117 pipes.
* **Key Features**:
  - `hour_step`: Simulation hour (1 to 720)
  - `node_id`: Monitored junction node (e.g. `J_101` to `J_192`)
  - `pressure_psi`: Dynamic pressure head (evaluated against 20-50 psi standard)
  - `demand_lps`: Instantaneous water outflow in liters per second
  - `pipe_id`: Connected pipeline link
  - `flow_lps`: Instantaneous fluid flow rate
  - `velocity_ms`: Fluid velocity in meters per second
  - `headloss_per_1000m`: Friction head loss computed using Hazen-Williams equation

---

## 4. Geospatial GIS Network Dataset (Hyderabad, Telangana Georeferenced)
* **File**: `network.geojson`
* **Size**: ~105 KB | **Features**: 173 spatial features (117 pipes, 92 junctions, 3 tanks, 2 reservoirs)
* **Used by**: **Leaflet GIS Map & PostGIS Spatial Queries** (`frontend/src/components/GISMap.jsx`, `backend/src/controllers/gisController.js`)
* **Purpose**: Real-world georeferenced spatial layout projected on Hyderabad, Telangana coordinates (Center Lat: 17.3850° N, Lon: 78.4867° E).
* **Municipal Context**: Calibrated to HMWSSB (Hyderabad Metropolitan Water Supply & Sewerage Board) operational zones:
  - **Zone 1 (`ZONE_A`)**: Cyberabad & Hitec City (HMWSSB Div 9 & 15)
  - **Zone 2 (`ZONE_B`)**: Secunderabad & Begumpet (HMWSSB Div 6 & 7)
  - **Zone 3 (`ZONE_C`)**: Old City & Charminar (HMWSSB Div 1 & 2)
* **Key Attributes**:
  - `LineString`: Pipeline geometries connecting junctions with accurate lengths.
  - `Point`: Junctions, tanks, and pumping reservoir stations.
  - Properties include pipe diameter, installation year, zone, and real-time status.

---

## 5. EPANET Physical Network Benchmark File
* **File**: `Net3.inp`
* **Size**: 19.6 KB
* **Used by**: **EPANET Fluid Solver, What-If Engine & Leak Localizer** (`ai_service/src/simulation/`)
* **Purpose**: Industry-standard US EPA hydraulic input file containing physical topology, node elevations (505m–545m MSL Deccan Plateau), pipe roughness, pump curves (Krishna & Godavari intakes), and tank dimensions.

