import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { LogIn, User, Shield, GraduationCap, AlertCircle } from 'lucide-react';
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

  const handleRoleSelect = (role: 'STUDENT' | 'TEACHER' | 'ADMIN') => {
    setActiveRole(role);
    setError('');
    if (role === 'STUDENT') {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const sysInfo = await getDesktopSystemInfo();
      const res = await axios.post('/api/v1/auth/login', {
        identifier,
        password,
        deviceName: sysInfo.deviceName,
        platform: sysInfo.platform
      });

      if (res.data.success) {
        const { accessToken, refreshToken, user } = res.data.data;
        login(accessToken, refreshToken, user);

        if (user.role === 'ADMIN') navigate('/admin');
        else if (user.role === 'TEACHER') navigate('/teacher');
        else navigate('/student');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to sign in. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

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

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              {activeRole === 'STUDENT' ? 'Username, Reg No (e.g. STU20260001), or Mobile' : 'Username or Email'}
            </label>
            <input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:border-[#2563EB] text-xs font-medium"
            />
          </div>

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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#142B4F] to-[#2563EB] hover:from-blue-900 hover:to-blue-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
          >
            <LogIn className="w-4 h-4" />
            <span>{loading ? 'Authenticating...' : `Sign In as ${activeRole}`}</span>
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
