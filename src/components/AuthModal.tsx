import React, { useState } from 'react';
import { usePlatform } from '../context/PlatformContext';
import { X, Mail, Lock, User, CheckCircle, ShieldCheck, KeyRound } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, signup } = usePlatform();
  const [mode, setMode] = useState<'login' | 'signup' | 'otp'>('login');
  
  // Form fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState<'Buyer' | 'Organizer' | 'Admin'>('Buyer');
  
  // OTP simulation & states
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [otpTimer, setOtpTimer] = useState(59);

  if (!isOpen) return null;

  // 🔴 LEAD FIX: Wired to /api/auth/login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please provide Email and Password.');
      return;
    }

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Pass the real database user object to the frontend context
      login(data.user); 
      setSuccessMsg('Logged in successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    }
  };

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill out all registration fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    // Move to mock OTP verification before we hit the DB
    setMode('otp');
    startOtpCountdown();
  };

  const startOtpCountdown = () => {
    setOtpTimer(59);
    const interval = setInterval(() => {
      setOtpTimer(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const nextOtp = [...otpCode];
    nextOtp[index] = val.slice(-1);
    setOtpCode(nextOtp);

    if (val && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // 🔴 LEAD FIX: Wired to /api/auth/register
  const handleOtpVerify = async () => {
    setError('');
    const fullCode = otpCode.join('');
    
    if (fullCode.length < 6) {
      setError('Please enter the full 6-digit verification code.');
      return;
    }

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password, 
          full_name: fullName, 
          role: role.toLowerCase() // Ensure it matches DB enum 'buyer' | 'organizer'
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setSuccessMsg('Security code verified! Account activated.');
      setTimeout(() => {
        setSuccessMsg('');
        setMode('login'); // Push them to log in with their new credentials
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Verification failed. Try again.');
    }
  };

  return (
    <div id="auth-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 p-6 shadow-2xl">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white rounded-lg p-1.5 hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Modal Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white">
            {mode === 'login' ? 'Welcome Back!' : mode === 'signup' ? 'Create Account' : 'Verify Device'}
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            {mode === 'login' 
              ? 'Access tickets, wallets, and instant event tools.' 
              : mode === 'signup' 
              ? 'Join Nigeria\'s fastest zero-redirection ticketing hub.'
              : `6-digit activation code sent to ${email}`}
          </p>
        </div>

        {/* Feedback Alerts */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-950/40 border border-red-800/60 p-3 text-xs text-red-400">
            {error}
          </div>
        )}
        {successMsg && (
          <div className="mb-4 rounded-lg bg-emerald-950/40 border border-emerald-800/60 p-3 text-xs text-emerald-400 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* --- LOGIN FORM --- */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., chioma@gmail.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Lock className="h-4 w-4" />
                </span>
                <input
                  id="login-password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold font-display shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all cursor-pointer"
            >
              Access Platform (Secure)
            </button>

            <div className="text-center mt-4">
              <span className="text-xs text-zinc-500">New around here? </span>
              <button
                id="login-switch-signup-btn"
                type="button"
                onClick={() => setMode('signup')}
                className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Create new account
              </button>
            </div>
          </form>
        )}

        {/* --- SIGNUP FORM --- */}
        {mode === 'signup' && (
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase font-mono tracking-wider font-semibold">Account Role</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Buyer', 'Organizer'] as const).map((r) => (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`px-3 py-2 rounded-lg text-xs font-medium text-center border transition-all cursor-pointer ${
                      role === r
                        ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 font-semibold'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {r === 'Buyer' ? 'Event Attendee' : 'Event Organizer'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">Full Name</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <User className="h-4 w-4" />
                </span>
                <input
                  id="signup-name-input"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g., Chioma Adebayo"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="signup-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g., adebayo@outlook.com"
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">Password</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="signup-password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase font-mono tracking-wider">Confirm</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Lock className="h-4 w-4" />
                  </span>
                  <input
                    id="signup-confirm-input"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••"
                    className="w-full rounded-xl border border-zinc-800 bg-zinc-950 py-2.5 pl-10 pr-4 text-xs text-white placeholder-zinc-600 focus:border-emerald-500 focus:outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button
              id="signup-submit-btn"
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold font-display shadow-lg shadow-emerald-500/10 transition-all cursor-pointer"
            >
              Generate Verification Code
            </button>

            <div className="text-center mt-4">
              <span className="text-xs text-zinc-500">Already registered? </span>
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-emerald-400 hover:underline font-semibold cursor-pointer"
              >
                Log In
              </button>
            </div>
          </form>
        )}

        {/* --- OTP VERIFICATION MODAL GRAPHIC --- */}
        {mode === 'otp' && (
          <div className="space-y-5">
            <div className="text-center">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800 text-emerald-400 animate-bounce">
                <KeyRound className="h-5 w-5" />
              </span>
              <p className="text-xs font-mono text-zinc-400 mt-2">
                Type <kbd className="text-emerald-400 font-bold bg-zinc-950 px-1.5 py-0.5 rounded">123456</kbd> to activate credentials
              </p>
            </div>

            {/* Code Inputs */}
            <div className="flex justify-center gap-2">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  id={`otp-input-${idx}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Backspace' && !digit && idx > 0) {
                      document.getElementById(`otp-input-${idx - 1}`)?.focus();
                    }
                  }}
                  className="h-12 w-12 rounded-xl border border-zinc-800 bg-zinc-950 text-center text-lg font-bold text-emerald-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              ))}
            </div>

            {/* Verification Button */}
            <button
              id="otp-verify-btn"
              onClick={handleOtpVerify}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-black text-sm font-bold font-display shadow-lg transition-all cursor-pointer"
            >
              Verify Code & Setup Account
            </button>
          </div>
        )}
      </div>
    </div>
  );
};