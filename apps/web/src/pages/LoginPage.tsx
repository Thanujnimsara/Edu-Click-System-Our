import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import {
  LogIn,
  User,
  Shield,
  GraduationCap,
  AlertCircle,
  Smartphone,
  KeyRound,
  RotateCw,
  Sparkles,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getDesktopSystemInfo } from '../services/desktop';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [activeRole, setActiveRole] = useState<'STUDENT' | 'TEACHER' | 'ADMIN'>('STUDENT');
  const [identifier, setIdentifier] = useState('student_kamal');
  const [password, setPassword] = useState('Student@1234');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Student OTP Verification States
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [mockOtp, setMockOtp] = useState('');
  const [sentMobile, setSentMobile] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [smsAlert, setSmsAlert] = useState<{ code: string; mobile: string; time: string } | null>(null);

  useEffect(() => {
    const roleParam = searchParams.get('role')?.toUpperCase();
    if (roleParam === 'ADMIN') {
      handleRoleSelect('ADMIN');
    } else if (roleParam === 'TEACHER') {
      handleRoleSelect('TEACHER');
    } else if (roleParam === 'STUDENT') {
      handleRoleSelect('STUDENT');
    }
  }, [searchParams]);

  // Resend Countdown Timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    setActiveRole(role);
    setError('');
    setOtpCode('');
    setOtpSent(false);
    setMockOtp('');
    setSmsAlert(null);
    setCountdown(0);

    if (role === 'STUDENT') {
      try {
        const stored = localStorage.getItem('educlick_last_registered_student');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.registrationNumber || parsed.username) {
            setIdentifier(parsed.registrationNumber || parsed.username);
            setPassword('Student@1234');
            return;
          }
        }
      } catch (e) {}
      setIdentifier('student_kamal');
      setPassword('Student@1234');
    } else if (role === 'TEACHER') {
      setIdentifier('teacher_kasun');
      setPassword('Teacher@1234');
    } else {
      setIdentifier('admin');
      setPassword('Admin@1234');
    }
  };

  const getRegisteredMobileInfo = () => {
    if (identifier.toLowerCase().includes('kamal') || identifier === 'STU20260001') {
      return { raw: '0751112233', masked: '075 •••• 233', name: 'Kamal Perera' };
    }

    try {
      const stored = localStorage.getItem('educlick_last_registered_student');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (
          parsed.username === identifier ||
          parsed.registrationNumber === identifier ||
          parsed.mobile === identifier
        ) {
          const raw = parsed.mobile || '0775556677';
          const masked = raw.length >= 7 ? `${raw.slice(0, 3)} •••• ${raw.slice(-3)}` : raw;
          return { raw, masked, name: parsed.fullName || 'Registered Student' };
        }
      }
    } catch (e) {}

    if (/^0\d{9}$/.test(identifier)) {
      return { raw: identifier, masked: `${identifier.slice(0, 3)} •••• ${identifier.slice(-3)}`, name: 'Student' };
    }

    return { raw: '0751112233', masked: '075 •••• 233', name: 'Student Account' };
  };

  const handleSendOtp = async () => {
    setError('');
    setOtpLoading(true);
    const info = getRegisteredMobileInfo();

    try {
      const res = await axios.post('/api/v1/auth/student-login-otp', {
        identifier,
        password
      });

      if (res.data.success) {
        const receivedOtp = res.data.data.mockOtp || '582914';
        const masked = res.data.data.maskedMobile || info.masked;
        setMockOtp(receivedOtp);
        setSentMobile(masked);
        setOtpSent(true);
        setCountdown(60);
        setSmsAlert({
          code: receivedOtp,
          mobile: masked,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        return;
      }
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 404) {
        setError(err.response?.data?.message || 'Invalid student credentials. Please verify your details.');
        setOtpLoading(false);
        return;
      }

      // Offline / Static GitHub Pages fallback
      const generatedOtp = String(Math.floor(100000 + Math.random() * 900000));
      setMockOtp(generatedOtp);
      setSentMobile(info.masked);
      setOtpSent(true);
      setCountdown(60);
      setSmsAlert({
        code: generatedOtp,
        mobile: info.masked,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (activeRole === 'STUDENT') {
      // Step 1: If OTP not yet sent, trigger OTP send
      if (!otpSent) {
        await handleSendOtp();
        return;
      }

      // Step 2: Ensure 6 digits entered
      if (otpCode.trim().length !== 6) {
        setError('Please enter the 6-digit OTP code sent to your registered phone number.');
        return;
      }

      // Verify OTP code matches
      if (mockOtp && otpCode.trim() !== mockOtp.trim()) {
        setError('Invalid OTP code. Please enter the correct 6-digit code received via SMS.');
        return;
      }
    }

    setLoading(true);

    try {
      const sysInfo = await getDesktopSystemInfo();
      const res = await axios.post('/api/v1/auth/login', {
        identifier,
        password,
        otpCode: activeRole === 'STUDENT' ? otpCode.trim() : undefined,
        deviceName: sysInfo.deviceName,
        platform: sysInfo.platform
      });

      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data.data;
        login(accessToken, refreshToken, user);

        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'TEACHER') navigate('/teacher');
        else navigate('/student');
        return;
      }
    } catch (err: any) {
      if (err.response?.data?.message) {
        setError(err.response.data.message);
        setLoading(false);
        return;
      }

      // Fallback for static GitHub Pages preview
      const info = getRegisteredMobileInfo();
      const mockUser = {
        id: 'kamal-uuid-001',
        username: identifier,
        email: 'kamal@gmail.com',
        mobile: info.raw,
        role: activeRole,
        fullName: activeRole === 'STUDENT' ? info.name : (activeRole === 'TEACHER' ? 'Kasun Jayawardena' : 'System Administrator'),
        registrationNumber: activeRole === 'STUDENT' ? 'STU20260001' : undefined,
        grade: activeRole === 'STUDENT' ? 10 : undefined,
        preferredLanguage: 'en'
      };
      login('mock-access-token-gh-pages', 'mock-refresh-token-gh-pages', mockUser as any);
      if (activeRole === 'ADMIN') navigate('/admin');
      else if (activeRole === 'TEACHER') navigate('/teacher');
      else navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const registeredInfo = getRegisteredMobileInfo();

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-[#142B4F] to-[#2563EB] p-1 flex items-center justify-center shadow-lg">
            <img src="/brand/icon.svg" alt="EDU CLICK" className="w-10 h-10 object-contain" />
          </div>
          <h2 className="text-2xl font-black text-[#142B4F]">Sign In to EDU CLICK</h2>
          <p className="text-xs text-slate-500">One account across Android, iOS, Windows, Mac & Web</p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => handleRoleSelect('STUDENT')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'STUDENT' ? 'bg-white text-[#2563EB] shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Student</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('TEACHER')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'TEACHER' ? 'bg-white text-[#2563EB] shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Teacher</span>
          </button>

          <button
            type="button"
            onClick={() => handleRoleSelect('ADMIN')}
            className={`py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
              activeRole === 'ADMIN' ? 'bg-white text-[#2563EB] shadow-md' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Admin</span>
          </button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Realistic SMS Notification Banner (Simulation) */}
        {smsAlert && activeRole === 'STUDENT' && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-300 text-xs text-slate-800 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-emerald-800">
                <MessageSquare className="w-4 h-4 text-emerald-600" />
                <span>SMS Delivery to {smsAlert.mobile}</span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono">{smsAlert.time}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/90 border border-emerald-200 font-mono text-[11px] text-slate-700 flex items-center justify-between">
              <span>
                EDU CLICK OTP: <strong className="text-base font-black text-[#2563EB] tracking-wider">{smsAlert.code}</strong>
              </span>
              <button
                type="button"
                onClick={() => setOtpCode(smsAlert.code)}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold shadow-sm transition-all flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3" />
                <span>Auto-fill</span>
              </button>
            </div>
            <p className="text-[10px] text-slate-500 italic">
              Code valid for 10 minutes. Enter code below to unlock Sign In.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Identifier Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {activeRole === 'STUDENT' ? 'Username, Reg No (e.g. STU20260001), or Mobile' : 'Username or Email'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => {
                setIdentifier(e.target.value);
                setOtpSent(false);
                setOtpCode('');
                setSmsAlert(null);
              }}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs font-medium"
            />
          </div>

          {/* Password Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-bold text-slate-700">Password</label>
              <span className="text-[10px] text-slate-400">Encrypted with bcrypt</span>
            </div>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs font-medium"
            />
          </div>

          {/* Student Registered Mobile & OTP Section */}
          {activeRole === 'STUDENT' && (
            <div className="space-y-3 pt-1">
              {/* Registered Phone Info Card */}
              <div className="p-3.5 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#2563EB]" />
                  <div>
                    <p className="text-[10px] text-slate-500 font-semibold">Registered Student Mobile</p>
                    <p className="font-mono font-bold text-[#142B4F]">{registeredInfo.masked}</p>
                  </div>
                </div>
                {!otpSent ? (
                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={otpLoading}
                    className="px-3 py-1.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-[11px] font-bold shadow-sm transition-all flex items-center gap-1.5"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>{otpLoading ? 'Sending...' : 'Send OTP'}</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    <span>OTP Dispatched</span>
                  </span>
                )}
              </div>

              {/* OTP Input Field (Shows after OTP is dispatched) */}
              {otpSent && (
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <KeyRound className="w-3.5 h-3.5 text-[#2563EB]" />
                      <span>Enter 6-Digit OTP</span>
                    </label>
                    <span className="text-[10px] font-semibold text-slate-500">
                      Sent to {sentMobile}
                    </span>
                  </div>

                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="• • • • • •"
                    value={otpCode}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtpCode(val);
                      setError('');
                    }}
                    className="w-full text-center tracking-[0.5em] text-lg font-black font-mono py-3 rounded-2xl border-2 border-blue-200 focus:border-[#2563EB] bg-white focus:outline-none transition-all shadow-inner"
                  />

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>Didn't receive SMS?</span>
                    {countdown > 0 ? (
                      <span className="font-semibold text-slate-400">Resend in {countdown}s</span>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpLoading}
                        className="font-bold text-[#2563EB] hover:underline flex items-center gap-1"
                      >
                        <RotateCw className={`w-3 h-3 ${otpLoading ? 'animate-spin' : ''}`} />
                        <span>Resend OTP</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Action / Submit Button */}
          <button
            type="submit"
            disabled={
              loading ||
              (activeRole === 'STUDENT' && otpSent && otpCode.trim().length !== 6)
            }
            className={`w-full py-3.5 rounded-2xl font-bold text-xs transition-all flex items-center justify-center gap-2 ${
              activeRole === 'STUDENT'
                ? otpSent
                  ? otpCode.trim().length === 6
                    ? 'bg-gradient-to-r from-[#142B4F] to-[#2563EB] hover:from-blue-900 hover:to-blue-700 text-white shadow-xl shadow-blue-900/30 cursor-pointer animate-pulse'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                  : 'bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-blue-700 hover:to-blue-800 text-white shadow-lg cursor-pointer'
                : 'bg-gradient-to-r from-[#142B4F] to-[#2563EB] hover:from-blue-900 hover:to-blue-700 text-white font-bold shadow-lg cursor-pointer'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>
              {loading
                ? 'Authenticating...'
                : activeRole === 'STUDENT'
                  ? otpSent
                    ? otpCode.trim().length === 6
                      ? 'Sign In as STUDENT'
                      : 'Enter 6-Digit OTP to Sign In'
                    : 'Send OTP & Sign In as STUDENT'
                  : `Sign In as ${activeRole}`}
            </span>
          </button>
        </form>

        {activeRole === 'STUDENT' && (
          <div className="text-center pt-2">
            <p className="text-xs text-slate-500">
              New student?{' '}
              <Link to="/register" className="font-bold text-[#2563EB] hover:underline">
                Register for Grade 1–13
              </Link>
            </p>
          </div>
        )}

      </div>
    </div>
  );
};
