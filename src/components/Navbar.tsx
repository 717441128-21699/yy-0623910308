import { LayoutDashboard, GitBranch, Eye } from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { cn } from '@/lib/utils';

const navItems = [
  { id: 'dashboard' as const, label: '总览看板', icon: LayoutDashboard },
  { id: 'nodes' as const, label: '节点分析', icon: GitBranch },
  { id: 'watchlist' as const, label: '观察清单', icon: Eye },
];

export function Navbar() {
  const currentView = useAppStore((state) => state.currentView);
  const setCurrentView = useAppStore((state) => state.setCurrentView);

  return (
    <header className="h-16 border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
      <div className="h-full px-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">P</span>
          </div>
          <div>
            <h1 className="text-base font-semibold text-white">Pulse 口碑观察</h1>
            <p className="text-xs text-slate-400">社区温度 · 版本节点 · 风险备忘</p>
          </div>
        </div>

        <nav className="flex items-center gap-1 bg-slate-800/50 p-1 rounded-lg">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-slate-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                )}
              >
                <Icon size={16} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-slate-400">当前项目</p>
            <p className="text-sm font-medium text-white">星之契约</p>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 flex items-center justify-center text-white text-sm font-medium">
            制
          </div>
        </div>
      </div>
    </header>
  );
}
