import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Mic, 
  MicOff, 
  Play,
  Pause,
  MessageSquare,
  Send,
  CheckCircle2,
  X
} from 'lucide-react';
import { api, type Customer, type Transaction, type RecoveryNudge } from '../utils/api';

export const Ledger: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nudges, setNudges] = useState<RecoveryNudge[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<'CREDIT' | 'DEBIT'>('CREDIT');
  const [description, setDescription] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVoiceUrl, setRecordedVoiceUrl] = useState<string | null>(null);

  // Nudge Dialog State
  const [activeNudgeDraft, setActiveNudgeDraft] = useState<RecoveryNudge | null>(null);
  
  // Audio Player State
  const [playingAudioUrl, setPlayingAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check search queries for initial values
    const queryType = searchParams.get('type')?.toUpperCase();
    if (queryType === 'CREDIT' || queryType === 'DEBIT') {
      setType(queryType as 'CREDIT' | 'DEBIT');
    }
    loadData();
  }, [searchParams]);

  const loadData = async () => {
    try {
      const [cData, tData, nData] = await Promise.all([
        api.getCustomers(),
        api.getTransactions(),
        api.getNudges()
      ]);
      setCustomers(cData);
      setTransactions(tData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
      setNudges(nData);
      
      if (cData.length > 0) {
        setSelectedCustomerId(cData[0].id);
      }
    } catch (err) {
      console.error("Failed to load ledger data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || !amount) return;

    try {
      setLoading(true);
      const newTx = await api.createTransaction({
        customer_id: selectedCustomerId,
        amount: Number(amount),
        type,
        description: description || (recordedVoiceUrl ? "Voice Ledger Entry" : "Ledger Entry"),
        voice_url: recordedVoiceUrl,
        status: 'CONFIRMED' // Confirmed directly from UI
      });

      // If it is credit, automatically generate a recovery nudge draft
      if (type === 'CREDIT') {
        const customerObj = customers.find(c => c.id === selectedCustomerId);
        await api.createNudge({
          transaction_id: newTx.id,
          customer_id: selectedCustomerId,
          message_text: `Dear ${customerObj?.name || 'Customer'}, a transaction of ₹${newTx.amount.toFixed(2)} is pending in your Apna Bazaar account ledger. Please settle. Thanks!`,
          status: 'DRAFT',
          sent_at: null
        });
      }

      // Reset form
      setAmount('');
      setDescription('');
      setRecordedVoiceUrl(null);
      
      // Reload lists
      await loadData();
    } catch (err) {
      console.error("Failed to save transaction:", err);
      setLoading(false);
    }
  };

  // Simulation of voice recording
  const handleToggleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      setRecordedVoiceUrl('https://hisaab.ai/audio/recorded-voice-' + Math.random().toString().substr(2, 5) + '.mp3');
      setDescription("Recorded: 'Udhar batch for rice bags and sugar packets'");
    } else {
      setIsRecording(true);
      setDescription("Listening to voice audio...");
    }
  };

  // Nudge workflow
  const triggerNudgeWorkflow = (tx: Transaction) => {
    // Find if there's an existing draft nudge for this transaction
    const existingNudge = nudges.find(n => n.transaction_id === tx.id);
    if (existingNudge) {
      setActiveNudgeDraft(existingNudge);
    } else {
      const customerObj = customers.find(c => c.id === tx.customer_id);
      // Create on the fly
      const tempNudge: RecoveryNudge = {
        id: 'n-temp-' + Math.random().toString().substr(2, 5),
        transaction_id: tx.id,
        customer_id: tx.customer_id,
        message_text: `Dear ${customerObj?.name || 'Customer'}, a transaction of ₹${Number(tx.amount).toFixed(2)} is pending in your Apna Bazaar account ledger. Please settle. Thanks!`,
        status: 'DRAFT',
        sent_at: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setActiveNudgeDraft(tempNudge);
    }
  };

  const dispatchNudge = async () => {
    if (!activeNudgeDraft) return;
    try {
      setLoading(true);
      const isTemp = activeNudgeDraft.id.startsWith('n-temp-');
      let finalNudge = activeNudgeDraft;
      if (isTemp) {
        // Create first
        finalNudge = await api.createNudge({
          transaction_id: activeNudgeDraft.transaction_id,
          customer_id: activeNudgeDraft.customer_id,
          message_text: activeNudgeDraft.message_text,
          status: 'DRAFT',
          sent_at: null
        });
      }
      
      await api.sendNudge(finalNudge.id);
      
      // Simulating whatsapp redirection link opening
      const customer = customers.find(c => c.id === activeNudgeDraft.customer_id);
      if (customer && customer.phone_number) {
        const cleanPhone = customer.phone_number.replace(/[^0-9+]/g, '');
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(activeNudgeDraft.message_text)}`;
        window.open(url, '_blank');
      }

      setActiveNudgeDraft(null);
      await loadData();
    } catch (err) {
      console.error("Failed to send nudge:", err);
      setLoading(false);
    }
  };

  const toggleAudioPlayback = (url: string) => {
    if (playingAudioUrl === url) {
      setPlayingAudioUrl(null);
    } else {
      setPlayingAudioUrl(url);
      // Simulate auto-end after 3 seconds
      setTimeout(() => {
        setPlayingAudioUrl(prev => prev === url ? null : prev);
      }, 3000);
    }
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* CREATE TRANSACTION FORM */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm h-fit">
          <h3 className="font-bold text-slate-800 text-base mb-4">New Ledger Entry</h3>
          
          <form onSubmit={handleAddTransaction} className="space-y-4">
            {/* Customer Dropdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Select Customer</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm focus:outline-none"
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} (Balance: ₹{c.current_balance})
                  </option>
                ))}
              </select>
            </div>

            {/* Credit/Debit Toggle Button */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Transaction Type</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/50">
                <button
                  type="button"
                  onClick={() => setType('CREDIT')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    type === 'CREDIT' 
                      ? 'bg-rose-500 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Give Credit (Udhar Dena)
                </button>
                <button
                  type="button"
                  onClick={() => setType('DEBIT')}
                  className={`py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    type === 'DEBIT' 
                      ? 'bg-emerald-500 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  Receive Cash (Paisa Lena)
                </button>
              </div>
            </div>

            {/* Amount Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Amount (₹)</label>
              <input
                type="number"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹0.00"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-base font-bold focus:outline-none"
              />
            </div>

            {/* Description/Transcriptions */}
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Details / Notes</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g. 5kg rice, sugar pack..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm focus:outline-none min-h-[70px]"
              />
            </div>

            {/* Voice Recorder Block */}
            <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-4 flex items-center justify-between">
              <div className="flex gap-3 items-center">
                <button
                  type="button"
                  onClick={handleToggleVoiceRecord}
                  className={`w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-md ${
                    isRecording 
                      ? 'bg-rose-500 text-white animate-pulse' 
                      : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                  }`}
                >
                  {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
                </button>
                <div>
                  <h4 className="text-xs font-bold text-slate-700">Voice ledger entry</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    {isRecording ? 'Recording waves...' : recordedVoiceUrl ? 'Audio attached ✓' : 'Click mic to record notes'}
                  </p>
                </div>
              </div>

              {isRecording && (
                <div className="flex gap-0.5 items-center">
                  <span className="w-1 h-3 bg-rose-500 rounded animate-bounce"></span>
                  <span className="w-1 h-5 bg-rose-500 rounded animate-bounce [animation-delay:0.1s]"></span>
                  <span className="w-1 h-4 bg-rose-500 rounded animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1 h-2 bg-rose-500 rounded animate-bounce [animation-delay:0.15s]"></span>
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-bold text-sm text-white shadow-md transition-all cursor-pointer ${
                type === 'CREDIT' 
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/10' 
                  : 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/10'
              }`}
            >
              Add to Ledger Book
            </button>
          </form>
        </div>

        {/* LEDGER LOGS TABLE */}
        <div className="bg-white border border-slate-200/50 rounded-2xl p-6 shadow-sm lg:col-span-2">
          <div className="pb-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-800">Ledger Logs</h3>
              <p className="text-xs text-slate-500 mt-0.5">All debit & credit entries recorded</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 overflow-y-auto max-h-[550px] pr-1 mt-4">
            {transactions.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                No transactions recorded yet in the ledger.
              </div>
            ) : (
              transactions.map((tx) => {
                const customer = customers.find(c => c.id === tx.customer_id);
                const isCredit = tx.type === 'CREDIT';
                const nudgeObj = nudges.find(n => n.transaction_id === tx.id);

                return (
                  <div key={tx.id} className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/40 px-2 rounded-xl transition-colors">
                    <div className="flex items-start gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                        isCredit ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {isCredit ? 'CR' : 'DR'}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{customer?.name || 'Customer'}</p>
                        <p className="text-xs text-slate-600 mt-1">{tx.description}</p>
                        
                        <div className="flex flex-wrap items-center gap-2 mt-2 text-[10px] text-slate-400">
                          <span>{new Date(tx.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.5 rounded font-semibold ${tx.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>
                            {tx.status}
                          </span>
                          
                          {tx.voice_url && (
                            <>
                              <span>•</span>
                              <button
                                onClick={() => toggleAudioPlayback(tx.voice_url!)}
                                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full font-bold cursor-pointer ${
                                  playingAudioUrl === tx.voice_url 
                                    ? 'bg-rose-500 text-white animate-pulse' 
                                    : 'bg-indigo-50 text-indigo-600'
                                }`}
                              >
                                {playingAudioUrl === tx.voice_url ? <Pause size={10} /> : <Play size={10} />}
                                <span>Voice Playback</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center gap-2 border-t md:border-t-0 border-slate-100 pt-3 md:pt-0">
                      <div className="text-right">
                        <p className={`text-base font-black ${isCredit ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isCredit ? '+' : '-'} ₹{Number(tx.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </p>
                      </div>

                      {/* Nudge trigger for Credit (Outstanding loan) */}
                      {isCredit && (
                        <div className="flex gap-1.5">
                          {nudgeObj?.status === 'SENT' ? (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-600 font-bold bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 size={11} />
                              <span>Nudge Sent</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => triggerNudgeWorkflow(tx)}
                              className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold bg-indigo-50 hover:bg-indigo-100 border border-indigo-100 px-2.5 py-1 rounded-lg cursor-pointer transition-colors"
                            >
                              <MessageSquare size={11} />
                              <span>Send Nudge</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* DISPATCH NUDGE DRAWER OVERLAY */}
      {activeNudgeDraft && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-200 shadow-xl space-y-4 animate-scale-up">
            <div className="flex justify-between items-start">
              <div>
                <span className="bg-indigo-50 text-indigo-600 border border-indigo-100 text-[9px] px-2 py-0.5 rounded-full font-bold uppercase">
                  Udhar Shield Lite
                </span>
                <h3 className="font-bold text-slate-800 text-lg mt-2">Confirm WhatsApp Nudge</h3>
              </div>
              <button 
                onClick={() => setActiveNudgeDraft(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Recipient Customer</label>
              <p className="text-sm font-semibold text-slate-800">
                {customers.find(c => c.id === activeNudgeDraft.customer_id)?.name}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Nudge Message Text</label>
              <textarea
                value={activeNudgeDraft.message_text}
                onChange={(e) => setActiveNudgeDraft({ ...activeNudgeDraft, message_text: e.target.value })}
                className="w-full text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-3.5 min-h-[100px] focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => setActiveNudgeDraft(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={dispatchNudge}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white shadow-md shadow-emerald-500/10 cursor-pointer transition-colors"
              >
                <Send size={12} />
                <span>Dispatch Nudge</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
