import { FBACaseContext, AuditItem, MissingMetricItem, RecommendationStep, RiskVerificationItem } from '../types';

export const EMPTY_CASE: FBACaseContext = {
  asin: '',
  marketplace: 'USA',
  customerProblem: '',
  category: '',
  sellerUnitsPerMonth: undefined,
  sellerReviewCount: undefined,
  competitorReviewCount: undefined,
  isBrandRegistered: undefined,
};

export const INITIAL_CASE: FBACaseContext = {
  asin: 'B0FVVM1CSC',
  marketplace: 'USA',
  customerProblem: 'My competitor has many more reviews than my product, and I want to understand what I can improve.',
  category: 'Consumer Goods / Home & Kitchen / Electronics (To be confirmed by Seller)',
  sellerUnitsPerMonth: undefined, // Intentionally undefined to strictly avoid hallucinating
  sellerReviewCount: undefined,
  competitorReviewCount: undefined,
  isBrandRegistered: undefined,
};

export interface CasePreset {
  id: string;
  name: string;
  badge: string;
  asin: string;
  marketplace: 'USA' | 'UK' | 'DE' | 'CA' | 'JP' | 'AU';
  problem: string;
  category: string;
}

export const CASE_PRESETS: CasePreset[] = [
  {
    id: 'benchmark-review-gap',
    name: 'Competitor Review Gap (Benchmark)',
    badge: 'Social Proof & Vine',
    asin: 'B0FVVM1CSC',
    marketplace: 'USA',
    problem: 'My competitor has many more reviews than my product, and I want to understand what I can improve.',
    category: 'Home & Kitchen / Consumer Products',
  },
  {
    id: 'cvr-rank-drop',
    name: 'Sudden Conversion & Organic Rank Drop',
    badge: 'Listing CRO & Algorithm',
    asin: 'B08N5WRWNW',
    marketplace: 'USA',
    problem: 'Our organic search ranking and Unit Session Percentage (CVR) dropped by 35% over the past 3 weeks after competitors refreshed their main hero imagery.',
    category: 'Electronics & Accessories',
  },
  {
    id: 'return-rate-defects',
    name: 'High Return Rate & 1-Star Defect Reviews',
    badge: 'VOC & Quality Trap',
    asin: 'B09K82MX7Q',
    marketplace: 'USA',
    problem: 'We are experiencing a 7.2% return rate and recent 1-star reviews citing confusing assembly instructions and packaging damage.',
    category: 'Sports & Outdoors / Fitness',
  },
  {
    id: 'ppc-bleed-tacos',
    name: 'PPC Margin Bleed & High ACoS (>70%)',
    badge: 'Advertising & Margins',
    asin: 'B07T2K9R1V',
    marketplace: 'USA',
    problem: 'Sponsored Products ACoS is exceeding 75% and our TACOS is eroding profit margins, while organic sales velocity remains stagnant.',
    category: 'Beauty & Personal Care',
  },
];

