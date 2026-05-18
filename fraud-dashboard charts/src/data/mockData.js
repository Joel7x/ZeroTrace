export const mockClaims = [
  {
    claim_id: "CLM-90214",
    risk_score: 92,
    risk_level: "High",
    reason: "Duplicate billing across different facilities within 24h",
    doctor: "Dr. Sarah Jenkins",
    patient: "Michael Chang",
    timestamp: "2026-05-18T10:15:00Z"
  },
  {
    claim_id: "CLM-90215",
    risk_score: 85,
    risk_level: "High",
    reason: "Unusually high number of expensive tests for standard visit",
    doctor: "Dr. Robert Chen",
    patient: "Emily Rodriguez",
    timestamp: "2026-05-18T09:42:00Z"
  },
  {
    claim_id: "CLM-90216",
    risk_score: 65,
    risk_level: "Medium",
    reason: "Slight mismatch in diagnosis codes and prescribed medication",
    doctor: "Dr. James Wilson",
    patient: "Sarah Smith",
    timestamp: "2026-05-17T14:30:00Z"
  },
  {
    claim_id: "CLM-90217",
    risk_score: 55,
    risk_level: "Medium",
    reason: "Upcoding suspected - level 4 visit billed for standard follow-up",
    doctor: "Dr. Amanda White",
    patient: "John Doe",
    timestamp: "2026-05-17T11:20:00Z"
  },
  {
    claim_id: "CLM-90218",
    risk_score: 20,
    risk_level: "Low",
    reason: "Routine checkup, standard billing",
    doctor: "Dr. William Patel",
    patient: "Alice Johnson",
    timestamp: "2026-05-16T16:45:00Z"
  },
  {
    claim_id: "CLM-90219",
    risk_score: 15,
    risk_level: "Low",
    reason: "Standard prescription refill",
    doctor: "Dr. Sarah Jenkins",
    patient: "Robert Brown",
    timestamp: "2026-05-16T09:10:00Z"
  },
  {
    claim_id: "CLM-90220",
    risk_score: 88,
    risk_level: "High",
    reason: "Patient address mismatch, suspected identity theft",
    doctor: "Dr. Elena Gilbert",
    patient: "Unknown (Flagged)",
    timestamp: "2026-05-15T15:20:00Z"
  },
  {
    claim_id: "CLM-90221",
    risk_score: 45,
    risk_level: "Medium",
    reason: "Frequent visits to same specialist within short timeframe",
    doctor: "Dr. Robert Chen",
    patient: "Thomas Muller",
    timestamp: "2026-05-15T10:05:00Z"
  },
  {
    claim_id: "CLM-90222",
    risk_score: 12,
    risk_level: "Low",
    reason: "Flu vaccination",
    doctor: "Dr. Amanda White",
    patient: "Lucy Pevensie",
    timestamp: "2026-05-14T11:00:00Z"
  },
  {
    claim_id: "CLM-90223",
    risk_score: 95,
    risk_level: "High",
    reason: "Billing for services post-patient discharge",
    doctor: "Dr. William Patel",
    patient: "George Costanza",
    timestamp: "2026-05-13T14:40:00Z"
  }
];

export const fraudTrendData = [
  { date: 'May 1', high: 4, medium: 7, low: 20 },
  { date: 'May 4', high: 5, medium: 8, low: 25 },
  { date: 'May 7', high: 3, medium: 10, low: 22 },
  { date: 'May 10', high: 8, medium: 5, low: 28 },
  { date: 'May 13', high: 2, medium: 6, low: 18 },
  { date: 'May 16', high: 6, medium: 9, low: 24 },
  { date: 'May 18', high: 4, medium: 3, low: 21 },
];

export const patternBreakdownData = [
  { entity: 'Dr. Sarah Jenkins', claims: 45, flagged: 12 },
  { entity: 'Dr. Robert Chen', claims: 38, flagged: 8 },
  { entity: 'Dr. James Wilson', claims: 52, flagged: 3 },
  { entity: 'Dr. Amanda White', claims: 29, flagged: 5 },
  { entity: 'Dr. William Patel', claims: 61, flagged: 15 },
];
