/**
 * Multi-Factor Maintenance Prioritization Engine
 *
 * Implements a transparent, multi-criteria decision-support index (0-100):
 * Priority Score = (w1 * RiskScore) + (w2 * ConditionPenalty) + (w3 * Criticality)
 *                + (w4 * PreviousFailures) + (w5 * HydraulicStress) + (w6 * ComplaintImpact)
 *
 * Output Levels:
 * - URGENT  (Score >= 80)
 * - HIGH    (65 <= Score < 80)
 * - MEDIUM  (45 <= Score < 65)
 * - LOW     (Score < 45)
 */

export function calculateMaintenancePriority(pipe, complaintsCount = 0, recentHydraulicStress = 1.0) {
  // Weights (sum to 1.0)
  const W_RISK = 0.30;
  const W_CONDITION = 0.20;
  const W_CRITICALITY = 0.20;
  const W_FAILURES = 0.15;
  const W_HYDRAULIC = 0.10;
  const W_COMPLAINTS = 0.05;

  // 1. Predicted Failure Risk Factor (0 - 100)
  let riskScore = 20.0;
  const riskClass = pipe.current_risk_class || pipe.predicted_risk || 'Low Risk';
  if (riskClass === 'High Risk') riskScore = 95.0;
  else if (riskClass === 'Medium Risk') riskScore = 60.0;
  else riskScore = 20.0;

  // 2. Physical Condition Degradation Factor (0 - 100)
  // Condition 1 = 100 (severe), Condition 5 = 0 (pristine)
  const condition = pipe.condition || pipe.condition_score || 3;
  const conditionScore = Math.max(0, Math.min(100, (5 - condition) * 25));

  // 3. Criticality Factor (0 - 100)
  // Criticality 5 = 100 (feeds hospital/downtown trunk), 1 = 20
  const criticality = pipe.criticality || pipe.criticality_score || 3;
  const criticalityScore = Math.max(0, Math.min(100, criticality * 20));

  // 4. Previous Failures History (0 - 100)
  const prevFails = pipe.previous_failures || 0;
  const failuresScore = Math.min(100, prevFails * 22);

  // 5. Hydraulic Stress (Velocity surge / pressure fluctuations) (0 - 100)
  const hydraulicScore = Math.max(0, Math.min(100, recentHydraulicStress * 50));

  // 6. Citizen Complaints Geotagged to Pipeline (0 - 100)
  const complaintScore = Math.min(100, complaintsCount * 30);

  // Weighted Composite Calculation
  const totalScore = (
    W_RISK * riskScore +
    W_CONDITION * conditionScore +
    W_CRITICALITY * criticalityScore +
    W_FAILURES * failuresScore +
    W_HYDRAULIC * hydraulicScore +
    W_COMPLAINTS * complaintScore
  );

  const roundedScore = Math.round(totalScore * 10) / 10;

  let priorityLevel = 'LOW';
  if (roundedScore >= 78.0) priorityLevel = 'URGENT';
  else if (roundedScore >= 62.0) priorityLevel = 'HIGH';
  else if (roundedScore >= 42.0) priorityLevel = 'MEDIUM';
  else priorityLevel = 'LOW';

  return {
    pipeline_id: pipe.id || pipe.pipeline_id,
    priority_level: priorityLevel,
    priority_score: roundedScore,
    factor_breakdown: {
      predicted_risk: { value: riskClass, points: Math.round(W_RISK * riskScore * 10) / 10, max_points: 30 },
      physical_condition: { value: `${condition}/5`, points: Math.round(W_CONDITION * conditionScore * 10) / 10, max_points: 20 },
      criticality_index: { value: `${criticality}/5`, points: Math.round(W_CRITICALITY * criticalityScore * 10) / 10, max_points: 20 },
      previous_failures: { value: prevFails, points: Math.round(W_FAILURES * failuresScore * 10) / 10, max_points: 15 },
      hydraulic_stress: { value: `${Math.round(recentHydraulicStress * 100) / 100}x`, points: Math.round(W_HYDRAULIC * hydraulicScore * 10) / 10, max_points: 10 },
      citizen_complaints: { value: complaintsCount, points: Math.round(W_COMPLAINTS * complaintScore * 10) / 10, max_points: 5 }
    },
    recommendation: getActionRecommendation(priorityLevel, pipe)
  };
}

function getActionRecommendation(level, pipe) {
  if (level === 'URGENT') {
    return 'Schedule immediate acoustic leak detection & ultrasonic wall-thickness audit within 24 hours. Prepare isolation bypass.';
  } else if (level === 'HIGH') {
    return 'Prioritize for valve inspection, joint sealing, and pressure transient monitoring in this week maintenance window.';
  } else if (level === 'MEDIUM') {
    return 'Include in bi-monthly planned maintenance roster. Inspect surface alignments and air-release valves.';
  }
  return 'Standard cyclical inspection. Operating safely within nominal engineering parameters.';
}

export default {
  calculateMaintenancePriority
};