export const BASELINE_POSSIBLE_CAUSES: AuditItem[] = [
  {
    id: 'cause-1',
    title: 'Time in Market & Cumulative Sales Longevity',
    category: 'Historical Accumulation',
    impactLevel: 'CRITICAL',
    type: 'ASSUMPTION',
    description: 'Amazon product reviews accumulate as a mathematical function of lifetime unit sales. If the competitor launched 12–36 months earlier, they have processed thousands more completed customer orders, naturally compounding reviews over time even at an industry standard 1–2% review rate.',
    sourceOrRationale: 'Hypothesis based on standard marketplace review growth models. Must be confirmed with launch dates.',
    actionableStep: 'Check Keepa / CamelCamelCamel / Brand Analytics historical date for both ASINs to establish exact launch age gap.'
  },
  {
    id: 'cause-2',
    title: 'Daily Sales Velocity & Review Flywheel Disparity',
    category: 'Sales Velocity',
    impactLevel: 'HIGH',
    type: 'ASSUMPTION',
    description: 'A competitor selling 50 units/day generates ~15–30 organic reviews monthly. A seller moving 3 units/day generates ~1–2 reviews monthly. The gap widens every single month unless sales velocity is accelerated.',
    sourceOrRationale: 'Direct correlation between order volume and review generation volume.',
    actionableStep: 'Review Seller Central Business Reports (Unit Session Percentage & Ordered Product Sales).'
  },
  {
    id: 'cause-3',
    title: 'Amazon Vine Program Enrollment (0 to 30 Reviews)',
    category: 'Amazon Programs',
    impactLevel: 'HIGH',
    type: 'ASSUMPTION',
    description: 'The competitor may have enrolled in Amazon Vine upon launch to secure up to 30 authentic, trusted, high-detail reviews with photos/videos within their first 30–60 days, giving their listing early social proof.',
    sourceOrRationale: 'Standard launch SOP for Brand Registered listings on Amazon USA.',
    actionableStep: 'Inspect competitor reviews for "Vine Customer Review of Free Product" green badge.'
  },
  {
    id: 'cause-4',
    title: 'Parent-Child Variation Family Aggregation',
    category: 'Listing Architecture',
    impactLevel: 'HIGH',
    type: 'ASSUMPTION',
    description: 'On Amazon, child variations (colors, sizes, styles, multipacks) share a pooled review pool under the parent ASIN. A competitor with 10 child variations pools all their reviews into a single combined count, giving an illusion of massive single-product volume.',
    sourceOrRationale: 'Amazon listing catalog architecture for variation families.',
    actionableStep: 'Inspect the competitor listing page to see if review count changes when switching dropdown variations.'
  },
  {
    id: 'cause-5',
    title: 'Automated "Request a Review" Button / API Integration',
    category: 'Post-Purchase Engagement',
    impactLevel: 'MEDIUM',
    type: 'ASSUMPTION',
    description: 'Competitors using automated Request-a-Review API triggers (dispatched 5–30 days after verified delivery) capture a 30%–60% higher review rate compared to sellers relying purely on passive organic buyer feedback.',
    sourceOrRationale: 'Amazon official 1-click star rating email conversion statistics.',
    actionableStep: 'Check whether automated review requests are currently active on your Seller Central account.'
  },
  {
    id: 'cause-6',
    title: 'Conversion Rate (CVR) & Traffic Flow Disparity',
    category: 'Listing Merchandising',
    impactLevel: 'HIGH',
    type: 'ASSUMPTION',
    description: 'Competitor may possess higher organic search rank, superior main hero imagery, A+ Brand Story, video assets, or a more compelling price-to-value ratio that drives higher conversion per visitor, fueling higher order velocity.',
    sourceOrRationale: 'Amazon A9/COSMO search algorithm conversion weighting.',
    actionableStep: 'Conduct a side-by-side visual and messaging audit of image stack, bullets, and A+ Content.'
  },
  {
    id: 'cause-7',
    title: 'Potential Policy Violations or Black-Hat Review Merging',
    category: 'Policy & Manipulation Risk',
    impactLevel: 'MODERATE',
    type: 'ASSUMPTION',
    description: 'Some unscrupulous competitors illegally merge unrelated defunct ASINs (review hijacking), utilize rebate clubs, or include non-compliant gift card insert cards to artificially inflate review count in violation of Amazon Anti-Manipulation TOS.',
    sourceOrRationale: 'Known marketplace anomaly; requires verification before making assumptions.',
    actionableStep: 'Audit competitor oldest reviews for mismatched product descriptions or sudden unnatural review spikes.'
  }
];

