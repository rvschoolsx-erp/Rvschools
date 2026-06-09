'use client';
import { useQuery } from '@tanstack/react-query';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  Users, GraduationCap, CreditCard, TrendingUp,
  BookOpen, CheckCircle, AlertCircle, Calendar,
} from 'lucide-react';
import { StatsCard } from '@/components/ui/StatsCard';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { apiService } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#1a3c6e', '#f59e0b', '#16a34a', '#dc2626', '#7c3aed'];

export default function AdminDashboard() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: () => apiService.analytics.admin().then(r => r.data.data),
  });

  const attendanceTrend = analytics?.attendanceTrend?.slice(-14).map((d: { date: string; present: number; absent: number; total: number }) => ({
    date: new Date(d.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' }),
    'उपस्थित': d.present,
    'अनुपस्थित': d.absent,
  })) ?? [];

  const revenueTrend = analytics?.revenueTrend ?? [];

  const classData = analytics?.classDistribution ?? [];

  const feesPieData = [
    { name: 'जमा हुई', value: Number(analytics?.fees?.total_collected ?? 0) },
    { name: 'बकाया', value: Number(analytics?.fees?.pending ?? 0) },
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
            <h1 className="page-title font-hindi">एडमिन डैशबोर्ड</h1>
            <p className="text-muted-foreground text-sm mt-0.5">
              शहीद राम सिंह विद्यालय — आज का अवलोकन
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground bg-card border border-border rounded-lg px-3 py-2">
            <Calendar size={14} />
            <span>{new Date().toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatsCard
            title="कुल छात्र"
            value={analytics?.students?.total?.toLocaleString('hi-IN') ?? '—'}
            subtitle={`${analytics?.students?.new_this_month ?? 0} इस माह नए`}
            icon={GraduationCap}
            iconBg="bg-blue-100 dark:bg-blue-900/30"
            iconColor="text-blue-600"
            trend={{ value: 3.2, label: 'पिछले माह से' }}
          />
          <StatsCard
            title="शिक्षक"
            value={analytics?.teachers?.total ?? '200+'}
            subtitle="सक्रिय शिक्षक"
            icon={Users}
            iconBg="bg-purple-100 dark:bg-purple-900/30"
            iconColor="text-purple-600"
          />
          <StatsCard
            title="आज उपस्थिति"
            value={`${analytics?.attendance?.overall_percentage ?? '—'}%`}
            subtitle={`${analytics?.attendance?.present_today ?? 0} उपस्थित / ${analytics?.attendance?.absent_today ?? 0} अनुपस्थित`}
            icon={CheckCircle}
            iconBg="bg-green-100 dark:bg-green-900/30"
            iconColor="text-green-600"
            trend={{ value: 1.5, label: 'कल से' }}
          />
          <StatsCard
            title="फीस संग्रह"
            value={formatCurrency(analytics?.fees?.total_collected ?? 0)}
            subtitle={`बकाया: ${formatCurrency(analytics?.fees?.pending ?? 0)}`}
            icon={CreditCard}
            iconBg="bg-gold-100 dark:bg-gold-900/30"
            iconColor="text-gold-600"
            trend={{ value: Number(analytics?.fees?.collection_rate ?? 0), label: 'संग्रह दर' }}
          />
        </div>

        {/* Charts Row 1 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Trend */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4 font-hindi">उपस्थिति — पिछले 14 दिन</h3>
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
                <Area type="monotone" dataKey="उपस्थित" stroke="#16a34a" fill="url(#presentGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="अनुपस्थित" stroke="#dc2626" fill="url(#absentGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Fees Pie */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4 font-hindi">फीस संग्रह स्थिति</h3>
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
                  <span className="text-muted-foreground font-hindi">{d.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Revenue Trend */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4 font-hindi">मासिक राजस्व प्रवृत्ति</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={revenueTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}K`} tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: number) => formatCurrency(v)} />
                <Bar dataKey="collected" fill="#1a3c6e" radius={[4, 4, 0, 0]} name="संग्रह" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Class Distribution */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-4 font-hindi">कक्षावार छात्र संख्या</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="class_name" type="category" tick={{ fontSize: 11 }} width={70} />
                <Tooltip />
                <Bar dataKey="student_count" fill="#f59e0b" radius={[0, 4, 4, 0]} name="छात्र" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4 font-hindi">त्वरित कार्य</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'नया छात्र जोड़ें', href: '/admin/students/new', color: 'bg-blue-500', icon: '➕' },
              { label: 'उपस्थिति लें', href: '/admin/attendance', color: 'bg-green-500', icon: '✅' },
              { label: 'फीस जमा करें', href: '/admin/fees', color: 'bg-gold-500', icon: '💰' },
              { label: 'परीक्षा बनाएं', href: '/admin/exams/new', color: 'bg-purple-500', icon: '📝' },
            ].map((action) => (
              <a
                key={action.label}
                href={action.href}
                className={`${action.color} hover:opacity-90 text-white rounded-xl p-4 text-center transition-opacity`}
              >
                <div className="text-2xl mb-2">{action.icon}</div>
                <p className="text-sm font-medium font-hindi">{action.label}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
