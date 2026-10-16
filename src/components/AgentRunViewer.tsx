import React, { useState } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  ArrowRight, 
  ChevronDown, 
  ChevronUp, 
  Activity, 
  ShieldCheck, 
  FileText, 
  RotateCcw, 
  UserCheck, 
  Zap, 
  Info,
  Scale,
  Package,
  Layers
} from 'lucide-react';
import { AgentExecutionResult, ToolCallTrace } from '../types/procurement.js';

interface AgentRunViewerProps {
  result: AgentExecutionResult | null;
  isRunning: boolean;
  onApprovePO: (poId: string, approved: boolean, notes: string) => void;
  isApproving: boolean;
}

export const AgentRunViewer: React.FC<AgentRunViewerProps> = ({
  result,
  isRunning,
  onApprovePO,
  isApproving,
}) => {
  const [expandedToolId, setExpandedToolId] = useState<string | null>(null);
  const [buyerNotes, setBuyerNotes] = useState('');
  const [showJsonDump, setShowJsonDump] = useState(false);

  if (isRunning) {
    return (
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[420px] text-center space-y-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center animate-pulse">
            <Activity className="w-8 h-8 text-cyan-400 animate-spin" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500"></span>
          </span>
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-100">AI Agent is Investigating Purchasing Situation</h3>
          <p className="text-xs text-slate-400 max-w-md mt-1">
            Auditing multi-node inventory, demand velocity trends, open in-transit POs, supplier MOQ & lead times, physical storage headroom, and category budgets...
          </p>
        </div>
        <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
          <div className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-full w-2/3 animate-[pulse_1.2s_ease-in-out_infinite]"></div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-slate-900/40 border border-dashed border-slate-800 rounded-2xl p-10 flex flex-col items-center justify-center min-h-[380px] text-center text-slate-500 space-y-3">
        <Package className="w-12 h-12 text-slate-700" />
        <div className="max-w-sm">
          <p className="text-sm font-semibold text-slate-300">Ready for Agent Execution</p>
          <p className="text-xs text-slate-500 mt-1">
            Select one of the 4 purchasing scenarios above or build a custom buyer event to watch the AI investigate, decide, execute, and validate in real-time.
          </p>
        </div>
      </div>
    );
  }

  const { decision, preFlightChecks, validationResult, toolCalls, thoughtSummary } = result;

  const getDecisionBadge = (action: string) => {
    switch (action) {
      case 'ACCEPT':
      case 'ACCEPT_RECOMMENDATION':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60';
      case 'MODIFY':
      case 'MODIFY_QUANTITY':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-700/60';
      case 'REJECT':
      case 'REJECT_RECOMMENDATION':
        return 'bg-rose-950/80 text-rose-300 border-rose-700/60';
      case 'SOURCE_ALTERNATE':
        return 'bg-amber-950/80 text-amber-300 border-amber-700/60';
      case 'SPLIT_ORDER':
        return 'bg-purple-950/80 text-purple-300 border-purple-700/60';
      case 'ESCALATE_TO_BUYER':
        return 'bg-orange-950/80 text-orange-300 border-orange-700/60';
      default:
        return 'bg-slate-800 text-slate-200 border-slate-700';
    }
  };

  const primaryPOAction = result.executionActions[0];

  return (
    <div className="space-y-4">
      {/* Top Banner: Decision Summary */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/40">
                Run ID: {result.runId}
              </span>
              <span className="text-xs text-slate-400">
                {new Date(result.timestamp).toLocaleTimeString()}
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-medium">
                {result.scenarioTitle}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                Decision:
              </h2>
              <span className={`text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-lg border ${getDecisionBadge(decision.action)}`}>
                {decision.action.replace(/_/g, ' ')}
              </span>
              <span className="text-xs text-slate-400">
                Confidence: <strong className="text-cyan-300">{decision.confidenceScore}%</strong>
              </span>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 self-start lg:self-auto">
            <div className="px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Recommended Qty</span>
              <span className="text-sm font-mono font-bold text-cyan-300">
                {decision.recommendedQuantity} units
              </span>
            </div>
            <div className="px-3 border-r border-slate-800">
              <span className="text-[10px] text-slate-500 uppercase block">Target Node</span>
              <span className="text-sm font-semibold text-slate-200">
                {decision.targetNodeId.replace('NODE-', '')}
              </span>
            </div>
            <div className="px-3">
              <span className="text-[10px] text-slate-500 uppercase block">Supplier</span>
              <span className="text-sm font-semibold text-slate-200">
                {decision.targetSupplierId}
              </span>
            </div>
          </div>
        </div>

        {/* Thought Summary & Executive Rationale */}
        <div className="mt-4 space-y-3">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800/80">
            <p className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              Executive Rationale & Synthesis
            </p>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {thoughtSummary}
            </p>
          </div>

          {/* Trade-Offs & Risk Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <Scale className="w-3.5 h-3.5 text-amber-400" />
                Trade-Offs Evaluated
              </span>
              <ul className="text-[11px] text-slate-400 space-y-1">
                {decision.tradeOffsConsidered.map((t, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400/80">▸</span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-300 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                Risk Mitigation Safeguards
              </span>
              <ul className="text-[11px] text-slate-400 space-y-1">
                {decision.riskFactors.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-rose-400/80">▸</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Human Approval Gate (if triggered) */}
        {result.requiresBuyerApproval && result.approvalStatus === 'PENDING' && (
          <div className="mt-4 bg-amber-950/40 border border-amber-600/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/20 rounded-lg text-amber-400">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-200">
                  Human-in-the-Loop Sign-off Required
                </p>
                <p className="text-[11px] text-amber-300/80">
                  This transaction exceeds high-spend threshold or modifies standard replenishment policy.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="text"
                placeholder="Buyer sign-off notes (optional)"
                value={buyerNotes}
                onChange={(e) => setBuyerNotes(e.target.value)}
                className="bg-slate-900 border border-amber-700/50 text-xs px-2.5 py-1.5 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 w-full sm:w-48"
              />
              <button
                onClick={() => onApprovePO(primaryPOAction?.poId || 'PO-PROCESSED', true, buyerNotes)}
                disabled={isApproving}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg shadow-sm transition-all whitespace-nowrap"
              >
                Approve PO
              </button>
              <button
                onClick={() => onApprovePO(primaryPOAction?.poId || 'PO-PROCESSED', false, buyerNotes)}
                disabled={isApproving}
                className="px-3 py-1.5 bg-rose-800 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg transition-all whitespace-nowrap"
              >
                Reject
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Two-Column Grid: Left = Closed-Loop Validation & Executed Action; Right = ReAct Investigation Tool Calls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column (5 cols): Feedback Loop & Executed PO */}
        <div className="lg:col-span-5 space-y-4">
          {/* Closed-Loop Post-Action Feedback Validation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3">
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Closed-Loop Feedback Validation
                  </h3>
                  <p className="text-[10px] text-slate-400">
                    Active verification of post-action ERP state
                  </p>
                </div>
              </div>

              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                validationResult.validationVerdict === 'VERIFIED_ACCEPTABLE'
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  : 'bg-amber-950 text-amber-300 border-amber-800'
              }`}>
                {validationResult.validationVerdict.replace(/_/g, ' ')}
              </span>
            </div>

            {/* Pre-Flight Constraint Matrix */}
            <div className="space-y-2">
              <p className="text-[11px] font-semibold text-slate-300">
                1. Pre-Flight Constraint Matrix
              </p>
              <div className="space-y-1.5">
                {preFlightChecks.map((chk, idx) => (
                  <div key={idx} className="flex items-start gap-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60 text-xs">
                    {chk.passed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-200 block">{chk.rule}</span>
                      <span className="text-[11px] text-slate-400">{chk.detail}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Post-Action ERP Verification Metrics */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <p className="text-[11px] font-semibold text-slate-300">
                2. Post-Action Outcome Verification
              </p>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase block">Stockout Risk</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Averted
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase block">Storage Compliance</span>
                  <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Within Limit
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase block">Projected Coverage</span>
                  <span className="text-xs font-mono font-semibold text-cyan-300">
                    {validationResult.metrics.projectedDaysOfSupply} days
                  </span>
                </div>
                <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                  <span className="text-[10px] text-slate-500 uppercase block">Committed Spend</span>
                  <span className="text-xs font-mono font-semibold text-slate-200">
                    ${validationResult.metrics.newTotalSpend.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Discrepancies & Adaptive Recovery Banner (if any) */}
            {validationResult.discrepancies.length > 0 ? (
              <div className="bg-amber-950/40 border border-amber-700/50 rounded-xl p-2.5 text-xs text-amber-200 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Discrepancy Caught & Handled:
                </span>
                <ul className="list-disc list-inside text-[11px] text-amber-300/80">
                  {validationResult.discrepancies.map((d, i) => (
                    <li key={i}>{d}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-emerald-950/30 border border-emerald-800/40 rounded-xl p-2 text-xs text-emerald-300/90 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero deviations. Target ERP state matches intended purchasing plan.</span>
              </div>
            )}
          </div>

          {/* Executed Action Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-cyan-400" />
              Executed Purchase Orders
            </h3>
            <div className="space-y-2">
              {result.executionActions.map((act, i) => (
                <div key={i} className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-cyan-300">{act.actionType}</span>
                    {act.poId && (
                      <span className="font-mono text-[11px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">
                        {act.poId}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {act.details}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column (7 cols): ReAct Tool Calls Trace & Evidence */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Agent ReAct Investigation Trace ({toolCalls.length} Tool Invocations)
              </h3>
              <p className="text-[10px] text-slate-400">
                Chronological chain of information gathering, pre-flight checks, and execution
              </p>
            </div>

            <button
              onClick={() => setShowJsonDump(!showJsonDump)}
              className="text-[11px] text-slate-400 hover:text-cyan-300 underline font-mono"
            >
              {showJsonDump ? 'Hide Raw JSON' : 'View Raw Log'}
            </button>
          </div>

          {showJsonDump ? (
            <pre className="mt-3 bg-slate-950 p-3 rounded-xl border border-slate-800 text-[10px] font-mono text-cyan-300 overflow-x-auto max-h-[500px]">
              {JSON.stringify(toolCalls, null, 2)}
            </pre>
          ) : (
            <div className="mt-3 space-y-2.5 overflow-y-auto max-h-[540px] pr-1">
              {toolCalls.map((tc, index) => {
                const isExpanded = expandedToolId === tc.id;
                return (
                  <div
                    key={tc.id}
                    className="bg-slate-950/70 border border-slate-800/90 rounded-xl overflow-hidden transition-all"
                  >
                    <button
                      onClick={() => setExpandedToolId(isExpanded ? null : tc.id)}
                      className="w-full flex items-center justify-between p-3 text-left hover:bg-slate-900/60 transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800/80 text-cyan-300 text-[10px] font-mono flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <div>
                          <span className="text-xs font-mono font-bold text-slate-200">
                            {tc.toolName}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono ml-2">
                            {tc.durationMs}ms
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
                          {Object.keys(tc.args).join(', ')}
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </button>

                    {/* Expanded Tool Details & Observation */}
                    {isExpanded && (
                      <div className="px-3 pb-3 pt-1 border-t border-slate-800/80 space-y-2 bg-slate-950/90">
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Arguments:
                          </span>
                          <pre className="text-[11px] font-mono text-slate-300 bg-slate-900 p-2 rounded border border-slate-800">
                            {JSON.stringify(tc.args, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Observation Payload:
                          </span>
                          <pre className="text-[11px] font-mono text-cyan-300 bg-slate-900 p-2 rounded border border-slate-800 overflow-x-auto max-h-48">
                            {JSON.stringify(tc.observation, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
