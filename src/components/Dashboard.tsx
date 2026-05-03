import React from 'react';
import { TransactionForm } from './TransactionForm';
import { ChartsCarousel } from './ChartsCarousel';
import { AssetList } from './AssetList';
import { KryptonAdvisor } from './KryptonAdvisor';
import { usePortfolio, calculateStats } from '../hooks/usePortfolio';
import { useBinancePrices } from '../hooks/useBinancePrices';
import { formatCurrency } from '../lib/utils';
import { auth } from '../lib/firebase';
import { LogOut, User } from 'lucide-react';

export function Dashboard() {
  const { transactions, addTransaction, removeTransaction } = usePortfolio();
  
  // Get unique assets to fetch prices
  const assets = React.useMemo(() => {
    const list = Array.from(new Set(transactions.map(t => t.asset)));
    // Default to at least BTC and USDC if empty
    if (list.length === 0) return ['BTC', 'USDC'];
    return list;
  }, [transactions]);

  const currentPrices = useBinancePrices(assets);
  
  // Re-calculate with real-time prices
  const { stats, totalPatrimony, totalInvested } = React.useMemo(
    () => calculateStats(transactions, currentPrices),
    [transactions, currentPrices]
  );

  const profitLoss = totalPatrimony - totalInvested;
  const isPositive = profitLoss >= 0;

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-[#0B0E11] text-[#EAECEF] font-sans overflow-x-hidden">
      {/* Sidebar */}
      <aside className="w-full lg:w-[380px] xl:w-[420px] border-b lg:border-b-0 lg:border-r border-[#2B2F36] flex flex-col p-6 lg:p-8 bg-[#181A20] shrink-0">
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#F3BA2F] rounded-full flex items-center justify-center">
                <div className="w-5 h-5 bg-black rounded-sm transform rotate-45 flex items-center justify-center">
                  <span className="text-[10px] text-[#F3BA2F] font-bold">B</span>
                </div>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl lg:text-3xl font-bold tracking-tight">KryptonStats</h1>
            </div>
            <button 
              onClick={() => {
                import('../lib/firebase').then(m => m.logout());
              }}
              className="flex items-center gap-2 px-3 py-2 bg-[#2B2F36] hover:bg-rose-500/20 text-[#848E9C] hover:text-rose-500 rounded-lg transition-colors text-sm font-semibold border border-transparent hover:border-rose-500/30 group"
              title="Sair da conta"
            >
              <span className="hidden sm:inline">Sair</span>
              <LogOut size={16} className="group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
          <p className="text-xs lg:text-sm text-[#848E9C] uppercase tracking-widest font-semibold">Portfolio Management</p>
        </div>

        {/* Form */}
        <div className="mb-10">
           <TransactionForm onAddTransaction={addTransaction} currentPrices={currentPrices} />
        </div>

        {/* Real-time quotes */}
        <div className="mt-auto">
          <div className="bg-[#2B2F36] rounded-xl p-6 border border-[#2B2F36] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#0ECB81] to-[#F3BA2F]"></div>
            <div className="flex justify-between items-center mb-6">
              <span className="text-lg font-bold text-white uppercase tracking-wide">Cotações (Tempo Real)</span>
              <span className="w-3 h-3 rounded-full bg-[#0ECB81] animate-pulse shadow-[0_0_8px_#0ECB81]"></span>
            </div>
            <div className="space-y-4">
              {assets.map(asset => (
                 <div key={asset} className="flex justify-between items-center bg-[#181A20] p-3 rounded-lg border border-[#2B2F36]">
                    <span className="text-sm font-semibold text-[#848E9C]">{asset}/BRL</span>
                    <span className={`text-lg font-mono font-bold ${asset === 'BTC' ? 'text-[#0ECB81]' : 'text-[#EAECEF]'}`}>
                       {formatCurrency(currentPrices[asset] || 0)}
                    </span>
                 </div>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
         <header className="py-8 lg:h-32 border-b border-[#2B2F36] px-6 lg:px-10 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#0B0E11] gap-6">
            <div>
               <div className="flex items-center gap-2 mb-2">
                 <div className="bg-[#F3BA2F]/10 p-1.5 rounded-md border border-[#F3BA2F]/20 overflow-hidden">
                   {auth.currentUser?.photoURL ? (
                     <img src={auth.currentUser.photoURL} alt="Profile" className="w-3 h-3 rounded-sm object-cover" />
                   ) : (
                     <User size={12} className="text-[#F3BA2F]" />
                   )}
                 </div>
                 <span className="text-[10px] text-[#A9B1BD] font-black uppercase tracking-[0.2em]">
                   Dashboard de {auth.currentUser?.displayName?.split(' ')[0] || 'Investidor'}
                 </span>
               </div>
               <h2 className="text-base text-white uppercase font-bold tracking-wider mb-2">Patrimônio Total</h2>
               <div className="flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-4">
                 <span className="text-4xl lg:text-5xl font-bold">{formatCurrency(totalPatrimony)}</span>
                 {totalInvested > 0 && (
                    <span className={`text-lg font-semibold ${isPositive ? 'text-[#0ECB81]' : 'text-rose-500'}`}>
                       {isPositive ? '+' : ''}{((profitLoss / totalInvested) * 100).toFixed(2)}% (Geral)
                    </span>
                 )}
               </div>
            </div>
            <div className="flex gap-8 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0 hide-scrollbar">
               <div className="text-left sm:text-right whitespace-nowrap">
                 <h2 className="text-base text-white uppercase font-bold tracking-wider mb-2">Lucro Total (P&L)</h2>
                 <p className={`text-2xl font-mono font-bold ${isPositive ? 'text-[#0ECB81]' : 'text-rose-500'}`}>
                    {isPositive ? '+' : ''}{formatCurrency(profitLoss)}
                 </p>
               </div>
               <div className="text-left sm:text-right whitespace-nowrap">
                 <h2 className="text-base text-white uppercase font-bold tracking-wider mb-2">Total Investido</h2>
                 <p className="text-2xl font-bold text-white">{formatCurrency(totalInvested)}</p>
               </div>
            </div>
         </header>

         <section className="p-6 lg:p-10 flex-1 flex flex-col gap-8 w-full min-h-0">
           <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
             <div className="xl:col-span-2">
               <ChartsCarousel transactions={transactions} stats={stats} totalCurrentValue={totalPatrimony} currentPrices={currentPrices} />
             </div>
             <div>
               <KryptonAdvisor stats={stats} transactions={transactions} />
             </div>
           </div>
           <AssetList stats={stats} transactions={transactions} onRemoveTransaction={removeTransaction} />
         </section>
      </main>
    </div>
  );
}
