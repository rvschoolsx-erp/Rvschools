'use client';
import { useQuery } from '@tanstack/react-query';
import { BarChart3, TrendingUp, Users, IndianRupee, BookOpen, Calendar } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const demoRevenue = [
  { month: 'Jan 2026', amount: 125000 },
  { month: 'Feb 2026', amount: 138000 },
  { month: 'Mar 2026', amount: 142000 },
  { month: 'Apr 2026', amount: 155000 },
  { month: 'May 2026', amount: 148000 },
  { month: 'Jun 2026', amount: 162000 },
];

export default function AdminReportsPage() {
  const { t, lang } = useLanguage();

  const { data: analyticsData } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiService.analytics.admin().then(r => r.data.data),
  });

  const overview = analyticsData?.overview ?? {
    total_students: 487, total_teachers: 32, total_revenue_this_month: 162000, attendance_rate: 87.4,
  };

  const revenue = analyticsData?.revenue_trend ?? demoRevenue;
  const maxRevenue = Math.max(...revenue.map((r: { amount: number }) => r.amount), 1);

  const subjectPerformance = [
    { subject: 'Mathematics',    avg: 72, color: 'bg-blue-500' },
    { subject: 'Science',        avg: 78, color: 'bg-green-500' },
    { subject: 'English',        avg: 81, color: 'bg-purple-500' },
    { subject: 'Hindi',          avg: 85, color: 'bg-orange-500' },
    { subject: 'Social Science', avg: 76, color: 'bg-pink-500' },
    { subject: 'Sanskrit',       avg: 69, color: 'bg-yellow-500' },
  ];

  const feeCollection = [
    { label: t('जनवरी','Jan'), collected: 87, target: 100 },
    { label: t('फरवरी','Feb'), collected: 92, target: 100 },
    { label: t('मार्च','Mar'), collected: 95, target: 100 },
    { label: t('अप्रैल','Apr'), collected: 88, target: 100 },
    { label: t('मई','May'), collected: 91, target: 100 },
    { label: t('जून','Jun'), collected: 94, target: 100 },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('रिपोर्ट', 'Reports')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('विद्यालय प्रदर्शन विश्लेषण', 'School performance analytics')}
            </p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: <Users size={18} />, label: t('कुल छात्र','Total Students'), value: overview.total_students, color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
            { icon: <Users size={18} />, label: t('कुल शिक्षक','Total Teachers'), value: overview.total_teachers, color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
            { icon: <Calendar size={18} />, label: t('उपस्थिति दर','Attendance Rate'), value: `${overview.attendance_rate}%`, color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' },
            { icon: <IndianRupee size={18} />, label: t('इस माह राजस्व','This Month Revenue'), value: `₹${(overview.total_revenue_this_month/1000).toFixed(0)}K`, color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
          ].map(card => (
            <div key={card.label} className="bg-card border border-border rounded-2xl p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}>{card.icon}</div>
              <p className="text-2xl font-bold">{card.value}</p>
              <p className={`text-xs text-muted-foreground mt-1 ${lang === 'hi' ? 'font-hindi' : ''}`}>{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue trend */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} className="text-brand-600" />
              <h3 className={`font-semibold text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('मासिक राजस्व', 'Monthly Revenue')}</h3>
            </div>
            <div className="flex items-end gap-3 h-36">
              {revenue.map((r: { month: string; amount: number }, i: number) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-medium text-muted-foreground">
                    ₹{(r.amount / 1000).toFixed(0)}K
                  </span>
                  <div className="w-full rounded-t-md bg-brand-500 dark:bg-brand-600 min-h-[4px]"
                    style={{ height: `${(r.amount / maxRevenue) * 100}px` }} />
                  <span className="text-[10px] text-muted-foreground">{r.month?.slice(0,3) ?? MONTHS[i]}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Subject performance */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <BookOpen size={16} className="text-brand-600" />
              <h3 className={`font-semibold text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('विषय प्रदर्शन', 'Subject Performance')}</h3>
            </div>
            <div className="space-y-3">
              {subjectPerformance.map(s => (
                <div key={s.subject}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-muted-foreground">{s.subject}</span>
                    <span className="font-semibold">{s.avg}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${s.color}`} style={{ width: `${s.avg}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Fee collection */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <IndianRupee size={16} className="text-brand-600" />
            <h3 className={`font-semibold text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('फीस संग्रह (%)','Fee Collection (%)')}</h3>
          </div>
          <div className="grid grid-cols-6 gap-4">
            {feeCollection.map(fc => (
              <div key={fc.label} className="flex flex-col items-center gap-2">
                <span className="text-sm font-bold">{fc.collected}%</span>
                <div className="relative w-8 h-24 bg-muted rounded-full overflow-hidden">
                  <div className="absolute bottom-0 w-full bg-brand-500 dark:bg-brand-600 rounded-full transition-all"
                    style={{ height: `${fc.collected}%` }} />
                </div>
                <span className={`text-[11px] text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>{fc.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
