import { mockClaims, fraudTrendData, patternBreakdownData } from '../data/chartMockData';

// Simulated delay to mimic real API calls
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const fetchClaims = async () => {
  await delay(800);
  return mockClaims;
};

export const fetchFraudTrends = async () => {
  await delay(600);
  return fraudTrendData;
};

export const fetchPatternBreakdown = async () => {
  await delay(700);
  return patternBreakdownData;
};

export const fetchSummaryMetrics = async () => {
  await delay(500);
  const total = mockClaims.length;
  const highRisk = mockClaims.filter(c => c.risk_level === 'High').length;
  const mediumRisk = mockClaims.filter(c => c.risk_level === 'Medium').length;
  const lowRisk = mockClaims.filter(c => c.risk_level === 'Low').length;

  return {
    total,
    highRisk,
    mediumRisk,
    lowRisk
  };
};
