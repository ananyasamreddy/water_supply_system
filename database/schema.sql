-- ==============================================================================
-- PostgreSQL + PostGIS Schema for Smart Water Supply Network System
-- B.Tech CSE Major Project Database Definition
-- ==============================================================================

-- Enable PostGIS spatial extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- 1. Users and Authentication
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('ADMIN', 'MUNICIPALITY_OFFICER', 'FIELD_ENGINEER', 'CITIZEN')),
    phone VARCHAR(20),
    department VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Water Supply Zones (Polygonal GIS Boundaries)
CREATE TABLE IF NOT EXISTS supply_zones (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    color_hex VARCHAR(20) DEFAULT '#3b82f6',
    population INTEGER DEFAULT 50000,
    avg_daily_demand_m3h NUMERIC(10, 2) DEFAULT 500.0,
    geom GEOMETRY(Polygon, 4326)
);

-- 3. Junction Nodes (Spatial Point Features)
CREATE TABLE IF NOT EXISTS junctions (
    id VARCHAR(50) PRIMARY KEY,
    elevation_m NUMERIC(8, 2) NOT NULL,
    base_demand_lps NUMERIC(8, 2) NOT NULL,
    zone_id VARCHAR(50) REFERENCES supply_zones(id) ON DELETE SET NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Reservoirs (Water Source Point Features)
CREATE TABLE IF NOT EXISTS reservoirs (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    head_m NUMERIC(8, 2) NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL
);

-- 5. Elevated Storage Tanks (Storage Point Features)
CREATE TABLE IF NOT EXISTS tanks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    elevation_m NUMERIC(8, 2) NOT NULL,
    init_level_m NUMERIC(8, 2) NOT NULL,
    min_level_m NUMERIC(8, 2) NOT NULL,
    max_level_m NUMERIC(8, 2) NOT NULL,
    diameter_m NUMERIC(8, 2) NOT NULL,
    zone_id VARCHAR(50) REFERENCES supply_zones(id) ON DELETE SET NULL,
    geom GEOMETRY(Point, 4326) NOT NULL
);

