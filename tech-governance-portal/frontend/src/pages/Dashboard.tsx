import { useState, useEffect } from 'react';
import { Package, ClipboardList, FolderKanban, Activity, ArrowUpRight, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Dashboard = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [dashboardStats, setDashboardStats] = useState({
    totalProducts: 0,
    activeEvaluations: 0,
    internalProjects: 0,
    avgMetricScore: '0.0',
    recentActivity: [] as any[]
  });

  useEffect(() => {
    fetch('http://localhost:3001/api/dashboard/stats')
      .then(res => res.json())
      .then(data => setDashboardStats(data))
      .catch(err => console.error('Failed to fetch dashboard stats', err));
  }, []);

  const stats = [
    { name: t('dashboard.totalProducts'), stat: dashboardStats.totalProducts, icon: Package, color: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
    { name: t('dashboard.activeEvaluations'), stat: dashboardStats.activeEvaluations, icon: ClipboardList, color: 'from-amber-400 to-orange-500', shadow: 'shadow-orange-500/20' },
    { name: t('dashboard.internalProjects'), stat: dashboardStats.internalProjects, icon: FolderKanban, color: 'from-emerald-400 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { name: t('dashboard.avgMetricScore'), stat: dashboardStats.avgMetricScore, icon: Activity, color: 'from-purple-500 to-pink-500', shadow: 'shadow-purple-500/20' },
  ];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex items-end justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-semibold text-blue-600 tracking-wider uppercase">{t('dashboard.overview')}</span>
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">{t('nav.dashboard')}</h1>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => navigate('/evaluations')}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-sm font-semibold rounded-xl shadow-lg shadow-blue-500/30 text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-300 hover:scale-105"
          >
            {t('dashboard.newEvaluation')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <div key={item.name} className="glass-card p-6 relative overflow-hidden group">
              <div className={`absolute -right-6 -top-6 w-24 h-24 bg-gradient-to-br ${item.color} rounded-full opacity-10 group-hover:scale-150 transition-transform duration-500 ease-out`}></div>
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${item.color} shadow-lg ${item.shadow}`}>
                  <Icon className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                <span className="flex items-center text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                  +12% <ArrowUpRight className="w-3 h-3 ml-1" />
                </span>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">{item.name}</p>
              <p className="text-3xl font-bold text-slate-900">{item.stat}</p>
            </div>
          );
        })}
      </div>

      <div className="glass-card overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-100/50 bg-white/40">
          <h3 className="text-lg font-semibold text-slate-900">{t('dashboard.recentActivity')}</h3>
        </div>
        {dashboardStats.recentActivity && dashboardStats.recentActivity.length > 0 ? (
          <div className="divide-y divide-slate-100/50">
            {dashboardStats.recentActivity.map((activity: any) => (
              <div key={activity.id} className="p-6 hover:bg-white/40 transition-colors flex items-start gap-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0">
                  <ClipboardList className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm text-slate-900 font-medium">
                    {t('dashboard.evaluated')} <span className="font-bold">{activity.product?.name}</span> {t('dashboard.on')} <span className="font-bold">{activity.metric?.name}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    {t('dashboard.score')}: {activity.score} • {new Date(activity.createdAt).toLocaleDateString()}
                  </p>
                  {activity.comments && (
                    <p className="text-sm text-slate-600 mt-2 italic">"{activity.comments}"</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500 py-16">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 rotate-3">
              <Activity className="h-8 w-8 text-slate-400 -rotate-3" />
            </div>
            <p className="text-slate-600 font-medium">{t('dashboard.noRecentActivity')}</p>
            <p className="text-sm text-slate-400 mt-1">{t('dashboard.activitiesWillAppear')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;