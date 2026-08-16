import React, { useState } from 'react';
import { Calculator, TrendingUp, Sparkles, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { SimulatorState } from '../types';

export const ReviewVelocitySimulator: React.FC = () => {
  const [params, setParams] = useState<SimulatorState>({
    currentReviews: 12,
    competitorReviews: 180,
    monthlyOrders: 250,
    organicReviewRate: 1.2, // 1.2%
    enableRequestReviewAPI: true, // +0.8%
    vineUnitsEnrolled: 30, // up to 30 reviews
    averageSalePrice: 29.99,
  });

  // Calculations
  const effectiveReviewRatePercent =
    params.organicReviewRate + (params.enableRequestReviewAPI ? 0.8 : 0.0);
  const organicReviewsPerMonth = (params.monthlyOrders * (effectiveReviewRatePercent / 100));

  // Estimated vine yield (~80% of enrolled units leave reviews)
  const estimatedVineReviews = Math.round(params.vineUnitsEnrolled * 0.85);

  // Remaining review gap
  const initialReviewGap = Math.max(0, params.competitorReviews - params.currentReviews);
  const gapAfterVine = Math.max(0, initialReviewGap - estimatedVineReviews);

  // Months to catch up
  const monthsToCatchUp =
    organicReviewsPerMonth > 0 ? (gapAfterVine / organicReviewsPerMonth).toFixed(1) : '∞';

  // Projection milestones
  const projection3Months = Math.round(
    params.currentReviews + estimatedVineReviews + organicReviewsPerMonth * 3
  );
  const projection6Months = Math.round(
    params.currentReviews + estimatedVineReviews + organicReviewsPerMonth * 6
  );
  const projection12Months = Math.round(
    params.currentReviews + estimatedVineReviews + organicReviewsPerMonth * 12
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 sm:p-6 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-amber-600" />
            <h3 className="text-base font-bold text-slate-900">
              Review Velocity & Amazon Vine Feasibility Simulator
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Simulate realistic, compliant review generation timelines based on unit sales velocity, Vine enrollment, and automated review requests.
          </p>
        </div>
        <span className="self-start sm:self-auto px-2.5 py-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md">
          100% Policy-Safe Model
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Controls Column */}
        <div className="lg:col-span-6 space-y-4 bg-slate-50 p-4 sm:p-5 rounded-xl border border-slate-200">
          <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Simulation Parameters
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Your Current Reviews
              </label>
              <input
                type="number"
                min="0"
                value={params.currentReviews}
                onChange={(e) =>
                  setParams({ ...params, currentReviews: Math.max(0, parseInt(e.target.value) || 0) })
                }
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Competitor Reviews Target
              </label>
              <input
                type="number"
                min="1"
                value={params.competitorReviews}
                onChange={(e) =>
                  setParams({ ...params, competitorReviews: Math.max(1, parseInt(e.target.value) || 1) })
                }
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between text-xs font-medium text-slate-700 mb-1">
              <span>Monthly Order Volume (Units)</span>
              <span className="font-bold text-amber-700">{params.monthlyOrders} units/mo</span>
            </div>
            <input
              type="range"
              min="20"
              max="2000"
              step="10"
              value={params.monthlyOrders}
              onChange={(e) => setParams({ ...params, monthlyOrders: parseInt(e.target.value) })}
              className="w-full accent-amber-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>20 (Low)</span>
              <span>500 (Medium)</span>
              <span>2,000 (High Velocity)</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Organic Review Rate (%)
              </label>
              <select
                value={params.organicReviewRate}
                onChange={(e) =>
                  setParams({ ...params, organicReviewRate: parseFloat(e.target.value) })
                }
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="0.8">0.8% (Conservative/Commodity)</option>
                <option value="1.2">1.2% (Amazon Standard Average)</option>
                <option value="1.8">1.8% (High-Emotion/Gift Product)</option>
                <option value="2.5">2.5% (Exceptional Experience)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Amazon Vine Enrollment
              </label>
              <select
                value={params.vineUnitsEnrolled}
                onChange={(e) =>
                  setParams({ ...params, vineUnitsEnrolled: parseInt(e.target.value) })
                }
                className="w-full text-xs font-semibold bg-white border border-slate-300 rounded-lg p-2 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              >
                <option value="0">None (0 units - $0 fee)</option>
                <option value="2">2 units (Free Tier - $0 fee)</option>
                <option value="10">10 units ($75 Amazon fee)</option>
                <option value="30">30 units ($200 Amazon fee - Recommended)</option>
              </select>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={params.enableRequestReviewAPI}
                onChange={(e) =>
                  setParams({ ...params, enableRequestReviewAPI: e.target.checked })
                }
                className="w-4 h-4 text-amber-600 rounded-sm focus:ring-amber-500"
              />
              <span className="text-xs text-slate-800 font-semibold">
                Automate Amazon "Request a Review" Button (+0.8% review rate lift)
              </span>
            </label>
            <p className="text-[11px] text-slate-500 mt-1 ml-6">
              Dispatches native 1-click Amazon rating requests between 5 and 30 days post-delivery.
            </p>
          </div>
        </div>

        {/* Results & Projections Column */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-4">
          {/* Key Metric Badges */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-amber-50/60 border border-amber-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-600 uppercase block mb-0.5">
                Effective Review Rate
              </span>
              <span className="text-xl font-bold text-amber-800">
                {effectiveReviewRatePercent.toFixed(1)}%
              </span>
              <span className="text-[10px] text-amber-700/80 block mt-0.5">
                of total buyers
              </span>
            </div>

            <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-3 text-center">
              <span className="text-[11px] font-semibold text-slate-600 uppercase block mb-0.5">
                Monthly New Reviews
              </span>
              <span className="text-xl font-bold text-emerald-800">
                +{organicReviewsPerMonth.toFixed(1)}
              </span>
              <span className="text-[10px] text-emerald-700/80 block mt-0.5">
                organic reviews/mo
              </span>
            </div>

            <div className="bg-blue-50/60 border border-blue-200 rounded-xl p-3 text-center col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-600 uppercase block mb-0.5">
                Estimated Vine Yield
              </span>
              <span className="text-xl font-bold text-blue-800">
                +{estimatedVineReviews}
              </span>
              <span className="text-[10px] text-blue-700/80 block mt-0.5">
                in 3–6 weeks
              </span>
            </div>
          </div>

          {/* Timeline to Target Review Count */}
          <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">
                Trajectory to Close Gap ({initialReviewGap} reviews behind)
              </span>
              <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-sm font-mono text-slate-300">
                Target: {params.competitorReviews}
              </span>
            </div>

            <div className="text-2xl font-black text-white flex items-baseline gap-2">
              <span>{monthsToCatchUp} Months</span>
              <span className="text-xs font-normal text-slate-300">
                to match competitor review volume
              </span>
            </div>

            {/* Trajectory Milestone Bars */}
            <div className="mt-4 pt-4 border-t border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between items-center text-slate-300">
                <span>In 3 Months (with Vine):</span>
                <span className="font-bold text-emerald-400">{projection3Months} Reviews</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, (projection3Months / params.competitorReviews) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-300 pt-1">
                <span>In 6 Months:</span>
                <span className="font-bold text-amber-400">{projection6Months} Reviews</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-amber-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, (projection6Months / params.competitorReviews) * 100)}%`,
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-slate-300 pt-1">
                <span>In 12 Months:</span>
                <span className="font-bold text-blue-400">{projection12Months} Reviews</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-blue-500 h-1.5 rounded-full"
                  style={{
                    width: `${Math.min(100, (projection12Months / params.competitorReviews) * 100)}%`,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-semibold">Strategic Conclusion:</strong>
              Do not chase competitor review parity by breaking Amazon TOS. Leveraging Vine for the first 30 reviews combined with optimized PPC and Request-a-Review automation creates sustainable, compound review momentum.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
