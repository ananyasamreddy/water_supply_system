"""
EPANET Hydraulic Simulation Engine
Serves extended-period hydraulic simulation results (pressures, flows, velocities, tank levels).
Reads from benchmark Net3.inp and precomputed extended-period hydraulic records.
"""

import os
import json
import numpy as np
import pandas as pd

DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
GEOJSON_PATH = os.path.join(DATA_DIR, "network.geojson")
HYDRAULIC_CSV = os.path.join(DATA_DIR, "hydraulic_timeseries.csv")

class EpanetSimulator:
    def __init__(self):
        self._load_network()
        self._load_hydraulics()

    def _load_network(self):
        if os.path.exists(GEOJSON_PATH):
            with open(GEOJSON_PATH, "r") as f:
                self.geojson = json.load(f)
        else:
            self.geojson = {"type": "FeatureCollection", "features": []}

    def _load_hydraulics(self):
        if os.path.exists(HYDRAULIC_CSV):
            df = pd.read_csv(HYDRAULIC_CSV)
            self.df_hyd = df.where(pd.notnull(df), None)
        else:
            self.df_hyd = pd.DataFrame()

    def get_simulation_state_at_hour(self, hour_step: int = 12):
        """Returns the full hydraulic snapshot of all network nodes, pipes, and tanks at a given hour."""
        if self.df_hyd.empty:
            return {"error": "Hydraulic dataset not found"}

        hour_step = max(0, min(719, hour_step))
        slice_df = self.df_hyd[self.df_hyd["hour_step"] == hour_step]

        def clean_records(records):
            cleaned = []
            for r in records:
                row = {}
                for k, v in r.items():
                    if isinstance(v, float) and (pd.isna(v) or np.isinf(v)):
                        row[k] = None
                    else:
                        row[k] = v
                cleaned.append(row)
            return cleaned

        junctions = clean_records(slice_df[slice_df["component_type"] == "JUNCTION"].to_dict(orient="records"))
        pipes = clean_records(slice_df[slice_df["component_type"] == "PIPE"].to_dict(orient="records"))
        tanks = clean_records(slice_df[slice_df["component_type"] == "TANK"].to_dict(orient="records"))

        # Summary KPIs at this hour
        avg_pressure = round(float(slice_df[slice_df["component_type"] == "JUNCTION"]["pressure_psi"].mean()), 2)
        min_pressure = round(float(slice_df[slice_df["component_type"] == "JUNCTION"]["pressure_psi"].min()), 2)
        total_demand = round(float(slice_df[slice_df["component_type"] == "JUNCTION"]["demand_lps"].sum()), 2)
        total_flow = round(float(slice_df[slice_df["component_type"] == "PIPE"]["flow_lps"].sum()), 2)

        return {
            "hour_step": hour_step,
            "timestamp": slice_df["timestamp"].iloc[0] if not slice_df.empty else None,
            "kpis": {
                "avg_pressure_psi": avg_pressure,
                "min_pressure_psi": min_pressure,
                "total_demand_lps": total_demand,
                "total_flow_lps": total_flow,
                "active_pipes": len(pipes),
                "active_junctions": len(junctions),
                "active_tanks": len(tanks)
            },
            "junctions": junctions,
            "pipes": pipes,
            "tanks": tanks
        }

    def get_component_timeseries(self, component_id: str, limit_hours: int = 72):
        """Returns the chronological pressure or flow profile for a specific component."""
        if self.df_hyd.empty:
            return {"error": "Dataset empty"}

        comp_df = self.df_hyd[self.df_hyd["component_id"] == component_id].head(limit_hours)
        if comp_df.empty:
            return {"error": f"Component {component_id} not found"}

        return {
            "component_id": component_id,
            "component_type": comp_df["component_type"].iloc[0],
            "records": comp_df.to_dict(orient="records")
        }

simulator_instance = EpanetSimulator()