-- 6. Pipelines (Spatial LineString Features)
CREATE TABLE IF NOT EXISTS pipelines (
    id VARCHAR(50) PRIMARY KEY,
    start_node VARCHAR(50) NOT NULL,
    end_node VARCHAR(50) NOT NULL,
    length_m NUMERIC(10, 2) NOT NULL,
    diameter_mm INTEGER NOT NULL,
    roughness_c INTEGER NOT NULL DEFAULT 120,
    material VARCHAR(50) NOT NULL,
    installation_year INTEGER NOT NULL,
    age_years INTEGER NOT NULL,
    condition_score INTEGER NOT NULL CHECK (condition_score BETWEEN 1 AND 5),
    previous_failures INTEGER NOT NULL DEFAULT 0,
    criticality_score INTEGER NOT NULL CHECK (criticality_score BETWEEN 1 AND 5),
    soil_corrosivity INTEGER DEFAULT 3 CHECK (soil_corrosivity BETWEEN 1 AND 5),
    traffic_load INTEGER DEFAULT 3 CHECK (traffic_load BETWEEN 1 AND 5),
    zone_id VARCHAR(50) REFERENCES supply_zones(id) ON DELETE SET NULL,
    current_risk_class VARCHAR(20) DEFAULT 'Low Risk',
    maintenance_priority VARCHAR(20) DEFAULT 'LOW',
    priority_score NUMERIC(5, 2) DEFAULT 25.0,
    geom GEOMETRY(LineString, 4326) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Pumps & Valves
CREATE TABLE IF NOT EXISTS pumps (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    from_node VARCHAR(50) NOT NULL,
    to_node VARCHAR(50) NOT NULL,
    power_kw NUMERIC(8, 2) NOT NULL,
    status VARCHAR(20) DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS valves (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    from_node VARCHAR(50) NOT NULL,
    to_node VARCHAR(50) NOT NULL,
    valve_type VARCHAR(20) NOT NULL,
    setting_psi NUMERIC(8, 2) DEFAULT 50.0,
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

-- 8. Timestamped Hydraulic Simulation Results (EPANET Outputs)
CREATE TABLE IF NOT EXISTS hydraulic_results (
    id BIGSERIAL PRIMARY KEY,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    hour_step INTEGER NOT NULL,
    component_type VARCHAR(20) NOT NULL CHECK (component_type IN ('JUNCTION', 'PIPE', 'TANK', 'RESERVOIR')),
    component_id VARCHAR(50) NOT NULL,
    pressure_psi NUMERIC(8, 2),
    flow_lps NUMERIC(8, 2),
    velocity_ms NUMERIC(8, 2),
    head_m NUMERIC(8, 2),
    demand_lps NUMERIC(8, 2),
    tank_level_m NUMERIC(8, 2),
    scenario_id VARCHAR(50) DEFAULT 'BASELINE',
    is_simulated BOOLEAN DEFAULT TRUE
);

-- 9. Maintenance Records & History Workflow
CREATE TABLE IF NOT EXISTS maintenance (
    id SERIAL PRIMARY KEY,
    pipeline_id VARCHAR(50) REFERENCES pipelines(id) ON DELETE CASCADE,
    problem_description TEXT NOT NULL,
    assigned_engineer_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    assigned_engineer_name VARCHAR(100),
    priority_level VARCHAR(20) NOT NULL CHECK (priority_level IN ('LOW', 'MEDIUM', 'HIGH', 'URGENT')),
    priority_score NUMERIC(5, 2) NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED')),
    scheduled_date DATE DEFAULT CURRENT_DATE,
    completion_date DATE,
    action_taken TEXT,
    cost_estimated NUMERIC(10, 2) DEFAULT 0.0,
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Citizen Complaints (Geotagged Issue Tracking)
CREATE TABLE IF NOT EXISTS complaints (
    id SERIAL PRIMARY KEY,
    citizen_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    citizen_name VARCHAR(100) NOT NULL,
    citizen_phone VARCHAR(20),
    complaint_type VARCHAR(50) NOT NULL CHECK (complaint_type IN ('No water', 'Low pressure', 'Pipeline leakage', 'Water quality issue', 'Other')),
    description TEXT NOT NULL,
    location_desc VARCHAR(255),
    latitude NUMERIC(10, 6) NOT NULL,
    longitude NUMERIC(10, 6) NOT NULL,
    related_zone VARCHAR(50),
    related_pipeline_id VARCHAR(50) REFERENCES pipelines(id) ON DELETE SET NULL,
    image_url TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')),
    resolution_notes TEXT,
    geom GEOMETRY(Point, 4326),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. What-If Scenario Runs
CREATE TABLE IF NOT EXISTS what_if_scenarios (
    id SERIAL PRIMARY KEY,
    scenario_name VARCHAR(150) NOT NULL,
    scenario_type VARCHAR(50) NOT NULL,
    target_component VARCHAR(50) NOT NULL,
    change_parameters JSONB,
    severity VARCHAR(20) DEFAULT 'MODERATE',
    summary_results JSONB,
    created_by_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Simulated Leak Localization Events
CREATE TABLE IF NOT EXISTS leak_scenarios (
    id SERIAL PRIMARY KEY,
    scenario_name VARCHAR(150) NOT NULL,
    simulated_leak_pipe_id VARCHAR(50) REFERENCES pipelines(id) ON DELETE CASCADE,
    simulated_leak_rate_lps NUMERIC(8, 2) DEFAULT 25.0,
    top_candidate_pipe_id VARCHAR(50),
    confidence_level VARCHAR(20),
    candidate_rankings JSONB,
    monitored_deltas JSONB,
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Indexes for sub-second spatial queries
CREATE INDEX IF NOT EXISTS idx_pipelines_geom ON pipelines USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_junctions_geom ON junctions USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_tanks_geom ON tanks USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_reservoirs_geom ON reservoirs USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_complaints_geom ON complaints USING GIST (geom);

-- B-Tree Indexes for relational lookups
CREATE INDEX IF NOT EXISTS idx_hyd_comp ON hydraulic_results (component_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_maint_pipe ON maintenance (pipeline_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints (status);
