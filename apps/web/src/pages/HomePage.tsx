import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { 
  BookOpen, Video, ShieldCheck, Smartphone, Users, CheckCircle, 
  ArrowRight, Star, Clock, Calendar, HelpCircle, Sparkles, Download, Layers
} from 'lucide-react';
import { GRADES, BRAND } from '@edu-click/shared';
import logoImg from '../assets/logo.png';

export const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedGradeCategory, setSelectedGradeCategory] = useState<'All' | 'Primary' | 'Junior' | 'O/L' | 'A/L'>('All');
  const [classes, setClasses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    // Fetch available classes and featured teachers from centralized backend
    axios.get('/api/v1/classes?status=AVAILABLE').then((res) => {
      if (res.data.success) setClasses(res.data.data.slice(0, 6));
    }).catch(() => {});

    axios.get('/api/v1/teachers').then((res) => {
      if (res.data.success) setTeachers(res.data.data.slice(0, 4));
    }).catch(() => {});
  }, []);

  const filteredGrades = selectedGradeCategory === 'All' 
    ? GRADES 
    : GRADES.filter(g => g.category === selectedGradeCategory);

  return (
    <div className="min-h-screen bg-[#F5F7FB] text-[#172033]">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#142B4F] via-[#1E3A8A] to-[#142B4F] text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8">
        
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-[#14B8A6]/20 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center space-y-8">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-950/80 border border-blue-700/60 text-[#14B8A6] text-xs font-bold uppercase tracking-wider shadow-inner">
            <Sparkles className="w-4 h-4" />
            <span>Sri Lanka's Unified Grade 1–13 Online Education Ecosystem</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-tight">
            One Platform. <br className="hidden sm:block" />
            <span className="text-[#38BDF8]">Every Device.</span> <span className="text-[#14B8A6]">Every Student.</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            {t('home.heroSubtitle')}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/classes"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white font-bold text-sm shadow-xl shadow-blue-900/40 hover:shadow-2xl transition-all flex items-center justify-center gap-2"
            >
              <span>{t('home.browseGrades')}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-slate-100 text-[#142B4F] font-bold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <span>{t('nav.register')}</span>
            </Link>
          </div>

          {/* Social Proof Badges */}
          <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto text-center border-t border-blue-900/40">
            <div>
              <p className="text-2xl font-black text-white">1–13</p>
              <p className="text-xs text-slate-400 font-semibold">All Grades Covered</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#14B8A6]">3</p>
              <p className="text-xs text-slate-400 font-semibold">Languages (සිං / த / En)</p>
            </div>
            <div>
              <p className="text-2xl font-black text-[#38BDF8]">100%</p>
              <p className="text-xs text-slate-400 font-semibold">Cross-Device Sync</p>
            </div>
            <div>
              <p className="text-2xl font-black text-white">LKR</p>
              <p className="text-xs text-slate-400 font-semibold">Dual Payment Support</p>
            </div>
          </div>

        </div>
      </section>

      {/* 2. DYNAMIC GRADE 1–13 SELECTOR */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#142B4F]">Select Grade Level</h2>
              <p className="text-xs text-slate-500">Official Sri Lankan National Curriculum standards</p>
            </div>

            {/* Category Filter Tabs */}
            <div className="flex flex-wrap gap-2">
              {(['All', 'Primary', 'Junior', 'O/L', 'A/L'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedGradeCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    selectedGradeCategory === cat
                      ? 'bg-[#142B4F] text-white shadow-md'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat === 'All' ? 'All Grades' : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Grades Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {filteredGrades.map((grade) => (
              <Link
                key={grade.id}
                to={`/classes?grade=${grade.level}`}
                className="p-4 rounded-2xl border border-slate-100 bg-[#F5F7FB] hover:bg-blue-50/70 hover:border-[#2563EB]/40 transition-all group flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                    {grade.category}
                  </span>
                  <h4 className="font-extrabold text-sm text-[#142B4F] group-hover:text-[#2563EB]">
                    {grade.name}
                  </h4>
                </div>
                <p className="text-[10px] text-slate-500 mt-2 line-clamp-1">{grade.description}</p>
              </Link>
            ))}
          </div>

        </div>
      </section>

      {/* 3. FEATURED CLASSES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-xs font-bold text-[#14B8A6] uppercase tracking-wider">Live & Recorded</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#142B4F]">Popular Classes</h2>
          </div>
          <Link to="/classes" className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1">
            <span>View All Classes</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

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
      </section>

      {/* 4. WHY EDU CLICK – COMMERCIAL GRADE ARCHITECTURE */}
      <section className="bg-white py-16 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Engineered for Sri Lanka</span>
            <h2 className="text-2xl sm:text-3xl font-black text-[#142B4F]">Built for Every Device, Every Connection</h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Reliable, secure, and multilingual learning across Android, iOS, Windows, and modern web browsers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-3xl bg-[#F5F7FB] border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#142B4F]">{t('home.deviceSync')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('home.deviceSyncDesc')}</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F5F7FB] border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#14B8A6] text-white flex items-center justify-center shadow-md">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#142B4F]">{t('home.dualLive')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('home.dualLiveDesc')}</p>
            </div>

            <div className="p-6 rounded-3xl bg-[#F5F7FB] border border-slate-100 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#142B4F] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#142B4F]">{t('home.dualPay')}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{t('home.dualPayDesc')}</p>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-[#142B4F] text-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 border-b border-blue-900 pb-8 text-center md:text-left">
          <div className="flex items-center gap-3">
            <img src={logoImg} alt="EDU CLICK" className="w-10 h-10 object-contain rounded-xl" />
            <div>
              <h3 className="font-black text-xl tracking-tight">EDU <span className="text-[#38BDF8]">CLICK</span></h3>
              <p className="text-[10px] text-[#14B8A6] font-semibold">One Platform. Every Device. Every Student.</p>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Grade 1–13 Online LMS • ශ්‍රී ලංකා ජාතික අධ්‍යාපන පද්ධතිය • இலங்கை
          </p>
        </div>
        <div className="max-w-7xl mx-auto pt-6 text-center text-[11px] text-slate-400">
          © 2026 EDU CLICK. All rights reserved. Commercial-Grade Cross-Platform LMS.
        </div>
      </footer>

    </div>
  );
};
