-- ==============================================================================
-- Seed Data for Smart Water Supply Network System
-- Default User Credentials (password: password123 for all test accounts)
-- ==============================================================================

-- 1. Default Users for all 4 Roles
INSERT INTO users (name, email, password_hash, role, phone, department)
VALUES
('System Administrator', 'admin@water.gov', '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q', 'ADMIN', '+91 9876543210', 'Information & Water Infrastructure Ops'),
('Ramesh Kumar', 'officer@water.gov', '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q', 'MUNICIPALITY_OFFICER', '+91 9876543211', 'Municipal Water Supply & Distribution'),
('Priya Sharma', 'engineer@water.gov', '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q', 'FIELD_ENGINEER', '+91 9876543212', 'Pipeline Maintenance & Rapid Response'),
('Ananya Gupta', 'citizen@water.gov', '$2b$10$EPV6i0h9H3J/x7pP2XFZe.nkg/R6nK14Z2rYvL8c3S0D4d6aM1Q0q', 'CITIZEN', '+91 9876543213', 'Sector 4 Residents Association')
ON CONFLICT (email) DO NOTHING;

-- 2. Water Supply Zones
INSERT INTO supply_zones (id, name, color_hex, population, avg_daily_demand_m3h, geom)
VALUES
('ZONE_A', 'North Residential Sector', '#3b82f6', 85000, 450.0, ST_GeomFromText('POLYGON((77.560 12.985, 77.625 12.985, 77.625 13.005, 77.560 13.005, 77.560 12.985))', 4326)),
('ZONE_B', 'Central Commercial District', '#10b981', 120000, 780.0, ST_GeomFromText('POLYGON((77.560 12.965, 77.625 12.965, 77.625 12.985, 77.560 12.985, 77.560 12.965))', 4326)),
('ZONE_C', 'South Industrial & Harbor Zone', '#f59e0b', 65000, 620.0, ST_GeomFromText('POLYGON((77.560 12.945, 77.625 12.945, 77.625 12.965, 77.560 12.965, 77.560 12.945))', 4326))
ON CONFLICT (id) DO NOTHING;

-- 3. Initial Maintenance Work Orders
INSERT INTO maintenance (pipeline_id, problem_description, assigned_engineer_id, assigned_engineer_name, priority_level, priority_score, status, scheduled_date, action_taken, cost_estimated)
VALUES
('P_102', 'High structural failure risk predicted by Random Forest (Age 45 yrs, Cast Iron, severe wall degradation)', 3, 'Priya Sharma', 'URGENT', 89.5, 'IN_PROGRESS', CURRENT_DATE, 'Acoustic inspection dispatched; ultrasonic thickness testing underway', 45000.0),
('P_105', 'Repeated pressure fluctuation anomalies detected during peak morning pumping', 3, 'Priya Sharma', 'HIGH', 74.2, 'ASSIGNED', CURRENT_DATE, 'Scheduled isolation valve inspection and joint leak test', 28000.0),
('P_112', 'Sub-surface soil moisture detected near arterial junction crossway', 3, 'Priya Sharma', 'MEDIUM', 56.0, 'PENDING', CURRENT_DATE + INTERVAL '2 days', 'Visual and sensor pit inspection planned', 12000.0),
('P_120', 'Corrosion pit remediation and epoxy lining rehabilitation', 3, 'Priya Sharma', 'HIGH', 71.0, 'COMPLETED', CURRENT_DATE - INTERVAL '5 days', 'Replaced 42-meter pipe section with Ductile Iron Class K9; pressure tested to 12 bar', 85000.0);

-- 4. Initial Citizen Complaints
INSERT INTO complaints (citizen_id, citizen_name, citizen_phone, complaint_type, description, location_desc, latitude, longitude, related_zone, related_pipeline_id, status, geom)
VALUES
(4, 'Ananya Gupta', '+91 9876543213', 'Low pressure', 'Very low water pressure during morning hours (7 AM - 9 AM) on 2nd and 3rd floors.', 'Near 5th Cross, 2nd Main, Indiranagar', 12.9782, 77.5920, 'ZONE_A', 'P_102', 'IN_PROGRESS', ST_SetSRID(ST_MakePoint(77.5920, 12.9782), 4326)),
(4, 'Ananya Gupta', '+91 9876543213', 'Pipeline leakage', 'Visible water oozing from pavement joint near market junction.', 'Main Market Road, opposite Community Hall', 12.9695, 77.6015, 'ZONE_B', 'P_105', 'ASSIGNED', ST_SetSRID(ST_MakePoint(77.6015, 12.9695), 4326)),
(4, 'Vikram Singh', '+91 9876543218', 'No water', 'Total supply disruption since yesterday afternoon in Block C.', 'Block C Apartments, South Extension', 12.9550, 77.5890, 'ZONE_C', 'P_118', 'SUBMITTED', ST_SetSRID(ST_MakePoint(77.5890, 12.9550), 4326)),
(4, 'Sunita Rao', '+91 9876543220', 'Water quality issue', 'Slight turbid/yellowish water received for 30 minutes upon opening supply valve.', 'Green Glen Layout, Sector 3', 12.9810, 77.6105, 'ZONE_A', 'P_107', 'RESOLVED', ST_SetSRID(ST_MakePoint(77.6105, 12.9810), 4326));
