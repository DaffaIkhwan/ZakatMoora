import type { Mustahik, CandidateWithScore, Criterion } from '../types';

// Helper to get all sub-criteria codes from dynamic criteria list
export function getAllSubCriteriaCodes(criteriaList: Criterion[]): string[] {
  const codes: string[] = [];
  criteriaList?.forEach(c => {
    c.aspects?.forEach(aspect => {
      codes.push(aspect.code);
    });
  });
  return codes;
}

// Helper to calculate sub-criteria weights from dynamic criteria list
export function getSubCriteriaWeights(criteriaList: Criterion[]): Record<string, number> {
  const weights: Record<string, number> = {};
  criteriaList?.forEach(c => {
    if (!c.aspects) return;
    const numAspects = c.aspects.length;
    // Distribute weight equally among aspects if aspects exist
    const weightPerAspect = numAspects > 0 ? c.weight / numAspects : 0;

    c.aspects.forEach(aspect => {
      weights[aspect.code] = weightPerAspect;
    });
  });
  return weights;
}

/**
 * Step 1: Create decision matrix from candidates using SUB-CRITERIA values
 */
function createSubCriteriaDecisionMatrix(candidates: Mustahik[], criteriaList: Criterion[]) {
  const subCriteriaCodes = getAllSubCriteriaCodes(criteriaList);
  const matrix: number[][] = [];

  candidates.forEach(candidate => {
    const row: number[] = [];
    subCriteriaCodes.forEach(code => {
      const value = candidate.subCriteria?.[code] ?? 0;
      row.push(value);
    });
    matrix.push(row);
  });

  return { matrix, codes: subCriteriaCodes };
}

/**
 * Step 2: Normalize the decision matrix using vector normalization
 * Formula: xij* = xij / sqrt(sum(xij^2))
 */
function normalizeMatrix(matrix: number[][]) {
  if (matrix.length === 0 || matrix[0].length === 0) return [];

  const normalizedMatrix: number[][] = [];
  const numCriteria = matrix[0].length;

  // Calculate sum of squares for each criterion
  const sumOfSquares: number[] = new Array(numCriteria).fill(0);

  matrix.forEach(row => {
    row.forEach((value, colIndex) => {
      sumOfSquares[colIndex] += value * value;
    });
  });

  // Calculate square root of sum of squares
  const sqrtSumOfSquares = sumOfSquares.map(sum => Math.sqrt(sum));

  // Normalize each value
  matrix.forEach(row => {
    const normalizedRow: number[] = [];
    row.forEach((value, colIndex) => {
      const normalized = sqrtSumOfSquares[colIndex] !== 0
        ? value / sqrtSumOfSquares[colIndex]
        : 0;
      normalizedRow.push(normalized);
    });
    normalizedMatrix.push(normalizedRow);
  });

  return normalizedMatrix;
}

/**
 * Step 3: Apply weights to normalized matrix (using sub-criteria weights)
 */
function applySubCriteriaWeights(normalizedMatrix: number[][], subCriteriaCodes: string[], criteriaList: Criterion[]) {
  const weightedMatrix: number[][] = [];
  const weights = getSubCriteriaWeights(criteriaList);

  normalizedMatrix.forEach(row => {
    const weightedRow = row.map((value, index) => {
      const code = subCriteriaCodes[index];
      return value * (weights[code] || 0);
    });
    weightedMatrix.push(weightedRow);
  });

  return weightedMatrix;
}

/**
 * Step 4: Calculate Yi (optimization value)
 * Since all criteria are benefit type: Yi = sum of all weighted normalized values
 */
function calculateOptimization(weightedMatrix: number[][], types: string[]) {
  return weightedMatrix.map(row => {
    return row.reduce((sum, value, index) => {
      const type = types[index] || 'benefit';
      return type === 'cost' ? sum - value : sum + value;
    }, 0);
  });
}

// Legacy functions for criteria-level display
function createDecisionMatrix(candidates: Mustahik[], criteriaList: Criterion[]) {
  const matrix: number[][] = [];

  candidates.forEach(candidate => {
    const row = criteriaList.map(c => candidate.criteria?.[c.code] || 0);
    matrix.push(row);
  });

  return matrix;
}

function applyWeights(normalizedMatrix: number[][], criteriaList: Criterion[]) {
  const weightedMatrix: number[][] = [];
  const weights = criteriaList.map(c => c.weight);

  normalizedMatrix.forEach(row => {
    const weightedRow = row.map((value, index) => value * (weights[index] || 0));
    weightedMatrix.push(weightedRow);
  });

  return weightedMatrix;
}

/**
 * Step 3 (New): Apply weights to CRITERIA based on Average Normalized Sub-Criteria
 * Logic: Avg(Nomralized Sub-Criteria) * Criteria Weight
 */
function applyWeightsByCriteriaAverage(normalizedMatrix: number[][], subCriteriaCodes: string[], criteriaList: Criterion[]) {
  const weightedMatrixByCriteria: number[][] = [];
  const avgNormalizedMatrixByCriteria: number[][] = [];

  normalizedMatrix.forEach(row => {
    const rowValues: number[] = [];
    const avgRowValues: number[] = [];

    criteriaList.forEach(criterion => {
      // Find indices of columns belonging to this criterion
      const aspectCodes = criterion.aspects?.map(a => a.code) || [];
      const relevantValues: number[] = [];

      if (aspectCodes.length > 0) {
        aspectCodes.forEach(code => {
          const index = subCriteriaCodes.indexOf(code);
          if (index !== -1) {
            relevantValues.push(row[index]);
          }
        });
      }

      // Calculate Average Normalized Score for this Criteria
      let avgNormalized = 0;
      if (relevantValues.length > 0) {
        const sum = relevantValues.reduce((a, b) => a + b, 0);
        avgNormalized = sum / relevantValues.length;
      }

      // Store Average Normalized (unweighted)
      avgRowValues.push(avgNormalized);

      // Multiply by FULL Criteria Weight
      rowValues.push(avgNormalized * criterion.weight);
    });

    weightedMatrixByCriteria.push(rowValues);
    avgNormalizedMatrixByCriteria.push(avgRowValues);
  });

  return { weightedMatrixByCriteria, avgNormalizedMatrixByCriteria };
}

