'use client';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, AreaChart,
} from 'recharts';
import { TrendingUp, Users, CreditCard, BarChart2, Download } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { apiService } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#1a3c6e', '#f59e0b', '#16a34a', '#dc2626', '#7c3aed', '#0891b2'];

export default function AnalyticsPage() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics-full'],
    queryFn: () => apiService.analytics.admin().then(r => r.data.data),
  });

  const attendanceTrend = analytics?.attendanceTrend?.map((d: { date: string; present: number; absent: number; total: number }) => ({
    date: new Date(d.date).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short' }),
    उपस्थित: d.present,
    अनुपस्थित: d.absent,
    प्रतिशत: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
  })) ?? [];

  const classData = analytics?.classDistribution ?? [];
  const genderData = [
    { name: 'बालक', value: Number(analytics?.students?.male ?? 0) },
    { name: 'बालिका', value: Number(analytics?.students?.female ?? 0) },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className="page-title font-hindi">विश्लेषण डैशबोर्ड</h1>
            <p className="text-muted-foreground text-sm">विद्यालय का संपूर्ण प्रदर्शन विश्लेषण</p>
          </div>
          <button className="flex items-center gap-2 border border-border px-3 py-2 rounded-lg text-sm hover:bg-accent">
            <Download size={15} />
            <span className="font-hindi">रिपोर्ट डाउनलोड करें</span>
          </button>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'कुल छात्र',       value: analytics?.students?.total?.toLocaleString('hi-IN') ?? '—',    icon: Users,      color: 'bg-blue-50',   text: 'text-blue-600' },
            { label: 'उपस्थिति',        value: `${analytics?.attendance?.overall_percentage ?? '—'}%`,         icon: TrendingUp,  color: 'bg-green-50',  text: 'text-green-600' },
            { label: 'फीस संग्रह',      value: formatCurrency(analytics?.fees?.total_collected ?? 0),          icon: CreditCard,  color: 'bg-gold-50',   text: 'text-gold-600' },
            { label: 'परीक्षाएं',       value: analytics?.exams?.total ?? '—',                                  icon: BarChart2,   color: 'bg-purple-50', text: 'text-purple-600' },
          ].map(({ label, value, icon: Icon, color, text }) => (
            <div key={label} className={`${color} border border-border rounded-2xl p-5 flex items-center gap-4`}>
              <Icon size={28} className={text} />
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className="text-xs text-muted-foreground font-hindi">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Percentage Trend */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold font-hindi mb-4">उपस्थिति प्रतिशत (30 दिन)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey="प्रतिशत" stroke="#16a34a" strokeWidth={2.5}
                  dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold font-hindi mb-4">लिंग वितरण</h3>
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {genderData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-3">
                {genderData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: COLORS[i] }} />
                    <div>
                      <p className="text-sm font-medium font-hindi">{d.name}</p>
                      <p className="text-xl font-bold text-foreground">{d.value.toLocaleString('hi-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class-wise Strength */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold font-hindi mb-4">कक्षावार छात्र संख्या</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="class_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="student_count" name="छात्र संख्या" radius={[4, 4, 0, 0]}>
                  {classData.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Students Table */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold font-hindi mb-4">शीर्ष प्रदर्शन करने वाले छात्र</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['रैंक', 'नाम', 'कक्षा', 'प्रतिशत', 'ग्रेड', 'उपस्थिति'].map(h => (
                    <th key={h} className="text-left pb-3 px-2 text-xs font-semibold text-muted-foreground font-hindi">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: 'प्रिया गुप्ता',   class: '8-A', pct: 87.6, grade: 'A', att: '95%' },
                  { rank: 2, name: 'राहुल शर्मा',      class: '8-A', pct: 79.4, grade: 'B+', att: '90%' },
                  { rank: 3, name: 'अमित यादव',        class: '8-B', pct: 76.2, grade: 'B+', att: '88%' },
                  { rank: 4, name: 'सीमा वर्मा',       class: '9-A', pct: 74.0, grade: 'B', att: '92%' },
                  { rank: 5, name: 'विकास तिवारी',     class: '10-A', pct: 71.8, grade: 'B', att: '87%' },
                ].map((row) => (
                  <tr key={row.rank} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-2">
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold
                        ${row.rank === 1 ? 'bg-gold-100 text-gold-700' :
                          row.rank === 2 ? 'bg-gray-100 text-gray-700' :
                          row.rank === 3 ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>
                        {row.rank}
                      </span>
                    </td>
                    <td className="py-3 px-2 font-medium font-hindi">{row.name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{row.class}</td>
                    <td className="py-3 px-2 font-semibold">{row.pct}%</td>
                    <td className="py-3 px-2">
                      <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                        row.grade.startsWith('A') ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                      }`}>{row.grade}</span>
                    </td>
                    <td className="py-3 px-2 text-green-600 font-medium">{row.att}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
