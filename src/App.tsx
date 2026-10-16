/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { Header } from './components/Header.tsx';
import { ScenarioCards, ScenarioCardData, CANONICAL_SCENARIOS } from './components/ScenarioCards.tsx';
import { AgentRunViewer } from './components/AgentRunViewer.tsx';
import { EvaluationSuiteTab } from './components/EvaluationSuiteTab.tsx';
import { ERPLedgerTab } from './components/ERPLedgerTab.tsx';
import { ArchitectureTab } from './components/ArchitectureTab.tsx';
import { CustomScenarioModal } from './components/CustomScenarioModal.tsx';
import { 
  AgentExecutionResult, 
  FulfillmentNode, 
  NodeInventory, 
  PurchaseOrder, 
  Supplier, 
  BudgetLedger, 
  SKU,
  NodeId
} from './types/procurement.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'workbench' | 'evaluator' | 'erp' | 'architecture'>('workbench');
  const [autonomousMode, setAutonomousMode] = useState(true);
  const [geminiActive, setGeminiActive] = useState(true);
  const [isResetting, setIsResetting] = useState(false);
  const [isRunningAgent, setIsRunningAgent] = useState(false);
  const [isRunningEval, setIsRunningEval] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isCustomModalOpen, setIsCustomModalOpen] = useState(false);

  const [activeScenarioId, setActiveScenarioId] = useState<string>('SCENARIO-1');
  const [latestRunResult, setLatestRunResult] = useState<AgentExecutionResult | null>(null);
  const [evalReport, setEvalReport] = useState<any | null>(null);

  const [erpState, setErpState] = useState<{
    nodes: FulfillmentNode[];
    suppliers: Supplier[];
    skus: SKU[];
    inventories: NodeInventory[];
    purchaseOrders: PurchaseOrder[];
    budgets: BudgetLedger[];
  } | null>(null);

  // Fetch initial ERP state & health on mount
  useEffect(() => {
    fetchERPState();
    fetchHealth();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await fetch('/api/health');
      const data = await res.json();
      setGeminiActive(data.geminiConfigured);
    } catch {
      // fallback
    }
  };

  const fetchERPState = async () => {
    try {
      const res = await fetch('/api/erp/state');
      const data = await res.json();
      if (data.success) {
        setErpState(data.data);
      }
    } catch (err) {
      console.error('Failed to fetch ERP state:', err);
    }
  };

  const handleResetERP = async () => {
    setIsResetting(true);
    try {
      const res = await fetch('/api/erp/reset', { method: 'POST' });
      await res.json();
      await fetchERPState();
      setLatestRunResult(null);
    } catch (err) {
      console.error('Reset error:', err);
    } finally {
      setIsResetting(false);
    }
  };

  const handleSelectScenario = async (scenario: ScenarioCardData) => {
    setActiveScenarioId(scenario.id);
    setIsRunningAgent(true);

    try {
      // 1. Inject scenario state in backend ERP
      await fetch('/api/erp/set-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioNumber: scenario.number }),
      });

      // 2. Trigger the purchasing agent
      const runRes = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioNumber: scenario.number,
          scenarioTitle: scenario.title,
          skuId: scenario.skuId,
          nodeId: scenario.nodeId,
          recommendedQuantity: scenario.initialQuantity,
          existingPoId: scenario.existingPoId,
          userPrompt: scenario.description,
          autonomousMode,
        }),
      });

      const data = await runRes.json();
      if (data.success) {
        setLatestRunResult(data.data);
        if (data.updatedERP) {
          setErpState(data.updatedERP);
        } else {
          await fetchERPState();
        }
      }
    } catch (err) {
      console.error('Error running scenario:', err);
    } finally {
      setIsRunningAgent(false);
    }
  };

  const handleRunCustom = async (params: {
    skuId: string;
    nodeId: NodeId;
    recommendedQuantity: number;
    scenarioTitle: string;
    userPrompt: string;
    conditionType: string;
  }) => {
    setIsRunningAgent(true);
    setActiveScenarioId('CUSTOM');

    try {
      const runRes = await fetch('/api/agent/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scenarioTitle: params.scenarioTitle,
          skuId: params.skuId,
          nodeId: params.nodeId,
          recommendedQuantity: params.recommendedQuantity,
          userPrompt: params.userPrompt,
          autonomousMode,
        }),
      });

      const data = await runRes.json();
      if (data.success) {
        setLatestRunResult(data.data);
        if (data.updatedERP) {
          setErpState(data.updatedERP);
        } else {
          await fetchERPState();
        }
      }
    } catch (err) {
      console.error('Error running custom scenario:', err);
    } finally {
      setIsRunningAgent(false);
    }
  };

  const handleRunEval = async () => {
    setIsRunningEval(true);
    try {
      const res = await fetch('/api/eval/run-all', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setEvalReport(data.report);
        await fetchERPState();
      }
    } catch (err) {
      console.error('Error running evaluation:', err);
    } finally {
      setIsRunningEval(false);
    }
  };

  const handleApprovePO = async (poId: string, approved: boolean, notes: string) => {
    setIsApproving(true);
    try {
      const res = await fetch('/api/agent/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ poId, approved, buyerNotes: notes }),
      });
      const data = await res.json();
      if (data.success && latestRunResult) {
        setLatestRunResult({
          ...latestRunResult,
          approvalStatus: approved ? 'APPROVED' : 'REJECTED',
        });
        await fetchERPState();
      }
    } catch (err) {
      console.error('Approval error:', err);
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation & Status Bar */}
      <Header
        activeTab={activeTab}
        setActiveTab={(tab: any) => setActiveTab(tab)}
        onResetERP={handleResetERP}
        isResetting={isResetting}
        autonomousMode={autonomousMode}
        setAutonomousMode={setAutonomousMode}
        geminiActive={geminiActive}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workbench' && (
          <div className="space-y-6">
            {/* Scenario Selector Grid */}
            <ScenarioCards
              onSelectScenario={handleSelectScenario}
              onOpenCustomModal={() => setIsCustomModalOpen(true)}
              activeScenarioId={activeScenarioId}
              isRunning={isRunningAgent}
            />

            {/* Agent Live Mission Control View */}
            <AgentRunViewer
              result={latestRunResult}
              isRunning={isRunningAgent}
              onApprovePO={handleApprovePO}
              isApproving={isApproving}
            />
          </div>
        )}

        {activeTab === 'evaluator' && (
          <EvaluationSuiteTab
            onRunEval={handleRunEval}
            evalReport={evalReport}
            isRunningEval={isRunningEval}
          />
        )}

        {activeTab === 'erp' && (
          <ERPLedgerTab erpState={erpState} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureTab />
        )}
      </main>

      {/* Custom Situation Builder Modal */}
      {erpState && (
        <CustomScenarioModal
          isOpen={isCustomModalOpen}
          onClose={() => setIsCustomModalOpen(false)}
          onRunCustom={handleRunCustom}
          skus={erpState.skus}
          nodes={erpState.nodes}
          isRunning={isRunningAgent}
        />
      )}

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-center text-xs text-slate-500">
        <p>ApexProcure — Autonomous AI Purchasing Agent for Retail & Quick-Commerce • Closed-Loop Feedback Engine</p>
      </footer>
    </div>
  );
}
