import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, BookOpen, Calendar, Video, FileText, CheckCircle, 
  CreditCard, Smartphone, Settings, Users, Award, ShieldAlert
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/logo.png';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();
  if (!user) return null;

  const role = user.role;

  const studentLinks = [
    { to: '/student', icon: Home, label: 'Dashboard' },
    { to: '/classes', icon: BookOpen, label: 'Available Classes' },
    { to: '/student/classes', icon: Award, label: 'My Classes' },
    { to: '/student/timetable', icon: Calendar, label: 'My Timetable' },
    { to: '/exams', icon: FileText, label: 'Online Exams' },
    { to: '/student/results', icon: CheckCircle, label: 'My Results' },
    { to: '/student/payments', icon: CreditCard, label: 'Payment History' },
    { to: '/student/devices', icon: Smartphone, label: 'Device Manager' }
  ];

  const teacherLinks = [
    { to: '/teacher', icon: Home, label: 'Teacher Dashboard' },
    { to: '/teacher/classes', icon: BookOpen, label: 'My Classes' },
    { to: '/teacher/schedule', icon: Calendar, label: 'Class Schedule' },
    { to: '/teacher/attendance', icon: CheckCircle, label: 'Attendance Marking' },
    { to: '/teacher/commissions', icon: CreditCard, label: 'Earnings & Commission' },
    { to: '/teacher/devices', icon: Smartphone, label: 'Active Devices' }
  ];

  const adminLinks = [
    { to: '/admin', icon: Home, label: 'Admin Console' },
    { to: '/admin/verifications', icon: CreditCard, label: 'Bank Slip Verifications' },
    { to: '/admin/teachers', icon: Users, label: 'Teacher Management' },
    { to: '/admin/classes', icon: BookOpen, label: 'Class & Subject Control' },
    { to: '/admin/audit', icon: ShieldAlert, label: 'Audit Logs & Security' }
  ];

  const links = role === 'ADMIN' ? adminLinks : (role === 'TEACHER' ? teacherLinks : studentLinks);

  return (
    <aside className="w-64 bg-white border-r border-slate-200 min-h-[calc(100vh-5rem)] p-4 hidden md:flex flex-col justify-between shadow-sm">
      <div className="space-y-6">
        
        {/* User Card */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-[#142B4F]/5 to-[#2563EB]/10 border border-blue-100 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#142B4F] text-white flex items-center justify-center font-bold text-sm shadow">
            {user.fullName ? user.fullName.charAt(0) : 'U'}
          </div>
          <div className="overflow-hidden">
            <h4 className="text-xs font-bold text-[#142B4F] truncate">{user.fullName}</h4>
            <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
              {user.role} {user.registrationNumber ? `• ${user.registrationNumber}` : ''}
            </p>
          </div>
        </div>

        {/* Links */}
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.to === '/student' || link.to === '/teacher' || link.to === '/admin'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#142B4F] text-white shadow-md'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-[#142B4F]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Branding */}
      <div className="pt-4 border-t border-slate-100 flex flex-col items-center text-center gap-1.5">
        <div className="flex items-center gap-2">
          <img src={logoImg} alt="EDU CLICK" className="w-5 h-5 object-contain" />
          <span className="text-xs font-black text-[#142B4F] tracking-tight">EDU CLICK</span>
        </div>
        <p className="text-[10px] font-bold text-slate-400">v4.0.0 • 100% Synced</p>
      </div>
    </aside>
  );
};
