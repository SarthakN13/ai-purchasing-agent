/**
 * Mock ERP & Supply Chain Database with In-Memory State & Reset
 */
import {
  FulfillmentNode,
  Supplier,
  SKU,
  NodeInventory,
  PurchaseOrder,
  BudgetLedger,
  NodeId,
} from '../types/procurement.js';

export class ERPDatabase {
  private nodes: Map<NodeId, FulfillmentNode> = new Map();
  private suppliers: Map<string, Supplier> = new Map();
  private skus: Map<string, SKU> = new Map();
  private inventories: Map<string, NodeInventory> = new Map(); // key: `${skuId}#${nodeId}`
  private purchaseOrders: Map<string, PurchaseOrder> = new Map();
  private budgets: Map<string, BudgetLedger> = new Map(); // key: `${category}#${nodeId}`
  private simulatedSupplierFailures: Map<string, 'SHORTFALL_50' | 'PRICE_INCREASE' | 'OUT_OF_STOCK'> = new Map();

  constructor() {
    this.resetToDefaults();
  }

  public resetToDefaults() {
    this.nodes.clear();
    this.suppliers.clear();
    this.skus.clear();
    this.inventories.clear();
    this.purchaseOrders.clear();
    this.budgets.clear();
    this.simulatedSupplierFailures.clear();

    // 1. Fulfillment Nodes
    const defaultNodes: FulfillmentNode[] = [
      {
        id: 'NODE-NORTH-MFC',
        name: 'North Dark Store (MFC)',
        type: 'Dark Store (MFC)',
        totalCapacityUnits: 1200,
        currentUtilizedUnits: 850,
        totalCapacityM3: 4.5,
        currentUtilizedM3: 3.2,
        maxUtilizationThreshold: 0.90, // 90%
        location: 'Downtown North Zone',
      },
      {
        id: 'NODE-CENTRAL-DC',
        name: 'Central Distribution Center',
        type: 'Central Distribution Center',
        totalCapacityUnits: 15000,
        currentUtilizedUnits: 8200,
        totalCapacityM3: 65.0,
        currentUtilizedM3: 34.0,
        maxUtilizationThreshold: 0.92,
        location: 'Industrial Logistics Hub B',
      },
      {
        id: 'NODE-SOUTH-MFC',
        name: 'South Dark Store (MFC)',
        type: 'Dark Store (MFC)',
        totalCapacityUnits: 900,
        currentUtilizedUnits: 550,
        totalCapacityM3: 3.2,
        currentUtilizedM3: 1.9,
        maxUtilizationThreshold: 0.88,
        location: 'South Metro Hub',
      },
    ];
    defaultNodes.forEach(n => this.nodes.set(n.id, { ...n }));

    // 2. SKUs
    const defaultSkus: SKU[] = [
      {
        id: 'SKU-OAT-101',
        name: 'Barista Organic Oat Milk 1L',
        category: 'Dairy & Alternatives',
        unitCost: 2.20,
        retailPrice: 4.50,
        unitVolumeM3: 0.0016, // ~1.6L volume
        shelfLifeDays: 90,
        targetSafetyStockDays: 3,
        minBatchSize: 50,
      },
      {
        id: 'SKU-AVO-202',
        name: 'Hass Ready-to-Eat Avocados 4-pack',
        category: 'Fresh Produce',
        unitCost: 3.10,
        retailPrice: 5.99,
        unitVolumeM3: 0.0022,
        shelfLifeDays: 6,
        targetSafetyStockDays: 2,
        minBatchSize: 50,
      },
      {
        id: 'SKU-ENE-303',
        name: 'ZenPulse Clean Energy Elixir 12pk',
        category: 'Functional Beverages',
        unitCost: 16.50,
        retailPrice: 29.99,
        unitVolumeM3: 0.012,
        shelfLifeDays: 180,
        targetSafetyStockDays: 4,
        minBatchSize: 20,
      },
      {
        id: 'SKU-KBR-404',
        name: 'Artisanal Ancient Grain Sourdough',
        category: 'Bakery',
        unitCost: 2.80,
        retailPrice: 6.25,
        unitVolumeM3: 0.0035,
        shelfLifeDays: 3,
        targetSafetyStockDays: 1,
        minBatchSize: 30,
      },
    ];
    defaultSkus.forEach(s => this.skus.set(s.id, { ...s }));

    // 3. Suppliers
    const defaultSuppliers: Supplier[] = [
      {
        id: 'SUP-VALLEY',
        name: 'Valley Organics Co.',
        leadTimeDays: 3,
        moq: 200,
        unitCost: 2.20,
        reliabilityScore: 96,
        tier: 'Primary',
        isExpeditedAvailable: true,
        expeditedLeadTimeDays: 1,
        expeditedCostMultiplier: 1.15,
        activeStatus: true,
        notes: 'Consistent supplier for oat milk and plant beverages.',
      },
      {
        id: 'SUP-METRO',
        name: 'Metro Quick Logistics & Sourcing',
        leadTimeDays: 1,
        moq: 100,
        unitCost: 3.30, // slight premium over $3.10
        reliabilityScore: 91,
        tier: 'Secondary',
        isExpeditedAvailable: true,
        expeditedLeadTimeDays: 1,
        expeditedCostMultiplier: 1.10,
        activeStatus: true,
        notes: 'High-speed urban backup supplier, rapid turnaround within 24h.',
      },
      {
        id: 'SUP-AGRI',
        name: 'Global Agri-Fresh Producers',
        leadTimeDays: 4,
        moq: 250,
        unitCost: 3.10,
        reliabilityScore: 84,
        tier: 'Primary',
        isExpeditedAvailable: false,
        activeStatus: true,
        notes: 'Primary avocado grower cooperative, occasional crop yields flux.',
      },
      {
        id: 'SUP-EXPRESS',
        name: 'Express Beverage Distro Ltd',
        leadTimeDays: 2,
        moq: 50,
        unitCost: 16.50,
        reliabilityScore: 94,
        tier: 'Primary',
        isExpeditedAvailable: true,
        expeditedLeadTimeDays: 1,
        expeditedCostMultiplier: 1.08,
        activeStatus: true,
        notes: 'Direct distributor for ZenPulse energy drinks.',
      },
    ];
    defaultSuppliers.forEach(sup => this.suppliers.set(sup.id, { ...sup }));

    // 4. Inventories
    const defaultInventories: NodeInventory[] = [
      // SKU-OAT-101 in North MFC (Scenario 1 default)
      {
        skuId: 'SKU-OAT-101',
        nodeId: 'NODE-NORTH-MFC',
        onHand: 220,
        reserved: 30,
        incomingOnOrder: 200, // arriving tomorrow via PO-8101
        dailyBurnRate: 68,
        demandTrendFactor: 1.0,
        lastUpdated: new Date().toISOString(),
      },
      // SKU-AVO-202 in Central DC (Scenario 2 default)
      {
        skuId: 'SKU-AVO-202',
        nodeId: 'NODE-CENTRAL-DC',
        onHand: 110,
        reserved: 20,
        incomingOnOrder: 500, // PO-7841 incoming
        dailyBurnRate: 105,
        demandTrendFactor: 1.0,
        lastUpdated: new Date().toISOString(),
      },
      // SKU-ENE-303 in South MFC (Scenario 3 default)
      {
        skuId: 'SKU-ENE-303',
        nodeId: 'NODE-SOUTH-MFC',
        onHand: 85,
        reserved: 15,
        incomingOnOrder: 150, // PO-6620
        dailyBurnRate: 95, // spiked from baseline 25!
        demandTrendFactor: 2.4, // +140% spike
        lastUpdated: new Date().toISOString(),
      },
      // SKU-OAT-101 in Central DC (For Scenario 4 cross-docking)
      {
        skuId: 'SKU-OAT-101',
        nodeId: 'NODE-CENTRAL-DC',
        onHand: 1400,
        reserved: 200,
        incomingOnOrder: 0,
        dailyBurnRate: 180,
        demandTrendFactor: 1.0,
        lastUpdated: new Date().toISOString(),
      },
    ];
    defaultInventories.forEach(inv => {
      this.inventories.set(`${inv.skuId}#${inv.nodeId}`, { ...inv });
    });

    // 5. Existing Open Purchase Orders
    const defaultPOs: PurchaseOrder[] = [
      {
        id: 'PO-8101',
        skuId: 'SKU-OAT-101',
        supplierId: 'SUP-VALLEY',
        targetNodeId: 'NODE-NORTH-MFC',
        quantity: 200,
        unitCost: 2.20,
        totalCost: 440.00,
        status: 'IN_TRANSIT',
        leadTimeDays: 3,
        createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 1 * 86400000).toISOString(),
        notes: 'Routine weekly replenishment',
      },
      {
        id: 'PO-7841',
        skuId: 'SKU-AVO-202',
        supplierId: 'SUP-AGRI',
        targetNodeId: 'NODE-CENTRAL-DC',
        quantity: 500,
        unitCost: 3.10,
        totalCost: 1550.00,
        status: 'PARTIALLY_ACCEPTED', // Supplier can only fulfill 250!
        leadTimeDays: 4,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        notes: 'Supplier update: Packhouse short-yield; only 250 units confirmed.',
      },
      {
        id: 'PO-6620',
        skuId: 'SKU-ENE-303',
        supplierId: 'SUP-EXPRESS',
        targetNodeId: 'NODE-SOUTH-MFC',
        quantity: 150,
        unitCost: 16.50,
        totalCost: 2475.00,
        status: 'CONFIRMED',
        leadTimeDays: 2,
        createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
        expectedDeliveryDate: new Date(Date.now() + 2 * 86400000).toISOString(),
        notes: 'Regular reorder cycle before viral demand surge.',
      },
    ];
    defaultPOs.forEach(po => this.purchaseOrders.set(po.id, { ...po }));

