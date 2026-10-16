import React from 'react';
import { 
  AlertCircle, 
  TrendingUp, 
  Truck, 
  Layers, 
  ArrowRight, 
  Play, 
  Sparkles,
  SlidersHorizontal
} from 'lucide-react';
import { NodeId } from '../types/procurement.js';

export interface ScenarioCardData {
  number: number;
  id: string;
  title: string;
  badge: string;
  badgeColor: string;
  skuId: string;
  skuName: string;
  nodeId: NodeId;
  nodeName: string;
  initialQuantity?: number;
  existingPoId?: string;
  description: string;
  constraintsToEvaluate: string[];
  expectedResolution: string;
}

export const CANONICAL_SCENARIOS: ScenarioCardData[] = [
  {
    number: 1,
    id: 'SCENARIO-1',
    title: 'Purchase Recommendation Review',
    badge: 'Recommendation Audit',
    badgeColor: 'border-cyan-500/40 bg-cyan-950/40 text-cyan-300',
    skuId: 'SKU-OAT-101',
    skuName: 'Organic Oat Milk 1L',
    nodeId: 'NODE-NORTH-MFC',
    nodeName: 'North Dark Store (MFC)',
    initialQuantity: 800,
    description: 'The automated system proposes buying 800 units. Agent must evaluate live inventory, 200 units already in transit, storage limits, and supplier MOQ to decide whether to accept, modify, or reject.',
    constraintsToEvaluate: [
      '200 units already in transit via PO-8101',
      'North Dark Store storage headroom is ~230 units (800 would breach limit)',
      'Supplier MOQ is 200 units',
      'Holding cost vs overstock penalty',
    ],
    expectedResolution: 'MODIFY: Reduce 800 down to 250 units to honor storage limits and pipeline stock.',
  },
  {
    number: 2,
    id: 'SCENARIO-2',
    title: 'Supplier Cannot Fulfil Purchase',
    badge: 'Supplier Shortfall',
    badgeColor: 'border-amber-500/40 bg-amber-950/40 text-amber-300',
    skuId: 'SKU-AVO-202',
    skuName: 'Hass Ready Avocados 4pk',
    nodeId: 'NODE-CENTRAL-DC',
    nodeName: 'Central Distribution Center',
    existingPoId: 'PO-7841',
    initialQuantity: 500,
    description: 'PO-7841 was submitted for 500 units, but supplier Global Agri-Fresh reports only 250 units can currently be supplied due to packhouse crop yield shortfalls. Risk of stockout in 3.4 days.',
    constraintsToEvaluate: [
      'Current stock (110 units) depleted within 3.4 days if unmitigated',
      'Supplier AGRI only fulfilling 250 units',
      'Approved secondary supplier Metro Quick offers 1-day expedited lead time',
      'Unit price delta ($3.30 vs $3.10)',
    ],
    expectedResolution: 'SOURCE_ALTERNATE / SPLIT: Accept 250 from AGRI + expedited 250 from METRO.',
  },
  {
    number: 3,
    id: 'SCENARIO-3',
    title: 'Demand / Forecast Surge',
    badge: 'Demand Shock',
    badgeColor: 'border-rose-500/40 bg-rose-950/40 text-rose-300',
    skuId: 'SKU-ENE-303',
    skuName: 'ZenPulse Clean Energy 12pk',
    nodeId: 'NODE-SOUTH-MFC',
    nodeName: 'South Dark Store (MFC)',
    existingPoId: 'PO-6620',
    description: 'Viral sales surge causes actual velocity to jump +140% (from 25 to 95 units/day). Current stock of 85 units will stock out in ~21 hours, well before scheduled PO-6620 arrives.',
    constraintsToEvaluate: [
      'Imminent stockout in ~21 hours without intervention',
      'Standard supplier lead time is 2 days; expedited is 1 day',
      'Storage capacity at South MFC allows up to 600 units',
      'Safety stock needs upward revision to support elevated burn rate',
    ],
    expectedResolution: 'EXPEDITE & REPLENISH: Place emergency order for 400 units with 24h delivery.',
  },
  {
    number: 4,
    id: 'SCENARIO-4',
    title: 'Purchasing Constraint Conflict',
    badge: 'Multi-Node Optimization',
    badgeColor: 'border-purple-500/40 bg-purple-950/40 text-purple-300',
    skuId: 'SKU-OAT-101',
    skuName: 'Organic Oat Milk 1L',
    nodeId: 'NODE-NORTH-MFC',
    nodeName: 'North Dark Store (MFC)',
    initialQuantity: 600,
    description: 'North Dark Store needs inventory, but its storage has only 230 units free capacity. Supplier MOQ is 500 units. A single order directly to North MFC violates warehouse limits.',
    constraintsToEvaluate: [
      'North Dark Store storage capacity limit: max 230 units',
      'Supplier Valley Organics MOQ is 500 units',
      'Adjacent Central DC has 6,800 units free capacity',
      'Twice-daily internal shuttle available for cross-dock transfer',
    ],
    expectedResolution: 'MULTI-NODE SPLIT: 200 units to North MFC + 400 units to Central DC with cross-dock.',
  },
];

