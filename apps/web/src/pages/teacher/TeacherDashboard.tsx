import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  BookOpen, Users, DollarSign, Calendar, CheckCircle, 
  Video, Clock, ShieldCheck, UserCheck, Smartphone, Settings,
  Award, ArrowRight, Check, X
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { BuiltInClassroom } from '../../components/BuiltInClassroom';

type TeacherTab = 'OVERVIEW' | 'CLASSES' | 'SCHEDULE' | 'ATTENDANCE' | 'EARNINGS' | 'DEVICES';

export const TeacherDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TeacherTab>('OVERVIEW');

  useEffect(() => {
    if (location.pathname.endsWith('/classes')) setActiveTab('CLASSES');
    else if (location.pathname.endsWith('/schedule')) setActiveTab('SCHEDULE');
    else if (location.pathname.endsWith('/attendance')) setActiveTab('ATTENDANCE');
    else if (location.pathname.endsWith('/commissions')) setActiveTab('EARNINGS');
    else if (location.pathname.endsWith('/devices')) setActiveTab('DEVICES');
    else if (location.pathname === '/teacher') setActiveTab('OVERVIEW');
  }, [location.pathname]);
  const [stats, setStats] = useState<any | null>(null);
  const [classes, setClasses] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [activeLiveClass, setActiveLiveClass] = useState<any | null>(null);

  // Attendance State
  const [attendanceModalClass, setAttendanceModalClass] = useState<any | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendanceStatus, setAttendanceStatus] = useState<'PRESENT' | 'ABSENT' | 'LATE'>('PRESENT');
  const [markingSuccess, setMarkingSuccess] = useState(false);

  const fetchTeacherData = async () => {
    try {
      const [dashRes, clsRes, devRes] = await Promise.all([
        axios.get('/api/v1/teacher/dashboard'),
        axios.get('/api/v1/teacher/classes'),
        axios.get('/api/v1/auth/devices')
      ]);

      if (dashRes.data.success) setStats(dashRes.data.data);
      if (clsRes.data.success) setClasses(clsRes.data.data);
      if (devRes.data.success) setDevices(devRes.data.data);
    } catch (e) {
      console.warn('Teacher fetch error', e);
    }
  };

  useEffect(() => {
    fetchTeacherData();
  }, []);

  const handleSaveAttendance = async () => {
    if (!attendanceModalClass) return;
    try {
      await axios.post('/api/v1/teacher/attendance', {
        classId: attendanceModalClass.id,
        sessionDate: attendanceDate,
        attendanceList: [
          { studentId: 'stu-kamal', status: attendanceStatus }
        ]
      });
      setMarkingSuccess(true);
      setTimeout(() => {
        setMarkingSuccess(false);
        setAttendanceModalClass(null);
      }, 1200);
    } catch (e) {
      alert('Failed to save attendance');
    }
  };

  if (activeLiveClass) {
    return (
      <BuiltInClassroom
        classTitle={activeLiveClass.title}
        onLeave={() => setActiveLiveClass(null)}
      />
    );
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 max-w-7xl mx-auto">
      
      {/* Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#142B4F] to-[#2563EB] text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-white/10 text-[#14B8A6] text-xs font-bold border border-white/10">
            Certified Teacher Console • {stats?.teacher?.teacher_id || 'TCH20260001'}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black mt-1">{user?.fullName}</h1>
          <p className="text-xs text-slate-300">
            Commission Rate: <strong className="text-[#14B8A6]">{stats?.teacher?.commission_percentage || 70}%</strong> of Verified Course Fees
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-white rounded-2xl border border-slate-100 shadow-sm text-xs font-bold">
        {[
          { key: 'OVERVIEW', label: 'Overview', icon: BookOpen },
          { key: 'CLASSES', label: 'Assigned Classes', icon: Award },
          { key: 'SCHEDULE', label: 'Class Schedule & Links', icon: Calendar },
          { key: 'ATTENDANCE', label: 'Attendance Register', icon: CheckCircle },
          { key: 'EARNINGS', label: 'Commissions & Payouts', icon: DollarSign },
          { key: 'DEVICES', label: 'Logged-in Devices', icon: Smartphone }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as TeacherTab)}
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
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Classes</span>
              <h3 className="text-2xl font-black text-[#142B4F]">{stats?.totalClasses || 0}</h3>
              <p className="text-[11px] text-slate-500 font-semibold">Scheduled Sessions</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enrolled Students</span>
              <h3 className="text-2xl font-black text-[#142B4F]">{stats?.totalStudents || 0}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">Active Learners</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Earnings</span>
              <h3 className="text-2xl font-black text-[#142B4F]">LKR {Number(stats?.totalEarningsLkr || 0).toLocaleString()}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">70% Commission Rate</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending Payout</span>
              <h3 className="text-2xl font-black text-amber-600">LKR {Number(stats?.pendingCommissionLkr || 0).toLocaleString()}</h3>
              <p className="text-[11px] text-amber-600 font-semibold">Under Processing</p>
            </div>
          </div>

          {/* Quick Classes List */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-black text-[#142B4F]">My Assigned Classes</h2>
                <p className="text-xs text-slate-500">Launch built-in WebRTC classroom or manage attendance</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {classes.map((cls) => (
                <div key={cls.id} className="p-5 rounded-2xl border border-slate-200 bg-[#F5F7FB] flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-full bg-white text-[#2563EB] text-[10px] font-bold border border-slate-200">
                        Grade {cls.grade} • {cls.subject_name}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">{cls.enrolled_count} Enrolled</span>
                    </div>

                    <h3 className="font-bold text-sm text-[#142B4F] leading-snug">{cls.title}</h3>
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{cls.day_of_week} ({cls.start_time} - {cls.end_time})</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex gap-2">
                    <button
                      onClick={() => setActiveLiveClass(cls)}
                      className="flex-1 py-2 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Start Class</span>
                    </button>

                    <button
                      onClick={() => setAttendanceModalClass(cls)}
                      className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold"
                      title="Mark Attendance"
                    >
                      <UserCheck className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ASSIGNED CLASSES */}
      {activeTab === 'CLASSES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#142B4F]">My Class Roster & Syllabi</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {classes.map((cls) => (
              <div key={cls.id} className="p-6 rounded-2xl border border-slate-200 bg-slate-50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="px-3 py-1 rounded-full bg-blue-100 text-[#2563EB] font-bold text-xs">
                    Grade {cls.grade}
                  </span>
                  <span className="text-xs font-bold text-[#14B8A6]">
                    Fee: LKR {Number(cls.fee_lkr).toLocaleString()}
                  </span>
                </div>
                <h3 className="font-black text-base text-[#142B4F]">{cls.title}</h3>
                <p className="text-xs text-slate-600">{cls.description}</p>
                <div className="text-xs text-slate-500 pt-2 border-t border-slate-200 flex justify-between">
                  <span>Enrolled: <strong>{cls.enrolled_count} / {cls.capacity}</strong></span>
                  <span>Platform: <strong>{cls.class_type === 'BUILT_IN' ? 'EDU CLICK WebRTC' : cls.external_platform}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: SCHEDULE & MEETING LINKS */}
      {activeTab === 'SCHEDULE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#142B4F]">Live Class Schedules & Meeting Links</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px]">
                <tr>
                  <th className="p-3">Class</th>
                  <th className="p-3">Grade</th>
                  <th className="p-3">Day & Time</th>
                  <th className="p-3">Platform</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {classes.map((cls) => (
                  <tr key={cls.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-[#142B4F]">{cls.title}</td>
                    <td className="p-3 font-semibold">Grade {cls.grade}</td>
                    <td className="p-3 text-slate-600">{cls.day_of_week} ({cls.start_time} - {cls.end_time})</td>
                    <td className="p-3 font-bold text-[#14B8A6]">{cls.class_type === 'BUILT_IN' ? 'Built-in WebRTC' : cls.external_platform}</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">READY</span></td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setActiveLiveClass(cls)}
                        className="px-3 py-1.5 rounded-lg bg-[#2563EB] text-white font-bold text-xs"
                      >
                        Launch Classroom
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ATTENDANCE */}
      {activeTab === 'ATTENDANCE' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#142B4F]">Class Attendance Register</h2>
          <p className="text-xs text-slate-500">Record and review student attendance (Present, Absent, Late)</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {classes.map((cls) => (
              <div key={cls.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2">
                <h4 className="font-bold text-xs text-[#142B4F]">{cls.title}</h4>
                <p className="text-[11px] text-slate-500">Enrolled: {cls.enrolled_count} students</p>
                <button
                  onClick={() => setAttendanceModalClass(cls)}
                  className="w-full mt-2 py-2 rounded-xl bg-[#142B4F] hover:bg-[#2563EB] text-white text-xs font-bold"
                >
                  Mark Attendance
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: COMMISSIONS & EARNINGS */}
      {activeTab === 'EARNINGS' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-black text-[#142B4F]">Commission & Earnings Breakdown</h2>
            <p className="text-xs text-slate-500">70% Teacher share automatically calculated on every approved enrollment fee</p>
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-xl">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
              <span className="text-xs font-bold text-emerald-800 uppercase">Paid / Available</span>
              <h3 className="text-2xl font-black text-emerald-900 mt-1">LKR {Number(stats?.totalEarningsLkr || 0).toLocaleString()}</h3>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
              <span className="text-xs font-bold text-amber-800 uppercase">Pending Verification</span>
              <h3 className="text-2xl font-black text-amber-900 mt-1">LKR {Number(stats?.pendingCommissionLkr || 0).toLocaleString()}</h3>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: DEVICES */}
      {activeTab === 'DEVICES' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100 shadow-sm space-y-6">
          <h2 className="text-lg font-black text-[#142B4F]">Teacher Active Device Sessions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {devices.map((d) => (
              <div key={d.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-1">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#2563EB]" />
                  <h4 className="text-xs font-bold text-slate-800">{d.deviceName}</h4>
                </div>
                <p className="text-[10px] text-slate-500">Platform: {d.platform} • IP: {d.ipAddress}</p>
                <p className="text-[10px] text-slate-400">Last active: {new Date(d.lastActive).toLocaleTimeString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Attendance Modal */}
      {attendanceModalClass && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-6 space-y-4 border border-slate-100">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <h3 className="font-black text-sm text-[#142B4F]">Mark Class Attendance</h3>
              <button onClick={() => setAttendanceModalClass(null)} className="text-slate-400 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-600 font-semibold">{attendanceModalClass.title}</p>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Session Date</label>
              <input
                type="date"
                value={attendanceDate}
                onChange={(e) => setAttendanceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl space-y-2">
              <p className="text-[11px] font-bold text-slate-500 uppercase">Select Attendance Status</p>
              <div className="grid grid-cols-3 gap-2">
                {(['PRESENT', 'ABSENT', 'LATE'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setAttendanceStatus(st)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all ${
                      attendanceStatus === st
                        ? 'bg-[#142B4F] text-white shadow-md'
                        : 'bg-white border border-slate-200 text-slate-700'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {markingSuccess && (
              <p className="text-xs text-emerald-600 font-bold text-center">Attendance recorded successfully!</p>
            )}

            <button
              onClick={handleSaveAttendance}
              className="w-full py-2.5 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs shadow-md transition-all"
            >
              Save Attendance Record
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
