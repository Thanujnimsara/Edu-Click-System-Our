import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar as CalendarIcon, Clock, Video, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { BuiltInClassroom } from '../components/BuiltInClassroom';

export const TimetablePage: React.FC = () => {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState<any[]>([]);
  const [activeLiveClass, setActiveLiveClass] = useState<any | null>(null);

  useEffect(() => {
    axios.get('/api/v1/timetable/my').then((res) => {
      if (res.data.success) setTimetable(res.data.data);
    });
  }, []);

  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  if (activeLiveClass) {
    return (
      <BuiltInClassroom
        classTitle={activeLiveClass.title}
        onLeave={() => setActiveLiveClass(null)}
      />
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 space-y-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex justify-between items-center">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold">
            Real-Time Schedule Synchronizer
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#142B4F] mt-2">
            Weekly Class Timetable
          </h1>
          <p className="text-xs text-slate-500">Synchronized automatically across all logged-in devices</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
        {days.map((day) => {
          const dayClasses = timetable.filter(c => c.day_of_week.toLowerCase() === day.toLowerCase());
          return (
            <div key={day} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm space-y-3">
              <h3 className="font-bold text-xs text-[#142B4F] uppercase tracking-wider pb-2 border-b border-slate-100">
                {day}
              </h3>

              {dayClasses.length === 0 ? (
                <p className="text-[10px] text-slate-400 italic">No classes</p>
              ) : (
                dayClasses.map((cls) => (
                  <div key={cls.id} className="p-3 rounded-xl bg-[#F5F7FB] border border-blue-100 space-y-1.5 text-xs">
                    <p className="font-bold text-[#142B4F] text-[11px] leading-tight">{cls.title}</p>
                    <p className="text-[10px] text-slate-500">{cls.subject_name}</p>
                    <p className="text-[10px] text-[#2563EB] font-bold">{cls.start_time} - {cls.end_time}</p>
                    
                    <button
                      onClick={() => setActiveLiveClass(cls)}
                      className="w-full mt-2 py-1 rounded-lg bg-[#2563EB] text-white text-[10px] font-bold flex items-center justify-center gap-1"
                    >
                      <Video className="w-3 h-3" />
                      <span>Join</span>
                    </button>
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
