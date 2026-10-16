/**
 * Tool Declarations and Handlers for the AI Purchasing Agent
 */
import { FunctionDeclaration, Type } from '@google/genai';
import { erpDb } from './erpDatabase.js';
import { NodeId, ToolCallTrace } from '../types/procurement.js';

export const agentToolDeclarations: FunctionDeclaration[] = [
  {
    name: 'check_inventory',
    description: 'Retrieves current on-hand stock, reserved stock, in-transit incoming purchase orders, daily burn rate, and days of supply for a given SKU at a fulfillment node.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        skuId: { type: Type.STRING, description: 'The unique SKU ID (e.g. SKU-OAT-101, SKU-AVO-202, SKU-ENE-303).' },
        nodeId: { type: Type.STRING, description: 'The fulfillment node ID (e.g. NODE-NORTH-MFC, NODE-CENTRAL-DC, NODE-SOUTH-MFC).' },
      },
      required: ['skuId', 'nodeId'],
    },
  },
  {
    name: 'check_demand_forecast',
    description: 'Retrieves the baseline demand forecast, current actual sales velocity, recent demand trend factor (e.g., spike or drop), and projected demand over the requested horizon in days.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        skuId: { type: Type.STRING, description: 'SKU identifier.' },
        nodeId: { type: Type.STRING, description: 'Fulfillment node identifier.' },
        horizonDays: { type: Type.NUMBER, description: 'Forecasting horizon in days (e.g. 7, 14, 30).' },
      },
      required: ['skuId', 'nodeId'],
    },
  },
  {
    name: 'check_open_pos',
    description: 'Lists all active or open purchase orders currently pending or in transit for a SKU and node, including quantities, ETAs, supplier info, and acceptance status.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        skuId: { type: Type.STRING, description: 'SKU identifier (optional, omit for all SKUs at node).' },
        nodeId: { type: Type.STRING, description: 'Fulfillment node identifier.' },
      },
      required: ['nodeId'],
    },
  },
  {
    name: 'check_suppliers',
    description: 'Fetches all approved suppliers for a SKU, including unit costs, minimum order quantities (MOQ), standard lead times, reliability ratings, expedited shipping options, and tier (Primary vs Secondary).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        skuId: { type: Type.STRING, description: 'SKU identifier.' },
      },
      required: ['skuId'],
    },
  },
  {
    name: 'check_storage_capacity',
    description: 'Inspects available volumetric (m³) and unit capacity at a fulfillment node, along with current utilization percentage and hard safety thresholds to prevent warehouse bottlenecks.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        nodeId: { type: Type.STRING, description: 'Fulfillment node identifier (NODE-NORTH-MFC, NODE-CENTRAL-DC, NODE-SOUTH-MFC).' },
      },
      required: ['nodeId'],
    },
  },
  {
    name: 'check_budget',
    description: 'Checks the purchasing budget ledger for a specific category and fulfillment node, showing monthly allocation, committed PO spend, and remaining available funds.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, description: 'Product category (e.g. "Dairy & Alternatives", "Fresh Produce", "Functional Beverages").' },
        nodeId: { type: Type.STRING, description: 'Fulfillment node identifier.' },
      },
      required: ['category', 'nodeId'],
    },
  },
  {
    name: 'simulate_po_action',
    description: 'Runs a pre-flight feasibility simulation of an intended purchase order or modification, checking MOQ compliance, warehouse space headroom, budget availability, and projected stock trajectory before committing.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        skuId: { type: Type.STRING, description: 'SKU identifier.' },
        supplierId: { type: Type.STRING, description: 'Supplier identifier.' },
        targetNodeId: { type: Type.STRING, description: 'Target node identifier.' },
        quantity: { type: Type.NUMBER, description: 'Proposed order quantity.' },
        isExpedited: { type: Type.BOOLEAN, description: 'Whether expedited courier is requested.' },
      },
      required: ['skuId', 'supplierId', 'targetNodeId', 'quantity'],
    },
  },
  {
    name: 'execute_purchase_action',
    description: 'Executes the agreed purchasing decision in the ERP (creates PO, modifies existing PO, splits order across nodes/suppliers, or flags for human approval).',
    parameters: {
      type: Type.OBJECT,
      properties: {
        actionType: { type: Type.STRING, description: 'ACCEPT_RECOMMENDATION | MODIFY_QUANTITY | REJECT_RECOMMENDATION | SPLIT_ORDER | SOURCE_ALTERNATE | ESCALATE_TO_BUYER.' },
        skuId: { type: Type.STRING, description: 'SKU identifier.' },
        supplierId: { type: Type.STRING, description: 'Target primary supplier ID.' },
        targetNodeId: { type: Type.STRING, description: 'Target primary node ID.' },
        quantity: { type: Type.NUMBER, description: 'Final order quantity.' },
        existingPoId: { type: Type.STRING, description: 'Existing PO ID if modifying or splitting.' },
        secondarySupplierId: { type: Type.STRING, description: 'Secondary supplier if splitting or alternate sourcing.' },
        secondaryQuantity: { type: Type.NUMBER, description: 'Quantity for secondary supplier/node.' },
        secondaryNodeId: { type: Type.STRING, description: 'Secondary node if cross-docking or multi-node split.' },
        isExpedited: { type: Type.BOOLEAN, description: 'Whether expedited delivery is used.' },
        justification: { type: Type.STRING, description: 'Detailed executive rationale for the decision.' },
      },
      required: ['actionType', 'skuId', 'targetNodeId', 'quantity', 'justification'],
    },
  },
  {
    name: 'verify_post_action_outcome',
    description: 'Closed-loop feedback tool: verifies that the executed purchase order registered successfully, supplier acknowledged, and the resulting stock curve remains within safety stock and storage constraints.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        poId: { type: Type.STRING, description: 'Created or modified purchase order ID.' },
        skuId: { type: Type.STRING, description: 'SKU identifier.' },
        nodeId: { type: Type.STRING, description: 'Fulfillment node identifier.' },
        expectedUnitsIncoming: { type: Type.NUMBER, description: 'Expected incoming units.' },
      },
      required: ['poId', 'skuId', 'nodeId'],
    },
  },
];

