import React, { useState, useEffect } from 'react';
import { 
  ArrowUpRight, 
  ArrowDownLeft, 
  Users, 
  Clock, 
  ChevronRight,
  Sparkles,
  Volume2
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { api, type Customer, type Transaction } from '../utils/api';

export const Dashboard: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cData, tData] = await Promise.all([
          api.getCustomers(),
          api.getTransactions()
        ]);
        setCustomers(cData);
        setTransactions(tData);
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Calculate statistics
  const totalReceivables = customers
    .filter(c => c.current_balance > 0)
    .reduce((sum, c) => sum + c.current_balance, 0);

  const totalPayables = Math.abs(customers
    .filter(c => c.current_balance < 0)
    .reduce((sum, c) => sum + c.current_balance, 0));

  const activeCustomers = customers.length;
  const pendingTransactions = transactions.filter(t => t.status === 'PENDING').length;

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Banner Alert / AI Insight */}
      <div className="bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 border border-emerald-500/20 rounded-2xl p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 glass-panel">
        <div className="flex gap-3 items-start">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 mt-0.5">
            <Sparkles size={20} />
          </div>
          <div>
            <h3 className="font-semibold text-slate-800 text-sm md:text-base m-0">Hisaab AI Udhar Shield Active</h3>
            <p className="text-xs md:text-sm text-slate-600 mt-1">
              Rajesh Kirana Store owes <strong className="text-slate-800">₹4,500.00</strong>. Last payment was 15 days ago. We have prepared a WhatsApp voice nudge draft.
            </p>
          </div>
        </div>
        <Link 
          to="/ledger" 
          className="flex items-center gap-1 bg-emerald-500 hover:bg-emerald-600 text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-xl transition-all shadow-md shadow-emerald-500/20"
        >
          <span>Dispatch Nudge</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Receivables Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Collect (Udhar)</p>
              <h2 className="text-3xl font-black text-slate-900 mt-2">{formatCurrency(totalReceivables)}</h2>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <ArrowDownLeft size={22} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-emerald-600 font-semibold">↑ 8.4%</span>
            <span>this week</span>
          </div>
        </div>

        {/* Payables Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">To Pay (Udhaar)</p>
              <h2 className="text-3xl font-black text-slate-900 mt-2">{formatCurrency(totalPayables)}</h2>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <ArrowUpRight size={22} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-slate-500">Steady</span>
            <span>since last month</span>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ledger Accounts</p>
              <h2 className="text-3xl font-black text-slate-900 mt-2">{activeCustomers}</h2>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Users size={22} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-indigo-600 font-semibold">+1 customer</span>
            <span>added today</span>
          </div>
        </div>

        {/* Pending Approvals */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/50 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Approvals</p>
              <h2 className="text-3xl font-black text-slate-900 mt-2">{pendingTransactions}</h2>
            </div>
            <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
              <Clock size={22} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-xs text-slate-500">
            <span className="text-amber-600 font-semibold">{pendingTransactions} transactions</span>
            <span>need confirmation</span>
          </div>
        </div>
      </div>

      {/* Visual Analytics Summary & Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Credit Breakdown Bar Graph */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm lg:col-span-2 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recovery Breakdown</h3>
            <p className="text-xs text-slate-500 mt-0.5">Progress of your outstanding ledger book</p>
          </div>

          <div className="space-y-6 my-6">
            {/* Visual breakdown bar */}
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>Rajesh Kirana Store</span>
                <span>₹4,500.00 (Outstanding)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-amber-400" style={{ width: '60%' }}></div>
                <div className="h-full bg-emerald-500" style={{ width: '40%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>Needs follow-up</span>
                <span>40% secured</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-600 mb-2">
                <span>Priya Verma (Boutique)</span>
                <span>₹8,900.50 (Outstanding)</span>
              </div>
              <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex">
                <div className="h-full bg-rose-500" style={{ width: '85%' }}></div>
                <div className="h-full bg-emerald-500" style={{ width: '15%' }}></div>
              </div>
              <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                <span>High outstanding amount</span>
                <span>15% settled</span>
              </div>
            </div>
          </div>

          <div className="flex gap-4 border-t border-slate-100 pt-4 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-amber-400 rounded"></span>
              <span>Pending</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-rose-500 rounded"></span>
              <span>Overdue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-emerald-500 rounded"></span>
              <span>Secured</span>
            </div>
          </div>
        </div>

        {/* Quick actions panel */}
        <div className="bg-[#0b0f19] text-white rounded-2xl p-6 shadow-md flex flex-col justify-between relative overflow-hidden">
          <div className="absolute right-[-20px] top-[-20px] w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl"></div>
          <div>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
              Quick Ledger
            </span>
            <h3 className="text-lg font-bold text-white mt-4">Record Transaction</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Add new CREDIT or DEBIT values easily. You can record voice descriptions or type notes.
            </p>
          </div>

          <div className="my-6 space-y-3">
            <Link 
              to="/ledger?action=new&type=credit" 
              className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-xs">
                  CR
                </div>
                <div>
                  <p className="text-xs font-semibold m-0 text-white">Give Credit (Udhar Dena)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Increases customer balance</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
            </Link>

            <Link 
              to="/ledger?action=new&type=debit" 
              className="flex items-center justify-between p-3.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 transition-colors text-slate-200 group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center font-bold text-xs">
                  DR
                </div>
                <div>
                  <p className="text-xs font-semibold m-0 text-white">Receive Payment (Udhar Lena)</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">Reduces customer balance</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-slate-600 group-hover:text-white transition-colors" />
            </Link>
          </div>

          <p className="text-[10px] text-slate-500 text-center">
            Hisaab AI can extract these from WhatsApp messages automatically.
          </p>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm">
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-800">Recent Transactions</h3>
            <p className="text-xs text-slate-500 mt-0.5">Latest logs across all customers</p>
          </div>
          <Link to="/ledger" className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            <span>View Ledger</span>
            <ChevronRight size={14} />
          </Link>
        </div>

        <div className="divide-y divide-slate-100">
          {transactions.slice(0, 3).map((item) => {
            const customer = customers.find(c => c.id === item.customer_id);
            return (
              <div key={item.id} className="py-4 flex items-center justify-between hover:bg-slate-50/50 px-2 rounded-xl transition-colors">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-xs ${
                    item.type === 'CREDIT' 
                      ? 'bg-rose-50 text-rose-600' 
                      : 'bg-emerald-50 text-emerald-600'
                  }`}>
                    {item.type === 'CREDIT' ? 'CR' : 'DR'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{customer?.name || 'Loading...'}</p>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500">
                      <span>{new Date(item.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
                      <span>•</span>
                      <span className="truncate max-w-[180px]">{item.description || 'No notes'}</span>
                      {item.voice_url && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 text-indigo-500 font-medium">
                            <Volume2 size={12} />
                            Voice
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className={`text-sm font-bold ${item.type === 'CREDIT' ? 'text-rose-600' : 'text-emerald-600'}`}>
                    {item.type === 'CREDIT' ? '+' : '-'} ₹{Number(item.amount).toLocaleString('en-IN')}
                  </p>
                  <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full font-bold mt-1 ${
                    item.status === 'CONFIRMED' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                      : 'bg-amber-50 text-amber-700 border border-amber-100 animate-pulse'
                  }`}>
                    {item.status}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
