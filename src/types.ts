export type MarketplaceCode = 'USA' | 'UK' | 'DE' | 'CA' | 'JP' | 'AU';

export interface FBACaseContext {
  asin: string;
  marketplace: MarketplaceCode;
  customerProblem: string;
  category?: string;
  launchDateEstimated?: string;
  sellerUnitsPerMonth?: number;
  sellerReviewCount?: number;
  sellerRating?: number;
  competitorReviewCount?: number;
  competitorRating?: number;
  price?: number;
  isBrandRegistered?: boolean;
}

export type FactCategory = 'FACT' | 'ASSUMPTION' | 'MISSING_DATA' | 'RECOMMENDATION' | 'RISK';

export interface AuditItem {
  id: string;
  title: string;
  category: string;
  description: string;
  impactLevel: 'HIGH' | 'MEDIUM' | 'CRITICAL' | 'MODERATE';
  type: FactCategory;
  sourceOrRationale: string;
  actionableStep?: string;
}

export interface MissingMetricItem {
  id: string;
  metricName: string;
  sellerCentralLocation: string;
  whyItMatters: string;
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  userValue?: string;
}

export interface RecommendationStep {
  id: string;
  pillar: 'VINE_AUTOMATION' | 'LISTING_CRO' | 'SALES_VELOCITY' | 'PACKAGING_CX';
  title: string;
  timeframe: 'Immediate (Days 1-7)' | 'Short-term (Weeks 2-4)' | 'Medium-term (Month 2+)';
  effort: 'Low' | 'Medium' | 'High';
  complianceLevel: '100% Amazon TOS Compliant' | 'Requires Verification' | 'Cautionary Policy Note';
  summary: string;
  sopSteps: string[];
  expectedImpact: string;
}

export interface RiskVerificationItem {
  id: string;
  title: string;
  severity: 'HIGH_RISK' | 'CRITICAL_TOS' | 'FINANCIAL_RISK' | 'PRODUCT_RISK';
  amazonPolicyReference: string;
  dangerExplanation: string;
  howToVerify: string;
  safeAlternative: string;
}

export interface SimulatorState {
  currentReviews: number;
  competitorReviews: number;
  monthlyOrders: number;
  organicReviewRate: number; // e.g. 1.2%
  enableRequestReviewAPI: boolean; // adds +0.8%
  vineUnitsEnrolled: number; // 0 to 30
  averageSalePrice: number;
}

export interface ImportedCaseRow {
  id: string;
  asin: string;
  marketplace: MarketplaceCode;
  category: string;
  problem: string;
  isValidAsin: boolean;
  asinError?: string;
  missingRequiredFields: string[];
  monthlyUnits?: number;
  currentReviews?: number;
  competitorReviews?: number;
  rating?: number;
  competitorRating?: number;
  price?: number;
  isBrandRegistered?: boolean;
  rawRowData?: Record<string, string>;
}
