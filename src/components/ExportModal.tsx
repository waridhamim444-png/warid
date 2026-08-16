import React, { useState } from 'react';
import { X, Copy, Check, Download, FileText, Printer } from 'lucide-react';
import { FBACaseContext, AuditItem, MissingMetricItem, RecommendationStep, RiskVerificationItem } from '../types';
import {
  generateCustomDiagnostic,
  BASELINE_POSSIBLE_CAUSES,
  MISSING_METRICS_LIST,
  PRACTICAL_RECOMMENDATIONS,
  RISKS_AND_VERIFICATION,
} from '../data/fbaCaseData';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseContext: FBACaseContext;
  causes: AuditItem[];
  missingMetrics: MissingMetricItem[];
  recommendations: RecommendationStep[];
  risks: RiskVerificationItem[];
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  caseContext,
  causes,
  missingMetrics,
  recommendations,
  risks,
}) => {
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  // Exact data resolution with fallback to custom diagnostic engine if arrays are unpopulated
  const targetAsin = caseContext?.asin?.trim() ? caseContext.asin.trim() : 'Not provided';
  const marketplace = caseContext?.marketplace?.trim() ? caseContext.marketplace.trim() : 'Not provided';
  const problemStatement = caseContext?.customerProblem?.trim() ? caseContext.customerProblem.trim() : 'Not provided';
  const category = caseContext?.category?.trim() ? caseContext.category.trim() : 'Not provided';

  // Fallback diagnostic if state arrays are empty but case has context
  const fallbackDiagnostic = caseContext?.customerProblem?.trim()
    ? generateCustomDiagnostic(caseContext)
    : null;

  const activeCauses =
    causes && causes.length > 0
      ? causes
      : fallbackDiagnostic?.causes && fallbackDiagnostic.causes.length > 0
      ? fallbackDiagnostic.causes
      : BASELINE_POSSIBLE_CAUSES;

  const activeMissingMetrics =
    missingMetrics && missingMetrics.length > 0
      ? missingMetrics
      : fallbackDiagnostic?.missingMetrics && fallbackDiagnostic.missingMetrics.length > 0
      ? fallbackDiagnostic.missingMetrics
      : MISSING_METRICS_LIST;

  const activeRecommendations =
    recommendations && recommendations.length > 0
      ? recommendations
      : fallbackDiagnostic?.recommendations && fallbackDiagnostic.recommendations.length > 0
      ? fallbackDiagnostic.recommendations
      : PRACTICAL_RECOMMENDATIONS;

  const activeRisks =
    risks && risks.length > 0
      ? risks
      : fallbackDiagnostic?.risks && fallbackDiagnostic.risks.length > 0
      ? fallbackDiagnostic.risks
      : RISKS_AND_VERIFICATION;

  const formattedReport = `# AMAZON FBA BUSINESS ANALYSIS AUDIT REPORT
================================================================================
CASE METADATA & INTAKE CONTEXT
================================================================================
- Target ASIN: ${targetAsin}
- Marketplace: Amazon ${marketplace}
- Category: ${category}
- Customer Problem Statement: "${problemStatement}"
- Audit Timestamp: ${new Date().toLocaleString()}
- Standard: Anti-Hallucination Protocol & Strict Fact vs Assumption Separation
- Regulatory Compliance: Amazon Business Solutions Agreement (Section 3)

================================================================================
PILLAR 1: POSSIBLE CAUSES (Root Cause Diagnostics)
================================================================================
${
  activeCauses && activeCauses.length > 0
    ? activeCauses
        .map(
          (c, i) => `[${i + 1}] ${c.title || 'Root Cause Finding'}
- Classification: [${c.type || 'ASSUMPTION'}]
- Impact Level: ${c.impactLevel || 'MEDIUM'} Impact
- Operational Category: ${c.category || 'General'}
- Diagnostic Finding: ${c.description || 'Not provided'}
- Underlying Rationale: ${c.sourceOrRationale || 'Not provided'}
- Actionable Verification Step: ${c.actionableStep || 'Not provided'}
`
        )
        .join('\n')
    : '[MISSING DATA] Not provided. No diagnostic causes currently generated for this case.'
}

================================================================================
PILLAR 2: WHAT INFORMATION IS MISSING (Required Seller Central Reports)
================================================================================
${
  activeMissingMetrics && activeMissingMetrics.length > 0
    ? activeMissingMetrics
        .map(
          (m, i) => `[${i + 1}] ${m.metricName || 'Seller Metric'}
- Priority Level: [Priority: ${m.priority || 'MEDIUM'}]
- Seller Central Location: ${m.sellerCentralLocation || 'Not provided'}
- Strategic Importance: ${m.whyItMatters || 'Not provided'}
- Current Seller Input Status: ${
            m.userValue && m.userValue.trim()
              ? `[VERIFIED FACT] Provided by Seller: ${m.userValue.trim()}`
              : '[MISSING SELLER DATA] Unconfirmed by Seller'
          }
`
        )
        .join('\n')
    : '[MISSING DATA] Not provided. No missing metric records specified.'
}

================================================================================
PILLAR 3: PRACTICAL RECOMMENDATIONS (Phased High-ROI Action Plan)
================================================================================
${
  activeRecommendations && activeRecommendations.length > 0
    ? activeRecommendations
        .map(
          (r, i) => `[Phase ${i + 1}] ${r.title || 'Action Step'} (${r.timeframe || 'Immediate'})
- Implementation Effort: ${r.effort || 'Moderate'}
- Amazon TOS Compliance Level: ${r.complianceLevel || '100% Policy Compliant'}
- Strategic Overview: ${r.summary || 'Not provided'}
- Standard Operating Procedure (SOP):
${
  r.sopSteps && r.sopSteps.length > 0
    ? r.sopSteps.map((s, si) => `   ${si + 1}. ${s}`).join('\n')
    : '   1. Not provided'
}
- Expected Strategic Impact: ${r.expectedImpact || 'Not provided'}
`
        )
        .join('\n')
    : '[MISSING DATA] Not provided. No practical recommendations generated for this case.'
}

================================================================================
PILLAR 4: RISKS & THINGS TO VERIFY (Amazon TOS & Financial Safeguards)
================================================================================
${
  activeRisks && activeRisks.length > 0
    ? activeRisks
        .map(
          (rk, i) => `[Risk ${i + 1}] ${rk.title || 'Operational Risk'} [Severity: ${rk.severity || 'HIGH_RISK'}]
- Amazon Policy Reference: ${rk.amazonPolicyReference || 'Amazon Customer Product Reviews Policies'}
- Danger / Risk Explanation: ${rk.dangerExplanation || 'Not provided'}
- How to Verify Before Acting: ${rk.howToVerify || 'Not provided'}
- Compliant Safe Alternative: ${rk.safeAlternative || 'Not provided'}
`
        )
        .join('\n')
    : '[MISSING DATA] Not provided. No risk verification entries recorded.'
}

================================================================================
SUMMARY DIRECTIVE & COMPLIANCE MANDATE:
================================================================================
1. Strict Zero-Tolerance Policy: Never offer incentives, refunds, gift cards, or conditional "review gating" language in package inserts or buyer messages (Amazon Section 3 BSA).
2. Social Proof & Vine Program: If brand-registered and review count is under 30, enroll up to 30 units in Amazon Vine via Advertising > Vine.
3. Automated TOS-Compliant Review Requests: Trigger the native Amazon "Request a Review" API 5–7 days post-delivery via authorized SP-API tools or Seller Central.
4. Voice of the Customer (VOC): Mine competitor 1-star and 2-star reviews to address common product flaws in your listing bullets and A+ Content before scaling PPC.
5. Unit Economics Discipline: Calculate break-even ACoS and target contribution margin before launching aggressive competitor conquesting campaigns.
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedReport);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const safeAsin = caseContext?.asin?.trim() ? caseContext.asin.trim() : 'FBA-Audit';
    const blob = new Blob([formattedReport], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `FBA-Audit-Report-${safeAsin}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Export FBA Business Analysis Audit Report
              </h3>
              <p className="text-xs text-slate-500">
                ASIN: <span className="font-mono font-semibold text-slate-700">{targetAsin}</span> • Marketplace: <span className="font-semibold text-slate-700">{marketplace}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Text Area Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          <pre className="text-xs font-mono bg-slate-50 text-slate-800 p-4 sm:p-5 rounded-xl border border-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed">
            {formattedReport}
          </pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 bg-slate-50 rounded-b-2xl">
          <span className="text-xs text-slate-500">
            Formatted in structured Markdown with all 4 pillars and verified fact separation.
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Download .md
            </button>
            <button
              onClick={handleCopy}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied to Clipboard!' : 'Copy Formatted Report'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
