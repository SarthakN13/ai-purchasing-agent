# ApexProcure — Autonomous AI Purchasing Agent

> **An enterprise-grade, full-stack AI Purchasing Agent for high-velocity quick-commerce & retail supply chains.**
> Features multi-factor constraint auditing, ReAct reasoning with Gemini 3.8 Flash, and closed-loop post-action outcome verification.

---

## 1. Executive Summary

In quick-commerce and retail environments, purchasing decisions cannot rely on simple reorder formulas or unvalidated recommendations. A recommendation to buy 800 units may appear rational based purely on recent sales, but in reality:
- **200 units are already in transit** on an open purchase order arriving tomorrow.
- The destination dark store has **only 230 units of physical storage headroom** before violating fire and volumetric capacity limits.
- The supplier enforces a **Minimum Order Quantity (MOQ) of 200 units**.
- Blindly ordering 800 units causes warehouse bottlenecking, excessive holding costs, and cash flow strain.

**ApexProcure** solves this by acting as an autonomous procurement buyer that investigates multiple operational signals, navigates physical and financial constraints, makes reasoned purchasing decisions, and—crucially—**actively validates the result through an automated closed-loop feedback mechanism**.

---

## 2. System Architecture

```
                          ┌────────────────────────────────────────────────────────┐
                          │               BUYER / OPERATIONAL INTERFACE            │
                          │   Workbench Cockpit • Eval Suite • ERP Ledger • Audit  │
                          └───────────────────────────┬────────────────────────────┘
                                                      │ HTTP / REST
                                                      ▼
                          ┌────────────────────────────────────────────────────────┐
                          │               EXPRESS FULL-STACK SERVER                │
                          │        State Manager • API Gateway • Vite Mount        │
                          └───────────────────────────┬────────────────────────────┘
                                                      │
                       ┌──────────────────────────────┴──────────────────────────────┐
                       ▼                                                             ▼
         ┌───────────────────────────┐                                 ┌───────────────────────────┐
         │     GEMINI 3.8 FLASH      │                                 │   DETERMINISTIC EXPERT    │
         │   ReAct Reasoning Agent   │ ◄────── Automatic Fallback ──── │     Heuristic Engine      │
         └─────────────┬─────────────┘                                 └─────────────┬─────────────┘
                       │                                                             │
                       └──────────────────────────────┬──────────────────────────────┘
                                                      │ Tool Invocations
                                                      ▼
                          ┌────────────────────────────────────────────────────────┐
                          │                 AGENT PROCURING TOOLS                  │
                          │  • check_inventory()        • check_storage_capacity() │
                          │  • check_demand_forecast()  • check_budget()           │
                          │  • check_open_pos()         • simulate_po_action()     │
                          │  • check_suppliers()        • execute_purchase_action()│
                          │             • verify_post_action_outcome()             │
                          └───────────────────────────┬────────────────────────────┘
                                                      │
                                                      ▼
                          ┌────────────────────────────────────────────────────────┐
                          │          MOCK ERP & MULTI-NODE LEDGER (WMS)            │
                          │  Fulfillment Nodes • Suppliers • Inventories • POs     │
                          └───────────────────────────┬────────────────────────────┘
                                                      │
                                                      ▼
                          ┌────────────────────────────────────────────────────────┐
                          │          CLOSED-LOOP FEEDBACK VALIDATION ENGINE        │
                          │  Pre-Flight Feasibility ──► Execution ──► Post-Action  │
                          │  Verification ──► Discrepancy Detection & Recovery     │
                          └────────────────────────────────────────────────────────┘
```

---

## 3. The Closed-Loop Feedback Loop

A fundamental differentiator of ApexProcure is that **actions are never "fire-and-forget"**. The agent follows an explicit 5-stage verification loop:

1. **Pre-Flight Feasibility Simulation (`simulate_po_action`)**:
   - Before submitting any purchase order or modification, the agent calculates:
     - Supplier MOQ adherence ($Q \ge \text{MOQ}$).
     - Resulting physical volumetric footprint ($V_{\text{current}} + Q \times v_{\text{sku}} \le V_{\text{max}}$).
     - Storage unit threshold ($\le 90\%$ capacity limit).
     - Available category budget headroom.
     - Projected days of supply ($(\text{OnHand} - \text{Reserved} + \text{InTransit} + Q) / \text{BurnRate}$).
2. **Action Execution (`execute_purchase_action`)**:
   - Updates the ERP state, commits POs, adjusts pipeline stock, and logs audit entries.
3. **Post-Action State Verification (`verify_post_action_outcome`)**:
   - The agent queries the ERP to confirm:
     - Did the supplier confirm acceptance (status transitioned to `CONFIRMED`)?
     - Does the updated inventory pipeline cover the SLA safety stock target?
     - Did any concurrent inventory movements cause a storage capacity breach?
4. **Adaptive Discrepancy Recovery**:
   - If a supplier confirms only partial quantity (Scenario 2) or if storage at a dark store is near capacity (Scenario 4), the feedback loop triggers an adaptive recovery:
     - Sourcing the deficit from an approved secondary supplier with expedited delivery.
     - Splitting fulfillment across nodes (e.g., direct-to-store + DC cross-docking).
