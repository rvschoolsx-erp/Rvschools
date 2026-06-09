'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ParentAttendancePage() {
  const { t, lang } = useLanguage();

  const { data: parentData } = useQuery({
    queryKey: ['parent-children'],
    queryFn: () => apiService.analytics.parent().then(r => r.data.data),
  });
  const studentId = parentData?.children?.[0]?.student_id ?? '';

  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear]   = useState(now.getFullYear());

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate   = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['parent-attendance', studentId, startDate, endDate],
    queryFn: () => apiService.attendance.getStudent(studentId, startDate, endDate).then(r => r.data.data),
    enabled: !!studentId,
  });

  const records: { date: string; status: string }[] = data ?? [];

  const counts = records.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    { present: 0, absent: 0, late: 0 } as Record<string, number>
  );
  const totalDays = records.length;
  const pct = totalDays ? Math.round(((counts.present + counts.late) / totalDays) * 100) : 0;

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2024, i, 1).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long' }),
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('उपस्थिति', 'Attendance')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('बच्चे की उपस्थिति देखें', "View your child's attendance")}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select value={month} onChange={e => setMonth(Number(e.target.value))}
              className="border border-input rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {months.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
            <select value={year} onChange={e => setYear(Number(e.target.value))}
              className="border border-input rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { hi: 'उपस्थिति %', en: 'Attendance %', value: `${pct}%`, icon: TrendingUp, color: pct >= 75 ? 'text-green-600' : 'text-red-600' },
            { hi: 'उपस्थित',   en: 'Present',       value: counts.present, icon: CheckCircle, color: 'text-green-600' },
            { hi: 'अनुपस्थित', en: 'Absent',        value: counts.absent,  icon: XCircle,     color: 'text-red-600'   },
            { hi: 'देर से',    en: 'Late',           value: counts.late,    icon: Clock,       color: 'text-yellow-600' },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.en} className="bg-card border border-border rounded-2xl p-4 text-center">
                <Icon size={22} className={cn('mx-auto mb-2', stat.color)} />
                <p className="text-2xl font-bold">{stat.value}</p>
                <p className={`text-xs font-medium text-muted-foreground mt-0.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t(stat.hi, stat.en)}</p>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between text-sm mb-2">
            <span className={`font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('मासिक उपस्थिति', 'Monthly Attendance')}</span>
            <span className={cn('font-bold', pct >= 75 ? 'text-green-600' : 'text-red-600')}>{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className={cn('h-3 rounded-full transition-all', pct >= 75 ? 'bg-green-500' : 'bg-red-500')}
              style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          {pct < 75 && (
            <p className={`text-xs text-red-600 mt-2 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              ⚠️ {t('उपस्थिति 75% से कम है। कृपया ध्यान दें।', 'Attendance below 75%. Please take action.')}
            </p>
          )}
        </div>

        {/* Day-by-day */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h3 className={`font-semibold text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('दिन-वार विवरण', 'Day-wise Details')}
            </h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('इस महीने का कोई रिकॉर्ड नहीं', 'No records for this month')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {records.map(r => {
                const d = new Date(r.date);
                return (
                  <div key={r.date} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium">
                        {d.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                      </p>
                    </div>
                    <span className={cn('text-xs font-medium px-3 py-1 rounded-full',
                      r.status === 'present' ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' :
                      r.status === 'absent'  ? 'bg-red-100   text-red-700   dark:bg-red-900/20   dark:text-red-400'   :
                      r.status === 'late'    ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400' :
                      'bg-muted text-muted-foreground'
                    )}>
                      {r.status === 'present' ? t('उपस्थित', 'Present') :
                       r.status === 'absent'  ? t('अनुपस्थित', 'Absent') :
                       r.status === 'late'    ? t('देर से', 'Late') : r.status}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
