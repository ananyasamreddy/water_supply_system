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
    <div className="min-h-screen bg-[#f6f7f8] text-[#253449] flex flex-col selection:bg-sky-500 selection:text-[#253449]">
      
      {/* Top Municipal Authority Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-[#e4e8ed] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#315f8e] flex items-center justify-center shadow-sm">
              <Droplets className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#22364b]">SmartWater GIS</span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section with Integrated Portal Access */}
      <section className="relative overflow-hidden pt-12 pb-16 px-6 border-b border-[#e1e6ec]/60 bg-[#f6f7f8]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center relative z-10">
          
          {/* Left Column: Simple & User-Friendly Introduction */}
          <div className="lg:col-span-7 space-y-6 text-left">
            <div className="space-y-5">
              <h1 className="text-3xl sm:text-[42px] font-semibold text-[#22364b] tracking-[-0.035em] leading-[1.16]">
                AI-Enabled GIS for Water Supply Network Mapping and Monitoring
              </h1>
              <p className="text-[15px] text-[#596779] leading-7 max-w-xl">
                Map water-supply assets, monitor network conditions and support maintenance decisions with location-based information and data-driven insights.
              </p>
            </div>
          </div>

          {/* Right Column: Integrated Central Authentication Card */}
          <div id="auth-card" className="lg:col-span-5 scroll-mt-24">
            <div className="p-6 sm:p-8 rounded-xl bg-white border border-[#e1e6ec] shadow-[0_8px_30px_rgba(28,48,70,0.06)] relative">
              
              {/* Tab Selector */}
              <div className="flex bg-[#f8fafc] p-1 rounded-lg border border-[#e1e6ec] mb-5">
                <button
                  type="button"
                  onClick={() => { setAuthMode('login'); setLoginError(''); setRegError(''); }}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    authMode === 'login'
                      ? 'bg-[#315f8e] text-white shadow-sm'
                      : 'text-[#748092] hover:text-[#253449]'
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
                      ? 'bg-[#315f8e] text-white shadow-sm'
                      : 'text-[#748092] hover:text-[#253449]'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  Create account
                </button>
              </div>

              {/* 1. SIGN IN FORM */}
              {authMode === 'login' && (
                <div className="space-y-4 text-left">
                  <div>
                    <h3 className="text-lg font-semibold text-[#253449] tracking-tight">Sign in to your account</h3>
                    <p className="text-sm text-[#637286] leading-5 mt-1">Enter your registered email and password to access the portal.</p>
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
                      <label className="text-xs font-medium text-[#46566a] block mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8792a1] absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#253449] placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#46566a] block mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8792a1] absolute left-3 top-2.5" />
                        <input
                          type="password"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          placeholder="Enter your password"
                          className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#253449] placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full py-2.5 rounded-lg bg-[#315f8e] hover:bg-[#274e76] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? 'Signing you in…' : 'Sign in to your account'}
                    </button>
                  </form>
                </div>
              )}

              {/* 2. REGISTER FORM */}
              {authMode === 'register' && (
                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-left">
                  <div>
                    <h3 className="text-base font-bold text-[#253449]">Create an account</h3>
                    <p className="text-sm text-[#637286] leading-5 mt-1">Create your account to access the tools and information available to your role.</p>
                  </div>

                  {regError && (
                    <div className="p-3 rounded-lg bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{regError}</span>
                    </div>
                  )}

                  <div className="space-y-2.5">
                    <div>
                      <label className="text-xs font-medium text-[#46566a] block mb-1.5">Full Name</label>
                      <div className="relative">
                        <User className="w-4 h-4 text-[#8792a1] absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          placeholder="e.g. Ramesh Kumar"
                          className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#253449] placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#46566a] block mb-1.5">Email Address</label>
                      <div className="relative">
                        <Mail className="w-4 h-4 text-[#8792a1] absolute left-3 top-2.5" />
                        <input
                          type="email"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          placeholder="name@example.com"
                          className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#253449] placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#46566a] block mb-1.5">Password</label>
                      <div className="relative">
                        <Lock className="w-4 h-4 text-[#8792a1] absolute left-3 top-2.5" />
                        <input
                          type="password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          placeholder="Create a password"
                          className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg pl-9 pr-3 py-2.5 text-sm text-[#253449] placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-xs font-medium text-[#46566a] block mb-1.5">Assign Role</label>
                        <select
                          value={regRole}
                          onChange={(e) => {
                            setRegRole(e.target.value);
                            if (e.target.value === 'CITIZEN') setRegDept('Central Zone Resident');
                            else if (e.target.value === 'FIELD_ENGINEER') setRegDept('Distribution Maintenance Crew');
                            else if (e.target.value === 'MUNICIPALITY_OFFICER') setRegDept('Water Supply Board');
                            else if (e.target.value === 'ADMIN') setRegDept('System & IT Administration');
                          }}
                          className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg px-2.5 py-2.5 text-sm text-[#253449] focus:outline-none focus:border-sky-500"
                        >
                          <option value="CITIZEN">Citizen Consumer</option>
                          <option value="FIELD_ENGINEER">Field Engineer</option>
                          <option value="MUNICIPALITY_OFFICER">Municipal Officer</option>
                          <option value="ADMIN">System Administrator</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-[#46566a] block mb-1.5">Phone Number</label>
                        <div className="relative">
                          <Phone className="w-3.5 h-3.5 text-[#8792a1] absolute left-2.5 top-2.5" />
                          <input
                            type="text"
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder="+91 9876543210"
                            className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg pl-8 pr-2.5 py-2.5 text-sm text-[#253449] placeholder-slate-500 focus:outline-none focus:border-sky-500"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-medium text-[#46566a] block mb-1.5">Department / Locality</label>
                      <div className="relative">
                        <MapPin className="w-3.5 h-3.5 text-[#8792a1] absolute left-2.5 top-2.5" />
                        <input
                          type="text"
                          value={regDept}
                          onChange={(e) => setRegDept(e.target.value)}
                          placeholder="e.g. Zone 1 North / Engineering Division"
                          className="w-full bg-[#f8fafc] border border-[#e1e6ec] rounded-lg pl-8 pr-2.5 py-2.5 text-sm text-[#253449] placeholder-slate-500 focus:outline-none focus:border-sky-500"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2.5 rounded-lg bg-[#315f8e] hover:bg-[#274e76] text-white font-semibold text-xs shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-3"
                  >
                    {loading ? 'Creating account…' : 'Create your account'}
                  </button>
                </form>
              )}

            </div>
          </div>

        </div>
      </section>

      {/* Simple footer */}
      <footer className="mt-auto border-t border-[#e4e8ed] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-center text-center">
          <p className="text-xs text-[#8792a1]">© 2026 SmartWater GIS</p>
        </div>
      </footer>
    </div>
  );
}
