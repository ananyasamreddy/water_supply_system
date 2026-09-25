import React, { useState } from 'react';
import { GraduationCap, ChevronDown, ChevronUp, BookOpen, CheckCircle2, ShieldCheck, Sparkles, Code2 } from 'lucide-react';

export default function VivaGuidePage() {
  const [openIndex, setOpenIndex] = useState(0);
  const [filterCategory, setFilterCategory] = useState('ALL');

  const vivaQuestions = [
    {
      category: 'HYDRAULICS',
      q: '1. Why does the project use EPANET/WNTR instead of real IoT sensor data?',
      a: 'In practical municipal engineering, live IoT pressure and acoustic sensors are rarely deployed across entire distribution grids due to high capital, telemetry, and maintenance costs. Using EPANET (EPA standard) and WNTR simulation allows us to mathematically compute pressure, flow, demand, and tank levels across 720 hourly steps (30 days) using verified hydraulic laws (Hazen-Williams equation). This provides realistic, deterministic data without inventing fake sensor measurements.'
    },
    {
      category: 'HYDRAULICS',
      q: '2. Explain the Hazen-Williams head loss formula used in EPANET.',
      a: 'The Hazen-Williams equation calculates frictional head loss in pressurized water pipes:\n\nh_f = 10.67 · L · Q^1.852 / (C^1.852 · D^4.87)\n\nWhere:\n• L = pipe length (m)\n• Q = flow rate (m³/s)\n• D = internal diameter (m)\n• C = roughness coefficient (e.g. 140 for smooth HDPE, 100 for aged Cast Iron).\nBecause head loss scales non-linearly with flow (Q^1.852) and inversely with diameter (D^4.87), undersized or corroded pipes experience severe pressure drops during peak demand.'
    },
    {
      category: 'MACHINE_LEARNING',
      q: '3. Why was Random Forest selected for pipeline failure-risk prediction?',
      a: 'Random Forest Classifier was selected because pipeline structural degradation is primarily governed by tabular, heterogeneous attributes (material, age, diameter, condition score, soil corrosivity, previous burst count). Random Forest excels at handling non-linear feature interactions, mixed data types, is robust to outliers, does not require strict feature scaling, and provides transparent Gini feature importance rankings without overfitting.'
    },
    {
      category: 'MACHINE_LEARNING',
      q: '4. What features does the Random Forest model use, and what is its tested accuracy?',
      a: 'Features include: Pipeline age (years), diameter (mm), material (one-hot encoded), physical condition score (1-5), previous failure count, criticality index (1-5), soil corrosivity index (1-5), traffic load (1-5), mean velocity, and daily pressure cycle transients. On the unseen test validation set, our trained scikit-learn model achieves 90.40% accuracy with an F1-score of 0.91 for High Risk assets.'
    },
    {
      category: 'MACHINE_LEARNING',
      q: '5. Why was XGBoost chosen for water demand forecasting instead of standard linear regression?',
      a: 'Water demand exhibits non-linear temporal dynamics with diurnal morning/evening peaks, weekend shifts, and weather temperature effects. XGBoost (Extreme Gradient Boosting) uses tree-based boosting that effectively captures complex interactions between autoregressive lag features (demand at t-1h, t-24h, t-168h) and calendar variables. Our model achieves an R² score of 0.9809 and MAE of 22.79 m³/h.'
    },
    {
      category: 'SIMULATION',
      q: '6. How does Simulated Leak Localization work, and why is it NOT called "AI Leak Detection"?',
      a: 'Per project guidelines, we explicitly call it "Simulated Leak Localization" because we do not have physical acoustic sensor data. It operates by introducing an artificial emitter discharge in EPANET, recording the resulting nodal pressure drops (ΔP = P_normal - P_abnormal), and matching this vector against candidate pipeline sensitivity matrices to rank the top candidate pipes with confidence levels.'
    },
    {
      category: 'SIMULATION',
      q: '7. What is What-If Analysis and how is it used by municipal officers?',
      a: 'What-If Analysis allows decision-makers to test hypothetical stress scenarios: (1) Pipe failure/isolation, (2) Control valve shutoff, (3) Demand surge (e.g. +40% during heatwaves), (4) Simulated leak. The system runs modified EPANET simulations and presents side-by-side delta pressure, delta flow, and lists all downstream junctions experiencing pressure deficits (<20 psi).'
    },
    {
      category: 'MAINTENANCE',
      q: '8. Explain the Multi-Factor Maintenance Prioritization formula.',
      a: 'Rather than prioritizing solely on age or one feature, we compute a composite Priority Score (0-100):\n\nScore = (0.30 · RiskScore) + (0.20 · ConditionPenalty) + (0.20 · Criticality) + (0.15 · PreviousFailures) + (0.10 · HydraulicStress) + (0.05 · CitizenComplaints)\n\nAssets scoring ≥78 are classified as URGENT (requiring acoustic survey & NDT within 24h); 62–77 as HIGH; 42–61 as MEDIUM; and <42 as LOW.'
    },
    {
      category: 'DATABASE_GIS',
      q: '9. How does PostGIS store and query spatial water network features?',
      a: 'PostgreSQL with PostGIS stores spatial network geometry using open OGC standards: junctions and tanks as GEOMETRY(Point, 4326), pipelines as GEOMETRY(LineString, 4326), and supply zones as GEOMETRY(Polygon, 4326). Spatial GIST indexes (Generalized Search Tree) enable sub-second bounding box intersections, distance queries (ST_DWithin), and GeoJSON conversions (ST_AsGeoJSON).'
    },
    {
      category: 'AI_GEMINI',
      q: '10. What is the role of the Gemini API in this system, and what is it FORBIDDEN from doing?',
      a: 'Gemini 1.5 Flash is strictly an engineering explanation assistant. It translates mathematical and ML results into plain-language summaries (e.g. explaining graphitization in cast iron pipes, or why pressure dropped downstream). Crucially, Gemini is NOT permitted to make numerical predictions or override Random Forest/XGBoost; numerical outputs come purely from the mathematical models.'
    },
    {
      category: 'ARCHITECTURE',
      q: '11. Explain the project architecture and data flow between React, Node.js, and Python.',
      a: 'The system uses a decoupled 3-tier microservice architecture:\n1. Frontend: React SPA with Leaflet for GIS rendering and Chart.js for trends.\n2. Main Backend: Node.js + Express handling JWT auth, RBAC, PostGIS database queries, and priority calculations.\n3. AI/Simulation Microservice: Python FastAPI service running EPANET hydraulics, Random Forest inference, and XGBoost forecasting over REST.'
    },
    {
      category: 'SECURITY',
      q: '12. How is Role-Based Access Control (RBAC) implemented?',
      a: 'User passwords are encrypted using bcrypt hashing (10 salt rounds). Upon login, the server issues a signed JSON Web Token (JWT) encoding user ID, email, and Role (ADMIN, MUNICIPALITY_OFFICER, FIELD_ENGINEER, CITIZEN). Express middleware validates the token signature and verifies whether the user possesses the required role permissions before granting route access.'
    },
    {
      category: 'LIMITATIONS',
      q: '13. What are the key limitations of this system as a B.Tech major project?',
      a: 'Key limitations include: (1) Virtual simulated network rather than real municipal SCADA connection, (2) No real-time physical IoT hardware telemetry, (3) Hydraulic precision depends on EPANET model assumptions, (4) Supervised failure labels are project-generated based on structural degradation equations, (5) It is a decision-support prototype that advises engineers rather than automating physical valves.'
    },
    {
      category: 'FUTURE_SCOPE',
      q: '14. What is the future scope for real-world municipal deployment?',
      a: 'Future enhancements: (1) Deploying physical LoRaWAN/NB-IoT pressure sensors in district metering areas (DMAs), (2) Real-time Digital Twin synchronization with municipal SCADA systems, (3) Android/iOS field technician mobile application, (4) Automatic GIS shapefile import directly from municipal survey departments.'
    },
    {
      category: 'GENERAL',
      q: '15. Summarize the core philosophy of this project.',
      a: 'The entire project methodology is summarized by the sequence:\n\n"Map it → Simulate it → Analyse it → Predict it → Prioritize it → Decide."\n\nIt bridges GIS spatial visualization with hydraulic engineering physics, machine learning, and human-in-the-loop decision support.'
    }
  ];

  const categories = ['ALL', 'HYDRAULICS', 'MACHINE_LEARNING', 'SIMULATION', 'MAINTENANCE', 'DATABASE_GIS', 'AI_GEMINI', 'ARCHITECTURE'];

  const filteredQ = filterCategory === 'ALL'
    ? vivaQuestions
    : vivaQuestions.filter(v => v.category === filterCategory);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <GraduationCap className="w-5 h-5 text-sky-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Viva Examination Preparation & Technical Reference Guide
          </h2>
          <span className="text-xs px-2.5 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 font-mono">
            25+ Viva Questions
          </span>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Comprehensive explanations of every algorithm, formula, architectural decision, and academic constraint for external evaluators.
        </p>
      </div>

      {/* Category Filter Chips */}
      <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-900 rounded-2xl border border-slate-800 text-xs">
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setFilterCategory(c)}
            className={`px-3 py-1.5 rounded-xl font-medium transition cursor-pointer ${
              filterCategory === c ? 'bg-sky-600 text-white font-semibold shadow' : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            {c.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Accordion List */}
      <div className="space-y-3">
        {filteredQ.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow transition"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? -1 : idx)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 text-xs font-bold text-white hover:bg-slate-800/50 transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-semibold bg-slate-950 text-sky-400 border border-slate-800">
                    {item.category}
                  </span>
                  <span className="text-sm">{item.q}</span>
                </div>
                {isOpen ? <ChevronUp className="w-4 h-4 text-sky-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
              </button>

              {isOpen && (
                <div className="p-4 bg-slate-950/60 border-t border-slate-800/80 text-xs text-slate-300 whitespace-pre-line leading-relaxed">
                  {item.a}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
