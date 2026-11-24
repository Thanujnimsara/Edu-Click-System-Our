import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, Calendar, Video, CreditCard, Smartphone, CheckCircle, 
  Clock, AlertCircle, FileText, Download, ShieldCheck, LogOut, 
  Bell, User as UserIcon, Globe, Settings, Award, ChevronRight, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BuiltInClassroom } from '../../components/BuiltInClassroom';
import { ReceiptModal } from '../../components/ReceiptModal';

type StudentTab = 'OVERVIEW' | 'CLASSES' | 'TIMETABLE' | 'EXAMS' | 'PAYMENTS' | 'DEVICES' | 'PROFILE';

export const StudentDashboard: React.FC = () => {
  const { user, logout, updateLanguage } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<StudentTab>('OVERVIEW');

  useEffect(() => {
    if (location.pathname.endsWith('/classes')) setActiveTab('CLASSES');
    else if (location.pathname.endsWith('/timetable')) setActiveTab('TIMETABLE');
    else if (location.pathname.endsWith('/results') || location.pathname.endsWith('/exams')) setActiveTab('EXAMS');
    else if (location.pathname.endsWith('/payments')) setActiveTab('PAYMENTS');
    else if (location.pathname.endsWith('/devices')) setActiveTab('DEVICES');
    else if (location.pathname.endsWith('/profile')) setActiveTab('PROFILE');
    else if (location.pathname === '/student') setActiveTab('OVERVIEW');
  }, [location.pathname]);
  const [enrolledClasses, setEnrolledClasses] = useState<any[]>([]);
  const [timetable, setTimetable] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [results, setResults] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  const [activeLiveClass, setActiveLiveClass] = useState<any | null>(null);
  const [selectedReceipt, setSelectedReceipt] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile edit state
  const [profileLang, setProfileLang] = useState(user?.preferredLanguage || 'en');
  const [profileSuccessMsg, setProfileSuccessMsg] = useState('');

  const fetchDashboardData = async () => {
    try {
      const [clsRes, ttRes, payRes, resRes, devRes, notifRes] = await Promise.all([
        axios.get('/api/v1/enrollments/my'),
        axios.get('/api/v1/timetable/my'),
        axios.get('/api/v1/payments/history'),
        axios.get('/api/v1/exams/results/my'),
        axios.get('/api/v1/auth/devices'),
        axios.get('/api/v1/notifications')
      ]);

      if (clsRes.data.success) setEnrolledClasses(clsRes.data.data);
      if (ttRes.data.success) setTimetable(ttRes.data.data);
      if (payRes.data.success) setPayments(payRes.data.data);
      if (resRes.data.success) setResults(resRes.data.data);
      if (devRes.data.success) setDevices(devRes.data.data);
      if (notifRes.data.success) setNotifications(notifRes.data.data);
    } catch (e) {
      console.warn('Dashboard fetch error', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleRevokeDevice = async (sessionId: string) => {
    try {
      await axios.delete(`/api/v1/auth/devices/${sessionId}`);
      fetchDashboardData();
    } catch (e) {
      alert('Failed to revoke session');
    }
  };

  const handleLogoutAll = async () => {
    try {
      await axios.post('/api/v1/auth/logout-all');
      logout();
    } catch (e) {
      alert('Failed to logout from all devices');
    }
  };

  const handleJoinClass = async (cls: any) => {
    try {
      const res = await axios.get(`/api/v1/live/room/${cls.id}`);
      if (res.data.success) {
        const liveData = res.data.data;
        if (liveData.classType === 'EXTERNAL' && liveData.externalLink) {
          window.open(liveData.externalLink, '_blank');
        } else {
          setActiveLiveClass(cls);
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to join live session');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateLanguage(profileLang);
    setProfileSuccessMsg('Profile and language preference synchronized across all devices!');
    setTimeout(() => setProfileSuccessMsg(''), 4000);
  };

  const markNotifRead = async (id: string) => {
    await axios.patch(`/api/v1/notifications/${id}/read`);
    fetchDashboardData();
  };

  if (activeLiveClass) {
    return (
      <BuiltInClassroom
        classTitle={activeLiveClass.title}
        onLeave={() => setActiveLiveClass(null)}
      />
    );
  }

  const unreadNotifsCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* 1. Header Banner & Notification Hub */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#142B4F] via-[#1E3A8A] to-[#2563EB] text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-[#14B8A6] text-xs font-bold border border-white/10">
              Student Portal • Grade {user?.grade || 11}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
              Synced Across Devices
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome, {user?.fullName || 'Student'}!
          </h1>
          <p className="text-xs text-slate-300">
            Registration Number: <strong className="text-white font-mono">{user?.registrationNumber || 'STU20260001'}</strong>
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <div className="relative">
            <button
              onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}
              className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white relative transition-all"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold flex items-center justify-center border-2 border-[#142B4F]">
                  {unreadNotifsCount}
                </span>
              )}
            </button>

            {/* Notification Drawer */}
            {notifDropdownOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 p-4 text-slate-800 z-50 space-y-3">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                  <h4 className="font-bold text-xs text-[#142B4F]">Notifications</h4>
                  <button onClick={() => setNotifDropdownOpen(false)} className="text-slate-400 text-xs">✕</button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {notifications.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">No notifications yet.</p>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markNotifRead(n.id)}
                        className={`p-2.5 rounded-xl text-xs cursor-pointer transition-all ${
                          n.is_read ? 'bg-slate-50 text-slate-500' : 'bg-blue-50 text-blue-900 font-semibold'
                        }`}
                      >
                        <p className="font-bold text-[11px]">{n.title}</p>
                        <p className="text-[10px] text-slate-600 mt-0.5">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          <Link
            to="/classes"
            className="px-6 py-3 rounded-2xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-lg transition-all"
          >
            Find New Classes
          </Link>
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: BookOpen },
          { key: 'CLASSES', label: 'My Classes', icon: Award },
          { key: 'TIMETABLE', label: 'My Timetable', icon: Calendar },
          { key: 'EXAMS', label: 'Exams & Results', icon: FileText },
          { key: 'PAYMENTS', label: 'Receipts & Payments', icon: CreditCard },
          { key: 'DEVICES', label: 'Device Sessions', icon: Smartphone },
          { key: 'PROFILE', label: 'Profile & Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as StudentTab)}
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
          
          {/* Overview Metrics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Enrolled Classes</span>
                <BookOpen className="w-5 h-5 text-[#2563EB]" />
              </div>
              <h3 className="text-2xl font-black text-[#142B4F]">{enrolledClasses.length}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">Active Curriculum</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Timetable Sessions</span>
                <Calendar className="w-5 h-5 text-[#14B8A6]" />
              </div>
              <h3 className="text-2xl font-black text-[#142B4F]">{timetable.length}</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Scheduled This Week</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Attendance Rate</span>
                <CheckCircle className="w-5 h-5 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-black text-[#142B4F]">96.5%</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">Good Academic Standing</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <div className="flex justify-between items-center text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active Devices</span>
                <Smartphone className="w-5 h-5 text-purple-500" />
              </div>
              <h3 className="text-2xl font-black text-[#142B4F]">{devices.length}</h3>
              <p className="text-[11px] text-[#2563EB] font-semibold">100% Cloud Synced</p>
            </div>
          </div>

          {/* Quick Access Enrolled Classes */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-[#142B4F]">My Active Classes</h2>
                <p className="text-xs text-slate-500">Join your live video classroom with camera and microphone</p>
              </div>
              <button onClick={() => setActiveTab('CLASSES')} className="text-xs font-bold text-[#2563EB] hover:underline">
                View All ({enrolledClasses.length}) →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrolledClasses.slice(0, 3).map((cls) => (
                <div key={cls.id} className="p-5 rounded-2xl border border-slate-200 bg-[#F5F7FB] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-full bg-white text-[#2563EB] text-[10px] font-bold border border-slate-200">
                        {cls.subject_name}
                      </span>
                      <span className="text-[10px] font-bold text-[#14B8A6]">
                        {cls.class_type === 'BUILT_IN' ? 'WebRTC Live' : cls.external_platform || 'Online'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-[#142B4F] leading-snug">{cls.title}</h3>
                    <p className="text-xs text-slate-500">Instructor: <strong>{cls.teacher_name}</strong></p>

                    <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cls.day_of_week} • {cls.start_time} - {cls.end_time}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[10px] font-bold text-emerald-600">Active</span>
                    <button
                      onClick={() => handleJoinClass(cls)}
                      className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Join Class</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* TAB 2: MY CLASSES */}
      {activeTab === 'CLASSES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-[#142B4F]">My Enrolled Classes & Subjects</h2>
              <p className="text-xs text-slate-500">Access video classrooms, syllabi, and learning schedules</p>
            </div>
            <Link to="/classes" className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-md">
              Enroll in More Classes
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {enrolledClasses.map((cls) => (
              <div key={cls.id} className="p-5 rounded-2xl border border-slate-200 bg-[#F5F7FB] flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="px-2.5 py-1 rounded-full bg-white text-[#2563EB] text-[10px] font-bold border border-slate-200">
                      Grade {cls.grade} • {cls.subject_name}
                    </span>
                    <span className="text-[10px] font-bold text-[#14B8A6]">{cls.medium}</span>
                  </div>

                  <h3 className="font-bold text-sm text-[#142B4F] leading-snug">{cls.title}</h3>
                  <p className="text-xs text-slate-500">{cls.description}</p>
                  <p className="text-xs text-slate-600">Instructor: <strong>{cls.teacher_name}</strong></p>

                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{cls.day_of_week} • {cls.start_time} - {cls.end_time}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-emerald-600">Enrolled & Active</span>
                  <button
                    onClick={() => handleJoinClass(cls)}
                    className="px-4 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Join Class</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: TIMETABLE */}
      {activeTab === 'TIMETABLE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-[#142B4F]">My Weekly Timetable</h2>
              <p className="text-xs text-slate-500">Synchronized across phone, tablet, and computer</p>
            </div>
            <span className="text-xs font-bold text-[#14B8A6]">Conflict Prevention Active</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
              const dayClasses = timetable.filter(c => c.day_of_week.toLowerCase() === day.toLowerCase());
              return (
                <div key={day} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <h4 className="font-bold text-[11px] text-[#142B4F] uppercase tracking-wider pb-1.5 border-b border-slate-200">{day}</h4>
                  {dayClasses.length === 0 ? (
                    <p className="text-[10px] text-slate-400 italic">No scheduled class</p>
                  ) : (
                    dayClasses.map((c) => (
                      <div key={c.id} className="p-2.5 rounded-xl bg-white border border-blue-200 shadow-sm space-y-1">
                        <p className="font-bold text-[11px] text-[#142B4F] leading-tight">{c.title}</p>
                        <p className="text-[10px] text-slate-500">{c.subject_name}</p>
                        <p className="text-[10px] font-bold text-[#2563EB]">{c.start_time} - {c.end_time}</p>
                        <button
                          onClick={() => handleJoinClass(c)}
                          className="w-full mt-1.5 py-1 rounded bg-[#2563EB] text-white text-[10px] font-bold"
                        >
                          Join
                        </button>
                      </div>
                    ))
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: EXAMS & RESULTS */}
      {activeTab === 'EXAMS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-[#142B4F]">My Exam Results & Past Papers</h2>
              <p className="text-xs text-slate-500">Automated objective marks, percentages, and performance letter grades</p>
            </div>
            <Link to="/exams" className="px-4 py-2 bg-[#2563EB] text-white text-xs font-bold rounded-xl shadow-md">
              Take Online Exam
            </Link>
          </div>

          {results.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <p className="text-xs text-slate-500 font-bold">No exam submissions yet.</p>
              <Link to="/exams" className="mt-2 inline-block text-xs text-[#2563EB] font-bold hover:underline">
                Explore Available Examination Papers →
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                  <tr>
                    <th className="p-3">Exam Paper</th>
                    <th className="p-3">Subject & Grade</th>
                    <th className="p-3">Marks Obtained</th>
                    <th className="p-3">Percentage</th>
                    <th className="p-3">Grade Letter</th>
                    <th className="p-3">Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {results.map((r) => {
                    const pct = r.max_marks > 0 ? (r.obtained_marks / r.max_marks) * 100 : 0;
                    return (
                      <tr key={r.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-[#142B4F]">{r.exam_title}</td>
                        <td className="p-3 text-slate-600">{r.subject_name} (Grade {r.grade})</td>
                        <td className="p-3 font-bold text-slate-800">{r.obtained_marks} / {r.max_marks}</td>
                        <td className="p-3 font-bold text-[#2563EB]">{pct.toFixed(1)}%</td>
                        <td className="p-3">
                          <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            {pct >= 75 ? 'A' : (pct >= 65 ? 'B' : (pct >= 50 ? 'C' : 'S'))}
                          </span>
                        </td>
                        <td className="p-3 text-slate-500 text-[11px]">{r.feedback}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: PAYMENTS & PDF RECEIPTS */}
      {activeTab === 'PAYMENTS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#142B4F]">Payment History & Official Electronic Receipts</h2>
            <p className="text-xs text-slate-500">View payment references, verification status, and printable PDF receipts</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Receipt / Ref</th>
                  <th className="p-3">Class & Subject</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Method</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/70">
                    <td className="p-3 font-mono font-bold text-slate-700">{p.receipt_number || p.transaction_id}</td>
                    <td className="p-3 font-bold text-[#142B4F]">{p.class_title} ({p.subject_name})</td>
                    <td className="p-3 text-slate-500">{new Date(p.created_at).toLocaleDateString()}</td>
                    <td className="p-3 font-semibold">{p.payment_method}</td>
                    <td className="p-3 font-bold text-slate-900">LKR {Number(p.amount_lkr).toLocaleString()}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        p.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {p.receipt_number ? (
                        <button
                          onClick={() => setSelectedReceipt({
                            receiptNumber: p.receipt_number,
                            studentName: user?.fullName || 'Student',
                            registrationNumber: user?.registrationNumber || 'STU20260001',
                            grade: user?.grade || 11,
                            subjectName: p.subject_name,
                            className: p.class_title,
                            teacherName: p.teacher_name,
                            paymentDate: p.created_at,
                            paymentMethod: p.payment_method,
                            amountLkr: p.amount_lkr,
                            transactionId: p.transaction_id
                          })}
                          className="px-3 py-1.5 rounded-lg bg-blue-50 text-[#2563EB] hover:bg-blue-100 font-bold text-[11px] flex items-center gap-1 inline-flex"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>PDF Receipt</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">Verifying</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 6: DEVICES & SESSION MANAGER */}
      {activeTab === 'DEVICES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-black text-[#142B4F]">Active Device Sessions</h2>
              <p className="text-xs text-slate-500">Your account STU20260001 is active on these verified devices</p>
            </div>
            <button
              onClick={handleLogoutAll}
              className="px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 text-xs font-bold flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout From All Devices</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {devices.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/70 flex justify-between items-start">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-[#2563EB]" />
                    <h4 className="text-xs font-bold text-slate-800">{d.deviceName}</h4>
                  </div>
                  <p className="text-[10px] text-slate-500">Platform: {d.platform} • IP: {d.ipAddress}</p>
                  <p className="text-[10px] text-slate-400">Last active: {new Date(d.lastActive).toLocaleTimeString()}</p>
                  {d.isCurrent && (
                    <span className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-[9px]">
                      Current Session
                    </span>
                  )}
                </div>

                {!d.isCurrent && !d.isRevoked && (
                  <button
                    onClick={() => handleRevokeDevice(d.id)}
                    className="text-[11px] text-red-500 hover:underline font-bold"
                  >
                    Revoke
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: PROFILE & LANGUAGE PREFERENCE */}
      {activeTab === 'PROFILE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6 max-w-xl">
          <div>
            <h2 className="text-lg font-black text-[#142B4F]">Student Profile & Language Settings</h2>
            <p className="text-xs text-slate-500">Preferences set here synchronize across every device automatically</p>
          </div>

          {profileSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-bold">
              {profileSuccessMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                disabled
                value={user?.fullName || ''}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Registration Number</label>
              <input
                type="text"
                disabled
                value={user?.registrationNumber || ''}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-mono font-bold text-[#2563EB]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Preferred System Language</label>
              <select
                value={profileLang}
                onChange={(e) => setProfileLang(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 font-bold text-slate-800"
              >
                <option value="en">English</option>
                <option value="si">සිංහල (Sinhala)</option>
                <option value="ta">தமிழ் (Tamil)</option>
              </select>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-[#142B4F] hover:bg-[#2563EB] text-white font-bold text-xs shadow-md transition-all"
            >
              Save & Synchronize All Devices
            </button>
          </form>
        </div>
      )}

      {/* Printable Receipt Modal */}
      {selectedReceipt && (
        <ReceiptModal
          receipt={selectedReceipt}
          onClose={() => setSelectedReceipt(null)}
        />
      )}

    </div>
  );
};
