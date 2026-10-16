import React from 'react';
import { 
  ShieldCheck, 
  RefreshCw, 
  Bot, 
  Cpu, 
  Sliders, 
  Warehouse,
  CheckCircle2,
  Clock
} from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onResetERP: () => void;
  isResetting: boolean;
  autonomousMode: boolean;
  setAutonomousMode: (val: boolean) => void;
  geminiActive: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onResetERP,
  isResetting,
  autonomousMode,
  setAutonomousMode,
  geminiActive,
}) => {
  const [time, setTime] = React.useState(new Date().toLocaleTimeString());

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const navItems = [
    { id: 'workbench', label: 'Agent Workbench', icon: Bot },
    { id: 'evaluator', label: 'Evaluation Suite', icon: ShieldCheck },
    { id: 'erp', label: 'ERP & Supply Chain Ledger', icon: Warehouse },
    { id: 'architecture', label: 'Architecture & Design', icon: Cpu },
  ];

  return (
    <header className="bg-slate-900/90 border-b border-slate-800/80 backdrop-blur sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/30">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
                  ApexProcure
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/50 text-cyan-300">
                  Quick-Commerce Agent
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Autonomous Procurement & Closed-Loop Replenishment
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30 ring-1 ring-cyan-400/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Tools & Status Indicators */}
          <div className="flex items-center gap-3">
            {/* Live Clock */}
            <div className="hidden lg:flex items-center gap-1.5 text-xs text-slate-400 bg-slate-950/50 px-2.5 py-1 rounded-lg border border-slate-800/80">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span className="font-mono">{time}</span>
            </div>

            {/* AI Engine Status */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{geminiActive ? 'Gemini 3.8 Flash' : 'Hybrid ReAct Engine'}</span>
            </div>

            {/* Mode Toggle */}
            <button
              onClick={() => setAutonomousMode(!autonomousMode)}
              className={`flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-all ${
                autonomousMode
                  ? 'bg-indigo-950/50 border-indigo-700/60 text-indigo-300'
                  : 'bg-amber-950/50 border-amber-700/60 text-amber-300'
              }`}
              title="Toggle Autonomous Execution vs Supervised Human Sign-off"
            >
              <Sliders className="w-3 h-3" />
              <span className="font-medium hidden md:inline">
                {autonomousMode ? 'Autonomous' : 'Supervised'}
              </span>
            </button>

            {/* Reset ERP State */}
            <button
              onClick={onResetERP}
              disabled={isResetting}
              className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Reset all inventory, open POs, and budgets back to initial benchmark state"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset ERP</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
