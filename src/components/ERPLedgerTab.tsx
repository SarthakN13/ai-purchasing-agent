import React from 'react';
import { 
  Warehouse, 
  Package, 
  Truck, 
  DollarSign, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  BarChart3,
  Users
} from 'lucide-react';
import { 
  FulfillmentNode, 
  NodeInventory, 
  PurchaseOrder, 
  Supplier, 
  BudgetLedger,
  SKU
} from '../types/procurement.js';

interface ERPLedgerTabProps {
  erpState: {
    nodes: FulfillmentNode[];
    suppliers: Supplier[];
    skus: SKU[];
    inventories: NodeInventory[];
    purchaseOrders: PurchaseOrder[];
    budgets: BudgetLedger[];
  } | null;
}

export const ERPLedgerTab: React.FC<ERPLedgerTabProps> = ({ erpState }) => {
  if (!erpState) {
    return (
      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
        Loading Supply Chain ERP Ledger...
      </div>
    );
  }

  const { nodes, suppliers, skus, inventories, purchaseOrders, budgets } = erpState;

  const getSkuName = (skuId: string) => {
    return skus.find(s => s.id === skuId)?.name || skuId;
  };

  const getSupplierName = (supplierId: string) => {
    return suppliers.find(s => s.id === supplierId)?.name || supplierId;
  };

  return (
    <div className="space-y-6">
      {/* 1. Fulfillment Nodes & Storage Capacity */}
      <div>
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Warehouse className="w-4 h-4 text-cyan-400" />
          Fulfillment Nodes & Physical Storage Capacity
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {nodes.map((node) => {
            const utilizationPct = Math.round((node.currentUtilizedUnits / node.totalCapacityUnits) * 100);
            const thresholdPct = Math.round(node.maxUtilizationThreshold * 100);
            const isNearCap = utilizationPct >= thresholdPct - 5;
            const isOverCap = utilizationPct >= thresholdPct;

            return (
              <div
                key={node.id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-md space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white">{node.name}</h4>
                    <span className="text-[11px] text-slate-500 font-mono">{node.id}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    isOverCap
                      ? 'bg-rose-950 text-rose-300 border-rose-800'
                      : isNearCap
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                  }`}>
                    {isOverCap ? 'CAPACITY CRITICAL' : isNearCap ? 'NEAR CEILING' : 'HEALTHY'}
                  </span>
                </div>

                {/* Progress bar */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Utilization ({utilizationPct}%)</span>
                    <span>Threshold: {thresholdPct}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className={`h-full transition-all duration-500 ${
                        isOverCap ? 'bg-rose-500' : isNearCap ? 'bg-amber-500' : 'bg-cyan-500'
                      }`}
                      style={{ width: `${Math.min(100, utilizationPct)}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-slate-800/80">
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Units Utilized</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {node.currentUtilizedUnits} / {node.totalCapacityUnits}
                    </span>
                  </div>
                  <div className="bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                    <span className="text-[10px] text-slate-500 block uppercase">Volume (m³)</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {node.currentUtilizedM3.toFixed(1)} / {node.totalCapacityM3.toFixed(1)} m³
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Live Inventory Ledger */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            Live SKU Inventory & Velocity Ledger
          </h3>
          <span className="text-xs text-slate-400">
            Real-time pipeline stock & days of supply
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-slate-500 border-b border-slate-800">
                <th className="pb-2 font-medium">SKU</th>
                <th className="pb-2 font-medium">Node</th>
                <th className="pb-2 font-medium text-right">On-Hand</th>
                <th className="pb-2 font-medium text-right">Reserved</th>
                <th className="pb-2 font-medium text-right text-cyan-400">In-Transit POs</th>
                <th className="pb-2 font-medium text-right">Daily Burn</th>
                <th className="pb-2 font-medium text-right">Days of Supply</th>
                <th className="pb-2 font-medium text-center">Stock Health</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {inventories.map((inv) => {
                const available = inv.onHand - inv.reserved;
                const totalPipeline = available + inv.incomingOnOrder;
                const daysSupply = inv.dailyBurnRate > 0 ? (totalPipeline / inv.dailyBurnRate).toFixed(1) : '999';
                const isSpike = inv.demandTrendFactor > 1.5;

                return (
                  <tr key={`${inv.skuId}-${inv.nodeId}`} className="hover:bg-slate-850/50 transition-colors">
                    <td className="py-2.5 font-semibold text-slate-200">
                      {getSkuName(inv.skuId)}
                      <span className="block text-[10px] text-slate-500 font-mono">{inv.skuId}</span>
                    </td>
                    <td className="py-2.5 text-slate-300 font-medium">
                      {inv.nodeId.replace('NODE-', '')}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-200">
                      {inv.onHand}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-400">
                      {inv.reserved}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-cyan-300">
                      +{inv.incomingOnOrder}
                    </td>
                    <td className="py-2.5 text-right font-mono text-slate-300">
                      {inv.dailyBurnRate}/day
                      {isSpike && (
                        <span className="text-[10px] text-rose-400 font-bold block">
                          +140% Spike
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-right font-mono font-bold text-slate-100">
                      {daysSupply} days
                    </td>
                    <td className="py-2.5 text-center">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        Number(daysSupply) < 2
                          ? 'bg-rose-950 text-rose-300 border-rose-800'
                          : Number(daysSupply) > 12
                          ? 'bg-amber-950 text-amber-300 border-amber-800'
                          : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      }`}>
                        {Number(daysSupply) < 2 ? 'STOCKOUT RISK' : Number(daysSupply) > 12 ? 'OVERSTOCK' : 'OPTIMAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* 3. Open Purchase Orders & Suppliers Ledger (2 columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Open POs */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Truck className="w-4 h-4 text-cyan-400" />
              Open Purchase Orders ({purchaseOrders.length})
            </h3>
            <span className="text-[11px] text-slate-400">Pipeline Tracking</span>
          </div>

          <div className="space-y-2 overflow-y-auto max-h-[360px] pr-1">
            {purchaseOrders.map((po) => (
              <div
                key={po.id}
                className="bg-slate-950/70 p-3 rounded-xl border border-slate-800 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-cyan-300">{po.id}</span>
                    <span className="text-slate-300 font-semibold">{getSkuName(po.skuId)}</span>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                    po.status === 'CONFIRMED' || po.status === 'IN_TRANSIT'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                      : po.status === 'PARTIALLY_ACCEPTED'
                      ? 'bg-amber-950 text-amber-300 border-amber-800'
                      : 'bg-rose-950 text-rose-300 border-rose-800'
                  }`}>
                    {po.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-400">
                  <div>
                    <span className="text-slate-500 block text-[10px]">Supplier:</span>
                    <span className="text-slate-300 font-medium">{getSupplierName(po.supplierId)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Quantity / Spend:</span>
                    <span className="text-slate-200 font-mono font-semibold">
                      {po.quantity} pcs (${po.totalCost.toFixed(2)})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[10px]">Destination:</span>
                    <span className="text-slate-300">{po.targetNodeId.replace('NODE-', '')}</span>
                  </div>
                </div>

                {po.notes && (
                  <p className="text-[11px] text-slate-400 bg-slate-900/80 p-1.5 rounded border border-slate-800/80 font-sans">
                    {po.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Suppliers & Category Budgets */}
        <div className="space-y-4">
          {/* Approved Suppliers */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <Users className="w-4 h-4 text-cyan-400" />
              Approved Suppliers & Conditions
            </h3>

            <div className="space-y-2">
              {suppliers.map((sup) => (
                <div
                  key={sup.id}
                  className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-slate-200 block">{sup.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      MOQ: {sup.moq} • Lead Time: {sup.leadTimeDays}d • Reliability: {sup.reliabilityScore}%
                    </span>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-cyan-300">${sup.unitCost.toFixed(2)}/ea</span>
                    <span className={`block text-[10px] font-semibold ${
                      sup.tier === 'Primary' ? 'text-indigo-400' : 'text-amber-400'
                    }`}>
                      {sup.tier} Tier
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Budgets */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2 pb-2 border-b border-slate-800">
              <DollarSign className="w-4 h-4 text-cyan-400" />
              Purchasing Category Budgets
            </h3>

            <div className="space-y-2.5">
              {budgets.map((b, i) => {
                const usedPct = Math.round(((b.spentToDate + b.committedPOs) / b.monthlyAllocation) * 100);
                return (
                  <div key={i} className="bg-slate-950/70 p-2.5 rounded-xl border border-slate-800 text-xs space-y-1.5">
                    <div className="flex justify-between font-medium">
                      <span className="text-slate-200">{b.category}</span>
                      <span className="text-slate-400 font-mono">
                        Available: <strong className="text-emerald-400">${b.available.toLocaleString()}</strong> / ${b.monthlyAllocation.toLocaleString()}
                      </span>
                    </div>
                    <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="bg-indigo-500 h-full rounded-full"
                        style={{ width: `${Math.min(100, usedPct)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
