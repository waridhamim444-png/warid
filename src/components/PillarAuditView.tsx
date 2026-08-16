import React, { useState } from 'react';
import {
  HelpCircle,
  FileQuestion,
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Shield,
  Layers,
  TrendingUp,
  Check,
  Edit3,
  Clock,
  Sparkles
} from 'lucide-react';
import {
  AuditItem,
  MissingMetricItem,
  RecommendationStep,
  RiskVerificationItem,
  FBACaseContext
} from '../types';

interface PillarAuditViewProps {
  possibleCauses: AuditItem[];
  missingMetrics: MissingMetricItem[];
  recommendations: RecommendationStep[];
  risks: RiskVerificationItem[];
  caseContext: FBACaseContext;
  onUpdateMissingMetric: (id: string, value: string) => void;
  onOpenAdvisorWithPrompt: (prompt: string) => void;
}

export const PillarAuditView: React.FC<PillarAuditViewProps> = ({
  possibleCauses,
  missingMetrics,
  recommendations,
  risks,
  caseContext,
  onUpdateMissingMetric,
  onOpenAdvisorWithPrompt,
}) => {
  const [activeSection, setActiveSection] = useState<'all' | 'causes' | 'missing' | 'recommendations' | 'risks'>('all');
  const [expandedSOPs, setExpandedSOPs] = useState<Record<string, boolean>>({
    'rec-1': true,
    'rec-2': true,
  });
  const [editingMetricId, setEditingMetricId] = useState<string | null>(null);
  const [tempMetricValue, setTempMetricValue] = useState<string>('');

  const toggleSOP = (id: string) => {
    setExpandedSOPs((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleStartEdit = (metric: MissingMetricItem) => {
    setEditingMetricId(metric.id);
    setTempMetricValue(metric.userValue || '');
  };

  const handleSaveEdit = (id: string) => {
    onUpdateMissingMetric(id, tempMetricValue);
    setEditingMetricId(null);
  };

  return (
    <div className="space-y-8">
      {/* If empty state after reset */}
      {possibleCauses.length === 0 && recommendations.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-xl p-8 sm:p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 mb-1">
            Fresh Case Ready for Diagnostic
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mb-6">
            The previous case was cleared. Configure your target ASIN and problem statement in the intake box above, or run a diagnostic on one of our pre-built benchmark cases.
          </p>
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Edit3 className="w-3.5 h-3.5 mr-1.5" />
            Set Up Case & Run Diagnostic
          </button>
        </div>
      ) : (
        <>
          {/* Section Quick Jump Filter */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-100/80 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveSection('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                activeSection === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              View Full 4-Pillar Audit
            </button>
            <button
              onClick={() => setActiveSection('causes')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeSection === 'causes' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              1. Possible Causes ({possibleCauses.length})
            </button>
            <button
              onClick={() => setActiveSection('missing')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeSection === 'missing' ? 'bg-white text-amber-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              2. Information Missing ({missingMetrics.length})
            </button>
            <button
              onClick={() => setActiveSection('recommendations')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeSection === 'recommendations' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              3. Practical Recommendations ({recommendations.length})
            </button>
            <button
              onClick={() => setActiveSection('risks')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                activeSection === 'risks' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              4. Risks & Verification ({risks.length})
            </button>
          </div>

      {/* PILLAR 1: POSSIBLE CAUSES */}
      {(activeSection === 'all' || activeSection === 'causes') && (
        <section id="pillar-causes" className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Possible Causes (Root Cause Diagnostics)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Marketplace mechanics explaining why a competitor's listing accumulated significantly more reviews.
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
              7 Strategic Hypotheses Evaluated
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {possibleCauses.map((cause) => (
              <div
                key={cause.id}
                className="border border-slate-200 rounded-xl p-4 hover:border-slate-300 transition-colors bg-white flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-semibold rounded-md bg-slate-100 text-slate-700">
                      {cause.category}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                        cause.impactLevel === 'CRITICAL'
                          ? 'bg-rose-100 text-rose-800'
                          : cause.impactLevel === 'HIGH'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {cause.impactLevel} Impact
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-1.5 flex items-center gap-1.5">
                    {cause.title}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed mb-3">
                    {cause.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 mt-2 space-y-1.5">
                  <div className="text-xs text-slate-500 flex items-start gap-1">
                    <span className="font-semibold text-slate-700 shrink-0">Rationale:</span>
                    <span>{cause.sourceOrRationale}</span>
                  </div>
                  {cause.actionableStep && (
                    <div className="text-xs text-blue-700 bg-blue-50/70 p-2 rounded-lg flex items-start gap-1.5">
                      <span className="font-semibold shrink-0">How to Verify:</span>
                      <span>{cause.actionableStep}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* PILLAR 2: WHAT INFORMATION IS MISSING */}
      {(activeSection === 'all' || activeSection === 'missing') && (
        <section id="pillar-missing" className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  What Information is Missing (Required Seller Data)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                To deliver a definitive numerical strategy, the following Seller Central reports & metrics must be verified.
              </p>
            </div>
            <div className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 font-medium">
              Anti-Hallucination Guard: {missingMetrics.filter((m) => !m.userValue).length} Unconfirmed Metrics
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase bg-slate-50/70">
                  <th className="py-3 px-4">Metric & Priority</th>
                  <th className="py-3 px-4">Where to Find in Seller Central</th>
                  <th className="py-3 px-4">Strategic Impact</th>
                  <th className="py-3 px-4 w-48">Your Actual Data (Optional)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {missingMetrics.map((metric) => (
                  <tr key={metric.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 align-top">
                      <div className="font-semibold text-slate-900 mb-1">{metric.metricName}</div>
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                          metric.priority === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : metric.priority === 'HIGH'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {metric.priority}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 align-top font-mono text-slate-600 bg-slate-50/50 rounded-md">
                      {metric.sellerCentralLocation}
                    </td>
                    <td className="py-3.5 px-4 align-top text-slate-600">
                      {metric.whyItMatters}
                    </td>
                    <td className="py-3.5 px-4 align-top">
                      {editingMetricId === metric.id ? (
                        <div className="space-y-1.5">
                          <input
                            type="text"
                            value={tempMetricValue}
                            onChange={(e) => setTempMetricValue(e.target.value)}
                            placeholder="e.g. 450 units/mo, 14% CVR"
                            className="w-full text-xs border border-amber-300 rounded-md p-1.5 focus:outline-hidden focus:ring-1 focus:ring-amber-500 bg-white"
                            autoFocus
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveEdit(metric.id)}
                              className="px-2 py-1 bg-emerald-600 text-white rounded-md text-[10px] font-medium hover:bg-emerald-700 flex items-center"
                            >
                              <Check className="w-3 h-3 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => setEditingMetricId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded-md text-[10px] hover:bg-slate-300"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between group">
                          {metric.userValue ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-200">
                              {metric.userValue}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Not provided</span>
                          )}
                          <button
                            onClick={() => handleStartEdit(metric)}
                            className="text-slate-400 hover:text-amber-700 opacity-60 group-hover:opacity-100 transition-opacity p-1"
                            title="Add your metric"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* PILLAR 3: PRACTICAL RECOMMENDATIONS */}
      {(activeSection === 'all' || activeSection === 'recommendations') && (
        <section id="pillar-recommendations" className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Practical Recommendations (Step-by-Step Action Plan)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Phased, high-impact strategies to bridge the social proof gap while remaining 100% compliant with Amazon TOS.
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md">
              4 Phased Milestones
            </span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const isExpanded = expandedSOPs[rec.id];
              return (
                <div
                  key={rec.id}
                  className="border border-slate-200 rounded-xl overflow-hidden hover:border-slate-300 transition-all bg-white"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 text-xs font-bold bg-slate-900 text-white rounded-md">
                          {rec.timeframe}
                        </span>
                        <span className="px-2 py-0.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
                          {rec.complianceLevel}
                        </span>
                      </div>
                      <span className="text-xs text-slate-500 font-medium">
                        Effort: <strong className="text-slate-700">{rec.effort}</strong>
                      </span>
                    </div>

                    <h4 className="text-sm sm:text-base font-bold text-slate-900 mb-1.5">
                      {rec.title}
                    </h4>

                    <p className="text-xs sm:text-sm text-slate-600 mb-3">
                      {rec.summary}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="text-xs text-emerald-800 font-medium flex items-center gap-1.5">
                        <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Expected Outcome: {rec.expectedImpact}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onOpenAdvisorWithPrompt(`Can you give me a detailed execution plan for "${rec.title}" on ASIN ${caseContext.asin}?`)}
                          className="px-2.5 py-1 text-xs text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-lg font-medium transition-colors flex items-center"
                        >
                          <Sparkles className="w-3 h-3 mr-1 text-amber-600" />
                          Deep Dive with AI
                        </button>
                        <button
                          onClick={() => toggleSOP(rec.id)}
                          className="px-2.5 py-1 text-xs text-slate-700 hover:bg-slate-100 rounded-lg font-medium transition-colors flex items-center"
                        >
                          {isExpanded ? 'Hide Steps' : 'View Action Steps'}
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 ml-1" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 ml-1" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Action Steps SOP */}
                  {isExpanded && (
                    <div className="bg-slate-50 p-4 border-t border-slate-200">
                      <div className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                        Step-by-Step Standard Operating Procedure (SOP)
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-700">
                        {rec.sopSteps.map((step, idx) => (
                          <li key={idx} className="leading-relaxed">
                            <span className="font-normal">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* PILLAR 4: RISKS & VERIFICATION */}
      {(activeSection === 'all' || activeSection === 'risks') && (
        <section id="pillar-risks" className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 mb-5 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 text-xs font-bold flex items-center justify-center">
                  4
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Risks & Things to Verify (Policy & Financial Safeguards)
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Crucial Amazon TOS checkpoints and commercial pitfalls to avoid while pursuing review growth.
              </p>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-medium bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
              4 Critical Guardrails
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {risks.map((risk) => (
              <div
                key={risk.id}
                className="border border-rose-200/80 bg-rose-50/20 rounded-xl p-4 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-rose-100 text-rose-900">
                      {risk.severity.replace('_', ' ')}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {risk.amazonPolicyReference}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-2">
                    {risk.title}
                  </h4>

                  <p className="text-xs text-slate-700 leading-relaxed mb-3">
                    {risk.dangerExplanation}
                  </p>
                </div>

                <div className="space-y-2 pt-3 border-t border-rose-200/60 text-xs">
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                    <strong className="text-slate-900 block mb-0.5">Verification Checklist:</strong>
                    {risk.howToVerify}
                  </div>
                  <div className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 text-emerald-900">
                    <strong className="text-emerald-950 block mb-0.5">Safe Compliant Alternative:</strong>
                    {risk.safeAlternative}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
        </>
      )}
    </div>
  );
};
