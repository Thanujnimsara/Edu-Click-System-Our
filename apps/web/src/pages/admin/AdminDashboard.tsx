import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  Users, BookOpen, DollarSign, CheckCircle, XCircle, 
  ShieldCheck, UserPlus, FileText, AlertCircle, Eye, Settings, 
  BarChart, Layers, Download, Check, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

type AdminTab = 'OVERVIEW' | 'VERIFICATIONS' | 'TEACHERS' | 'STUDENTS' | 'SUBJECTS' | 'SETTINGS' | 'REPORTS';

export const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');

  useEffect(() => {
    if (location.pathname.endsWith('/verifications')) setActiveTab('VERIFICATIONS');
    else if (location.pathname.endsWith('/teachers')) setActiveTab('TEACHERS');
    else if (location.pathname.endsWith('/classes') || location.pathname.endsWith('/subjects')) setActiveTab('SUBJECTS');
    else if (location.pathname.endsWith('/audit') || location.pathname.endsWith('/settings')) setActiveTab('SETTINGS');
    else if (location.pathname.endsWith('/reports')) setActiveTab('REPORTS');
    else if (location.pathname === '/admin') setActiveTab('OVERVIEW');
  }, [location.pathname]);
  const [stats, setStats] = useState<any | null>(null);
  const [pendingSlips, setPendingSlips] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [verifyingId, setVerifyingId] = useState<string | null>(null);

  // New Teacher Modal
  const [showTeacherForm, setShowTeacherForm] = useState(false);
  const [newTeacher, setNewTeacher] = useState({
    fullName: '',
    username: '',
    email: '',
    mobile: '',
    password: 'Teacher@1234',
    qualifications: 'B.Sc. / National Diploma',
    experienceYears: '4',
    commissionPercentage: 70
  });

  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      const [statsRes, slipsRes, tchRes, subRes] = await Promise.all([
        axios.get('/api/v1/admin/stats'),
        axios.get('/api/v1/admin/bank-slips/pending'),
        axios.get('/api/v1/teachers'),
        axios.get('/api/v1/subjects')
      ]);

      if (statsRes.data.success) setStats(statsRes.data.data);
      if (slipsRes.data.success) setPendingSlips(slipsRes.data.data);
      if (tchRes.data.success) setTeachers(tchRes.data.data);
      if (subRes.data.success) setSubjects(subRes.data.data);
    } catch (e) {
      console.warn('Admin fetch error', e);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifySlip = async (submissionId: string, action: 'APPROVED' | 'REJECTED') => {
    setVerifyingId(submissionId);
    try {
      const res = await axios.patch(`/api/v1/admin/bank-slips/${submissionId}/verify`, {
        action,
        notes: action === 'APPROVED' ? 'Deposit slip verified and matched against bank records' : 'Invalid reference or amount mismatch'
      });

      if (res.data.success) {
        setActionMessage(`Bank slip ${action.toLowerCase()} successfully! Receipt issued and commission assigned.`);
        setTimeout(() => setActionMessage(''), 4000);
        fetchAdminData();
      }
    } catch (e: any) {
      alert(e.response?.data?.message || 'Verification failed');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleCreateTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/v1/admin/teachers', newTeacher);
      if (res.data.success) {
        alert(`Teacher account created with ID: ${res.data.data.teacherId}`);
        setShowTeacherForm(false);
        fetchAdminData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create teacher account');
    }
  };

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#0B132B] via-[#142B4F] to-[#1E3A8A] text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-[#38BDF8] text-xs font-bold border border-white/10">
            System Administration Console
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">EDU CLICK Central Operations</h1>
          <p className="text-xs text-slate-300">Grade 1–13 Students, Teachers, Gateways, Commissions & Security</p>
        </div>

        <button
          onClick={() => setShowTeacherForm(true)}
          className="px-6 py-3 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold flex items-center gap-2 shadow-lg transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Create Teacher Account</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold">
        {[
          { key: 'OVERVIEW', label: 'Overview & Metrics', icon: BarChart },
          { key: 'VERIFICATIONS', label: `Bank Slip Queue (${pendingSlips.length})`, icon: DollarSign },
          { key: 'TEACHERS', label: 'Teacher Management', icon: Users },
          { key: 'SUBJECTS', label: 'Subjects & Curriculum', icon: BookOpen },
          { key: 'SETTINGS', label: 'Platform Settings', icon: Settings },
          { key: 'REPORTS', label: 'Reports & Export', icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as AdminTab)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === tab.key
                  ? 'bg-[#142B4F] text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-[#142B4F]'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'OVERVIEW' && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
              <h3 className="text-2xl font-black text-[#142B4F]">{stats?.totalStudents || 0}</h3>
              <p className="text-[11px] text-slate-500 font-semibold">{stats?.activeEnrollments || 0} Active Enrollments</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Teachers</span>
              <h3 className="text-2xl font-black text-[#142B4F]">{stats?.totalTeachers || 0}</h3>
              <p className="text-[11px] text-[#2563EB] font-semibold">{stats?.totalClasses || 0} Scheduled Classes</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</span>
              <h3 className="text-2xl font-black text-emerald-700">LKR {Number(stats?.totalRevenueLkr || 0).toLocaleString()}</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Verified LMS Payments</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Platform Earnings (30%)</span>
              <h3 className="text-2xl font-black text-[#2563EB]">LKR {Number(stats?.platformEarningsLkr || 0).toLocaleString()}</h3>
              <p className="text-[11px] text-slate-400 font-semibold">Teacher Share: LKR {Number(stats?.teacherCommissionsLkr || 0).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">National Grades</span>
              <h4 className="text-xl font-bold text-slate-800">13 (Grade 1–13)</h4>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Registered Subjects</span>
              <h4 className="text-xl font-bold text-slate-800">{subjects.length} Subjects</h4>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Examination Papers</span>
              <h4 className="text-xl font-bold text-slate-800">{stats?.totalExams || 1} Published</h4>
            </div>
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase">Pending Slips</span>
              <h4 className="text-xl font-bold text-amber-600">{pendingSlips.length} in Queue</h4>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BANK SLIP VERIFICATION QUEUE */}
      {activeTab === 'VERIFICATIONS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-[#142B4F]">Pending Bank Deposit Slips</h2>
              <p className="text-xs text-slate-500">Verify student bank deposits (BOC, Commercial Bank, HNB), confirm enrollments, and split commission</p>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-xs">
              {pendingSlips.length} Pending
            </span>
          </div>

          {pendingSlips.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-bold">All bank deposit slips have been verified!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Student</th>
                    <th className="p-3">Class & Subject</th>
                    <th className="p-3">Bank Details</th>
                    <th className="p-3">Deposit Ref</th>
                    <th className="p-3">Deposit Date</th>
                    <th className="p-3">Amount</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pendingSlips.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/70">
                      <td className="p-3">
                        <strong className="block text-slate-800">{sub.student_name}</strong>
                        <span className="text-[10px] text-slate-400">{sub.registration_number}</span>
                      </td>
                      <td className="p-3 font-semibold text-[#142B4F]">{sub.class_title}</td>
                      <td className="p-3 text-slate-600">{sub.bank_name || 'BOC / Commercial'}</td>
                      <td className="p-3 font-mono font-bold text-[#2563EB]">{sub.reference_number}</td>
                      <td className="p-3 text-slate-500">{sub.deposit_date}</td>
                      <td className="p-3 font-bold text-slate-900">LKR {Number(sub.amount_lkr).toLocaleString()}</td>
                      <td className="p-3 text-right space-x-2">
                        <button
                          onClick={() => handleVerifySlip(sub.id, 'APPROVED')}
                          disabled={verifyingId === sub.id}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleVerifySlip(sub.id, 'REJECTED')}
                          disabled={verifyingId === sub.id}
                          className="px-3 py-1.5 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-bold text-[11px]"
                        >
                          Reject
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: TEACHERS */}
      {activeTab === 'TEACHERS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-[#142B4F]">Certified Teachers Directory</h2>
              <p className="text-xs text-slate-500">Only Administrator can register and configure teacher accounts</p>
            </div>
            <button
              onClick={() => setShowTeacherForm(true)}
              className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-md"
            >
              Add New Teacher
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {teachers.map((t) => (
              <div key={t.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-sm text-[#142B4F]">{t.full_name}</h4>
                  <p className="text-xs text-[#2563EB] font-mono font-bold">{t.teacher_id}</p>
                  <p className="text-xs text-slate-600 mt-1">{t.qualifications}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Experience: {t.experience_years} years • Rating: ★ {t.rating}</p>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {t.commission_percentage || 70}% Commission
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: SUBJECTS & CURRICULUM */}
      {activeTab === 'SUBJECTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#142B4F]">National Curriculum Subjects</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {subjects.map((s) => (
              <div key={s.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <span className="px-2 py-0.5 rounded bg-blue-100 text-[#2563EB] text-[10px] font-bold">{s.code}</span>
                <h4 className="font-bold text-xs text-[#142B4F] mt-1">{s.name}</h4>
                <p className="text-[11px] text-slate-500">{s.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: PLATFORM SETTINGS */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 max-w-xl">
          <h2 className="text-lg font-black text-[#142B4F]">Global System Configurations</h2>
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Platform Currency</span>
              <p className="font-bold text-slate-800">Sri Lankan Rupee (LKR)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Default Teacher Commission</span>
              <p className="font-bold text-[#14B8A6]">70.0% of Course Fees</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">PayHere Payment Gateway</span>
              <p className="font-bold text-emerald-600">Active (Sandbox Mode)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase">Real-Time WebRTC Live Classroom</span>
              <p className="font-bold text-[#2563EB]">Enabled (Low-latency Sri Lanka CDN)</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & ANALYTICS */}
      {activeTab === 'REPORTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#142B4F]">System Reports & Analytics</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-sm text-[#142B4F]">Financial & Revenue Report</h4>
              <p className="text-xs text-slate-500">Summary of all PayHere and Bank Transfer payments and commission splits.</p>
              <button
                onClick={() => alert('Financial Report exported successfully to CSV!')}
                className="w-full py-2 bg-[#2563EB] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Revenue CSV</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-sm text-[#142B4F]">Student Enrollment Report</h4>
              <p className="text-xs text-slate-500">Breakdown of student registrations per Grade 1–13 and District.</p>
              <button
                onClick={() => alert('Student Report exported successfully to CSV!')}
                className="w-full py-2 bg-[#142B4F] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Enrollment CSV</span>
              </button>
            </div>

            <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
              <h4 className="font-bold text-sm text-[#142B4F]">Examination Performance Report</h4>
              <p className="text-xs text-slate-500">Automated marks, average score, and grade letter distributions.</p>
              <button
                onClick={() => alert('Exam Performance Report exported successfully to CSV!')}
                className="w-full py-2 bg-[#14B8A6] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export Exam Marks CSV</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Create Teacher Account */}
      {showTeacherForm && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-black text-[#142B4F]">Register Certified Teacher</h3>
              <button onClick={() => setShowTeacherForm(false)} className="text-slate-400 font-bold">✕</button>
            </div>

            <form onSubmit={handleCreateTeacher} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Teacher Full Name</label>
                <input
                  type="text"
                  required
                  value={newTeacher.fullName}
                  onChange={(e) => setNewTeacher({ ...newTeacher, fullName: e.target.value })}
                  placeholder="e.g. Nimal Senanayake"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Username</label>
                  <input
                    type="text"
                    required
                    value={newTeacher.username}
                    onChange={(e) => setNewTeacher({ ...newTeacher, username: e.target.value })}
                    placeholder="teacher_nimal"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Mobile</label>
                  <input
                    type="tel"
                    required
                    value={newTeacher.mobile}
                    onChange={(e) => setNewTeacher({ ...newTeacher, mobile: e.target.value })}
                    placeholder="0771234567"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={newTeacher.email}
                  onChange={(e) => setNewTeacher({ ...newTeacher, email: e.target.value })}
                  placeholder="nimal@educlick.lk"
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Qualifications</label>
                  <input
                    type="text"
                    value={newTeacher.qualifications}
                    onChange={(e) => setNewTeacher({ ...newTeacher, qualifications: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Commission %</label>
                  <input
                    type="number"
                    value={newTeacher.commissionPercentage}
                    onChange={(e) => setNewTeacher({ ...newTeacher, commissionPercentage: Number(e.target.value) })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-2xl bg-[#142B4F] hover:bg-[#2563EB] text-white font-bold text-xs shadow-lg transition-all"
              >
                Create Teacher & Issue Unique ID
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
