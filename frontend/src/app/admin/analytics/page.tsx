'use client';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, Users, CreditCard, BarChart2, Download } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

const COLORS = ['#1a3c6e', '#f59e0b', '#16a34a', '#dc2626', '#7c3aed', '#0891b2'];

export default function AnalyticsPage() {
  const { t, lang } = useLanguage();

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics-full'],
    queryFn: () => apiService.analytics.admin().then(r => r.data.data),
  });

  const attendanceTrend = analytics?.attendanceTrend?.map((d: { date: string; present: number; absent: number; total: number }) => ({
    date: new Date(d.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: '2-digit', month: 'short' }),
    [t('उपस्थित', 'Present')]: d.present,
    [t('अनुपस्थित', 'Absent')]: d.absent,
    [t('प्रतिशत', 'Percent')]: d.total > 0 ? Math.round((d.present / d.total) * 100) : 0,
  })) ?? [];

  const classData = analytics?.classDistribution ?? [];
  const genderData = [
    { name: t('बालक', 'Boys'),   value: Number(analytics?.students?.male   ?? 0) },
    { name: t('बालिका', 'Girls'), value: Number(analytics?.students?.female ?? 0) },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('विश्लेषण डैशबोर्ड', 'Analytics Dashboard')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('विद्यालय का संपूर्ण प्रदर्शन विश्लेषण', 'Complete school performance analysis')}
            </p>
          </div>
          <button className="flex items-center gap-2 border border-border px-3 py-2 rounded-lg text-sm hover:bg-accent">
            <Download size={15} />
            <span className={lang === 'hi' ? 'font-hindi' : ''}>
              {t('रिपोर्ट डाउनलोड करें', 'Download Report')}
            </span>
          </button>
        </div>

        {/* KPI Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { hi: 'कुल छात्र',  en: 'Total Students',  value: analytics?.students?.total?.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN') ?? '—', icon: Users,      color: 'bg-blue-50',   text: 'text-blue-600' },
            { hi: 'उपस्थिति',   en: 'Attendance',      value: `${analytics?.attendance?.overall_percentage ?? '—'}%`,                               icon: TrendingUp,  color: 'bg-green-50',  text: 'text-green-600' },
            { hi: 'फीस संग्रह', en: 'Fee Collection',  value: formatCurrency(analytics?.fees?.total_collected ?? 0),                                 icon: CreditCard,  color: 'bg-gold-50',   text: 'text-gold-600' },
            { hi: 'परीक्षाएं',  en: 'Exams',           value: analytics?.exams?.total ?? '—',                                                        icon: BarChart2,   color: 'bg-purple-50', text: 'text-purple-600' },
          ].map(({ hi, en, value, icon: Icon, color, text }) => (
            <div key={en} className={`${color} border border-border rounded-2xl p-5 flex items-center gap-4`}>
              <Icon size={28} className={text} />
              <div>
                <p className="text-2xl font-bold text-foreground">{value}</p>
                <p className={`text-xs text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>{t(hi, en)}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Attendance Trend */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className={`font-semibold mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('उपस्थिति प्रतिशत (30 दिन)', 'Attendance % (30 Days)')}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={4} />
                <YAxis domain={[60, 100]} tick={{ fontSize: 10 }} unit="%" />
                <Tooltip formatter={(v: number) => `${v}%`} />
                <Line type="monotone" dataKey={t('प्रतिशत', 'Percent')} stroke="#16a34a" strokeWidth={2.5} dot={false} activeDot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gender Distribution */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className={`font-semibold mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('लिंग वितरण', 'Gender Distribution')}
            </h3>
            <div className="flex items-center justify-center gap-8">
              <ResponsiveContainer width="60%" height={200}>
                <PieChart>
                  <Pie data={genderData} cx="50%" cy="50%" outerRadius={80} dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
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
                      <p className={`text-sm font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>{d.name}</p>
                      <p className="text-xl font-bold text-foreground">{d.value.toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN')}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Class-wise Strength */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h3 className={`font-semibold mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('कक्षावार छात्र संख्या', 'Class-wise Student Count')}
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={classData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="class_name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="student_count" name={t('छात्र संख्या', 'Student Count')} radius={[4, 4, 0, 0]}>
                  {classData.map((_: unknown, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Performing Students */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h3 className={`font-semibold mb-4 ${lang === 'hi' ? 'font-hindi' : ''}`}>
            {t('शीर्ष प्रदर्शन करने वाले छात्र', 'Top Performing Students')}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {[
                    { hi: 'रैंक', en: 'Rank' }, { hi: 'नाम', en: 'Name' },
                    { hi: 'कक्षा', en: 'Class' }, { hi: 'प्रतिशत', en: 'Score' },
                    { hi: 'ग्रेड', en: 'Grade' }, { hi: 'उपस्थिति', en: 'Attendance' },
                  ].map(h => (
                    <th key={h.en} className={`text-left pb-3 px-2 text-xs font-semibold text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>
                      {t(h.hi, h.en)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { rank: 1, name: 'Priya Gupta',   nameHi: 'प्रिया गुप्ता',   cls: '8-A', pct: 87.6, grade: 'A',  att: '95%' },
                  { rank: 2, name: 'Rahul Sharma',  nameHi: 'राहुल शर्मा',      cls: '8-A', pct: 79.4, grade: 'B+', att: '90%' },
                  { rank: 3, name: 'Amit Yadav',    nameHi: 'अमित यादव',        cls: '8-B', pct: 76.2, grade: 'B+', att: '88%' },
                  { rank: 4, name: 'Seema Verma',   nameHi: 'सीमा वर्मा',       cls: '9-A', pct: 74.0, grade: 'B',  att: '92%' },
                  { rank: 5, name: 'Vikas Tiwari',  nameHi: 'विकास तिवारी',     cls: '10-A', pct: 71.8, grade: 'B', att: '87%' },
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
                    <td className={`py-3 px-2 font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>
                      {t(row.nameHi, row.name)}
                    </td>
                    <td className="py-3 px-2 text-muted-foreground">{row.cls}</td>
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
