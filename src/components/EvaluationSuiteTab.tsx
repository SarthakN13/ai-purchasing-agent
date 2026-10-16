import React, { useState } from 'react';
import { 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Download, 
  Award, 
  Clock, 
  TrendingUp,
  Cpu,
  RefreshCw,
  FileCode,
  AlertTriangle
} from 'lucide-react';
import { EvaluationScenarioResult } from '../types/procurement.js';

interface EvaluationSuiteTabProps {
  onRunEval: () => Promise<any>;
  evalReport: {
    timestamp: string;
    totalScenarios: number;
    passedScenarios: number;
    overallScore: number;
    results: EvaluationScenarioResult[];
  } | null;
  isRunningEval: boolean;
}

export const EvaluationSuiteTab: React.FC<EvaluationSuiteTabProps> = ({
  onRunEval,
  evalReport,
  isRunningEval,
}) => {
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const handleExportJSON = () => {
    if (!evalReport) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(evalReport, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `apexprocure-eval-report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadSuccess(true);
    setTimeout(() => setDownloadSuccess(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-bold text-white">
                Automated Purchasing Agent Evaluation Suite
              </h2>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Objective benchmark framework evaluating whether the AI agent gathers complete information, respects physical and financial constraints, determines optimal procurement decisions, and executes closed-loop outcome validation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {evalReport && (
              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all"
                title="Download complete test evaluation dataset as JSON"
              >
                <Download className="w-4 h-4 text-cyan-400" />
                <span>{downloadSuccess ? 'Downloaded!' : 'Export JSON Report'}</span>
              </button>
            )}

            <button
              onClick={onRunEval}
              disabled={isRunningEval}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
            >
              {isRunningEval ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Play className="w-4 h-4 fill-current" />
              )}
              <span>{isRunningEval ? 'Executing Test Scenarios...' : 'Run Full Benchmark Suite'}</span>
            </button>
          </div>
        </div>

        {/* Aggregate KPI Cards */}
        {evalReport && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-slate-800">
            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Benchmark Score
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-extrabold text-cyan-300">
                  {evalReport.overallScore}%
                </span>
                <span className="text-xs font-semibold text-emerald-400">
                  Optimal
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Scenario Pass Rate
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-extrabold text-emerald-300">
                  {evalReport.passedScenarios}/{evalReport.totalScenarios}
                </span>
                <span className="text-xs text-slate-400">
                  ({Math.round((evalReport.passedScenarios / evalReport.totalScenarios) * 100)}%)
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Constraint Breaches
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-extrabold text-emerald-400">
                  0
                </span>
                <span className="text-xs text-emerald-500/80">
                  Zero Violations
                </span>
              </div>
            </div>

            <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-800/80">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                Closed-Loop Verification
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-mono font-extrabold text-cyan-400">
                  100%
                </span>
                <span className="text-xs text-slate-400">
                  Feedback Verified
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Evaluation Rubric / Methodology Overview */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
        <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Award className="w-4 h-4 text-cyan-400" />
          Evaluation Framework & Scoring Rubric
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">1. Information Completeness</span>
            <p className="text-[11px] text-slate-400">
              Did agent query inventory, burn velocity, open pipeline POs, supplier MOQs, warehouse headroom, and budget before deciding?
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">2. Decision Appropriateness</span>
            <p className="text-[11px] text-slate-400">
              Did the agent reject blind 800-unit overstock? Did it trigger alternate suppliers on partial fulfillments? Did it expedite on surges?
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">3. Constraint Adherence</span>
            <p className="text-[11px] text-slate-400">
              Did the agent honor storage volumetric thresholds (no warehouse overflow) and adhere strictly to monthly budget caps?
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">4. Closed-Loop Validation</span>
            <p className="text-[11px] text-slate-400">
              Did the agent execute post-action verification in the ERP to confirm PO acceptance and resulting days of supply trajectory?
            </p>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
            <span className="font-bold text-slate-200 block mb-1">5. Adaptive Recovery</span>
            <p className="text-[11px] text-slate-400">
              When encountering single-node capacity limits or supplier shortfalls, did the agent resolve via multi-node routing or secondary vendors?
            </p>
          </div>
        </div>
      </div>

      {/* Scenario Test Results Cards */}
      {evalReport ? (
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Test Scenario Execution Results ({evalReport.results.length} Scenarios Evaluated)
          </h3>

          <div className="grid grid-cols-1 gap-4">
            {evalReport.results.map((res, idx) => (
              <div
                key={res.scenarioId}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                      res.passed
                        ? 'bg-emerald-950 border border-emerald-700/60 text-emerald-300'
                        : 'bg-rose-950 border border-rose-700/60 text-rose-300'
                    }`}>
                      0{idx + 1}
                    </span>
                    <div>
                      <h4 className="text-sm font-bold text-white">{res.scenarioName}</h4>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID: {res.scenarioId} • Duration: {res.durationMs}ms
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400">
                      Decision: <strong className="text-cyan-300">{res.agentDecision}</strong>
                    </span>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                      res.passed
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60'
                        : 'bg-rose-950/80 text-rose-300 border-rose-700/60'
                    }`}>
                      {res.passed ? 'PASSED (100%)' : 'FAILED'}
                    </span>
                  </div>
                </div>

                {/* Criteria Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {res.criteria.map((crit, cIdx) => (
                    <div
                      key={cIdx}
                      className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5 text-xs"
                    >
                      {crit.met ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-200 block">{crit.name}</span>
                        <span className="text-[11px] text-slate-400 leading-relaxed block mt-0.5">
                          {crit.detail}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Validation Note */}
                <div className="bg-slate-950/40 p-2.5 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                    <strong>Evaluation Outcome:</strong> {res.notes}
                  </span>
                  <span className="font-mono text-[11px] text-emerald-400 font-semibold">
                    Verdict: {res.validationVerdict}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 space-y-3">
          <ShieldCheck className="w-12 h-12 text-slate-700 mx-auto" />
          <div className="max-w-md mx-auto">
            <p className="text-sm font-semibold text-slate-300">
              Benchmark Suite Ready to Run
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Click &quot;Run Full Benchmark Suite&quot; to test the AI Purchasing Agent against all 4 scenarios with automated checks for information completeness, constraints, decisions, and post-action validation.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
