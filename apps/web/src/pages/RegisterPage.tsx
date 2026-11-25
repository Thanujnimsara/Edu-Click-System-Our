import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { UserPlus, CheckCircle, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { SRI_LANKA_DISTRICTS } from '@edu-click/shared';
import logoImg from '../assets/logo.png';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<'FORM' | 'SUCCESS'>('FORM');
  const [formData, setFormData] = useState({
    fullName: 'Dilshan Silva',
    username: 'student_dilshan',
    dateOfBirth: '2010-06-15',
    gender: 'MALE',
    parentName: 'Gamini Silva',
    parentMobile: '0714445566',
    mobile: '0775556677',
    email: 'dilshan@educlick.lk',
    password: 'Student@1234',
    confirmPassword: 'Student@1234',
    address: '42 Main Street, Galle',
    district: 'Galle',
    grade: '11'
  });

  const [registeredRegNo, setRegisteredRegNo] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post('/api/v1/auth/register', formData);
      const regNo = res.data?.data?.registrationNumber || `STU${new Date().getFullYear()}${Math.floor(1000 + Math.random() * 9000)}`;

      localStorage.setItem('educlick_last_registered_student', JSON.stringify({
        username: formData.username,
        mobile: formData.mobile,
        fullName: formData.fullName,
        registrationNumber: regNo
      }));

      setRegisteredRegNo(regNo);
      setStep('SUCCESS');
    } catch (err: any) {
      if (!err.response) {
        // Offline / GitHub Pages fallback
        const fallbackRegNo = `STU2026${Math.floor(1000 + Math.random() * 9000)}`;
        localStorage.setItem('educlick_last_registered_student', JSON.stringify({
          username: formData.username,
          mobile: formData.mobile,
          fullName: formData.fullName,
          registrationNumber: fallbackRegNo
        }));
        setRegisteredRegNo(fallbackRegNo);
        setStep('SUCCESS');
        return;
      }
      setError(err.response?.data?.message || 'Registration failed. Please check your information.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-5rem)] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-slate-100 space-y-6">
        
        {step === 'FORM' ? (
          <>
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-white p-1.5 flex items-center justify-center shadow-lg border border-slate-100">
                <img src={logoImg} alt="EDU CLICK" className="w-14 h-14 object-contain rounded-2xl" />
              </div>
              <h2 className="text-2xl font-black text-[#142B4F]">Student Registration</h2>
              <p className="text-xs text-slate-500">Grade 1 through Grade 13 National Curriculum LMS</p>
            </div>

            {error && (
              <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-4">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    required
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender</label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB] bg-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Grade (1–13)</label>
                  <select
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB] bg-white"
                  >
                    {Array.from({ length: 13 }, (_, i) => i + 1).map((g) => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent / Guardian Name</label>
                  <input
                    type="text"
                    required
                    name="parentName"
                    value={formData.parentName}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Parent Mobile</label>
                  <input
                    type="tel"
                    required
                    name="parentMobile"
                    value={formData.parentMobile}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Student Mobile Number</label>
                  <input
                    type="tel"
                    required
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">District</label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB] bg-white"
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Address</label>
                  <input
                    type="text"
                    required
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input
                    type="password"
                    required
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                  <input
                    type="password"
                    required
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:border-[#2563EB]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#142B4F] to-[#2563EB] hover:from-blue-900 hover:to-blue-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                <span>{loading ? 'Creating Account...' : 'Register as Student'}</span>
              </button>
            </form>

            <div className="text-center">
              <p className="text-xs text-slate-500">
                Already registered?{' '}
                <Link to="/login" className="font-bold text-[#2563EB] hover:underline">
                  Sign In
                </Link>
              </p>
            </div>
          </>
        ) : (
          /* REGISTRATION SUCCESS STEP */
          <div className="text-center space-y-6 py-4">
            <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200 shadow-sm animate-in zoom-in duration-300">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 rounded-full bg-emerald-100/70 text-emerald-800 text-[11px] font-bold">
                ✓ Registration Successful
              </span>
              <h2 className="text-2xl font-black text-[#142B4F]">Welcome to EDU CLICK!</h2>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Your student profile has been created successfully. You can now proceed to Sign In using your credentials.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-blue-50/70 border border-blue-100 max-w-sm mx-auto space-y-2 text-left">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Student Registration Number</p>
                <p className="text-lg font-black text-[#2563EB] font-mono">{registeredRegNo}</p>
              </div>
              <div className="pt-2 border-t border-blue-100/60 flex justify-between items-center text-xs">
                <span className="text-slate-500">Registered Mobile:</span>
                <span className="font-bold text-[#142B4F] font-mono">{formData.mobile}</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs max-w-md mx-auto flex items-center gap-2 text-left">
              <Sparkles className="w-4 h-4 shrink-0 text-amber-600" />
              <span>
                <strong>Login Security:</strong> When you sign in, a 6-digit OTP verification code will be sent to your registered phone number (<strong>{formData.mobile}</strong>).
              </span>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => navigate('/login?role=student')}
                className="inline-flex items-center justify-center gap-2 w-full max-w-md py-3.5 rounded-2xl bg-gradient-to-r from-[#142B4F] to-[#2563EB] hover:from-blue-900 hover:to-blue-700 text-white font-bold text-xs shadow-xl shadow-blue-900/20 transition-all cursor-pointer"
              >
                <span>Proceed to Sign In (Login)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