export async function executeAgentTool(
  name: string,
  args: Record<string, unknown>
): Promise<{ observation: Record<string, unknown>; durationMs: number }> {
  const startTime = Date.now();
  let observation: Record<string, unknown> = {};

  switch (name) {
    case 'check_inventory': {
      const skuId = String(args.skuId);
      const nodeId = args.nodeId as NodeId;
      const inv = erpDb.getInventory(skuId, nodeId);
      const sku = erpDb.getSku(skuId);
      if (!inv || !sku) {
        observation = { error: `No inventory record found for ${skuId} at ${nodeId}` };
      } else {
        const netAvailable = inv.onHand - inv.reserved;
        const totalPipeline = netAvailable + inv.incomingOnOrder;
        const daysOfSupplyOnHand = inv.dailyBurnRate > 0 ? Number((netAvailable / inv.dailyBurnRate).toFixed(1)) : 999;
        const daysOfSupplyWithPipeline = inv.dailyBurnRate > 0 ? Number((totalPipeline / inv.dailyBurnRate).toFixed(1)) : 999;
        const targetSafetyUnits = Math.ceil(inv.dailyBurnRate * sku.targetSafetyStockDays);

        observation = {
          skuId,
          skuName: sku.name,
          nodeId,
          onHand: inv.onHand,
          reserved: inv.reserved,
          netAvailable,
          incomingOnOrder: inv.incomingOnOrder,
          totalPipeline,
          dailyBurnRate: inv.dailyBurnRate,
          targetSafetyStockDays: sku.targetSafetyStockDays,
          targetSafetyUnits,
          daysOfSupplyOnHand,
          daysOfSupplyWithPipeline,
          isStockoutImminent: daysOfSupplyOnHand < 1.5,
          stockHealth: daysOfSupplyWithPipeline < sku.targetSafetyStockDays ? 'DEFICIT_RISK' : daysOfSupplyWithPipeline > 14 ? 'OVERSTOCK_RISK' : 'OPTIMAL',
        };
      }
      break;
    }

    case 'check_demand_forecast': {
      const skuId = String(args.skuId);
      const nodeId = args.nodeId as NodeId;
      const horizon = Number(args.horizonDays || 7);
      const inv = erpDb.getInventory(skuId, nodeId);
      const sku = erpDb.getSku(skuId);

      if (!inv || !sku) {
        observation = { error: `Forecasting data not found for ${skuId} at ${nodeId}` };
      } else {
        const baselineBurn = inv.demandTrendFactor > 1.5 ? Math.round(inv.dailyBurnRate / inv.demandTrendFactor) : inv.dailyBurnRate;
        const currentVelocity = inv.dailyBurnRate;
        const trendFactor = inv.demandTrendFactor;
        const projectedDemandHorizon = Math.round(currentVelocity * horizon);

        observation = {
          skuId,
          skuName: sku.name,
          nodeId,
          horizonDays: horizon,
          baselineDailyDemand: baselineBurn,
          currentActualVelocity: currentVelocity,
          trendFactor,
          trendDescription: trendFactor > 1.5 
            ? `SURGE DETECTED: +${Math.round((trendFactor - 1) * 100)}% increase over baseline (persistent velocity spike)`
            : 'NORMAL_STABLE: Baseline seasonal demand within expected range',
          projectedDemandHorizon,
          confidenceInterval: '94.2%',
          recommendationTriggerReason: trendFactor > 1.5 ? 'VELOCITY_SURGE_DETECTED' : 'ROUTINE_CYCLE',
        };
      }
      break;
    }

    case 'check_open_pos': {
      const skuId = args.skuId ? String(args.skuId) : undefined;
      const nodeId = args.nodeId as NodeId;
      const openPOs = erpDb.getOpenPOs(skuId, nodeId);

      observation = {
        nodeId,
        filterSkuId: skuId || 'ALL',
        totalOpenPOs: openPOs.length,
        openPOs: openPOs.map(po => {
          const supplier = erpDb.getSupplier(po.supplierId);
          return {
            id: po.id,
            skuId: po.skuId,
            supplierId: po.supplierId,
            supplierName: supplier?.name || po.supplierId,
            quantity: po.quantity,
            unitCost: po.unitCost,
            totalCost: po.totalCost,
            status: po.status,
            expectedDeliveryDate: po.expectedDeliveryDate,
            leadTimeDays: po.leadTimeDays,
            notes: po.notes,
            isExpedited: po.isExpedited,
          };
        }),
      };
      break;
    }

    case 'check_suppliers': {
      const skuId = String(args.skuId);
      const allSuppliers = erpDb.getAllSuppliers();
      // Filter suppliers that can supply this SKU category
      const sku = erpDb.getSku(skuId);

      const relevant = allSuppliers.map(sup => {
        let fitsCategory = true;
        if (sku?.category === 'Fresh Produce' && !sup.id.includes('AGRI') && !sup.id.includes('METRO')) fitsCategory = false;
        if (sku?.category === 'Dairy & Alternatives' && !sup.id.includes('VALLEY') && !sup.id.includes('METRO')) fitsCategory = false;
        if (sku?.category === 'Functional Beverages' && !sup.id.includes('EXPRESS') && !sup.id.includes('METRO')) fitsCategory = false;

        return {
          id: sup.id,
          name: sup.name,
          tier: sup.tier,
          leadTimeDays: sup.leadTimeDays,
          moq: sup.moq,
          unitCost: sup.unitCost,
          reliabilityScore: sup.reliabilityScore,
          isExpeditedAvailable: sup.isExpeditedAvailable,
          expeditedLeadTimeDays: sup.expeditedLeadTimeDays,
          expeditedCostMultiplier: sup.expeditedCostMultiplier,
          activeStatus: sup.activeStatus,
          isPreferredForCategory: fitsCategory,
          notes: sup.notes,
        };
      }).filter(s => s.isPreferredForCategory);

      observation = {
        skuId,
        availableSuppliersCount: relevant.length,
        suppliers: relevant,
      };
      break;
    }

    case 'check_storage_capacity': {
      const nodeId = args.nodeId as NodeId;
      const node = erpDb.getNode(nodeId);
      if (!node) {
        observation = { error: `Node ${nodeId} not found` };
      } else {
        const freeUnits = node.totalCapacityUnits - node.currentUtilizedUnits;
        const maxPermissibleUnits = Math.floor(node.totalCapacityUnits * node.maxUtilizationThreshold);
        const headroomBeforeThreshold = Math.max(0, maxPermissibleUnits - node.currentUtilizedUnits);
        const utilizationPct = Number(((node.currentUtilizedUnits / node.totalCapacityUnits) * 100).toFixed(1));
        const freeM3 = Number((node.totalCapacityM3 - node.currentUtilizedM3).toFixed(2));

        observation = {
          nodeId: node.id,
          nodeName: node.name,
          nodeType: node.type,
          totalCapacityUnits: node.totalCapacityUnits,
          currentUtilizedUnits: node.currentUtilizedUnits,
          freeUnits,
          maxUtilizationThresholdPct: Math.round(node.maxUtilizationThreshold * 100),
          headroomBeforeThresholdUnits: headroomBeforeThreshold,
          utilizationPct,
          totalCapacityM3: node.totalCapacityM3,
          currentUtilizedM3: node.currentUtilizedM3,
          freeM3,
          storageStatus: utilizationPct >= node.maxUtilizationThreshold * 100 ? 'CONSTRAINED_CRITICAL' : utilizationPct > 75 ? 'MODERATE_HIGH' : 'HEALTHY_HEADROOM',
        };
      }
      break;
    }

    case 'check_budget': {
      const category = String(args.category);
      const nodeId = args.nodeId as NodeId;
      const budget = erpDb.getBudget(category, nodeId);
      if (!budget) {
        // Return default high capacity if no specific rule
        observation = {
          category,
          nodeId,
          available: 15000,
          committedPOs: 0,
          monthlyAllocation: 25000,
          status: 'UNRESTRICTED_FALLBACK',
        };
      } else {
        const utilizationPct = Number(((budget.spentToDate + budget.committedPOs) / budget.monthlyAllocation * 100).toFixed(1));
        observation = {
          category: budget.category,
          nodeId: budget.nodeId,
          monthlyAllocation: budget.monthlyAllocation,
          spentToDate: budget.spentToDate,
          committedPOs: budget.committedPOs,
          available: budget.available,
          currency: budget.currency,
          utilizationPct,
          budgetHealth: budget.available < 1000 ? 'RESTRICTED' : 'HEALTHY',
        };
      }
      break;
    }

    case 'simulate_po_action': {
      const skuId = String(args.skuId);
      const supplierId = String(args.supplierId);
      const targetNodeId = args.targetNodeId as NodeId;
      const quantity = Number(args.quantity);
      const isExpedited = Boolean(args.isExpedited);

      const sku = erpDb.getSku(skuId);
      const supplier = erpDb.getSupplier(supplierId);
      const node = erpDb.getNode(targetNodeId);
      const inv = erpDb.getInventory(skuId, targetNodeId);

      if (!sku || !supplier || !node || !inv) {
        observation = { valid: false, error: 'Entity lookup failed during pre-flight check.' };
        break;
      }

      const unitCost = isExpedited && supplier.expeditedCostMultiplier 
        ? supplier.unitCost * supplier.expeditedCostMultiplier 
        : supplier.unitCost;
      const totalSpend = Number((quantity * unitCost).toFixed(2));
      const budget = erpDb.getBudget(sku.category, targetNodeId);

      const moqPassed = quantity >= supplier.moq;
      const budgetAvailable = budget ? budget.available : 999999;
      const budgetPassed = totalSpend <= budgetAvailable;

      const spaceAfterUnits = node.currentUtilizedUnits + quantity;
      const maxUnitsThreshold = Math.floor(node.totalCapacityUnits * node.maxUtilizationThreshold);
      const capacityPassed = spaceAfterUnits <= maxUnitsThreshold;

      const netAvailableNow = inv.onHand - inv.reserved;
      const projectedPipeline = netAvailableNow + inv.incomingOnOrder + quantity;
      const projectedDaysOfSupply = inv.dailyBurnRate > 0 
        ? Number((projectedPipeline / inv.dailyBurnRate).toFixed(1)) 
        : 999;

      const passedAll = moqPassed && budgetPassed && capacityPassed;

      observation = {
        preFlightStatus: passedAll ? 'FEASIBLE' : 'CONSTRAINT_VIOLATION',
        moqCheck: {
          passed: moqPassed,
          orderedQuantity: quantity,
          supplierMoq: supplier.moq,
          detail: moqPassed ? 'Meets supplier minimum order quantity' : `VIOLATION: ${quantity} is below MOQ of ${supplier.moq}`,
        },
        capacityCheck: {
          passed: capacityPassed,
          currentUtilizedUnits: node.currentUtilizedUnits,
          resultingUtilizedUnits: spaceAfterUnits,
          maxPermissibleUnits: maxUnitsThreshold,
          headroomRemaining: maxUnitsThreshold - spaceAfterUnits,
          detail: capacityPassed ? `Passes storage check (${spaceAfterUnits} / ${node.totalCapacityUnits} units)` : `CAPACITY BREACH: Requires ${spaceAfterUnits} units, max threshold is ${maxUnitsThreshold}`,
        },
        budgetCheck: {
          passed: budgetPassed,
          proposedSpend: totalSpend,
          availableBudget: budgetAvailable,
          detail: budgetPassed ? `Within approved budget (Remaining: $${(budgetAvailable - totalSpend).toFixed(2)})` : `BUDGET DEFICIT: Order cost $${totalSpend} exceeds available $${budgetAvailable}`,
        },
        inventoryTrajectory: {
          currentOnHand: inv.onHand,
          currentIncoming: inv.incomingOnOrder,
          newIncoming: quantity,
          projectedDaysOfSupply,
          targetDaysOfSupply: sku.targetSafetyStockDays,
          status: projectedDaysOfSupply > 14 ? 'EXCESSIVE_HOLDING_RISK' : projectedDaysOfSupply < sku.targetSafetyStockDays ? 'SAFETY_STOCK_DEFICIT' : 'OPTIMAL_COVERAGE',
        },
      };
      break;
    }

    case 'execute_purchase_action': {
      const actionType = String(args.actionType);
      const skuId = String(args.skuId);
      const supplierId = String(args.supplierId);
      const targetNodeId = args.targetNodeId as NodeId;
      const quantity = Number(args.quantity);
      const isExpedited = Boolean(args.isExpedited);
      const justification = String(args.justification || 'Autonomous buyer action');

      // Idempotency check: if an order was created within the last 30s for this sku & node, return existing PO
      const existingRecentPO = Array.from(erpDb.getAllPOs()).find(p => 
        p.skuId === skuId && 
        p.targetNodeId === targetNodeId && 
        p.quantity === quantity && 
        (Date.now() - new Date(p.createdAt).getTime()) < 30000
      );
      if (existingRecentPO && !args.existingPoId) {
        observation = {
          executionStatus: 'SUCCESS',
          actionType,
          primaryPO: existingRecentPO,
          executionTimestamp: new Date().toISOString(),
          justification: `${justification} (Idempotent ERP verification)`,
        };
        break;
      }

      // Check if existing PO is being modified or split
      if (args.existingPoId) {
        const existingId = String(args.existingPoId);
        if (actionType === 'MODIFY_QUANTITY' || actionType === 'SOURCE_ALTERNATE') {
          erpDb.modifyPurchaseOrder(existingId, {
            quantity,
            notes: `Updated by AI Agent: ${justification}`,
            status: 'CONFIRMED',
          });
        }
      }

      // If secondary split is specified (e.g., Scenario 2 alternate supplier, or Scenario 4 multi-node)
      let secondaryPoResult;
      if (args.secondaryQuantity && Number(args.secondaryQuantity) > 0) {
        const secQty = Number(args.secondaryQuantity);
        const secSup = String(args.secondarySupplierId || supplierId);
        const secNode = (args.secondaryNodeId as NodeId) || targetNodeId;

        secondaryPoResult = erpDb.createPurchaseOrder({
          skuId,
          supplierId: secSup,
          targetNodeId: secNode,
          quantity: secQty,
          isExpedited: Boolean(args.isExpedited),
          notes: `Split / Multi-node allocation generated by AI Agent: ${justification}`,
          splitFromPoId: args.existingPoId ? String(args.existingPoId) : undefined,
        });
      }

      // Create primary PO if needed
      let primaryPoResult;
      if (!args.existingPoId || actionType === 'ACCEPT_RECOMMENDATION' || actionType === 'SPLIT_ORDER') {
        primaryPoResult = erpDb.createPurchaseOrder({
          skuId,
          supplierId,
          targetNodeId,
          quantity,
          isExpedited,
          notes: `Created by AI Agent [${actionType}]: ${justification}`,
        });
      }

      observation = {
        executionStatus: 'SUCCESS',
        actionType,
        primaryPO: primaryPoResult?.po || erpDb.getAllPOs().find(p => p.id === args.existingPoId),
        secondaryPO: secondaryPoResult?.po,
        executionTimestamp: new Date().toISOString(),
        justification,
      };
      break;
    }

    case 'verify_post_action_outcome': {
      const poId = String(args.poId);
      const skuId = String(args.skuId);
      const nodeId = args.nodeId as NodeId;

      const po = erpDb.getAllPOs().find(p => p.id === poId);
      const inv = erpDb.getInventory(skuId, nodeId);
      const node = erpDb.getNode(nodeId);
      const sku = erpDb.getSku(skuId);

      if (!po || !inv || !node || !sku) {
        observation = {
          verified: false,
          reason: 'Post-action entity verification failed to find matching ERP state.',
        };
      } else {
        const totalPipeline = (inv.onHand - inv.reserved) + inv.incomingOnOrder;
        const daysOfSupply = inv.dailyBurnRate > 0 ? Number((totalPipeline / inv.dailyBurnRate).toFixed(1)) : 999;
        const storageUtilizationPct = Number(((node.currentUtilizedUnits / node.totalCapacityUnits) * 100).toFixed(1));
        const withinCapacity = storageUtilizationPct <= (node.maxUtilizationThreshold * 100) + 0.1;
        const poStatusConfirmed = po.status === 'CONFIRMED' || po.status === 'IN_TRANSIT';

        const discrepancies: string[] = [];
        if (!poStatusConfirmed) discrepancies.push(`PO ${poId} is in status ${po.status}, expected CONFIRMED.`);
        if (!withinCapacity) discrepancies.push(`Node ${nodeId} utilization is ${storageUtilizationPct}%, exceeding limit of ${node.maxUtilizationThreshold * 100}%.`);
        if (daysOfSupply < sku.targetSafetyStockDays * 0.75) discrepancies.push(`Projected days of supply (${daysOfSupply}d) falls significantly below safety stock target of ${sku.targetSafetyStockDays}d.`);

        observation = {
          verified: discrepancies.length === 0,
          poId,
          poStatus: po.status,
          currentPipelineUnits: totalPipeline,
          projectedDaysOfSupply: daysOfSupply,
          storageUtilizationPct,
          withinCapacityLimit: withinCapacity,
          discrepanciesCount: discrepancies.length,
          discrepancies,
          feedbackVerdict: discrepancies.length === 0 ? 'CLOSED_LOOP_VERIFIED_OPTIMAL' : 'ANOMALY_FLAGGED',
        };
      }
      break;
    }

    default:
      observation = { error: `Unknown tool name: ${name}` };
  }

  const durationMs = Date.now() - startTime;
  return { observation, durationMs };
}
