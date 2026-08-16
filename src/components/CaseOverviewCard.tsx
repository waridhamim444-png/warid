import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  FileText,
  ArrowRight,
  RefreshCw,
  Sparkles,
  PlusCircle,
  Edit3,
  Loader2,
  Globe,
  Tag,
  Check,
  FileSpreadsheet
} from 'lucide-react';
import { FBACaseContext, MarketplaceCode } from '../types';
import { CASE_PRESETS, CasePreset } from '../data/fbaCaseData';

interface CaseOverviewCardProps {
  caseContext: FBACaseContext;
  hasActiveAnalysis: boolean;
  isAnalyzing: boolean;
  onOpenAdvisor: () => void;
  onFillMissingData: () => void;
  onResetCase: () => void;
  onRunAnalysis: (newContext: FBACaseContext) => void;
  onLoadPreset: (preset: CasePreset) => void;
  missingDataCount: number;
  onOpenAutomatedDataEntry?: () => void;
}

export const CaseOverviewCard: React.FC<CaseOverviewCardProps> = ({
  caseContext,
  hasActiveAnalysis,
  isAnalyzing,
  onOpenAdvisor,
  onFillMissingData,
  onResetCase,
  onRunAnalysis,
  onLoadPreset,
  missingDataCount,
  onOpenAutomatedDataEntry,
}) => {
  const [isEditing, setIsEditing] = useState<boolean>(!hasActiveAnalysis || !caseContext.asin);
  const [inputAsin, setInputAsin] = useState<string>(caseContext.asin || '');
  const [inputMarketplace, setInputMarketplace] = useState<MarketplaceCode>(caseContext.marketplace || 'USA');
  const [inputProblem, setInputProblem] = useState<string>(caseContext.customerProblem || '');
  const [inputCategory, setInputCategory] = useState<string>(caseContext.category || '');

  // Sync state if caseContext changes from parent
  useEffect(() => {
    setInputAsin(caseContext.asin || '');
    setInputMarketplace(caseContext.marketplace || 'USA');
    setInputProblem(caseContext.customerProblem || '');
    setInputCategory(caseContext.category || '');
    if (!hasActiveAnalysis || !caseContext.asin) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
    }
  }, [caseContext, hasActiveAnalysis]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputProblem.trim() && !inputAsin.trim()) return;

    onRunAnalysis({
      ...caseContext,
      asin: inputAsin.trim().toUpperCase() || 'UNASSIGNED_ASIN',
      marketplace: inputMarketplace,
      customerProblem: inputProblem.trim() || 'General FBA listing performance and review diagnostics.',
      category: inputCategory.trim() || undefined,
    });
    setIsEditing(false);
  };

  const handleSelectPreset = (preset: CasePreset) => {
    setInputAsin(preset.asin);
    setInputMarketplace(preset.marketplace);
    setInputProblem(preset.problem);
    setInputCategory(preset.category);
    onLoadPreset(preset);
    setIsEditing(false);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs mb-6 transition-all">
      {/* If in Editing / Intake Mode */}
      {isEditing ? (
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-800 border border-amber-500/20 rounded-md flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Case Intake & Problem Definition
                </span>
                <span className="text-xs text-slate-500">
                  Define your ASIN and problem statement to generate an anti-hallucination diagnostic
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {caseContext.asin ? 'Edit Case Parameters' : 'Start Fresh Amazon FBA Case Analysis'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenAutomatedDataEntry && (
                <button
                  type="button"
                  onClick={onOpenAutomatedDataEntry}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  title="Import from Google Sheets / CSV format"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Import from CSV / Sheets
                </button>
              )}
              {hasActiveAnalysis && caseContext.asin && (
                <button
                  onClick={() => setIsEditing(false)}
                  className="text-xs font-medium text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  Cancel & View Active Case
                </button>
              )}
            </div>
          </div>

          {/* Preset Chips */}
          <div className="mt-4 pt-1">
            <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
              Quick Case Presets (One-Click Setup)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
              {CASE_PRESETS.map((preset) => {
                const isCurrent = caseContext.asin === preset.asin && caseContext.customerProblem === preset.problem;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`text-left p-3 rounded-lg border text-xs transition-all ${
                      isCurrent
                        ? 'border-amber-500 bg-amber-50/70 text-slate-900 shadow-xs'
                        : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-900 truncate">{preset.name}</span>
                      <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 text-slate-700 rounded shrink-0">
                        {preset.asin}
                      </span>
                    </div>
                    <span className="inline-block px-1.5 py-0.5 text-[10px] font-medium bg-amber-100 text-amber-800 rounded mb-1.5">
                      {preset.badge}
                    </span>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                      "{preset.problem}"
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Input Form */}
          <form onSubmit={handleSubmit} className="mt-5 space-y-4 pt-4 border-t border-slate-100">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* ASIN Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Target ASIN (Amazon Standard Identification Number)
                </label>
                <input
                  type="text"
                  value={inputAsin}
                  onChange={(e) => setInputAsin(e.target.value.toUpperCase())}
                  placeholder="e.g. B0FVVM1CSC"
                  maxLength={10}
                  className="w-full text-xs font-mono font-semibold uppercase bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                />
                <p className="text-[11px] text-slate-400 mt-1">10-character alphanumeric Amazon identifier</p>
              </div>

              {/* Marketplace Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amazon Marketplace
                </label>
                <select
                  value={inputMarketplace}
                  onChange={(e) => setInputMarketplace(e.target.value as MarketplaceCode)}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800"
                >
                  <option value="USA">Amazon.com (USA)</option>
                  <option value="UK">Amazon.co.uk (United Kingdom)</option>
                  <option value="DE">Amazon.de (Germany)</option>
                  <option value="CA">Amazon.ca (Canada)</option>
                  <option value="JP">Amazon.co.jp (Japan)</option>
                  <option value="AU">Amazon.com.au (Australia)</option>
                </select>
                <p className="text-[11px] text-slate-400 mt-1">Sets regional review policy & TOS rules</p>
              </div>

              {/* Product Category (Optional) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Product Category (Optional)
                </label>
                <input
                  type="text"
                  value={inputCategory}
                  onChange={(e) => setInputCategory(e.target.value)}
                  placeholder="e.g. Home & Kitchen / Electronics"
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800"
                />
                <p className="text-[11px] text-slate-400 mt-1">Helps benchmark standard conversion rates</p>
              </div>
            </div>

            {/* Problem Statement Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Customer Problem Statement / Diagnostic Goal <span className="text-red-500">*</span>
              </label>
              <textarea
                value={inputProblem}
                onChange={(e) => setInputProblem(e.target.value)}
                rows={3}
                placeholder="Describe your current listing problem (e.g. 'My competitor has 10x more reviews than my listing, and I want to understand what I can improve compliantly' or 'Our conversion rate dropped after competitor launched low-price variation')..."
                className="w-full text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-lg p-3 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden text-slate-800"
                required
              />
            </div>

            {/* Form Action Buttons */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={onResetCase}
                  className="inline-flex items-center px-3 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
                  Clear All Inputs
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  disabled={isAnalyzing || (!inputProblem.trim() && !inputAsin.trim())}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors disabled:opacity-40"
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                      Running FBA Diagnostic...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                      Run 4-Pillar FBA Diagnostic
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      ) : (
        /* Active Case Display */
        <div>
          {/* Top Banner / Case Title */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-md flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  Active Case Analysis
                </span>
                <span className="px-2.5 py-0.5 text-xs font-medium bg-slate-100 text-slate-700 rounded-md">
                  Marketplace: {caseContext.marketplace}
                </span>
                <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
                  ASIN: {caseContext.asin || 'UNASSIGNED'}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                {caseContext.customerProblem.includes('review')
                  ? 'Competitor Review Gap & Listing Growth Diagnostic'
                  : 'Amazon FBA Root-Cause Problem Diagnostic'}
              </h2>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {onOpenAutomatedDataEntry && (
                <button
                  onClick={onOpenAutomatedDataEntry}
                  className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                  title="Import cases from Google Sheets / CSV"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5 text-amber-600" />
                  Import Cases (CSV)
                </button>
              )}
              <button
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
                title="Edit ASIN, Marketplace, or Problem Statement"
              >
                <Edit3 className="w-3.5 h-3.5 mr-1.5 text-slate-600" />
                Edit / Switch Case
              </button>
              <button
                onClick={onResetCase}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-colors"
                title="Clear current case and start fresh"
              >
                <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-red-600" />
                Reset Case
              </button>
              <button
                onClick={onFillMissingData}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-lg transition-colors"
              >
                <FileText className="w-3.5 h-3.5 mr-1.5" />
                Missing Data ({missingDataCount})
              </button>
              <button
                onClick={onOpenAdvisor}
                className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg shadow-xs transition-colors"
              >
                Ask AI Advisor
                <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </button>
            </div>
          </div>

          {/* Customer Problem Statement */}
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-slate-50 border border-slate-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">
                <HelpCircle className="w-4 h-4 text-amber-500" />
                Customer Problem Statement
              </div>
              <p className="text-sm font-medium text-slate-800 italic">
                "{caseContext.customerProblem}"
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <span className="font-semibold text-slate-700">Diagnostic Scope:</span>
                <span>Identify structural drivers</span>
                <span>•</span>
                <span>Highlight missing Seller Central reports</span>
                <span>•</span>
                <span>Deliver 100% compliant review acceleration strategy</span>
              </div>
            </div>

            {/* Fact vs Assumption Guardrails Policy */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-lg p-4">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 mb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                Anti-Hallucination & Policy Protocol
              </div>
              <ul className="text-xs text-emerald-900/80 space-y-1.5">
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Zero Data Invention:</strong> Real sales numbers, BSR, and fees are never assumed without seller reports.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Strict Fact Separation:</strong> Clear labels distinguish user-confirmed facts from hypotheses.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-emerald-600 font-bold">•</span>
                  <span><strong>Zero TOS Tolerance:</strong> Strictly safe compliant Amazon mechanisms (Vine, Request-a-Review).</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