export const MISSING_METRICS_LIST: MissingMetricItem[] = [
  {
    id: 'metric-1',
    metricName: 'Launch Dates (ASIN B0FVVM1CSC vs Competitor)',
    sellerCentralLocation: 'Manage Inventory / Keepa / First Review Timestamp',
    whyItMatters: 'Reveals whether the review difference is purely natural time-in-market maturity or an active velocity/conversion problem.',
    priority: 'CRITICAL'
  },
  {
    id: 'metric-2',
    metricName: 'Current Review Counts & Star Ratings for Both ASINs',
    sellerCentralLocation: 'Amazon Product Detail Page / Voice of the Customer',
    whyItMatters: 'Quantifies the exact numerical gap and identifies whether you need to fix rating quality (e.g. 3.9 vs 4.6) or strictly volume.',
    priority: 'CRITICAL'
  },
  {
    id: 'metric-3',
    metricName: 'Monthly Ordered Product Sales & Unit Velocity',
    sellerCentralLocation: 'Reports > Business Reports > Detail Page Sales and Traffic',
    whyItMatters: 'Establishes your baseline review generation capacity. Review velocity is directly capped by monthly unit volume.',
    priority: 'CRITICAL'
  },
  {
    id: 'metric-4',
    metricName: 'Unit Session Percentage (Conversion Rate - CVR)',
    sellerCentralLocation: 'Reports > Business Reports > By ASIN',
    whyItMatters: 'If your CVR is below 10-15% for the category, traffic isn\'t converting into buyers, starving your review pipeline.',
    priority: 'HIGH'
  },
  {
    id: 'metric-5',
    metricName: 'Amazon Brand Registry & Vine Eligibility Status',
    sellerCentralLocation: 'Advertising > Vine / Brand Registry Portal',
    whyItMatters: 'Determines if you can immediately enroll in Amazon Vine to claim up to 30 high-credibility reviews.',
    priority: 'HIGH'
  },
  {
    id: 'metric-6',
    metricName: 'Return Rate & Voice of the Customer (VOC) CX Health',
    sellerCentralLocation: 'Performance > Voice of the Customer (VOC)',
    whyItMatters: 'Reveals product defects or customer dissatisfaction. Requesting reviews before fixing defects triggers 1-star reviews.',
    priority: 'HIGH'
  },
  {
    id: 'metric-7',
    metricName: 'PPC Organic Synergy (TACOS & Search Query Performance)',
    sellerCentralLocation: 'Brands > Search Query Performance (SQP) & Campaign Manager',
    whyItMatters: 'Shows whether the competitor is heavily outspending on Sponsored Products/Brands to monopolize top search query clicks.',
    priority: 'MEDIUM'
  },
  {
    id: 'metric-8',
    metricName: 'Variation Architecture (Single ASIN vs Multi-Child Family)',
    sellerCentralLocation: 'Manage Inventory > Variations',
    whyItMatters: 'Shows whether the competitor is pooling 5–10 child ASIN reviews under one parent listing.',
    priority: 'MEDIUM'
  }
];