interface ScenarioCardsProps {
  onSelectScenario: (scenario: ScenarioCardData) => void;
  onOpenCustomModal: () => void;
  activeScenarioId?: string;
  isRunning: boolean;
}

export const ScenarioCards: React.FC<ScenarioCardsProps> = ({
  onSelectScenario,
  onOpenCustomModal,
  activeScenarioId,
  isRunning,
}) => {
  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold tracking-tight text-slate-200 uppercase flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            Purchasing Scenarios & Situations
          </h2>
          <p className="text-xs text-slate-400">
            Select a real-world quick-commerce purchasing dilemma for the AI Agent to investigate, solve, and validate.
          </p>
        </div>

        <button
          onClick={onOpenCustomModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800/80 hover:bg-slate-700/80 text-cyan-300 border border-slate-700 hover:border-cyan-500/40 transition-all self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Custom Situation Builder</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {CANONICAL_SCENARIOS.map((sc) => {
          const isSelected = activeScenarioId === sc.id;
          return (
            <div
              key={sc.id}
              className={`group relative rounded-xl border p-4 transition-all flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-900 border-cyan-500/60 shadow-lg shadow-cyan-950/40 ring-1 ring-cyan-500/30'
                  : 'bg-slate-900/60 hover:bg-slate-900/90 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Header */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full border ${sc.badgeColor}`}>
                    {sc.badge}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Scenario 0{sc.number}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-sm font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                  {sc.title}
                </h3>

                {/* Target context */}
                <div className="mt-2 text-xs text-slate-400 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">SKU:</span>
                    <span className="font-medium text-slate-300 truncate max-w-[140px]" title={sc.skuName}>
                      {sc.skuName}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Node:</span>
                    <span className="font-medium text-slate-300 truncate max-w-[140px]">
                      {sc.nodeName.split(' ')[0]} {sc.nodeName.split(' ')[1]}
                    </span>
                  </div>
                  {sc.initialQuantity && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Proposed:</span>
                      <span className="font-mono font-semibold text-amber-300">
                        {sc.initialQuantity} units
                      </span>
                    </div>
                  )}
                </div>

                {/* Brief description */}
                <p className="mt-2.5 text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {sc.description}
                </p>

                {/* Constraints preview */}
                <div className="mt-3 pt-2.5 border-t border-slate-800/80 space-y-1">
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                    Key Constraints:
                  </p>
                  {sc.constraintsToEvaluate.slice(0, 2).map((c, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                      <span className="text-cyan-400">•</span>
                      <span className="line-clamp-1">{c}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => onSelectScenario(sc)}
                disabled={isRunning}
                className={`mt-4 w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
                  isSelected
                    ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white'
                } disabled:opacity-50`}
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>{isRunning && isSelected ? 'Investigating...' : 'Run Agent Investigation'}</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
