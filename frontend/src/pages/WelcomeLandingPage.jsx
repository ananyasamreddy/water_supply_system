import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  Droplets,
  Users,
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  MapPin,
  Activity,
  Layers,
  Cpu,
  BarChart3,
  GitCompare,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

export default function WelcomeLandingPage() {
  const { login, register, loading } = useAuth();

  const [authMode, setAuthMode] = useState('login'); // 'login' | 'register'
  
  // Login State
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // Register State
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regRole, setRegRole] = useState('CITIZEN');
  const [regPhone, setRegPhone] = useState('');
  const [regDept, setRegDept] = useState('Central Zone Resident');
  const [regError, setRegError] = useState('');

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoginError('');
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password.');
      return;
    }
    const res = await login(loginEmail, loginPassword);
    if (!res.success) {
      setLoginError(res.error || 'Invalid email or password.');
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setRegError('');
    if (!regName || !regEmail || !regPassword) {
      setRegError('Please complete all required fields.');
      return;
    }
    const res = await register({
      name: regName,
      email: regEmail,
      password: regPassword,
      role: regRole,
      phone: regPhone,
      department: regDept
    });
    if (!res.success) {
      setRegError(res.error || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-sky-500 selection:text-white">
      
      {/* Top Municipal Authority Header */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-cyan-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-sky-500/25">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">SmartWater GIS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Integrated Portal Access */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 border-b border-slate-800/60 bg-gradient-to-b from-slate-950 via-slate-900/60 to-slate-950">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-r from-sky-600/20 via-cyan-500/15 to-emerald-500/10 blur-3xl pointer-events-none rounded-full" />
        
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column: Simple & User-Friendly Introduction */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-sky-500/30 text-sky-300 text-xs font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Municipal Smart Water Utility Portal</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
                Smart Water Supply Network
                <br />
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-sky-400 via-cyan-300 to-emerald-400">
                  Monitoring & Maintenance
                </span>
              </h1>
              <p className="text-base text-slate-300 leading-relaxed max-w-xl">
                Welcome to your smart municipal water portal. Designed to be simple, intuitive, and easy to use for city officers, maintenance engineers, and citizens.
              </p>
            </div>
          </div>

          {/* Right Column: Integrated Central Authentication Card */}
          <div id="auth-card" className="lg:col-span-5 scroll-mt-24">
            <div className="p-6 sm:p-7 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl shadow-black/70 relative">
              
              {/* Tab Selector */}
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); setRegError(''); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    authMode === 'login'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setAuthMode('register'); setLoginError(''); setRegError(''); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    authMode === 'register'
                      ? 'bg-sky-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Register Account
                </button>
              </div>

              {/* 1. SIGN IN FORM */}
              {authMode === 'login' && (
                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="text-base font-bold text-white">Sign In to Your Account</h3>
                    <p className="text-xs text-slate-400">Enter your registered email and password to access the portal</p>
                  </div>

                  {loginError && (
                    <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{loginError}</span>
                    </div>
                  )}

                  {/* Registered Login Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="e.g. officer@water.gov"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs shadow-md shadow-sky-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Authenticating...' : 'Sign In'}
                    </button>
                  </form>
                </div>
              )}

              {/* 2. REGISTER FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
                  <div>
                    <h3 className="text-base font-bold text-white">Create New Account</h3>
                    <p className="text-xs text-slate-400">Register with your designated role and department</p>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="e.g. name@water.gov"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create a password"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-medium text-slate-300 block mb-1">Assign Role</label>
                        <select
                          value={regRole}
                          onChange={(e) => {
                            setRegRole(e.target.value);
                            if (e.target.value === 'CITIZEN') setRegDept('Central Zone Resident');
                            else if (e.target.value === 'FIELD_ENGINEER') setRegDept('Distribution Maintenance Crew');
                            else if (e.target.value === 'MUNICIPALITY_OFFICER') setRegDept('Water Supply Board');
                            else if (e.target.value === 'ADMIN') setRegDept('System & IT Administration');
                          }}
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
                        >
                          <option value="CITIZEN">Citizen Consumer</option>
                          <option value="FIELD_ENGINEER">Field Engineer</option>
                          <option value="MUNICIPALITY_OFFICER">Municipal Officer</option>
                          <option value="ADMIN">System Administrator</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-[11px] font-medium text-slate-300 block mb-1">Phone Number</label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+91 9876543210"
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-medium text-slate-300 block mb-1">Department / Locality</label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value)}
                          placeholder="e.g. Zone 1 North / Engineering Division"
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-8 pr-2.5 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs shadow-md shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                  >
                    {loading ? 'Creating Account...' : 'Register & Enter Role Portal'}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Clean Minimal Municipal Footer */}
      <footer className="mt-auto py-5 px-6 border-t border-slate-800 bg-slate-950 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-300">SmartWater GIS Decision-Support System</span>
            <span>•</span>
            <span className="text-[11px] text-slate-500">Municipal Water Distribution Network Monitoring & Predictive Maintenance</span>
          </div>
          <div className="flex items-center gap-4 text-slate-400 text-[11px]">
            <span>Operational Decision Support</span>
            <span>•</span>
            <span>Citizen Helpline: 1916</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
