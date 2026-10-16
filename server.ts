/**
 * ApexProcure — AI Purchasing Agent Full-Stack Server
 * Express Backend + Vite Middleware (Dev) & Static Serve (Prod)
 */
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { erpDb } from './src/server/erpDatabase.js';
import { purchasingAgent } from './src/server/purchasingAgent.js';
import { runFullEvaluationSuite } from './src/server/evaluationSuite.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    const geminiAvailable = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && !purchasingAgent.isQuotaExhausted);
    res.json({
      status: 'healthy',
      app: 'ApexProcure AI Purchasing Agent',
      geminiConfigured: geminiAvailable,
      engineMode: geminiAvailable ? 'Gemini 3.8 Flash' : 'Hybrid ReAct Expert Engine',
      timestamp: new Date().toISOString(),
    });
  });

  // Get ERP State Snapshot
  app.get('/api/erp/state', (req, res) => {
    try {
      const snapshot = erpDb.getFullSnapshot();
      res.json({ success: true, data: snapshot });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Reset ERP to defaults
  app.post('/api/erp/reset', (req, res) => {
    try {
      erpDb.resetToDefaults();
      res.json({ success: true, message: 'ERP state reset to baseline.' });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Set Scenario State
  app.post('/api/erp/set-scenario', (req, res) => {
    try {
      const scenarioNumber = parseInt(req.body.scenarioNumber, 10) || 1;
      erpDb.setScenarioState(scenarioNumber);
      res.json({
        success: true,
        scenarioNumber,
        snapshot: erpDb.getFullSnapshot(),
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Run Purchasing Agent
  app.post('/api/agent/run', async (req, res) => {
    try {
      const {
        scenarioNumber,
        scenarioTitle,
        skuId,
        nodeId,
        recommendedQuantity,
        existingPoId,
        userPrompt,
        autonomousMode,
      } = req.body;

      if (!skuId || !nodeId) {
        return res.status(400).json({ success: false, error: 'skuId and nodeId are required' });
      }

      const result = await purchasingAgent.runPurchasingTask({
        scenarioNumber,
        scenarioTitle: scenarioTitle || `Purchasing Review for ${skuId}`,
        skuId,
        nodeId,
        recommendedQuantity: recommendedQuantity ? parseInt(recommendedQuantity, 10) : undefined,
        existingPoId,
        userPrompt: userPrompt || 'Review inventory and purchasing requirements.',
        autonomousMode: autonomousMode !== false,
      });

      res.json({ success: true, data: result, updatedERP: erpDb.getFullSnapshot() });
    } catch (err: any) {
      console.error('Error running agent:', err);
      res.status(500).json({ success: false, error: err.message || 'Failed to run agent' });
    }
  });

  // Human Approval endpoint
  app.post('/api/agent/approve', (req, res) => {
    try {
      const { poId, approved, buyerNotes } = req.body;
      const po = erpDb.getAllPOs().find(p => p.id === poId);
      if (!po) {
        return res.status(404).json({ success: false, error: `PO ${poId} not found` });
      }

      po.status = approved ? 'CONFIRMED' : 'REJECTED';
      po.notes = `${po.notes || ''} [Human Buyer ${approved ? 'APPROVED' : 'REJECTED'}: ${buyerNotes || 'Signed off'}]`;

      res.json({
        success: true,
        po,
        message: `PO ${poId} status set to ${po.status}`,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // Run Evaluation Benchmark Suite
  app.post('/api/eval/run-all', async (req, res) => {
    try {
      const evalReport = await runFullEvaluationSuite();
      res.json({ success: true, report: evalReport });
    } catch (err: any) {
      console.error('Evaluation suite error:', err);
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // --- Vite Dev Server Middleware or Static Production Build ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ApexProcure AI Purchasing Agent server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