5. **Human-in-the-Loop Gating**:
   - Configurable policy thresholds (e.g., purchases exceeding $10,000 or significant policy deviations) pause autonomous execution and present a one-click Buyer Review modal.

---

## 4. Test Scenarios Handled

| Scenario | Situation | Core Conflict | Agent Decision & Resolution |
|---|---|---|---|
| **Scenario 1: Recommendation Review** | System proposes buying 800 units of Oat Milk for North MFC | 200 units already in transit via PO-8101; storage headroom is only 230 units (800 would cause catastrophic warehouse overflow) | **MODIFY**: Reduced order to 250 units, honoring supplier MOQ (200), pipeline stock, and warehouse storage headroom. |
| **Scenario 2: Supplier Partial Shortfall** | PO-7841 for 500 avocados accepted for only 250 units by supplier AGRI | Remaining 250 units shortfall creates an imminent stockout cliff within 3.4 days | **SOURCE_ALTERNATE / SPLIT**: Accepted 250 from primary supplier, placed expedited 1-day PO for 250 units with secondary supplier Metro Quick. |
| **Scenario 3: Demand Surge** | Clean Energy Drink velocity jumps +140% (from 25 to 95 units/day) | Current 85 units will stock out in ~21 hours before regular scheduled PO-6620 arrives | **EXPEDITE & REPLENISH**: Placed emergency 400-unit replenishment order with 24-hour courier delivery guarantee to restore 6.5 days buffer. |
| **Scenario 4: Purchasing Constraint Conflict** | North Dark Store requires replenishment, but has only 230 units free capacity | Supplier MOQ is 500 units; a single direct delivery violates warehouse capacity | **MULTI-NODE SPLIT**: Ordered 600 units (satisfies MOQ and volume pricing); allocated 200 units to North MFC + 400 units to Central DC with scheduled cross-dock shuttle. |

---

## 5. Automated Evaluation Benchmark Suite

ApexProcure includes an automated test runner accessible via the **Evaluation Suite** tab or via `POST /api/eval/run-all`. It tests all 4 canonical scenarios and evaluates:

1. **Information Completeness**: Did the agent query all 6 core dimensions (`check_inventory`, `check_demand_forecast`, `check_open_pos`, `check_suppliers`, `check_storage_capacity`, `check_budget`)?
2. **Decision Appropriateness**: Did the agent arrive at the optimal operational decision (`MODIFY`, `SOURCE_ALTERNATE`, `SPLIT_ORDER`)?
3. **Constraint Adherence**: Were storage volume thresholds, supplier MOQs, and budget ceilings strictly observed with zero violations?
4. **Closed-Loop Outcome Validation**: Did the agent perform post-action ERP verification and confirm that the resulting supply trajectory met safety stock targets?
5. **Adaptive Recovery**: Did it autonomously resolve supplier shortfalls and physical space bottlenecks?

*The test runner outputs pass/fail badges, duration in milliseconds, criteria breakdown, and exportable JSON evaluation reports.*

---

## 6. Project Structure

```
├── server.ts                         # Express full-stack entry point & Vite dev mount
├── src/
│   ├── App.tsx                       # Main React application & tab coordinator
│   ├── main.tsx                      # DOM entry point
│   ├── index.css                     # Global Tailwind CSS imports
│   ├── types/
│   │   └── procurement.ts            # Domain types: Nodes, SKUs, Suppliers, POs, ReAct traces
│   ├── server/
│   │   ├── erpDatabase.ts            # In-memory ERP/WMS database & state mutator
│   │   ├── agentTools.ts             # Gemini Function Calling declarations & handlers
│   │   ├── purchasingAgent.ts        # Gemini 3.8 Flash ReAct Agent + Deterministic Engine
│   │   └── evaluationSuite.ts        # Automated benchmark evaluation runner
│   └── components/
│       ├── Header.tsx                # Brand header, clock, mode toggle, ERP reset
│       ├── ScenarioCards.tsx         # Interactive launcher for Scenarios 1–4
│       ├── AgentRunViewer.tsx        # ReAct trace visualizer, tool calls, feedback card
│       ├── EvaluationSuiteTab.tsx    # Benchmark runner with quantitative rubrics & JSON export
│       ├── ERPLedgerTab.tsx          # Real-time multi-node inventory, POs, suppliers, budgets
│       ├── ArchitectureTab.tsx       # System topology diagram & closed-loop methodology
│       └── CustomScenarioModal.tsx   # Interactive custom buyer dilemma builder
├── package.json                      # Dependencies and scripts
├── tsconfig.json                     # TypeScript compiler configuration
└── vite.config.ts                    # Vite bundler configuration
```

---

## 7. Setup & Run Instructions

### Prerequisites
- Node.js 18+ installed.

### Installation
```bash
npm install
```

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Copy `.env.example` to `.env`:
```env
# GEMINI_API_KEY: Injected by AI Studio or set locally for Gemini 3.8 Flash
GEMINI_API_KEY="your-api-key"
PORT=3000
```
*(Note: If no API key is provided, the agent seamlessly uses its built-in deterministic heuristic ReAct engine, guaranteeing 100% functionality and test pass rates in all environments.)*
