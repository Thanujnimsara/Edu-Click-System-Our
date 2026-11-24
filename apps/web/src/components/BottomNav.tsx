import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, BookOpen, Calendar, FileText, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const BottomNav: React.FC = () => {
  const { user } = useAuth();

  const getProfilePath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student';
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 py-2 px-6 flex justify-around items-center md:hidden shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <NavLink
        to="/"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-[#2563EB] font-bold' : 'text-slate-500 font-medium'}`
        }
      >
        <Home className="w-5 h-5" />
        <span className="text-[10px]">Home</span>
      </NavLink>

      <NavLink
        to="/classes"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-[#2563EB] font-bold' : 'text-slate-500 font-medium'}`
        }
      >
        <BookOpen className="w-5 h-5" />
        <span className="text-[10px]">Classes</span>
      </NavLink>

      {user && (
        <NavLink
          to="/student/timetable"
          className={({ isActive }) =>
            `flex flex-col items-center gap-1 ${isActive ? 'text-[#2563EB] font-bold' : 'text-slate-500 font-medium'}`
          }
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">Timetable</span>
        </NavLink>
      )}

      <NavLink
        to="/exams"
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-[#2563EB] font-bold' : 'text-slate-500 font-medium'}`
        }
      >
        <FileText className="w-5 h-5" />
        <span className="text-[10px]">Exams</span>
      </NavLink>

      <NavLink
        to={getProfilePath()}
        className={({ isActive }) =>
          `flex flex-col items-center gap-1 ${isActive ? 'text-[#2563EB] font-bold' : 'text-slate-500 font-medium'}`
        }
      >
        <User className="w-5 h-5" />
        <span className="text-[10px]">{user ? 'Dashboard' : 'Login'}</span>
      </NavLink>
    </nav>
  );
};
