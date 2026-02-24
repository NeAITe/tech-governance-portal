import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart2, ClipboardList, FolderKanban, Layers, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import nessLogo from '../assets/ness-logo.jpg';

const Layout = () => {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    document.dir = i18n.dir();
  }, [i18n, i18n.language]);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'he' : 'en';
    i18n.changeLanguage(newLang);
  };

  const navItems = [
    { name: t('nav.dashboard'), path: '/', icon: LayoutDashboard },
    { name: t('nav.products'), path: '/products', icon: Package },
    { name: t('nav.metrics'), path: '/metrics', icon: BarChart2 },
    { name: t('nav.metricGroups'), path: '/metric-groups', icon: Layers },
    { name: t('nav.evaluations'), path: '/evaluations', icon: ClipboardList },
    { name: t('nav.internalProjects'), path: '/projects', icon: FolderKanban },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse"></div>
      <div className="absolute top-[20%] right-[-5%] w-72 h-72 bg-purple-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-[-10%] left-[20%] w-80 h-80 bg-pink-400/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-pulse" style={{ animationDelay: '4s' }}></div>

      <div className="p-6 z-10">
        <aside className="w-64 h-full glass rounded-3xl flex flex-col overflow-hidden">
          <div className="p-8 flex flex-col items-center gap-4 border-b border-slate-100/50">
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center w-24 h-24 overflow-hidden">
              <img src={nessLogo} alt="Ness Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 tracking-tight">
              TechGov
            </h1>
          </div>
          
          <nav className="flex-1 px-4 space-y-2 mt-6 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center px-4 py-3.5 rounded-2xl transition-all duration-300 group ${
                    isActive 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20' 
                      : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${i18n.dir() === 'rtl' ? 'ml-3' : 'mr-3'} transition-transform duration-300 ${isActive ? 'scale-110' : 'group-hover:scale-110'}`} />
                  <span className="font-medium text-sm tracking-wide">{item.name}</span>
                </Link>
              );
            })}
          </nav>
          
          <div className="p-6 mt-auto space-y-4">
            <button 
              onClick={toggleLanguage}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-white/50 hover:bg-white/80 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 transition-colors"
            >
              <Globe className="w-4 h-4" />
              {i18n.language === 'en' ? 'עברית' : 'English'}
            </button>

            <div className="bg-gradient-to-br from-slate-100 to-slate-50 rounded-2xl p-4 border border-slate-200/60">
              <p className="text-xs font-medium text-slate-500 mb-1">{t('layout.systemStatus')}</p>
              <div className="flex items-center gap-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-semibold text-slate-700">{t('layout.allSystemsOperational')}</span>
              </div>
            </div>
            
            <div className="text-center pt-2">
              <p className="text-xs text-slate-400 font-medium">{t('layout.createdBy')}</p>
            </div>
          </div>
        </aside>
      </div>

      <main className="flex-1 overflow-y-auto p-6 z-10">
        <div className="h-full rounded-3xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;