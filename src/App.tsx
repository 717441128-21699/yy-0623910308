import { Navbar } from '@/components/Navbar';
import { DashboardPage } from '@/pages/DashboardPage';
import { NodesPage } from '@/pages/NodesPage';
import { WatchlistPage } from '@/pages/WatchlistPage';
import { WatchModal } from '@/components/watchlist/WatchModal';
import { useAppStore } from '@/store/useAppStore';

export default function App() {
  const currentView = useAppStore((state) => state.currentView);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="fixed inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        <Navbar />

        <main>
          {currentView === 'dashboard' && <DashboardPage />}
          {currentView === 'nodes' && <NodesPage />}
          {currentView === 'watchlist' && <WatchlistPage />}
        </main>

        <footer className="py-6 text-center text-xs text-slate-600 border-t border-slate-800/50">
          Pulse 口碑观察 · 用数据代替印象
        </footer>

        <WatchModal />
      </div>
    </div>
  );
}
