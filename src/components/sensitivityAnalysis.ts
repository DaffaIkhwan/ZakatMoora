import { Mustahik, Criterion, CandidateWithScore } from '../types';
import { calculateMOORA } from './mooraCalculations';

export interface SensitivityScenario {
  weight: number;
  topCandidateId: string;
  topCandidateName: string;
  topCandidateScore: number;
  rankings: { id: string; name: string; rank: number; score: number }[];
}

export interface SensitivityResult {
  criterionCode: string;
  criterionName: string;
  baseWeight: number;
  scenarios: SensitivityScenario[];
  isSensitive: boolean; // True if the rank of the top candidate changes
}

/**
 * Sensitivity Analysis for MOORA Method
 * This analysis checks how changes in criteria weights affect the final ranking.
 */
export function performSensitivityAnalysis(
  candidates: Mustahik[],
  criteriaList: Criterion[]
): SensitivityResult[] {
  if (!candidates || candidates.length === 0 || !criteriaList || criteriaList.length === 0) {
    return [];
  }

  // 1. Calculate Baseline
  const baselineResults = calculateMOORA(candidates, criteriaList);
  const baselineTopCandidateId = baselineResults[0]?.id;

  const results: SensitivityResult[] = [];

  // Total weight of all criteria
  const totalWeight = criteriaList.reduce((sum, c) => sum + c.weight, 0);

  // 2. perform OAT (One-At-a-Time) Sensitivity Analysis for each criterion
  criteriaList.forEach((targetCriterion) => {
    const scenarios: SensitivityScenario[] = [];
    let isSensitive = false;

    // We vary the weight of the target criterion from 0.1 to 0.9 (or steps)
    // In this implementation, we'll try variations: -50%, -25%, Baseline, +25%, +50%
    // and also extreme cases if desired.
    const variations = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9];
    
    variations.forEach((newWeightFactor) => {
      // Create a new criteria list with adjusted weights
      // The target criterion gets the new weight
      // The others are adjusted proportionally to keep the total weight constant
      
      const newTargetWeight = totalWeight * newWeightFactor;
      const remainingWeight = totalWeight - newTargetWeight;
      const otherBaseWeightSum = totalWeight - targetCriterion.weight;

      const adjustedCriteria = criteriaList.map((c) => {
        if (c.code === targetCriterion.code) {
          return { ...c, weight: newTargetWeight };
        } else {
          // Proportionally adjust other weights
          const proportion = otherBaseWeightSum > 0 ? c.weight / otherBaseWeightSum : 0;
          return { ...c, weight: remainingWeight * proportion };
        }
      });

      // Recalculate MOORA with adjusted weights
      const mooraResults = calculateMOORA(candidates, adjustedCriteria);
      const topCandidate = mooraResults[0];

      if (topCandidate && topCandidate.id !== baselineTopCandidateId) {
        isSensitive = true;
      }

      scenarios.push({
        weight: newWeightFactor,
        topCandidateId: topCandidate?.id || '',
        topCandidateName: topCandidate?.name || '',
        topCandidateScore: topCandidate?.mooraScore || 0,
        rankings: mooraResults.slice(0, 5).map(r => ({
          id: r.id,
          name: r.name,
          rank: r.rank,
          score: r.mooraScore
        }))
      });
    });

    results.push({
      criterionCode: targetCriterion.code,
      criterionName: targetCriterion.name,
      baseWeight: targetCriterion.weight / totalWeight,
      scenarios,
      isSensitive
    });
  });

  return results;
}

/**
 * Summarizes the sensitivity analysis to find the "Most Sensitive Criterion"
 */
export function getSensitivitySummary(results: SensitivityResult[]) {
  const sensitiveCriteria = results.filter(r => r.isSensitive);
  
  // A simple metric for sensitivity: how many times the top candidate changed across scenarios
  const sensitivityScores = results.map(r => {
    const changes = new Set(r.scenarios.map(s => s.topCandidateId)).size - 1;
    return {
      code: r.criterionCode,
      name: r.criterionName,
      changes
    };
  });

  sensitivityScores.sort((a, b) => b.changes - a.changes);

  return {
    sensitiveCriteriaCount: sensitiveCriteria.length,
    mostSensitiveCriterion: sensitivityScores[0],
    fullResults: results
  };
}
