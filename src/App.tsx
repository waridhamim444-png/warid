import React, { useState } from 'react';
import { Header } from './components/Header';
import { CaseOverviewCard } from './components/CaseOverviewCard';
import { PillarAuditView } from './components/PillarAuditView';
import { FactAssumptionInspector } from './components/FactAssumptionInspector';
import { ReviewVelocitySimulator } from './components/ReviewVelocitySimulator';
import { ComplianceChecker } from './components/ComplianceChecker';
import { AIAdvisorChat } from './components/AIAdvisorChat';
import { AutomatedDataEntry } from './components/AutomatedDataEntry';
import { ExportModal } from './components/ExportModal';
import {
  INITIAL_CASE,
  EMPTY_CASE,
  BASELINE_POSSIBLE_CAUSES,
  MISSING_METRICS_LIST,
  PRACTICAL_RECOMMENDATIONS,
  RISKS_AND_VERIFICATION,
  CASE_PRESETS,
  CasePreset,
  generateCustomDiagnostic,
} from './data/fbaCaseData';
import { FBACaseContext, MissingMetricItem, AuditItem, RecommendationStep, RiskVerificationItem } from './types';
import { CheckCircle2, AlertCircle, X, Sparkles } from 'lucide-react';

export default function App() {
  const [caseContext, setCaseContext] = useState<FBACaseContext>(INITIAL_CASE);
  const [possibleCauses, setPossibleCauses] = useState<AuditItem[]>(BASELINE_POSSIBLE_CAUSES);
  const [missingMetrics, setMissingMetrics] = useState<MissingMetricItem[]>(MISSING_METRICS_LIST);
  const [recommendations, setRecommendations] = useState<RecommendationStep[]>(PRACTICAL_RECOMMENDATIONS);
  const [risks, setRisks] = useState<RiskVerificationItem[]>(RISKS_AND_VERIFICATION);

  const [hasActiveAnalysis, setHasActiveAnalysis] = useState<boolean>(true);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('audit');
  const [isExportOpen, setIsExportOpen] = useState<boolean>(false);
  const [advisorInitialPrompt, setAdvisorInitialPrompt] = useState<string>('');
  const [toast, setToast] = useState<{ type: 'success' | 'info'; message: string } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  const handleUpdateMissingMetric = (id: string, value: string) => {
    setMissingMetrics((prev) =>
      prev.map((m) => (m.id === id ? { ...m, userValue: value } : m))
    );
  };

  // Reset Case Handler: Clears current ASIN, user problem, analysis results, and restores the app to a fresh case
  const handleResetCase = () => {
    setCaseContext(EMPTY_CASE);
    setPossibleCauses([]);
    setMissingMetrics(MISSING_METRICS_LIST.map((m) => ({ ...m, userValue: undefined })));
    setRecommendations([]);
    setRisks([]);
    setHasActiveAnalysis(false);
    setAdvisorInitialPrompt('');
    setActiveTab('audit');
    showToast('Case reset successfully. ASIN, problem statement, and audit findings have been cleared for a fresh case.', 'info');
  };

  // Run Analysis on any Custom Case
  const handleRunAnalysis = async (newContext: FBACaseContext) => {
    setIsAnalyzing(true);
    setCaseContext(newContext);

    try {
      // Call backend API
      const res = await fetch('/api/fba/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          asin: newContext.asin,
          marketplace: newContext.marketplace,
          problem: newContext.customerProblem,
          sellerContext: {
            category: newContext.category,
          },
        }),
      });

      const data = await res.json();
      // Generate structured 4-pillar data tailored to this case
      const diagnostic = generateCustomDiagnostic(newContext);

      setPossibleCauses(diagnostic.causes);
      setMissingMetrics(diagnostic.missingMetrics);
      setRecommendations(diagnostic.recommendations);
      setRisks(diagnostic.risks);
      setHasActiveAnalysis(true);

      if (data && data.notice) {
        showToast(`4-Pillar FBA Diagnostic generated for ASIN ${newContext.asin || 'Listing'}.`, 'info');
      } else {
        showToast(`4-Pillar FBA Diagnostic generated for ASIN ${newContext.asin || 'Listing'}.`, 'success');
      }
    } catch (err) {
      // Fallback to structured dynamic generator
      const diagnostic = generateCustomDiagnostic(newContext);
      setPossibleCauses(diagnostic.causes);
      setMissingMetrics(diagnostic.missingMetrics);
      setRecommendations(diagnostic.recommendations);
      setRisks(diagnostic.risks);
      setHasActiveAnalysis(true);
      showToast(`Diagnostic generated for ASIN ${newContext.asin || 'Listing'}.`, 'success');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Load a preset case
  const handleLoadPreset = (preset: CasePreset) => {
    const newContext: FBACaseContext = {
      asin: preset.asin,
      marketplace: preset.marketplace,
      customerProblem: preset.problem,
      category: preset.category,
    };

    setCaseContext(newContext);

    if (preset.id === 'benchmark-review-gap') {
      setPossibleCauses(BASELINE_POSSIBLE_CAUSES);
      setMissingMetrics(MISSING_METRICS_LIST);
      setRecommendations(PRACTICAL_RECOMMENDATIONS);
      setRisks(RISKS_AND_VERIFICATION);
    } else {
      const diagnostic = generateCustomDiagnostic(newContext);
      setPossibleCauses(diagnostic.causes);
      setMissingMetrics(diagnostic.missingMetrics);
      setRecommendations(diagnostic.recommendations);
      setRisks(diagnostic.risks);
    }

    setHasActiveAnalysis(true);
    showToast(`Loaded preset case: "${preset.name}".`, 'success');
  };

  const handleOpenAdvisorWithPrompt = (promptText: string) => {
    setAdvisorInitialPrompt(promptText);
    setActiveTab('ai-advisor');
  };

  const missingDataCount = missingMetrics.filter((m) => !m.userValue).length;

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-900 flex flex-col font-sans selection:bg-amber-100 selection:text-amber-900 relative">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 max-w-md bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <div className="flex items-center gap-2 text-xs">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* App Header */}
      <Header
        asin={caseContext.asin}
        marketplace={caseContext.marketplace}
        onExportClick={() => setIsExportOpen(true)}
        onResetCase={handleResetCase}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Customer Case Context Banner & Intake */}
        <CaseOverviewCard
          caseContext={caseContext}
          hasActiveAnalysis={hasActiveAnalysis}
          isAnalyzing={isAnalyzing}
          onOpenAdvisor={() => {
            setAdvisorInitialPrompt(
              `Can you guide me on diagnosing ASIN ${caseContext.asin || 'my listing'} against my competitor review gap?`
            );
            setActiveTab('ai-advisor');
          }}
          onFillMissingData={() => {
            setActiveTab('audit');
            const el = document.getElementById('pillar-missing');
            el?.scrollIntoView({ behavior: 'smooth' });
          }}
          onResetCase={handleResetCase}
          onRunAnalysis={handleRunAnalysis}
          onLoadPreset={handleLoadPreset}
          missingDataCount={missingDataCount}
          onOpenAutomatedDataEntry={() => setActiveTab('automated-data-entry')}
        />

        {/* Tab: Automated Data Entry (CSV & Google Sheets) */}
        {activeTab === 'automated-data-entry' && (
          <AutomatedDataEntry
            onSelectCase={(newCase) => {
              handleRunAnalysis(newCase);
              setActiveTab('audit');
              showToast(`Imported & activated ASIN ${newCase.asin} (${newCase.marketplace}) into live 4-pillar analysis.`, 'success');
            }}
            onOpenAdvisor={handleOpenAdvisorWithPrompt}
          />
        )}

        {/* Tab 1: 4-Pillar Comprehensive Audit */}
        {activeTab === 'audit' && (
          <PillarAuditView
            possibleCauses={possibleCauses}
            missingMetrics={missingMetrics}
            recommendations={recommendations}
            risks={risks}
            caseContext={caseContext}
            onUpdateMissingMetric={handleUpdateMissingMetric}
            onOpenAdvisorWithPrompt={handleOpenAdvisorWithPrompt}
          />
        )}

        {/* Tab 2: Fact vs Assumption Inspector */}
        {activeTab === 'facts-assumptions' && (
          <FactAssumptionInspector
            caseContext={caseContext}
            onOpenAdvisor={handleOpenAdvisorWithPrompt}
          />
        )}

        {/* Tab 3: Review Velocity & Vine Feasibility Simulator */}
        {activeTab === 'simulator' && <ReviewVelocitySimulator />}

        {/* Tab 4: Amazon Review TOS Compliance Checker */}
        {activeTab === 'compliance' && <ComplianceChecker />}

        {/* Tab 5: AI FBA Advisor Deep Dive Chat */}
        {activeTab === 'ai-advisor' && (
          <AIAdvisorChat
            caseContext={caseContext}
            initialPrompt={advisorInitialPrompt}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-4 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <div>
            <span>Amazon FBA Business Analysis Assistant • Model: Gemini 3.7 Flash</span>
          </div>
          <div className="flex items-center space-x-4">
            <span>Marketplace: Amazon.com (USA)</span>
            <span>•</span>
            <span>TOS Compliance: Section 3 BSA & Customer Reviews Policy</span>
          </div>
        </div>
      </footer>

      {/* Export Report Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        caseContext={caseContext}
        causes={possibleCauses}
        missingMetrics={missingMetrics}
        recommendations={recommendations}
        risks={risks}
      />
    </div>
  );
}
