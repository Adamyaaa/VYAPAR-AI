import React from 'react';
import { Search } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({ value, onChange, placeholder, className = '' }) => (
  <div className={`relative ${className}`}>
    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-4 py-2.5 rounded-md border border-border bg-surface text-ink placeholder:text-ink-faint text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo transition-all"
    />
  </div>
);
