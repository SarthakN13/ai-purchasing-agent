/**
 * ApexProcure — AI Purchasing Agent Domain Types
 */

export type NodeId = 'NODE-NORTH-MFC' | 'NODE-CENTRAL-DC' | 'NODE-SOUTH-MFC';

export interface FulfillmentNode {
  id: NodeId;
  name: string;
  type: 'Dark Store (MFC)' | 'Central Distribution Center' | 'Micro-Hub';
  totalCapacityUnits: number;
  currentUtilizedUnits: number;
  totalCapacityM3: number;
  currentUtilizedM3: number;
  maxUtilizationThreshold: number; // e.g. 0.90 (90%)
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  leadTimeDays: number;
  moq: number; // Minimum Order Quantity
  unitCost: number;
  reliabilityScore: number; // 0 - 100
  tier: 'Primary' | 'Secondary' | 'Backup';
  isExpeditedAvailable: boolean;
  expeditedLeadTimeDays?: number;
  expeditedCostMultiplier?: number;
  activeStatus: boolean;
  notes?: string;
}

export interface SKU {
  id: string;
  name: string;
  category: string;
  unitCost: number;
  retailPrice: number;
  unitVolumeM3: number; // cubic meters per unit
  shelfLifeDays: number;
  targetSafetyStockDays: number;
  minBatchSize: number;
}

export interface NodeInventory {
  skuId: string;
  nodeId: NodeId;
  onHand: number;
  reserved: number;
  incomingOnOrder: number;
  dailyBurnRate: number; // units sold per day
  demandTrendFactor: number; // 1.0 = normal, 2.4 = +140% spike
  lastUpdated: string;
}

export type POStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'SUBMITTED' 
  | 'CONFIRMED' 
  | 'PARTIALLY_ACCEPTED' 
  | 'REJECTED' 
  | 'IN_TRANSIT' 
  | 'DELIVERED' 
  | 'CANCELLED';

export interface PurchaseOrder {
  id: string;
  skuId: string;
  supplierId: string;
  targetNodeId: NodeId;
  quantity: number;
  unitCost: number;
  totalCost: number;
  status: POStatus;
  leadTimeDays: number;
  createdAt: string;
  expectedDeliveryDate: string;
  notes?: string;
  isExpedited?: boolean;
  splitFromPoId?: string;
}

export interface BudgetLedger {
  category: string;
  nodeId: NodeId;
  monthlyAllocation: number;
  spentToDate: number;
  committedPOs: number;
  available: number;
  currency: string;
}

export type AgentDecisionType = 
  | 'ACCEPT' 
  | 'MODIFY' 
  | 'REJECT' 
  | 'INVESTIGATE_FURTHER' 
  | 'SPLIT_ORDER' 
  | 'SOURCE_ALTERNATE' 
  | 'ESCALATE_TO_BUYER';

export interface ToolCallTrace {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  observation: Record<string, unknown>;
  timestamp: string;
  durationMs: number;
}

export interface PreFlightCheck {
  rule: string;
  passed: boolean;
  detail: string;
}

export interface FeedbackValidationResult {
  step: 'PRE_FLIGHT' | 'SUPPLIER_EXECUTION' | 'POST_ACTION_VERIFICATION' | 'FEEDBACK_RECOVERY';
  success: boolean;
  metrics: {
    stockoutRiskAvoided: boolean;
    storageLimitExceeded: boolean;
    budgetLimitExceeded: boolean;
    moqRespected: boolean;
    projectedDaysOfSupply: number;
    newTotalSpend: number;
  };
  discrepancies: string[];
  remedyActionTaken?: string;
  validationVerdict: 'VERIFIED_ACCEPTABLE' | 'DEVIATION_CORRECTED' | 'FAILED_ESCALATED';
}

export interface AgentExecutionResult {
  runId: string;
  scenarioId: string;
  scenarioTitle: string;
  timestamp: string;
  thoughtSummary: string;
  toolCalls: ToolCallTrace[];
  decision: {
    action: AgentDecisionType;
    recommendedQuantity: number;
    targetSupplierId: string;
    targetNodeId: NodeId;
    confidenceScore: number;
    reasoning: string[];
    riskFactors: string[];
    tradeOffsConsidered: string[];
  };
  preFlightChecks: PreFlightCheck[];
  executionActions: {
    actionType: string;
    poId?: string;
    secondaryPoId?: string;
    details: string;
  }[];
  validationResult: FeedbackValidationResult;
  requiresBuyerApproval: boolean;
  approvalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED';
}

export interface ScenarioDefinition {
  id: string;
  number: number;
  title: string;
  shortDescription: string;
  fullSituation: string;
  initialRecommendation?: {
    skuId: string;
    nodeId: NodeId;
    quantity: number;
    supplierId: string;
  };
  triggerType: 'RECOMMENDATION_REVIEW' | 'SUPPLIER_SHORTFALL' | 'DEMAND_SURGE' | 'CONSTRAINT_CONFLICT' | 'CUSTOM';
  expectedOutcome: string;
}

export interface EvaluationScenarioResult {
  scenarioId: string;
  scenarioName: string;
  passed: boolean;
  score: number; // 0 - 100
  criteria: {
    name: string;
    met: boolean;
    detail: string;
  }[];
  durationMs: number;
  agentDecision: AgentDecisionType;
  validationVerdict: string;
  notes: string;
}
