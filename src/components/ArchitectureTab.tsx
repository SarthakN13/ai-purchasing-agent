import React from 'react';
import { 
  Cpu, 
  Layers, 
  GitBranch, 
  ShieldCheck, 
  RotateCcw, 
  Server, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles,
  Zap,
  Activity
} from 'lucide-react';

export const ArchitectureTab: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">System Architecture & Feedback Loop Design</h2>
            <p className="text-xs text-slate-400">
              Autonomous AI Purchasing Agent with Closed-Loop Validation for High-Velocity Quick-Commerce
            </p>
          </div>
        </div>
      </div>

      {/* Visual Interactive Architecture Diagram */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg space-y-6">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          End-to-End System Topology & Information Flow
        </h3>

        {/* 5-Stage Architecture Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {/* Stage 1: Ingestion & Triggers */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-400 font-bold bg-cyan-950/60 px-2 py-0.5 rounded">
                  STAGE 01
                </span>
                <Sparkles className="w-4 h-4 text-cyan-400" />
              </div>
              <h4 className="text-xs font-bold text-white">Signals & Triggers</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Real-world purchasing events ingested from operations:
              </p>
              <ul className="text-[11px] text-slate-300 mt-2 space-y-1">
                <li>• ERP 800-unit recommendation</li>
                <li>• Supplier 50% shortfall alert</li>
                <li>• Demand velocity spike (+140%)</li>
                <li>• Physical storage limit breach</li>
              </ul>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono font-semibold pt-2 border-t border-slate-800/80">
              Payload Dispatched →
            </div>
          </div>

          {/* Stage 2: ReAct Agent Brain */}
          <div className="bg-slate-950/80 border border-cyan-500/40 shadow-md shadow-cyan-950/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-cyan-300 font-bold bg-cyan-900/60 px-2 py-0.5 rounded">
                  STAGE 02
                </span>
                <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <h4 className="text-xs font-bold text-white">ReAct Agent Brain</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Gemini 3.8 Flash ReAct reasoning loop with tools:
              </p>
              <ul className="text-[11px] text-slate-300 mt-2 space-y-1">
                <li>• Multi-factor investigation</li>
                <li>• Hypothesis formulation</li>
                <li>• Trade-off calculation</li>
                <li>• Decision synthesis</li>
              </ul>
            </div>
            <div className="text-[10px] text-cyan-400 font-mono font-semibold pt-2 border-t border-slate-800/80">
              Tool Function Calls ⇄
            </div>
          </div>

          {/* Stage 3: Tool Execution Layer */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-indigo-400 font-bold bg-indigo-950/60 px-2 py-0.5 rounded">
                  STAGE 03
                </span>
                <Server className="w-4 h-4 text-indigo-400" />
              </div>
              <h4 className="text-xs font-bold text-white">Procurement Tools</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Domain APIs queried dynamically:
              </p>
              <ul className="text-[11px] text-slate-300 mt-2 space-y-1 font-mono text-[10px]">
                <li>• check_inventory()</li>
                <li>• check_demand_forecast()</li>
                <li>• check_open_pos()</li>
                <li>• check_suppliers()</li>
                <li>• check_storage_capacity()</li>
                <li>• check_budget()</li>
              </ul>
            </div>
            <div className="text-[10px] text-indigo-400 font-mono font-semibold pt-2 border-t border-slate-800/80">
              Pre-Flight Simulation →
            </div>
          </div>

          {/* Stage 4: ERP & Order Execution */}
          <div className="bg-slate-950/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-amber-400 font-bold bg-amber-950/60 px-2 py-0.5 rounded">
                  STAGE 04
                </span>
                <Database className="w-4 h-4 text-amber-400" />
              </div>
              <h4 className="text-xs font-bold text-white">ERP Execution</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Action committed to enterprise ledger:
              </p>
              <ul className="text-[11px] text-slate-300 mt-2 space-y-1">
                <li>• Primary PO modified/created</li>
                <li>• Secondary supplier split</li>
                <li>• Cross-dock shuttle routing</li>
                <li>• Human approval gating</li>
              </ul>
            </div>
            <div className="text-[10px] text-amber-400 font-mono font-semibold pt-2 border-t border-slate-800/80">
              Action Executed →
            </div>
          </div>

          {/* Stage 5: Closed-Loop Feedback Validation */}
          <div className="bg-slate-950/80 border border-emerald-500/40 shadow-md shadow-emerald-950/30 rounded-xl p-4 flex flex-col justify-between space-y-3">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2 py-0.5 rounded">
                  STAGE 05
                </span>
                <RotateCcw className="w-4 h-4 text-emerald-400 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <h4 className="text-xs font-bold text-emerald-300">Feedback Loop</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Post-action state verification & recovery:
              </p>
              <ul className="text-[11px] text-slate-300 mt-2 space-y-1">
                <li>• verify_post_action_outcome()</li>
                <li>• Live storage re-check</li>
                <li>• Supplier ACK verification</li>
                <li>• Discrepancy auto-recovery</li>
              </ul>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono font-semibold pt-2 border-t border-slate-800/80">
              Verified & Stabilized ✓
            </div>
          </div>
        </div>
      </div>

      {/* Deep Dive Breakdown: Why Blind Recommendations Fail & The Feedback Loop */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Card 1: The Closed-Loop Feedback Architecture */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-cyan-400" />
            The Closed-Loop Feedback Architecture
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            In standard purchasing bots, an action is fire-and-forget: a PO is generated and the system assumes the job is finished. In real quick-commerce, reality immediately diverges:
          </p>

          <div className="space-y-2 pt-2 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-cyan-300 block mb-1">Phase 1: Pre-Flight Feasibility Simulation</span>
              <p className="text-[11px] text-slate-400">
                Before committing an order, the agent runs <code className="text-cyan-300 font-mono">simulate_po_action()</code> against active business rules: supplier minimum order quantities (MOQ), physical volumetric m³ headroom at the dark store, and category budget ceilings.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-cyan-300 block mb-1">Phase 2: Post-Action Outcome Verification</span>
              <p className="text-[11px] text-slate-400">
                After order execution, the agent calls <code className="text-cyan-300 font-mono">verify_post_action_outcome()</code> to read the updated ERP state. It checks if the PO transitioned to CONFIRMED, if the resulting stock curve guarantees safety stock, and if dock capacity is respected.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-cyan-300 block mb-1">Phase 3: Adaptive Recovery & Escalation</span>
              <p className="text-[11px] text-slate-400">
                If the post-action outcome diverges (e.g., supplier confirms only 50%, or warehouse space is exhausted), the feedback loop triggers an adaptive recovery: engaging backup suppliers, scheduling cross-dock shuttles, or presenting quantified trade-offs to the human buyer.
              </p>
            </div>
          </div>
        </div>

        {/* Card 2: Why Blind Recommendations Fail */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Handling Constraints & Complex Trade-Offs
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            The agent explicitly rejects blind trust in recommendations through multi-factor constraint auditing:
          </p>

          <div className="space-y-2.5 pt-2 text-xs">
            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-amber-300 block mb-0.5">Pipeline Stock Blindspots (Scenario 1)</span>
              <p className="text-[11px] text-slate-400">
                A simple formula recommended 800 units based on gross burn rate. The agent investigated open in-transit POs and discovered 200 units already arriving tomorrow. Blindly ordering 800 would cause extreme overstock and breach warehouse storage limits. The agent modified the order to 250 units.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-amber-300 block mb-0.5">Supplier Yield Vulnerability (Scenario 2)</span>
              <p className="text-[11px] text-slate-400">
                When supplier AGRI confirmed only 250 of 500 avocados, the agent calculated a 3.4-day stockout cliff. Instead of waiting for buyer escalation, it engaged secondary supplier Metro Quick with 1-day delivery, absorbing a slight $0.20 premium to protect 100% customer fill-rate.
              </p>
            </div>

            <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
              <span className="font-semibold text-amber-300 block mb-0.5">Physical Storage Ceiling vs MOQ (Scenario 4)</span>
              <p className="text-[11px] text-slate-400">
                North Dark Store has only 230 units free capacity, but the supplier refuses orders under 500 units. The agent navigated this hard conflict by ordering 600 units and splitting allocation: 200 units to North MFC + 400 units to Central DC with automated scheduled cross-docking.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
