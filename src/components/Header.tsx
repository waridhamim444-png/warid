import React from 'react';
import { ShieldCheck, Sparkles, Download, RefreshCw, BarChart3, AlertCircle, FileSpreadsheet } from 'lucide-react';
import { MarketplaceCode } from '../types';

interface HeaderProps {
  asin: string;
  marketplace: MarketplaceCode;
  onExportClick: () => void;
  onResetCase: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  asin,
  marketplace,
  onExportClick,
  onResetCase,
  activeTab,
  setActiveTab,
}) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Context */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 font-bold">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base font-semibold text-slate-900 leading-tight">
                  Amazon FBA Business Analysis Assistant
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3 mr-1" />
                  Anti-Hallucination Guard Active
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Marketplace: <span className="font-semibold text-slate-700">{marketplace}</span> | Target ASIN: <span className="font-mono font-semibold text-amber-700">{asin || 'New Case (Unassigned)'}</span>
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <button
              onClick={onResetCase}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Reset to original case parameters"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Reset Case
            </button>
            <button
              onClick={onExportClick}
              className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Export Audit Report
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 border-t border-slate-100 overflow-x-auto py-1 scrollbar-none">
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 mr-1.5" />
            4-Pillar FBA Problem Audit
          </button>
          <button
            onClick={() => setActiveTab('automated-data-entry')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center ${
              activeTab === 'automated-data-entry'
                ? 'bg-amber-600 text-white'
                : 'text-amber-800 bg-amber-50/80 hover:bg-amber-100 border border-amber-200/50'
            }`}
          >
            <FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />
            Automate Data Entry (CSV/Sheets)
          </button>
          <button
            onClick={() => setActiveTab('facts-assumptions')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center ${
              activeTab === 'facts-assumptions'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
            Fact vs Assumption Inspector
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center ${
              activeTab === 'simulator'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Review Velocity & Vine Simulator
          </button>
          <button
            onClick={() => setActiveTab('compliance')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center ${
              activeTab === 'compliance'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
            Amazon Review TOS Compliance Checker
          </button>
          <button
            onClick={() => setActiveTab('ai-advisor')}
            className={`px-3 py-2 text-xs font-medium rounded-lg whitespace-nowrap transition-colors flex items-center ${
              activeTab === 'ai-advisor'
                ? 'bg-amber-600 text-white'
                : 'text-amber-700 bg-amber-50 hover:bg-amber-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-200" />
            AI FBA Advisor (Deep-Dive Q&A)
          </button>
        </div>
      </div>
    </header>
  );
};