export const PRACTICAL_RECOMMENDATIONS: RecommendationStep[] = [
  {
    id: 'rec-1',
    pillar: 'VINE_AUTOMATION',
    title: 'Phase 1: Enroll in Amazon Vine (Up to 30 Reviews)',
    timeframe: 'Immediate (Days 1-7)',
    effort: 'Low',
    complianceLevel: '100% Amazon TOS Compliant',
    summary: 'If Brand Registered and the ASIN has fewer than 30 reviews, enroll up to 30 units in Amazon Vine. Vine Voices receive free products and provide thorough, authentic reviews with photos/videos.',
    sopSteps: [
      'Navigate to Seller Central > Advertising > Vine.',
      'Enter ASIN B0FVVM1CSC.',
      'Select enrollment tier (1-2 units free, up to 10 units for $75, or up to 30 units for $200 in Amazon US fees).',
      'Ensure FBA inventory is available in warehouse so Vine Voices can claim units immediately.'
    ],
    expectedImpact: 'Generates 15–28 detailed reviews with high media rate within 3–6 weeks, boosting initial social proof.'
  },
  {
    id: 'rec-2',
    pillar: 'VINE_AUTOMATION',
    title: 'Phase 1: Automate "Request a Review" via Seller Central / API',
    timeframe: 'Immediate (Days 1-7)',
    effort: 'Low',
    complianceLevel: '100% Amazon TOS Compliant',
    summary: 'Activate automated triggers for Amazon\'s official Request a Review tool between days 5 and 30 post-delivery. This sends a native Amazon 1-click star rating prompt.',
    sopSteps: [
      'Enable automated review requests using Seller Central approved third-party tool or standard order page trigger.',
      'Configure timing to trigger 5-7 days after delivery (allowing customer time to experience the product).',
      'Never send custom buyer-seller messages that solicit only positive feedback.'
    ],
    expectedImpact: 'Increases organic review conversion rate from ~1% to ~1.8%–2.5% of total orders.'
  },
  {
    id: 'rec-3',
    pillar: 'LISTING_CRO',
    title: 'Phase 2: Reverse-Engineer Competitor 1-3 Star Complaints',
    timeframe: 'Short-term (Weeks 2-4)',
    effort: 'Medium',
    complianceLevel: '100% Amazon TOS Compliant',
    summary: 'Analyze all 1-star, 2-star, and 3-star reviews on the competitor\'s listing. Identify their most frequent customer pain points (e.g., poor durability, confusing instructions, weak packaging).',
    sopSteps: [
      'Export competitor negative reviews or filter by "1 star" on their detail page.',
      'Group recurring complaints into 3 primary categories (e.g. Size, Clarity, Material).',
      'Highlight directly in your Main Image gallery bullet infographics how your product solves these exact issues.',
      'Update Bullet #1 and Bullet #2 to explicitly guarantee the solution to those pain points.'
    ],
    expectedImpact: 'Steals market share and conversion from the competitor by presenting a superior, defect-free alternative.'
  },
  {
    id: 'rec-4',
    pillar: 'LISTING_CRO',
    title: 'Phase 2: Upgrade Image Stack, Video Asset & A+ Brand Story',
    timeframe: 'Short-term (Weeks 2-4)',
    effort: 'High',
    complianceLevel: '100% Amazon TOS Compliant',
    summary: 'Elevate visual conversion assets to match or exceed the competitor: 3D render main image with 85%+ frame fill, dimension scale infographic, real-life lifestyle video, and Premium A+ Content with comparison chart.',
    sopSteps: [
      'Audit main image against competitor on mobile search results (does it pop off the white background?).',
      'Produce a 30-45s product demonstration video showing unboxing and immediate benefits.',
      'Build A+ Content featuring an ASIN comparison matrix cross-selling your own brand items.'
    ],
    expectedImpact: 'Lifts Unit Session Percentage (CVR) by 15%–35%, which directly multiplies unit sales and review volume.'
  },
  {
    id: 'rec-5',
    pillar: 'SALES_VELOCITY',
    title: 'Phase 3: Targeted PPC Conquesting on Competitor ASIN',
    timeframe: 'Short-term (Weeks 2-4)',
    effort: 'Medium',
    complianceLevel: '100% Amazon TOS Compliant',
    summary: 'Run a Sponsored Products Product Targeting (PAT) campaign placing your ad directly beneath the competitor\'s "Buy Box" on their own product detail page, paired with a limited-time coupon badge.',
    sopSteps: [
      'Create Sponsored Products campaign > Manual Targeting > Product Targeting.',
      'Target the specific competitor ASIN.',
      'Apply a 5%–10% green digital coupon clip badge to make your offer visually irresistible on their listing.'
    ],
    expectedImpact: 'Diverts qualified in-market buyers from their listing directly to yours, boosting immediate unit velocity.'
  },
  {
    id: 'rec-6',
    pillar: 'PACKAGING_CX',
    title: 'Phase 4: Flawless Unboxing & 100% Compliant Product Inserts',
    timeframe: 'Medium-term (Month 2+)',
    effort: 'Medium',
    complianceLevel: '100% Amazon TOS Compliant',
    summary: 'Design a professional quick-start user guide / thank-you card inside the box with QR code for digital warranty registration or setup instructions. Zero review gating or incentivized language.',
    sopSteps: [
      'Include simple step-by-step setup guide to prevent user error (the #1 cause of accidental 1-star reviews).',
      'Provide direct customer support email/warranty registration.',
      'Ensure zero language like "If you liked it review us, if not contact us" (which is an explicit TOS violation).'
    ],
    expectedImpact: 'Lowers product return rate and prevents negative reviews before they happen.'
  }
];

