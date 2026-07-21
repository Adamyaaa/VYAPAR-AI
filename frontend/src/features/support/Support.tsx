import React, { useState } from 'react';
import { ChevronDown, Mail } from 'lucide-react';
import { Card } from '../../components/ui';

const FAQS: { question: string; answer: string }[] = [
  {
    question: 'What is Hisaab AI?',
    answer:
      'Hisaab AI is a digital ledger for tracking customer credit (udhar) and payments, with WhatsApp-based reminders — built for kirana and small business owners as the first module of the Vyapar AI platform.',
  },
  {
    question: 'Is the voice recording feature real?',
    answer:
      'Not yet — voice notes are currently simulated so you can try the flow, but there\'s no real speech-to-text behind them. Typed entries in the Ledger are fully real and save to your account normally.',
  },
  {
    question: 'How does "Send Nudge" work?',
    answer:
      'It opens WhatsApp with a pre-filled reminder message to that customer. You still tap Send yourself in WhatsApp — this app doesn\'t send messages automatically on your behalf yet.',
  },
  {
    question: 'What does the "Reliability" score on a customer mean?',
    answer:
      'It\'s the share of credit you\'ve issued to that customer which they\'ve paid back so far (payments recovered ÷ credit issued), based only on your own recorded transactions.',
  },
  {
    question: 'Is my data private to my business?',
    answer:
      'Yes — every customer and transaction is scoped to your account at the database level (Row-Level Security), not just hidden in the app. No other business can query your data, even in theory.',
  },
  {
    question: 'Can I export my ledger?',
    answer: 'Yes — go to Reports, pick a month, and use "Export CSV" to download that month\'s transactions.',
  },
];

const FAQItem: React.FC<{ question: string; answer: string }> = ({ question, answer }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-border-soft last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left cursor-pointer"
      >
        <span className="text-[13.5px] font-medium text-ink">{question}</span>
        <ChevronDown size={16} className={`text-ink-faint shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <p className="text-[12.5px] text-ink-muted pb-4 -mt-2 max-w-2xl">{answer}</p>}
    </div>
  );
};

export const Support: React.FC = () => {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-[15px] font-semibold text-ink m-0">Support</h2>
        <p className="text-[12.5px] text-ink-faint m-0 mt-0.5">Answers to common questions, and how to reach us</p>
      </div>

      <Card className="px-5">
        {FAQS.map((faq) => (
          <FAQItem key={faq.question} {...faq} />
        ))}
      </Card>

      <Card className="p-6">
        <h3 className="text-[13.5px] font-semibold text-ink mb-1">Still need help?</h3>
        <p className="text-[12.5px] text-ink-faint flex items-center gap-2">
          <Mail size={14} className="shrink-0" />
          Live chat and a support inbox aren't set up yet — this is a placeholder until there's a real address to
          point here.
        </p>
      </Card>
    </div>
  );
};
