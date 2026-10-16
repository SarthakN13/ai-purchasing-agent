import React, { useState } from 'react';
import { X, Play, SlidersHorizontal, Sparkles } from 'lucide-react';
import { NodeId, SKU, FulfillmentNode } from '../types/procurement.js';

interface CustomScenarioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunCustom: (params: {
    skuId: string;
    nodeId: NodeId;
    recommendedQuantity: number;
    scenarioTitle: string;
    userPrompt: string;
    conditionType: string;
  }) => void;
  skus: SKU[];
  nodes: FulfillmentNode[];
  isRunning: boolean;
}

export const CustomScenarioModal: React.FC<CustomScenarioModalProps> = ({
  isOpen,
  onClose,
  onRunCustom,
  skus,
  nodes,
  isRunning,
}) => {
  const [skuId, setSkuId] = useState(skus[0]?.id || 'SKU-OAT-101');
  const [nodeId, setNodeId] = useState<NodeId>('NODE-NORTH-MFC');
  const [recommendedQuantity, setRecommendedQuantity] = useState(600);
  const [conditionType, setConditionType] = useState('NORMAL');
  const [customPrompt, setCustomPrompt] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const skuName = skus.find(s => s.id === skuId)?.name || skuId;
    const nodeName = nodes.find(n => n.id === nodeId)?.name || nodeId;

    let conditionNote = '';
    if (conditionType === 'SUPPLIER_SHORTFALL') conditionNote = 'Supplier reported 50% shortfall on existing orders.';
    if (conditionType === 'DEMAND_SURGE') conditionNote = 'Recent consumer sales spiked by +140% over 48h.';
    if (conditionType === 'STORAGE_TIGHT') conditionNote = 'Node storage utilization is approaching 90% maximum threshold.';

    const prompt = customPrompt || `Review purchasing situation for ${skuName} at ${nodeName}. Recommended quantity is ${recommendedQuantity} units. ${conditionNote}`;

    onRunCustom({
      skuId,
      nodeId,
      recommendedQuantity,
      scenarioTitle: `Custom Purchasing Review (${skuName} @ ${nodeName.split(' ')[0]})`,
      userPrompt: prompt,
      conditionType,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Custom Purchasing Situation Builder</h3>
            <p className="text-xs text-slate-400">Configure parameters and test agent autonomous behavior</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Target SKU */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Target SKU</label>
            <select
              value={skuId}
              onChange={(e) => setSkuId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {skus.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.id}) — ${s.unitCost.toFixed(2)}/ea
                </option>
              ))}
            </select>
          </div>

          {/* Fulfillment Node */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">Fulfillment Node</label>
            <select
              value={nodeId}
              onChange={(e) => setNodeId(e.target.value as NodeId)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              {nodes.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.name} (Cap: {n.totalCapacityUnits} units)
                </option>
              ))}
            </select>
          </div>

          {/* Recommended Quantity */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Proposed / Recommended Order Quantity
            </label>
            <input
              type="number"
              min="10"
              max="5000"
              step="10"
              value={recommendedQuantity}
              onChange={(e) => setRecommendedQuantity(parseInt(e.target.value, 10) || 0)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 font-mono focus:outline-none focus:border-cyan-500"
            />
          </div>

          {/* Operational Condition / Anomaly Injection */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Simulated Operational Condition
            </label>
            <select
              value={conditionType}
              onChange={(e) => setConditionType(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="NORMAL">Standard Operational Cycle (Audit Pipeline & Storage)</option>
              <option value="SUPPLIER_SHORTFALL">Supplier Partial Shortfall (Triggers Alternate Sourcing)</option>
              <option value="DEMAND_SURGE">Demand Surge +140% (Triggers Emergency Reorder)</option>
              <option value="STORAGE_TIGHT">Storage Near 90% Ceiling (Tests Volumetric Protection)</option>
            </select>
          </div>

          {/* Custom Buyer Prompt */}
          <div>
            <label className="block text-slate-300 font-medium mb-1">
              Custom Buyer Instructions / Notes (Optional)
            </label>
            <textarea
              rows={2}
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="e.g. Please check if we can source from local suppliers to avoid cross-state freight..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isRunning}
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-lg shadow-cyan-500/20 transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Launch Investigation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