export const RISKS_AND_VERIFICATION: RiskVerificationItem[] = [
  {
    id: 'risk-1',
    title: 'Strict Prohibition on Incentivized / Conditional Reviews (Amazon TOS Section 3)',
    severity: 'CRITICAL_TOS',
    amazonPolicyReference: 'Customer Product Reviews Policies & Anti-Manipulation Policy',
    dangerExplanation: 'Never offer gift cards, cashback, refunds, free gifts, or warranty extensions in exchange for reviews. Never use conditional language like "If you are happy, please leave a 5-star review on Amazon; if you are unhappy, please contact our private support". Amazon\'s automated bots inspect packaging complaints and buyer messages; violations result in permanent review wiping, listing removal, or account deactivation.',
    howToVerify: 'Inspect all existing packaging inserts, emails, and collateral to ensure 100% neutral language.',
    safeAlternative: 'Use Amazon official Vine program and the native Seller Central "Request a Review" button only.'
  },
  {
    id: 'risk-2',
    title: 'The "Review Acceleration Quality Trap" (Accelerating 1-Star Reviews)',
    severity: 'PRODUCT_RISK',
    amazonPolicyReference: 'Voice of the Customer (VOC) & Order Defect Rate (ODR)',
    dangerExplanation: 'If ASIN B0FVVM1CSC has an unaddressed manufacturing flaw, confusing instructions, or shipping damage issue, aggressively soliciting reviews will simply accelerate the inflow of 1-star and 2-star reviews, permanently poisoning the listing rating below the critical 4.2-star threshold.',
    howToVerify: 'Check Voice of the Customer (VOC) CX Health in Seller Central. Ensure return rate is under 3-5% before pushing review volume.',
    safeAlternative: 'Resolve physical quality, sizing, and instructional clarity first, then scale review requests.'
  },
  {
    id: 'risk-3',
    title: 'Margin Erosion from Chasing Review Parity via PPC Overspend',
    severity: 'FINANCIAL_RISK',
    amazonPolicyReference: 'FBA Profitability & Contribution Margin Accounting',
    dangerExplanation: 'Attempting to match a competitor\'s 2,000-review count overnight by bidding excessively on high-volume broad keywords can cause advertising spend (ACoS > 80%) to wipe out all profitability and deplete cash flow.',
    howToVerify: 'Calculate your exact Break-Even ACoS = (Selling Price - COGS - FBA Fees - Referral Fee) / Selling Price.',
    safeAlternative: 'Scale PPC profitably by targeting specific long-tail keywords and competitor ASIN conquesting where your product holds a clear price/quality advantage.'
  },
  {
    id: 'risk-4',
    title: 'Competitor Black-Hat Review Hijacking / Variation Merging Check',
    severity: 'HIGH_RISK',
    amazonPolicyReference: 'Amazon Variation Policy & ASIN Creation Guidelines',
    dangerExplanation: 'Some competitors have thousands of reviews because they merged abandoned, unrelated listings (e.g. phone cables merged with kitchen utensils) into their family to falsely inherit reviews. Competing organically against a manipulated listing requires reporting, not mimicking.',
    howToVerify: 'Review competitor historical reviews. Filter by "All formats" and sort by oldest reviews to confirm all reviews are for the exact current product category.',
    safeAlternative: 'If illegitimate merging is verified, submit a structured Report Abuse ticket through Seller Central > Account Health.'
  }
];

