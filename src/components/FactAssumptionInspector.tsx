import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2, FileQuestion, Filter, Search, Edit3 } from 'lucide-react';
import { FBACaseContext } from '../types';

interface FactAssumptionInspectorProps {
  caseContext: FBACaseContext;
  onOpenAdvisor: (prompt: string) => void;
}

export const FactAssumptionInspector: React.FC<FactAssumptionInspectorProps> = ({
  caseContext,
  onOpenAdvisor,
}) => {
  const [filter, setFilter] = useState<'all' | 'facts' | 'assumptions' | 'unverified'>('all');

  const asinDisplay = caseContext.asin || 'UNASSIGNED';
  const hasCase = Boolean(caseContext.asin || caseContext.customerProblem);

  const ledgerItems = [
    {
      id: 'f-1',
      type: 'VERIFIED_FACT',
      statement: `Target ASIN under review is "${asinDisplay}".`,
      evidence: caseContext.asin
        ? 'Explicitly confirmed in case setup as the primary listing identifier.'
        : 'Pending confirmation by seller.',
      verificationStatus: caseContext.asin ? 'VERIFIED' : 'PENDING',
      actionableAdvice: 'Use ASIN for indexing, catalog lookup, and Seller Central inventory tracking.'
    },
    {
      id: 'f-2',
      type: 'VERIFIED_FACT',
      statement: `Target Marketplace is "${caseContext.marketplace}" (${caseContext.marketplace === 'USA' ? 'Amazon.com' : `Amazon ${caseContext.marketplace}`}).`,
      evidence: 'Confirmed in marketplace selection.',
      verificationStatus: 'VERIFIED',
      actionableAdvice: 'Subject to regional Federal Trade Commission / consumer endorsement guides and Amazon Section 3 TOS.'
    },
    {
      id: 'f-3',
      type: 'VERIFIED_FACT',
      statement: caseContext.customerProblem
        ? `Seller reported problem: "${caseContext.customerProblem}"`
        : 'No specific customer problem statement entered yet.',
      evidence: 'Direct problem reported by the seller.',
      verificationStatus: caseContext.customerProblem ? 'VERIFIED' : 'PENDING',
      actionableAdvice: 'Audit scope is strictly bounded to solving this specific symptom without hallucinating unconfirmed metrics.'
    },
    {
      id: 'a-1',
      type: 'ASSUMPTION',
      statement: 'Competitor listing has an earlier launch date and longer sales history.',
      evidence: 'Logical hypothesis; Amazon review counts compound over lifetime orders. Needs Seller confirmation.',
      verificationStatus: 'NEEDS_VERIFICATION',
      actionableAdvice: 'Verify launch date on Keepa or CamelCamelCamel.'
    },
    {
      id: 'a-2',
      type: 'ASSUMPTION',
      statement: 'Competitor has higher daily unit sales volume fueling higher organic review velocity.',
      evidence: 'Standard Amazon review mathematical correlation: review velocity = monthly units * review rate %.',
      verificationStatus: 'NEEDS_VERIFICATION',
      actionableAdvice: 'Compare estimated BSR or Search Query Performance market share.'
    },
    {
      id: 'a-3',
      type: 'ASSUMPTION',
      statement: 'Competitor utilized Amazon Vine to get their first 30 reviews with green badges.',
      evidence: 'Standard launch SOP for brand-registered sellers in US marketplace.',
      verificationStatus: 'NEEDS_VERIFICATION',
      actionableAdvice: 'Inspect competitor listing reviews for the green "Vine Customer Review of Free Product" badge.'
    },
    {
      id: 'a-4',
      type: 'ASSUMPTION',
      statement: 'Competitor may be pooling reviews across multiple child variations (parent-child family).',
      evidence: 'Common Amazon listing architecture where colors/sizes share review aggregates.',
      verificationStatus: 'NEEDS_VERIFICATION',
      actionableAdvice: 'Check dropdown variations on competitor product detail page.'
    },
    {
      id: 'm-1',
      type: 'MISSING_DATA',
      statement: `Exact Monthly Unit Volume and Revenue for ASIN ${asinDisplay}.`,
      evidence: 'Not provided in initial prompt. Never hallucinated or assumed.',
      verificationStatus: 'UNAVAILABLE_WITHOUT_REPORT',
      actionableAdvice: 'Extract from Seller Central > Business Reports > Detail Page Sales & Traffic.'
    },
    {
      id: 'm-2',
      type: 'MISSING_DATA',
      statement: `Unit Session Percentage (Conversion Rate) for ASIN ${asinDisplay}.`,
      evidence: 'Not provided in initial prompt. Crucial for diagnosing conversion bottlenecks.',
      verificationStatus: 'UNAVAILABLE_WITHOUT_REPORT',
      actionableAdvice: 'Check Business Reports By ASIN.'
    },
    {
      id: 'm-3',
      type: 'MISSING_DATA',
      statement: 'Current Star Rating and Exact Numerical Review Count for Both ASINs.',
      evidence: 'Not provided in initial prompt. Prevents calculating exact review parity timeline.',
      verificationStatus: 'UNAVAILABLE_WITHOUT_REPORT',
      actionableAdvice: 'Record live review totals and star rating (e.g. 4.2 vs 4.7) from product page.'
    }
  ];

  const filteredItems = ledgerItems.filter((item) => {
    if (filter === 'facts') return item.type === 'VERIFIED_FACT';
    if (filter === 'assumptions') return item.type === 'ASSUMPTION';
    if (filter === 'unverified') return item.type === 'MISSING_DATA';
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">
                Fact vs. Assumption Verification Ledger
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Zero tolerance for hallucination. Every statement is categorized as verified evidence, hypothesis, or missing Seller Central data.
            </p>
          </div>

          <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
            Anti-Hallucination Protocol Active
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 mt-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              filter === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Ledger Items ({ledgerItems.length})
          </button>
          <button
            onClick={() => setFilter('facts')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'facts'
                ? 'bg-emerald-700 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Verified Facts (3)
          </button>
          <button
            onClick={() => setFilter('assumptions')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'assumptions'
                ? 'bg-amber-700 text-white'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Hypotheses / Assumptions (4)
          </button>
          <button
            onClick={() => setFilter('unverified')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
              filter === 'unverified'
                ? 'bg-blue-700 text-white'
                : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Missing Data Points (3)
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="py-3 px-4 sm:px-6">Status & Type</th>
                <th className="py-3 px-4 sm:px-6">Statement / Claim</th>
                <th className="py-3 px-4 sm:px-6">Evidence / Verification Basis</th>
                <th className="py-3 px-4 sm:px-6">Strategic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-4 px-4 sm:px-6 whitespace-nowrap align-top">
                    {item.type === 'VERIFIED_FACT' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-emerald-100 text-emerald-800">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                        VERIFIED FACT
                      </span>
                    )}
                    {item.type === 'ASSUMPTION' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-amber-100 text-amber-900">
                        <AlertCircle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                        ASSUMPTION
                      </span>
                    )}
                    {item.type === 'MISSING_DATA' && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-semibold bg-blue-100 text-blue-900">
                        <FileQuestion className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        MISSING DATA
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-4 sm:px-6 font-medium text-slate-900 align-top max-w-xs sm:max-w-sm">
                    {item.statement}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-slate-600 text-xs align-top max-w-xs">
                    {item.evidence}
                  </td>
                  <td className="py-4 px-4 sm:px-6 text-xs align-top">
                    <span className="text-slate-700 block mb-1.5 font-medium">
                      {item.actionableAdvice}
                    </span>
                    <button
                      onClick={() =>
                        onOpenAdvisor(
                          `Can you help me verify or take action on this statement: "${item.statement}" for ASIN ${asinDisplay}?`
                        )
                      }
                      className="text-[11px] font-semibold text-amber-700 hover:text-amber-800 hover:underline"
                    >
                      Consult Advisor →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