    // 6. Budgets
    const defaultBudgets: BudgetLedger[] = [
      {
        category: 'Dairy & Alternatives',
        nodeId: 'NODE-NORTH-MFC',
        monthlyAllocation: 10000,
        spentToDate: 4200,
        committedPOs: 1200,
        available: 4600,
        currency: 'USD',
      },
      {
        category: 'Fresh Produce',
        nodeId: 'NODE-CENTRAL-DC',
        monthlyAllocation: 25000,
        spentToDate: 12400,
        committedPOs: 3100,
        available: 9500,
        currency: 'USD',
      },
      {
        category: 'Functional Beverages',
        nodeId: 'NODE-SOUTH-MFC',
        monthlyAllocation: 15000,
        spentToDate: 8100,
        committedPOs: 2475,
        available: 4425,
        currency: 'USD',
      },
      {
        category: 'Dairy & Alternatives',
        nodeId: 'NODE-CENTRAL-DC',
        monthlyAllocation: 35000,
        spentToDate: 18000,
        committedPOs: 4200,
        available: 12800,
        currency: 'USD',
      },
    ];
    defaultBudgets.forEach(b => this.budgets.set(`${b.category}#${b.nodeId}`, { ...b }));
  }

  // --- Query Methods ---

  public getNode(nodeId: NodeId): FulfillmentNode | undefined {
    return this.nodes.get(nodeId);
  }

  public getAllNodes(): FulfillmentNode[] {
    return Array.from(this.nodes.values());
  }

  public getSupplier(supplierId: string): Supplier | undefined {
    return this.suppliers.get(supplierId);
  }

  public getAllSuppliers(): Supplier[] {
    return Array.from(this.suppliers.values());
  }

  public getSku(skuId: string): SKU | undefined {
    return this.skus.get(skuId);
  }

  public getAllSkus(): SKU[] {
    return Array.from(this.skus.values());
  }

  public getInventory(skuId: string, nodeId: NodeId): NodeInventory | undefined {
    return this.inventories.get(`${skuId}#${nodeId}`);
  }

  public getAllInventories(): NodeInventory[] {
    return Array.from(this.inventories.values());
  }

  public getOpenPOs(skuId?: string, nodeId?: NodeId): PurchaseOrder[] {
    return Array.from(this.purchaseOrders.values()).filter(po => {
      if (skuId && po.skuId !== skuId) return false;
      if (nodeId && po.targetNodeId !== nodeId) return false;
      return po.status !== 'CANCELLED' && po.status !== 'DELIVERED';
    });
  }

  public getAllPOs(): PurchaseOrder[] {
    return Array.from(this.purchaseOrders.values());
  }

  public getBudget(category: string, nodeId: NodeId): BudgetLedger | undefined {
    return this.budgets.get(`${category}#${nodeId}`);
  }

  public getAllBudgets(): BudgetLedger[] {
    return Array.from(this.budgets.values());
  }

  // --- Mutators & Actions ---

  public createPurchaseOrder(data: {
    skuId: string;
    supplierId: string;
    targetNodeId: NodeId;
    quantity: number;
    unitCost?: number;
    isExpedited?: boolean;
    notes?: string;
    splitFromPoId?: string;
  }): { success: boolean; po?: PurchaseOrder; error?: string } {
    const sku = this.skus.get(data.skuId);
    const supplier = this.suppliers.get(data.supplierId);
    const node = this.nodes.get(data.targetNodeId);

    if (!sku || !supplier || !node) {
      return { success: false, error: 'Invalid SKU, Supplier, or Node identifier.' };
    }

    const unitCost = data.unitCost ?? (
      data.isExpedited && supplier.expeditedCostMultiplier 
        ? supplier.unitCost * supplier.expeditedCostMultiplier 
        : supplier.unitCost
    );
    const totalCost = Number((data.quantity * unitCost).toFixed(2));

    const poId = `PO-${Math.floor(1000 + Math.random() * 9000)}`;
    const leadTime = data.isExpedited && supplier.expeditedLeadTimeDays 
      ? supplier.expeditedLeadTimeDays 
      : supplier.leadTimeDays;

    const newPO: PurchaseOrder = {
      id: poId,
      skuId: data.skuId,
      supplierId: data.supplierId,
      targetNodeId: data.targetNodeId,
      quantity: data.quantity,
      unitCost,
      totalCost,
      status: 'CONFIRMED',
      leadTimeDays: leadTime,
      createdAt: new Date().toISOString(),
      expectedDeliveryDate: new Date(Date.now() + leadTime * 86400000).toISOString(),
      notes: data.notes,
      isExpedited: data.isExpedited,
      splitFromPoId: data.splitFromPoId,
    };

    this.purchaseOrders.set(poId, newPO);

    // Update inventory incomingOnOrder
    const inv = this.getInventory(data.skuId, data.targetNodeId);
    if (inv) {
      inv.incomingOnOrder += data.quantity;
      inv.lastUpdated = new Date().toISOString();
    }

    // Update budget committed
    const budget = this.getBudget(sku.category, data.targetNodeId);
    if (budget) {
      budget.committedPOs += totalCost;
      budget.available = Math.max(0, budget.available - totalCost);
    }

    // Update node capacity
    const volumeIncrease = data.quantity * sku.unitVolumeM3;
    node.currentUtilizedUnits += data.quantity;
    node.currentUtilizedM3 = Number((node.currentUtilizedM3 + volumeIncrease).toFixed(3));

    return { success: true, po: newPO };
  }

  public modifyPurchaseOrder(poId: string, updates: Partial<PurchaseOrder>): { success: boolean; po?: PurchaseOrder; error?: string } {
    const po = this.purchaseOrders.get(poId);
    if (!po) return { success: false, error: `PO ${poId} not found.` };

    const oldQuantity = po.quantity;
    const oldTotal = po.totalCost;

    Object.assign(po, updates);

    if (updates.quantity !== undefined && updates.quantity !== oldQuantity) {
      po.totalCost = Number((po.quantity * po.unitCost).toFixed(2));
      const sku = this.skus.get(po.skuId);
      const inv = this.getInventory(po.skuId, po.targetNodeId);
      const node = this.nodes.get(po.targetNodeId);
      const budget = sku ? this.getBudget(sku.category, po.targetNodeId) : undefined;

      const diffQuantity = po.quantity - oldQuantity;
      const diffCost = po.totalCost - oldTotal;

      if (inv) inv.incomingOnOrder += diffQuantity;
      if (node && sku) {
        node.currentUtilizedUnits += diffQuantity;
        node.currentUtilizedM3 = Number((node.currentUtilizedM3 + diffQuantity * sku.unitVolumeM3).toFixed(3));
      }
      if (budget) {
        budget.committedPOs += diffCost;
        budget.available = Math.max(0, budget.available - diffCost);
      }
    }

    return { success: true, po };
  }

  public setScenarioState(scenarioNumber: number) {
    this.resetToDefaults();

    if (scenarioNumber === 1) {
      // Scenario 1: Recommends 800 units for North MFC.
      // North MFC currently has 850 units utilized out of 1200 (max threshold 90% = 1080 units max -> room for 230 units!).
      // Inventory: onHand 220, incoming PO-8101 = 200 units, burn = 68/day.
      // Ordering 800 would cause catastrophic warehouse overflow (850 + 800 = 1650 > 1200) and excessive days of supply!
      // Ideal order: 200 - 250 units (respecting supplier MOQ 200).
    } else if (scenarioNumber === 2) {
      // Scenario 2: PO-7841 was for 500 avocados, supplier confirms only 250.
      const po = this.purchaseOrders.get('PO-7841');
      if (po) {
        po.status = 'PARTIALLY_ACCEPTED';
        po.notes = 'Supplier AGRI confirmed only 250 units out of 500 available due to harvest yield loss.';
      }
      const inv = this.getInventory('SKU-AVO-202', 'NODE-CENTRAL-DC');
      if (inv) {
        inv.incomingOnOrder = 250; // reflected shortfall
      }
    } else if (scenarioNumber === 3) {
      // Scenario 3: Clean Energy Drink sudden viral surge
      const inv = this.getInventory('SKU-ENE-303', 'NODE-SOUTH-MFC');
      if (inv) {
        inv.dailyBurnRate = 110; // high burn
        inv.demandTrendFactor = 2.8;
      }
    } else if (scenarioNumber === 4) {
      // Scenario 4: Purchasing constraint - North MFC has only 250 units remaining capacity,
      // but supplier MOQ is 500 units! Cannot order 500 to North MFC.
      // Must multi-node split with Central DC (which has plenty of room: 6800 units free).
      const north = this.nodes.get('NODE-NORTH-MFC');
      if (north) {
        north.currentUtilizedUnits = 880; // 1080 - 880 = 200 units headroom before 90% threshold (1080)
      }
      const inv = this.getInventory('SKU-OAT-101', 'NODE-NORTH-MFC');
      if (inv) {
        inv.onHand = 120;
        inv.incomingOnOrder = 0;
        inv.dailyBurnRate = 75;
      }
    }
  }

  public getFullSnapshot() {
    return {
      nodes: this.getAllNodes(),
      suppliers: this.getAllSuppliers(),
      skus: this.getAllSkus(),
      inventories: this.getAllInventories(),
      purchaseOrders: this.getAllPOs(),
      budgets: this.getAllBudgets(),
    };
  }
}

export const erpDb = new ERPDatabase();