export function generateCustomDiagnostic(caseCtx: FBACaseContext): {
  causes: AuditItem[];
  missingMetrics: MissingMetricItem[];
  recommendations: RecommendationStep[];
  risks: RiskVerificationItem[];
} {
  const prob = (caseCtx.customerProblem || '').toLowerCase();
  const targetAsin = caseCtx.asin || 'Your Target ASIN';

  // If standard benchmark review gap
  if (prob.includes('review') || prob.includes('competitor') || prob.includes('vine') || !prob.trim()) {
    return {
      causes: BASELINE_POSSIBLE_CAUSES.map(c => ({
        ...c,
        description: c.description.replace(/B0FVVM1CSC/g, targetAsin),
        actionableStep: c.actionableStep?.replace(/B0FVVM1CSC/g, targetAsin),
      })),
      missingMetrics: MISSING_METRICS_LIST.map(m => ({
        ...m,
        metricName: m.metricName.replace(/B0FVVM1CSC/g, targetAsin),
      })),
      recommendations: PRACTICAL_RECOMMENDATIONS.map(r => ({
        ...r,
        sopSteps: r.sopSteps.map(s => s.replace(/B0FVVM1CSC/g, targetAsin)),
      })),
      risks: RISKS_AND_VERIFICATION.map(rk => ({
        ...rk,
        dangerExplanation: rk.dangerExplanation.replace(/B0FVVM1CSC/g, targetAsin),
      })),
    };
  }

  // Dynamic tailoring for other problem archetypes
  const isReturnProblem = prob.includes('return') || prob.includes('defect') || prob.includes('broken') || prob.includes('quality');
  const isPpcProblem = prob.includes('ppc') || prob.includes('acos') || prob.includes('ad') || prob.includes('spend');
  const isCvrProblem = prob.includes('conversion') || prob.includes('cvr') || prob.includes('traffic') || prob.includes('rank');

  const dynamicCauses: AuditItem[] = [
    {
      id: 'dc-1',
      title: isReturnProblem ? 'Unboxing Experience & Instructional Clarity Deficit' : isPpcProblem ? 'Broad Keyword Cannibalization & Bleeding Search Terms' : 'Mobile Hero Asset & Conversion Funnel Friction',
      category: isReturnProblem ? 'Customer Experience' : isPpcProblem ? 'Paid Advertising' : 'Listing Merchandising',
      impactLevel: 'CRITICAL',
      type: 'ASSUMPTION',
      description: `Analysis for ASIN ${targetAsin}: ${isReturnProblem ? 'High return rate is frequently caused by non-intuitive setup or mismatch between product images and physical reality.' : isPpcProblem ? 'Broad and auto campaigns without negative keyword filtering generate irrelevant clicks that fail to convert.' : 'Mobile buyers make split-second purchase decisions based on the first 3 gallery images; weak visual contrast drives bounce rate.'}`,
      sourceOrRationale: 'Marketplace operational root cause logic.',
      actionableStep: isReturnProblem ? 'Inspect Voice of the Customer (VOC) return codes in Seller Central.' : isPpcProblem ? 'Download 60-day Search Term Report from Campaign Manager.' : 'Check Unit Session Percentage by ASIN in Business Reports.'
    },
    {
      id: 'dc-2',
      title: 'Competitive Price-to-Value & Offer Presentation Gap',
      category: 'Offer Economics',
      impactLevel: 'HIGH',
      type: 'ASSUMPTION',
      description: 'Competitors may be offering bundled accessories, digital coupons, or prime delivery lead-times that outperform the target listing.',
      sourceOrRationale: 'Comparative listing analysis.',
      actionableStep: 'Audit competitor landing pages for digital coupon badges and bundle inclusions.'
    },
    {
      id: 'dc-3',
      title: 'Organic Search Query Indexing & Relevance Shifts',
      category: 'Search Algorithm',
      impactLevel: 'HIGH',
      type: 'ASSUMPTION',
      description: 'Amazon search algorithms re-weight root keywords based on recent click-to-purchase ratios, which can cause sudden rank volatility.',
      sourceOrRationale: 'Search Query Performance (SQP) algorithmic dynamics.',
      actionableStep: 'Review Brand Analytics Search Query Performance report for target ASIN.'
    }
  ];

  return {
    causes: dynamicCauses,
    missingMetrics: MISSING_METRICS_LIST.map(m => ({
      ...m,
      metricName: m.metricName.replace(/B0FVVM1CSC/g, targetAsin),
    })),
    recommendations: PRACTICAL_RECOMMENDATIONS.map(r => ({
      ...r,
      sopSteps: r.sopSteps.map(s => s.replace(/B0FVVM1CSC/g, targetAsin)),
    })),
    risks: RISKS_AND_VERIFICATION.map(rk => ({
      ...rk,
      dangerExplanation: rk.dangerExplanation.replace(/B0FVVM1CSC/g, targetAsin),
    })),
  };
}
