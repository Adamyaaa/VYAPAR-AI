import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Button } from '../../components/ui';
import { useAuth } from '../../context/AuthContext';

interface AuthPageProps {
  mode: 'signin' | 'signup';
}

export const AuthPage: React.FC<AuthPageProps> = ({ mode }) => {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationSent, setConfirmationSent] = useState(false);

  const isSignup = mode === 'signup';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const result = isSignup
      ? await signUp(email, password, businessName, phone || undefined)
      : await signIn(email, password);

    setSubmitting(false);

    if (result.error) {
      setError(result.error);
      return;
    }
    if (isSignup && result.needsEmailConfirmation) {
      setConfirmationSent(true);
      return;
    }
    const redirectTo = (location.state as { from?: string } | null)?.from ?? '/';
    navigate(redirectTo, { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-canvas px-4">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-sm"
      >
        <div className="flex items-center gap-2.5 justify-center mb-8">
          <div className="w-9 h-9 rounded-sm bg-[linear-gradient(155deg,var(--color-indigo),var(--color-indigo-ink))] flex items-center justify-center font-bold text-white">
            V
          </div>
          <div>
            <p className="font-semibold text-[15px] text-ink leading-tight">Hisaab AI</p>
            <p className="text-[10px] text-ink-faint uppercase tracking-wider font-medium leading-tight">Vyapar AI</p>
          </div>
        </div>

        <div className="bg-surface border border-border-soft rounded-lg shadow-sm p-7">
          {confirmationSent ? (
            <div className="text-center py-4">
              <div className="w-11 h-11 rounded-md bg-indigo-soft text-indigo flex items-center justify-center mx-auto mb-4">
                <Sparkles size={20} />
              </div>
              <h2 className="text-base font-semibold text-ink mb-1.5">Check your email</h2>
              <p className="text-[13px] text-ink-muted">
                We've sent a confirmation link to <span className="text-ink font-medium">{email}</span>. Click it to
                activate your account, then sign in.
              </p>
              <Link
                to="/login"
                className="inline-block mt-5 text-[13px] font-semibold text-indigo hover:text-indigo-ink"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-lg font-semibold text-ink mb-1">
                {isSignup ? 'Create your account' : 'Welcome back'}
              </h1>
              <p className="text-[13px] text-ink-muted mb-6">
                {isSignup ? 'Set up your business ledger in a minute.' : 'Sign in to your ledger.'}
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                {isSignup && (
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1.5">Business name</label>
                    <input
                      type="text"
                      required
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Apna Bazaar"
                      className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Email</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
                  />
                </div>
                {isSignup && (
                  <div>
                    <label className="block text-xs font-semibold text-ink-muted mb-1.5">
                      Phone number <span className="text-ink-faint font-normal">(optional)</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 99999 88888"
                      className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-ink-muted mb-1.5">Password</label>
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 rounded-md border border-border bg-surface text-ink text-sm focus:outline-none focus:ring-2 focus:ring-indigo/20 focus:border-indigo"
                  />
                </div>

                {error && (
                  <p className="text-[12.5px] text-rose bg-rose-soft rounded-md px-3 py-2">{error}</p>
                )}

                <Button type="submit" className="w-full justify-center" disabled={submitting}>
                  {submitting ? 'Please wait…' : isSignup ? 'Create account' : 'Sign in'}
                </Button>
              </form>

              <p className="text-center text-[12.5px] text-ink-muted mt-5">
                {isSignup ? (
                  <>
                    Already have an account?{' '}
                    <Link to="/login" className="font-semibold text-indigo hover:text-indigo-ink">
                      Sign in
                    </Link>
                  </>
                ) : (
                  <>
                    New to Hisaab AI?{' '}
                    <Link to="/signup" className="font-semibold text-indigo hover:text-indigo-ink">
                      Create an account
                    </Link>
                  </>
                )}
              </p>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};
