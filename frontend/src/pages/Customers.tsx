import React, { useState, useEffect } from 'react';
import { 
  Search, 
  UserPlus, 
  MessageSquare, 
  Phone
} from 'lucide-react';
import { api, type Customer } from '../utils/api';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // New Customer Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [initialBalance, setInitialBalance] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data);
    } catch (err) {
      console.error("Failed to load customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName) return;

    try {
      setLoading(true);
      await api.createCustomer({
        name: newCustomerName,
        phone_number: newCustomerPhone || '',
        current_balance: Number(initialBalance) || 0
      });
      // Reset form
      setNewCustomerName('');
      setNewCustomerPhone('');
      setInitialBalance('');
      setShowAddForm(false);
      // Reload list
      await loadCustomers();
    } catch (err) {
      console.error("Failed to add customer:", err);
      setLoading(false);
    }
  };

  // Filter customers by search
  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.phone_number.includes(searchQuery)
  );

  const getWhatsAppLink = (phone: string, name: string, balance: number) => {
    const cleanPhone = phone.replace(/[^0-9+]/g, '');
    const message = balance > 0 
      ? `Hello ${name}, this is a gentle reminder from Apna Bazaar. An outstanding credit of ₹${balance.toFixed(2)} is pending in your ledger book. Please settle it soon. Thank you!`
      : `Hello ${name}, thank you for your business. Your ledger book is currently settled.`;
    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  if (loading && customers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Search and Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-3 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="Search by customer name or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-sm"
          />
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold px-4 py-2.5 rounded-xl transition-all shadow-md shadow-emerald-500/10 cursor-pointer"
        >
          <UserPlus size={18} />
          <span>Add Customer</span>
        </button>
      </div>

      {/* Add Customer Overlay Form */}
      {showAddForm && (
        <div className="bg-white border border-slate-200/60 rounded-2xl p-6 shadow-md glass-panel">
          <h3 className="font-bold text-slate-800 text-base mb-4">Create New Customer Account</h3>
          <form onSubmit={handleAddCustomer} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Customer Full Name *</label>
              <input
                type="text"
                required
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="e.g. Ramesh Singh"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Phone Number (WhatsApp) *</label>
              <input
                type="tel"
                value={newCustomerPhone}
                onChange={(e) => setNewCustomerPhone(e.target.value)}
                placeholder="e.g. +91 99999 88888"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Opening Balance (₹)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="e.g. 500 (+ to collect, - you owe)"
                  className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-sm focus:outline-none"
                />
                <button
                  type="submit"
                  className="bg-emerald-500 hover:bg-emerald-600 text-white font-bold px-4 rounded-xl text-sm transition-all"
                >
                  Save
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Customers List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white border border-slate-200/50 rounded-2xl p-12 text-center text-slate-400">
            No customers found matching your search.
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const isOwed = customer.current_balance > 0;
            const owesUs = customer.current_balance < 0;
            const isSettled = customer.current_balance === 0;

            return (
              <div 
                key={customer.id} 
                className="bg-white border border-slate-200/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center font-bold text-slate-600 text-base shadow-sm">
                      {customer.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-base leading-tight">{customer.name}</h4>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{customer.phone_number || 'No phone logged'}</span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400">Account Balance</span>
                    <h4 className={`text-lg font-black mt-0.5 ${
                      isOwed ? 'text-rose-600' : owesUs ? 'text-emerald-600' : 'text-slate-500'
                    }`}>
                      {isSettled ? 'Settled' : `₹${Math.abs(customer.current_balance).toLocaleString('en-IN')}`}
                    </h4>
                    {!isSettled && (
                      <p className={`text-[10px] font-semibold ${isOwed ? 'text-rose-500' : 'text-emerald-500'}`}>
                        {isOwed ? 'To Collect (CR)' : 'To Pay (DR)'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400">
                    Updated {new Date(customer.updated_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                  </span>

                  <div className="flex gap-2">
                    {/* WhatsApp recovery dispatch trigger */}
                    {customer.phone_number && (
                      <a
                        href={getWhatsAppLink(customer.phone_number, customer.name, customer.current_balance)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#25d366]/20 bg-[#25d366]/5 text-[#25d366] hover:bg-[#25d366] hover:text-white transition-all text-xs font-semibold"
                      >
                        <MessageSquare size={13} />
                        <span>WhatsApp</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
