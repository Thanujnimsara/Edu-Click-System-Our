import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { BookOpen, Users, Clock, Search, ArrowRight } from 'lucide-react';
import { GRADES } from '@edu-click/shared';

export const ClassesListPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialGrade = searchParams.get('grade') || '';

  const [classes, setClasses] = useState<any[]>([]);
  const [selectedGrade, setSelectedGrade] = useState(initialGrade);
  const [search, setSearch] = useState('');

  const fetchClasses = () => {
    let url = '/api/v1/classes?status=AVAILABLE';
    if (selectedGrade) url += `&grade=${selectedGrade}`;
    if (search) url += `&search=${search}`;

    axios.get(url).then((res) => {
      if (res.data.success) setClasses(res.data.data);
    });
  };

  useEffect(() => {
    fetchClasses();
  }, [selectedGrade, search]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      
      {/* Header */}
      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold">
            Grade 1–13 Class Directory
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-[#142B4F] mt-2">Available Live Classes</h1>
          <p className="text-xs text-slate-500">Learn from certified instructors across all subjects and national curriculum streams</p>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, title, teacher..."
              className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-xs w-full sm:w-60 focus:border-[#2563EB]"
            />
          </div>

          <select
            value={selectedGrade}
            onChange={(e) => setSelectedGrade(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700"
          >
            <option value="">All Grades</option>
            {GRADES.map((g) => (
              <option key={g.id} value={g.level}>{g.name} ({g.category})</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {classes.map((cls) => (
          <div key={cls.id} className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-xl transition-all">
            <div className="space-y-3">
              <div className="flex justify-between items-start">
                <span className="px-3 py-1 rounded-full bg-blue-50 text-[#2563EB] text-xs font-bold">
                  Grade {cls.grade} • {cls.subject_name}
                </span>
                <span className="text-xs font-bold text-[#14B8A6]">
                  {cls.is_free ? 'FREE' : `LKR ${Number(cls.fee_lkr).toLocaleString()}/mo`}
                </span>
              </div>

              <h3 className="font-bold text-base text-[#142B4F] leading-snug">{cls.title}</h3>
              <p className="text-xs text-slate-500 line-clamp-2">{cls.description}</p>

              <div className="pt-2 flex items-center gap-2 text-xs text-slate-600">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{cls.day_of_week} ({cls.start_time} - {cls.end_time})</span>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Users className="w-3.5 h-3.5 text-slate-400" />
                <span>Instructor: <strong className="text-slate-800">{cls.teacher_name}</strong></span>
              </div>
            </div>

            <div className="pt-6 mt-4 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] font-semibold text-slate-400">{cls.enrolled_count} Enrolled</span>
              <Link
                to={`/classes/${cls.id}`}
                className="px-4 py-2 rounded-xl bg-[#142B4F] hover:bg-[#2563EB] text-white text-xs font-bold transition-colors"
              >
                Enroll Now
              </Link>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
