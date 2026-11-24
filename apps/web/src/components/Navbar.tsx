import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, User as UserIcon, LogOut, Menu, X, Smartphone, Bell, BookOpen } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, logout, updateLanguage } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [langDropdown, setLangDropdown] = React.useState(false);

  const handleLanguageChange = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('educlick_language', lang);
    updateLanguage(lang);
    setLangDropdown(false);
  };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'ADMIN') return '/admin';
    if (user.role === 'TEACHER') return '/teacher';
    return '/student';
  };

  return (
    <header className="sticky top-0 z-50 bg-[#142B4F] text-white shadow-lg border-b border-blue-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand Identity */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#1E3A8A] to-[#14B8A6] p-0.5 shadow-md flex items-center justify-center transform group-hover:scale-105 transition-transform">
              <img src="/brand/icon.svg" alt="EDU CLICK" className="w-10 h-10 object-contain rounded-xl" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-tight text-white">EDU</span>
                <span className="font-extrabold text-2xl tracking-tight text-[#38BDF8]">CLICK</span>
                <span className="w-2 h-2 rounded-full bg-[#14B8A6] inline-block animate-pulse"></span>
              </div>
              <p className="text-[10px] uppercase tracking-wider text-[#14B8A6] font-semibold hidden sm:block">
                One Platform. Every Device. Every Student.
              </p>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-slate-200">
            <Link to="/" className="hover:text-[#14B8A6] transition-colors">{t('nav.home')}</Link>
            <Link to="/classes" className="hover:text-[#14B8A6] transition-colors">{t('nav.classes')}</Link>
            <Link to="/teachers" className="hover:text-[#14B8A6] transition-colors">{t('nav.teachers')}</Link>
            <Link to="/exams" className="hover:text-[#14B8A6] transition-colors">{t('nav.exams')}</Link>
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Language Switcher */}
            <div className="relative">
              <button
                onClick={() => setLangDropdown(!langDropdown)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-950/60 hover:bg-blue-900 border border-blue-800 text-xs font-semibold text-slate-200 transition-all"
              >
                <Globe className="w-4 h-4 text-[#14B8A6]" />
                <span>
                  {i18n.language === 'si' ? 'සිංහල' : (i18n.language === 'ta' ? 'தமிழ்' : 'English')}
                </span>
              </button>

              {langDropdown && (
                <div className="absolute right-0 mt-2 w-36 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-1.5 z-50">
                  <button
                    onClick={() => handleLanguageChange('en')}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between ${i18n.language === 'en' ? 'text-[#2563EB] font-bold' : ''}`}
                  >
                    English {i18n.language === 'en' && '✓'}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('si')}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between font-sinhala ${i18n.language === 'si' ? 'text-[#2563EB] font-bold' : ''}`}
                  >
                    සිංහල {i18n.language === 'si' && '✓'}
                  </button>
                  <button
                    onClick={() => handleLanguageChange('ta')}
                    className={`w-full text-left px-4 py-2 text-xs font-semibold hover:bg-slate-50 flex items-center justify-between font-tamil ${i18n.language === 'ta' ? 'text-[#2563EB] font-bold' : ''}`}
                  >
                    தமிழ் {i18n.language === 'ta' && '✓'}
                  </button>
                </div>
              )}
            </div>

            {/* User Session State */}
            {user ? (
              <div className="flex items-center gap-3">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] hover:from-[#1D4ED8] hover:to-[#1E40AF] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
                >
                  <UserIcon className="w-4 h-4" />
                  <span>{user.fullName.split(' ')[0]} ({user.role})</span>
                </Link>
                <button
                  onClick={logout}
                  title="Logout"
                  className="p-2 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-red-200 border border-red-500/20 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-blue-900/60 transition-all"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 rounded-xl bg-[#14B8A6] hover:bg-[#0D9488] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5"
                >
                  <span>{t('nav.register')}</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={() => handleLanguageChange(i18n.language === 'en' ? 'si' : (i18n.language === 'si' ? 'ta' : 'en'))}
              className="px-2.5 py-1 text-xs rounded bg-blue-900 text-[#14B8A6] font-bold"
            >
              {i18n.language.toUpperCase()}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-blue-900"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#0F172A] border-b border-blue-900 px-4 pt-2 pb-6 space-y-3">
          <Link to="/" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-200">{t('nav.home')}</Link>
          <Link to="/classes" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-200">{t('nav.classes')}</Link>
          <Link to="/teachers" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-200">{t('nav.teachers')}</Link>
          <Link to="/exams" onClick={() => setMobileMenuOpen(false)} className="block py-2 text-sm font-semibold text-slate-200">{t('nav.exams')}</Link>
          <div className="pt-4 border-t border-slate-800">
            {user ? (
              <div className="space-y-2">
                <Link
                  to={getDashboardPath()}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl bg-[#2563EB] text-white text-sm font-bold"
                >
                  {t('nav.dashboard')}
                </Link>
                <button
                  onClick={() => { logout(); setMobileMenuOpen(false); }}
                  className="block w-full text-center py-2.5 rounded-xl bg-red-600/20 text-red-400 text-sm font-bold border border-red-500/30"
                >
                  {t('nav.logout')}
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl bg-blue-900/50 text-white text-sm font-bold"
                >
                  {t('nav.login')}
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block w-full text-center py-2.5 rounded-xl bg-[#14B8A6] text-white text-sm font-bold"
                >
                  {t('nav.register')}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