/**
 * Main MOORA calculation function - updated logic
 */
export function calculateMOORA(candidates: Mustahik[], criteriaList: Criterion[]): CandidateWithScore[] {
  try {
    if (!Array.isArray(candidates) || candidates.length === 0 || !Array.isArray(criteriaList) || criteriaList.length === 0) {
      return [];
    }

    // Step 1: Create decision matrix using SUB-CRITERIA
    const { matrix: subDecisionMatrix, codes: subCriteriaCodes } = createSubCriteriaDecisionMatrix(candidates, criteriaList);

    // Step 2: Normalize matrix
    const subNormalizedMatrix = normalizeMatrix(subDecisionMatrix);

    // Step 3 (OLD): Apply sub-criteria weights (Still useful for displaying granular breakdown if needed, but not for final score)
    const subWeightedMatrix = applySubCriteriaWeights(subNormalizedMatrix, subCriteriaCodes, criteriaList);

    // Step 3 (NEW): Apply weights by Criteria Average
    const { weightedMatrixByCriteria: criteriaWeightedMatrixRaw, avgNormalizedMatrixByCriteria } = applyWeightsByCriteriaAverage(subNormalizedMatrix, subCriteriaCodes, criteriaList);

    // Step 4: Calculate Yi (MOORA scores) from CRITERIA Weighted Matrix
    const criteriaTypes = criteriaList.map(c => c.type || 'benefit');
    const mooraScores = calculateOptimization(criteriaWeightedMatrixRaw, criteriaTypes);

    // Also calculate legacy criteria-level for display purposes (Raw input level)
    const criteriaDecisionMatrix = createDecisionMatrix(candidates, criteriaList);
    const criteriaNormalizedMatrix = normalizeMatrix(criteriaDecisionMatrix);
    // const criteriaWeightedMatrix = applyWeights(criteriaNormalizedMatrix, criteriaList); // Unused now

    // Create results with all calculation details
    const results: CandidateWithScore[] = candidates.map((candidate, index) => {
      // Criteria-level weighted (NEW LOGIC)
      const weightedNormalized: Record<string, number> = {};
      const avgNormalizedCriteria: Record<string, number> = {};

      criteriaList.forEach((c, i) => {
        weightedNormalized[c.code] = criteriaWeightedMatrixRaw[index][i];
        avgNormalizedCriteria[c.code] = avgNormalizedMatrixByCriteria[index][i];
      });

      // Criteria-level normalized (Raw Input) - optional for display
      const normalizedCriteria: Record<string, number> = {};
      criteriaList.forEach((c, i) => {
        normalizedCriteria[c.code] = criteriaNormalizedMatrix[index]?.[i] ?? 0;
      });

      // Sub-criteria level normalized and weighted (legacy view)
      const normalizedSubCriteria: Record<string, number> = {};
      const weightedSubCriteria: Record<string, number> = {};

      subCriteriaCodes.forEach((code, codeIndex) => {
        normalizedSubCriteria[code] = subNormalizedMatrix[index]?.[codeIndex] ?? 0;
        weightedSubCriteria[code] = subWeightedMatrix[index]?.[codeIndex] ?? 0;
      });

      return {
        ...candidate,
        normalizedCriteria,
        avgNormalizedCriteria, // New: Average of Normalized Sub-Criteria
        weightedNormalized, // Now contains the "Avg * Weight" values per Criteria
        normalizedSubCriteria,
        weightedSubCriteria,
        mooraScore: mooraScores[index] ?? 0,
        rank: 0,
      };
    });

    // Step 5: Rank the alternatives (higher score = better rank)
    results.sort((a, b) => b.mooraScore - a.mooraScore);
    results.forEach((result, index) => {
      result.rank = index + 1;
    });

    return results;
  } catch (error) {
    console.error("Error in calculateMOORA:", error);
    return [];
  }
}

/**
 * Get detailed calculation steps for display
 */
export function getCalculationSteps(candidates: Mustahik[], criteriaList: Criterion[]) {
  try {
    if (candidates.length === 0 || !criteriaList || criteriaList.length === 0) {
      return null;
    }

    const { matrix: subDecisionMatrix, codes: subCriteriaCodes } = createSubCriteriaDecisionMatrix(candidates, criteriaList);
    const subNormalizedMatrix = normalizeMatrix(subDecisionMatrix);
    const subWeightedMatrix = applySubCriteriaWeights(subNormalizedMatrix, subCriteriaCodes, criteriaList);
    // Calculate types for sub-criteria
    const typeMap: Record<string, string> = {};
    criteriaList?.forEach(c => c.aspects?.forEach(a => typeMap[a.code] = c.type));
    const subTypes = subCriteriaCodes.map(code => typeMap[code] || 'benefit');

    const mooraScores = calculateOptimization(subWeightedMatrix, subTypes);

    return {
      subCriteriaCodes,
      subDecisionMatrix,
      subNormalizedMatrix,
      subWeightedMatrix,
      mooraScores,
    };
  } catch (e) {
    console.error(e);
    return null;
  }
}