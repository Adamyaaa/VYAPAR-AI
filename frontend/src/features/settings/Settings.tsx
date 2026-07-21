import React, { useEffect, useState } from 'react';
import { Sun, Moon, LogOut } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/useTheme';

const CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED'];

export const Settings: React.FC = () => {
  const { profile, user, updateProfile, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [businessName, setBusinessName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (profile) {
      setBusinessName(profile.business_name);
      setPhoneNumber(profile.phone_number ?? '');
      setCurrency(profile.currency);
    }
  }, [profile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    setError(null);
    const result = await updateProfile({ business_name: businessName, phone_number: phoneNumber || null, currency });
    setSaving(false);
    if (result.error) {
      setError(result.error);
    } else {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-[15px] font-semibold text-ink m-0">Settings</h2>
        <p className="text-[12.5px] text-ink-faint m-0 mt-0.5">Your business profile and preferences</p>
      </div>

      <Card className="p-6">
        <h3 className="text-[13.5px] font-semibold text-ink mb-4">Business profile</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Business name</label>
            <input
              type="text"
              required
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Phone number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="+91 99999 88888"
              className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-ink-muted mb-1.5">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-[12.5px] text-rose bg-rose-soft rounded-md px-3 py-2">{error}</p>}
          {saved && <p className="text-[12.5px] text-emerald bg-emerald-soft rounded-md px-3 py-2">Saved</p>}

          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Card>

      <Card className="p-6">
        <h3 className="text-[13.5px] font-semibold text-ink mb-4">Appearance</h3>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center justify-between w-full px-3.5 py-2.5 rounded-md border border-border-soft bg-surface-2 text-sm text-ink cursor-pointer hover:border-border transition-colors"
        >
          <span className="flex items-center gap-2.5">
            {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
            Theme
          </span>
          <span className="text-ink-muted text-xs font-medium capitalize">{theme}</span>
        </button>
      </Card>

      <Card className="p-6">
        <h3 className="text-[13.5px] font-semibold text-ink mb-1">Account</h3>
        <p className="text-[12.5px] text-ink-faint mb-4">{user?.email}</p>
        <Button variant="danger" onClick={signOut}>
          <LogOut size={14} />
          Sign out
        </Button>
      </Card>
    </div>
  );
};
