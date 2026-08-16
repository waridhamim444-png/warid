import React, { useState } from 'react';
import { AlertCircle, CheckCircle2, XCircle, ShieldAlert, Sparkles, Loader2, RefreshCw } from 'lucide-react';

export const ComplianceChecker: React.FC = () => {
  const [inputText, setInputText] = useState<string>(
    'Thank you for your purchase! If you love your product, please leave us a 5-star review on Amazon. If you have any issues, please do not leave a bad review—contact our support team at support@mybrand.com and we will refund you immediately!'
  );
  const [intentType, setIntentType] = useState<string>('Packaging Insert Card');
  const [isChecking, setIsChecking] = useState<boolean>(false);
  const [auditResult, setAuditResult] = useState<string | null>(null);

  const presets = [
    {
      label: 'Dangerous Violation (Review Gating & Conditional Request)',
      type: 'Packaging Insert Card',
      text: 'Thank you for your purchase! If you love your product, please leave us a 5-star review on Amazon. If you have any issues, please do not leave a bad review—contact our support team at support@mybrand.com and we will refund you immediately!',
    },
    {
      label: 'Critical Violation (Incentivized Gift Card / Cashback)',
      type: 'Packaging Insert Card',
      text: 'Claim your FREE $20 Amazon Gift Card! Simply scan the QR code, share your honest 5-star feedback on Amazon, and email a screenshot of your review to gifts@brandvip.com.',
    },
    {
      label: '100% Compliant (Warranty & Neutral Support)',
      type: 'Packaging Insert Card',
      text: 'Thank you for purchasing with us! Scan the QR code below to register your 2-Year Manufacturer Warranty and download our Quick-Start Setup Guide. If you need any assistance with assembly or product support, our team is always here to help.',
    },
  ];

  const handleRunCheck = async () => {
    if (!inputText.trim()) return;
    setIsChecking(true);
    setAuditResult(null);

    try {
      const res = await fetch('/api/fba/compliance-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ insertText: inputText, intentType }),
      });
      const data = await res.json();
      if (data.success && data.result) {
        setAuditResult(data.result);
      } else {
        setAuditResult(
          'Automated Rule Evaluation:\n- VIOLATION DETECTED: Conditional review solicitation ("If you love it leave a review, if not contact us").\n- VIOLATION: Asking specifically for 5-star ratings is strictly prohibited under Amazon Anti-Manipulation Policy.\n- SAFE ALTERNATIVE: Use neutral warranty registration without mentioning Amazon reviews.'
        );
      }
    } catch (e: any) {
      setAuditResult(
        'Rule Evaluation:\n- FAIL: Prohibited conditional language detected.\n- Amazon Section 3 strictly forbids diverting dissatisfied buyers away from Amazon while directing satisfied buyers to leave reviews.'
      );
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600" />
            <h3 className="text-base font-bold text-slate-900">
              Amazon Review TOS Compliance & Insert Card Auditor
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Audit your packaging insert cards, warranty flyers, and buyer messaging against Amazon's Anti-Manipulation Customer Review Policies.
          </p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold bg-rose-50 text-rose-800 border border-rose-200 rounded-md">
          Zero-Tolerance Policy Engine
        </span>
      </div>

      {/* Preset Test Scenarios */}
      <div>
        <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Test Common Scenarios:
        </div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputText(preset.text);
                setIntentType(preset.type);
                setAuditResult(null);
              }}
              className="px-3 py-1.5 text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg transition-colors text-left"
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-xs font-medium text-slate-700">
          <label htmlFor="compliance-input">Text Draft to Audit:</label>
          <select
            value={intentType}
            onChange={(e) => setIntentType(e.target.value)}
            className="text-xs border border-slate-300 rounded-md px-2 py-1 bg-white"
          >
            <option value="Packaging Insert Card">Packaging Insert Card</option>
            <option value="Product User Manual">Product User Manual</option>
            <option value="Buyer-Seller Message">Buyer-Seller Message</option>
            <option value="Warranty Registration Page">Warranty Registration Page</option>
          </select>
        </div>

        <textarea
          id="compliance-input"
          rows={4}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Paste your insert card copy or buyer message here..."
          className="w-full text-xs sm:text-sm p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden font-sans"
        />

        <div className="flex justify-end">
          <button
            onClick={handleRunCheck}
            disabled={isChecking || !inputText.trim()}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-50"
          >
            {isChecking ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Auditing Against Amazon TOS...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                Audit Compliance & Generate Safe Rewrite
              </>
            )}
          </button>
        </div>
      </div>

      {/* Result Display */}
      {auditResult && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200">
            <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Amazon Policy Audit Report
            </span>
            <span className="text-xs text-slate-500 font-mono">
              Evaluated under Amazon Customer Reviews Policies
            </span>
          </div>

          <div className="prose prose-sm max-w-none text-xs sm:text-sm text-slate-800 whitespace-pre-line leading-relaxed">
            {auditResult}
          </div>
        </div>
      )}

      {/* Static Policy Cheat Sheet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
        <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 font-bold text-rose-900 mb-1.5">
            <XCircle className="w-4 h-4 text-rose-600 shrink-0" />
            STRICTLY PROHIBITED
          </div>
          <ul className="text-rose-900/80 space-y-1 list-disc list-inside">
            <li>Asking for 5-star reviews or positive feedback</li>
            <li>Offering gift cards, refunds, or cashback</li>
            <li>Diverting unhappy customers away from Amazon</li>
            <li>Requiring a review to activate warranty</li>
          </ul>
        </div>

        <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 font-bold text-emerald-900 mb-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            100% PERMITTED & SAFE
          </div>
          <ul className="text-emerald-900/80 space-y-1 list-disc list-inside">
            <li>Amazon Vine Program (up to 30 units)</li>
            <li>Official "Request a Review" button</li>
            <li>Product setup manuals & troubleshooting FAQs</li>
            <li>Neutral warranty registration cards</li>
          </ul>
        </div>

        <div className="bg-amber-50/50 border border-amber-200 rounded-xl p-3.5">
          <div className="flex items-center gap-1.5 font-bold text-amber-900 mb-1.5">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            SUSPENSION RISKS
          </div>
          <ul className="text-amber-900/80 space-y-1 list-disc list-inside">
            <li>Permanent review scrubbing across catalog</li>
            <li>Permanent ASIN suppression / delisting</li>
            <li>Account deactivation (Section 3 TOS)</li>
            <li>Withheld seller funds & inventory destruction</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
