'use client';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, GraduationCap, CreditCard, CheckCircle, Calendar,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

export default function AdminDashboard() {
  const { t, lang } = useLanguage();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiService.analytics.admin().then(r => r.data.data),
  });

  const attendanceTrend = analytics?.attendanceTrend?.slice(-14).map((d: { date: string; present: number; absent: number }) => ({
    date: new Date(d.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short' }),
    [t('उपस्थित', 'Present')]: d.present,
    [t('अनुपस्थित', 'Absent')]: d.absent,
  })) ?? [];

  const revenueTrend = analytics?.revenueTrend ?? [];
  const classData = analytics?.classDistribution ?? [];

  const feesPieData = [
    { name: t('जमा हुई', 'Collected'), value: Number(analytics?.fees?.total_collected ?? 0) },
    { name: t('बकाया', 'Pending'),     value: Number(analytics?.fees?.pending ?? 0) },
  ];

  if (isLoading) {
    return (
      <AppLayout>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card-stat animate-pulse">
              <div className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg" />
            </div>
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('एडमिन डैशबोर्ड', 'Admin Dashboard')}
            </h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              {t('आज का अवलोकन', "Today's Overview")}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title={t('कुल छात्र', 'Total Students')}
            value={analytics?.students?.total?.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN') ?? '—'}
            subtitle={`${analytics?.students?.new_this_month ?? 0} ${t('इस माह नए', 'new this month')}`}
            icon={GraduationCap}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
            trend={{ value: 3.2, label: t('पिछले माह से', 'vs last month') }}
          />
          <StatsCard
            title={t('शिक्षक', 'Teachers')}
            value={analytics?.teachers?.total ?? '200+'}
            subtitle={t('सक्रिय शिक्षक', 'Active teachers')}
            icon={Users}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
          />
          <StatsCard
            title={t('आज उपस्थिति', "Today's Attendance")}
            value={`${analytics?.attendance?.overall_percentage ?? '—'}%`}
            subtitle={`${analytics?.attendance?.present_today ?? 0} ${t('उपस्थित', 'present')} / ${analytics?.attendance?.absent_today ?? 0} ${t('अनुपस्थित', 'absent')}`}
            icon={CheckCircle}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
            trend={{ value: 1.5, label: t('कल से', 'vs yesterday') }}
          />
          <StatsCard
            title={t('फीस संग्रह', 'Fee Collection')}
            value={formatCurrency(analytics?.fees?.total_collected ?? 0)}
            subtitle={`${t('बकाया', 'Pending')}: ${formatCurrency(analytics?.fees?.pending ?? 0)}`}
            icon={CreditCard}
            iconBg="bg-gold-100 dark:bg-gold-900/30"
            iconColor="text-gold-600"
            trend={{ value: Number(analytics?.fees?.collection_rate ?? 0), label: t('संग्रह दर', 'collection rate') }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Trend */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h3 className={`font-semibold text-foreground mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('उपस्थिति — पिछले 14 दिन', 'Attendance — Last 14 Days')}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={attendanceTrend}>
                <defs>
                  <linearGradient id="presentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#16a34a" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#16a34a" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="absentGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#dc2626" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#dc2626" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid var(--border)' }} />
                <Legend />
                <Area type="monotone" dataKey={t('उपस्थित', 'Present')} stroke="#16a34a" fill="url(#presentGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey={t('अनुपस्थित', 'Absent')} stroke="#dc2626" fill="url(#absentGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fees Pie */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className={`font-semibold text-foreground mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('फीस संग्रह स्थिति', 'Fee Collection Status')}
            </h3>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={feesPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                  paddingAngle={4} dataKey="value">
                  {feesPieData.map((_, i) => (
                    <Cell key={i} fill={i === 0 ? '#16a34a' : '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-center">
              {feesPieData.map((d, i) => (
                <div key={d.name} className="flex items-center gap-2 text-xs">
                  <div className="w-3 h-3 rounded-full" style={{ background: i === 0 ? '#16a34a' : '#f59e0b' }} />
                  <span className={`text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className={`font-semibold text-foreground mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('मासिक राजस्व प्रवृत्ति', 'Monthly Revenue Trend')}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="collected" fill="#1a3c6e" radius={[4, 4, 0, 0]} name={t('संग्रह', 'Collected')} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Class Distribution */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className={`font-semibold text-foreground mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('कक्षावार छात्र संख्या', 'Class-wise Student Count')}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="class_name" type="category" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="student_count" fill="#f59e0b" radius={[0, 4, 4, 0]} name={t('छात्र', 'Students')} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className={`font-semibold text-foreground mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
            {t('त्वरित कार्य', 'Quick Actions')}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { hi: 'नया छात्र जोड़ें', en: 'Add Student',     href: '/admin/students/new', color: 'bg-blue-500',   icon: '➕' },
              { hi: 'उपस्थिति लें',    en: 'Mark Attendance', href: '/admin/attendance',   color: 'bg-green-500',  icon: '✅' },
              { hi: 'फीस जमा करें',    en: 'Record Payment',  href: '/admin/fees',         color: 'bg-gold-500',   icon: '💰' },
              { hi: 'परीक्षा बनाएं',   en: 'Create Exam',     href: '/admin/exams/new',    color: 'bg-purple-500', icon: '📝' },
            ].map((action) => (
              <a
                key={action.en}
                href={action.href}
                className={`${action.color} hover:opacity-90 text-white rounded-xl p-4 text-center transition-opacity`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className={`text-sm font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t(action.hi, action.en)}
                </p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
