'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function StudentAttendancePage() {
  const { t, lang } = useLanguage();
  const studentId = 'demo-student-id';
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year,  setYear]  = useState(now.getFullYear());

  const startDate = new Date(year, month, 1).toISOString().split('T')[0];
  const endDate   = new Date(year, month + 1, 0).toISOString().split('T')[0];

  const { data, isLoading } = useQuery({
    queryKey: ['student-attendance', studentId, startDate, endDate],
    queryFn: () => apiService.attendance.getStudent(studentId, startDate, endDate).then(r => r.data.data),
  });

  const records: { date: string; status: string }[] = data ?? [];
  const counts = records.reduce(
    (acc, r) => { acc[r.status] = (acc[r.status] ?? 0) + 1; return acc; },
    { present: 0, absent: 0, late: 0 } as Record<string, number>
  );
  const total = records.length;
  const pct = total ? Math.round(((counts.present + counts.late) / total) * 100) : 0;

  const months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2024, i, 1).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN', { month: 'long' }),
  }));

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('मेरी उपस्थिति', 'My Attendance')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('मासिक उपस्थिति रिकॉर्ड', 'Monthly attendance record')}
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
        <div className="grid grid-cols-3 gap-4">
          {[
            { hi: 'उपस्थित',   en: 'Present', value: counts.present, icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
            { hi: 'अनुपस्थित', en: 'Absent',  value: counts.absent,  icon: XCircle,     color: 'text-red-600   bg-red-50   dark:bg-red-900/20'   },
            { hi: 'देर से',    en: 'Late',     value: counts.late,    icon: Clock,       color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
          ].map(s => {
            const Icon = s.icon;
            return (
              <div key={s.en} className={cn('rounded-2xl border border-border p-4 text-center', s.color)}>
                <Icon size={22} className="mx-auto mb-2" />
                <p className="text-2xl font-bold">{s.value}</p>
                <p className={`text-xs font-medium mt-0.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t(s.hi, s.en)}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex justify-between text-sm mb-3">
            <span className={`font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('उपस्थिति प्रतिशत', 'Attendance Percentage')}</span>
            <span className={cn('text-xl font-bold', pct >= 75 ? 'text-green-600' : 'text-red-600')}>{pct}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div className={cn('h-3 rounded-full transition-all', pct >= 75 ? 'bg-green-500' : 'bg-red-500')}
              style={{ width: `${Math.min(pct, 100)}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-1.5">
            <span>0%</span>
            <span className="text-yellow-600 font-medium">{t('न्यूनतम 75%', 'Min 75%')}</span>
            <span>100%</span>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h3 className={`font-semibold text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('दैनिक रिकॉर्ड', 'Daily Records')}</h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
          ) : records.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('इस महीने का कोई रिकॉर्ड नहीं', 'No records this month')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {records.map(r => (
                <div key={r.date} className="flex items-center justify-between px-5 py-3">
                  <p className="text-sm font-medium">
                    {new Date(r.date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </p>
                  <span className={cn('text-xs font-medium px-3 py-1 rounded-full',
                    r.status === 'present' ? 'bg-green-100 text-green-700' :
                    r.status === 'absent'  ? 'bg-red-100   text-red-700'   :
                    'bg-yellow-100 text-yellow-700')}>
                    {r.status === 'present' ? t('उपस्थित','Present') : r.status === 'absent' ? t('अनुपस्थित','Absent') : t('देर से','Late')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
