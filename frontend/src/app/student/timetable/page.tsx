'use client';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const days = [
  { en: 'Monday',    hi: 'सोमवार'   },
  { en: 'Tuesday',   hi: 'मंगलवार'  },
  { en: 'Wednesday', hi: 'बुधवार'   },
  { en: 'Thursday',  hi: 'गुरुवार'  },
  { en: 'Friday',    hi: 'शुक्रवार' },
  { en: 'Saturday',  hi: 'शनिवार'   },
];

const periods = [
  { time: '08:00 - 08:45', period: 1 },
  { time: '08:45 - 09:30', period: 2 },
  { time: '09:30 - 10:15', period: 3 },
  { time: '10:15 - 10:30', period: 0, isBreak: true },
  { time: '10:30 - 11:15', period: 4 },
  { time: '11:15 - 12:00', period: 5 },
  { time: '12:00 - 12:45', period: 6 },
  { time: '12:45 - 01:15', period: 0, isBreak: true, isLunch: true },
  { time: '01:15 - 02:00', period: 7 },
];

const timetableData: Record<string, Record<number, { subject: string; teacher: string; color: string }>> = {
  Monday:    { 1: { subject: 'Mathematics',    teacher: 'Mr. Ram Sharma',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }, 2: { subject: 'Science',        teacher: 'Mr. Suresh Verma',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }, 3: { subject: 'English',        teacher: 'Mr. Anil Yadav',    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }, 4: { subject: 'Hindi',          teacher: 'Mrs. Priya Singh',  color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }, 5: { subject: 'Social Science', teacher: 'Mr. Vijay Patel',   color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' }, 6: { subject: 'Sanskrit',       teacher: 'Mrs. Meena Joshi',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }, 7: { subject: 'Computer',       teacher: 'Mr. Rahul Gupta',   color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' } },
  Tuesday:   { 1: { subject: 'Hindi',          teacher: 'Mrs. Priya Singh',  color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }, 2: { subject: 'Mathematics',    teacher: 'Mr. Ram Sharma',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }, 3: { subject: 'Social Science', teacher: 'Mr. Vijay Patel',   color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' }, 4: { subject: 'Science',        teacher: 'Mr. Suresh Verma',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }, 5: { subject: 'Computer',       teacher: 'Mr. Rahul Gupta',   color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' }, 6: { subject: 'English',        teacher: 'Mr. Anil Yadav',    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }, 7: { subject: 'Mathematics',    teacher: 'Mr. Ram Sharma',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' } },
  Wednesday: { 1: { subject: 'English',        teacher: 'Mr. Anil Yadav',    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }, 2: { subject: 'Sanskrit',       teacher: 'Mrs. Meena Joshi',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }, 3: { subject: 'Mathematics',    teacher: 'Mr. Ram Sharma',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }, 4: { subject: 'Hindi',          teacher: 'Mrs. Priya Singh',  color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }, 5: { subject: 'Science',        teacher: 'Mr. Suresh Verma',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }, 6: { subject: 'Social Science', teacher: 'Mr. Vijay Patel',   color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' }, 7: { subject: 'Computer',       teacher: 'Mr. Rahul Gupta',   color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' } },
  Thursday:  { 1: { subject: 'Science',        teacher: 'Mr. Suresh Verma',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }, 2: { subject: 'English',        teacher: 'Mr. Anil Yadav',    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }, 3: { subject: 'Hindi',          teacher: 'Mrs. Priya Singh',  color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }, 4: { subject: 'Mathematics',    teacher: 'Mr. Ram Sharma',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }, 5: { subject: 'Sanskrit',       teacher: 'Mrs. Meena Joshi',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }, 6: { subject: 'Computer',       teacher: 'Mr. Rahul Gupta',   color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' }, 7: { subject: 'Social Science', teacher: 'Mr. Vijay Patel',   color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' } },
  Friday:    { 1: { subject: 'Social Science', teacher: 'Mr. Vijay Patel',   color: 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' }, 2: { subject: 'Hindi',          teacher: 'Mrs. Priya Singh',  color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }, 3: { subject: 'Science',        teacher: 'Mr. Suresh Verma',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }, 4: { subject: 'English',        teacher: 'Mr. Anil Yadav',    color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' }, 5: { subject: 'Mathematics',    teacher: 'Mr. Ram Sharma',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }, 6: { subject: 'Sanskrit',       teacher: 'Mrs. Meena Joshi',  color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' }, 7: { subject: 'Computer',       teacher: 'Mr. Rahul Gupta',   color: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300' } },
  Saturday:  { 1: { subject: 'Mathematics',    teacher: 'Mr. Ram Sharma',    color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' }, 2: { subject: 'Hindi',          teacher: 'Mrs. Priya Singh',  color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' }, 3: { subject: 'Science',        teacher: 'Mr. Suresh Verma',  color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' }, 4: { subject: 'PTM / Activity', teacher: '—',                 color: 'bg-muted text-muted-foreground' } },
};

export default function StudentTimetablePage() {
  const { t, lang } = useLanguage();
  const todayEn = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  const todayMatch = days.find(d => d.en === todayEn);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('समय सारणी', 'Timetable')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('साप्ताहिक कक्षा अनुसूची — कक्षा 8-A', 'Weekly class schedule — Class 8-A')}
            </p>
          </div>
          {todayMatch && (
            <span className="text-sm text-brand-600 font-medium bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-xl">
              📅 {t(todayMatch.hi, todayMatch.en)}
            </span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr>
                <th className="text-left px-3 py-3 text-xs font-semibold text-muted-foreground bg-muted/50 border border-border rounded-tl-xl w-28">
                  {t('समय', 'Time')}
                </th>
                {days.map(d => (
                  <th key={d.en} className={cn(
                    'text-center px-2 py-3 text-xs font-semibold border border-border',
                    d.en === todayEn ? 'bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300' : 'bg-muted/50 text-muted-foreground'
                  )}>
                    <span className={lang === 'hi' ? 'font-hindi' : ''}>{t(d.hi, d.en)}</span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periods.map((p, i) => {
                if (p.isBreak) {
                  return (
                    <tr key={i}>
                      <td className="px-3 py-2 text-xs text-muted-foreground border border-border bg-muted/20">{p.time}</td>
                      <td colSpan={6} className="px-3 py-2 text-center text-xs text-muted-foreground border border-border bg-muted/20">
                        {p.isLunch ? `🍱 ${t('दोपहर का भोजन', 'Lunch Break')}` : `☕ ${t('अंतराल', 'Break')}`}
                      </td>
                    </tr>
                  );
                }
                return (
                  <tr key={i}>
                    <td className="px-3 py-2 text-xs text-muted-foreground border border-border bg-card">
                      <div className="font-medium">{t(`कालांश ${p.period}`, `P${p.period}`)}</div>
                      <div className="opacity-70">{p.time}</div>
                    </td>
                    {days.map(d => {
                      const slot = timetableData[d.en]?.[p.period];
                      return (
                        <td key={d.en} className={cn('px-2 py-2 border border-border text-center',
                          d.en === todayEn ? 'bg-brand-50/30 dark:bg-brand-900/10' : 'bg-card')}>
                          {slot ? (
                            <div className={cn('rounded-lg px-2 py-1.5 text-xs', slot.color)}>
                              <p className="font-semibold text-[11px] leading-tight">{slot.subject}</p>
                              <p className="opacity-70 text-[10px] leading-tight mt-0.5">{slot.teacher}</p>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">—</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
