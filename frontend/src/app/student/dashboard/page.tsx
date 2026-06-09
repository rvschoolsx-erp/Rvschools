'use client';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, BookOpen, Award, Clock, Calendar, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

const timetableMock = [
  { period: 1, time: '08:00 - 08:45', hi: 'गणित',           en: 'Mathematics',      teacher: 'Mr. Ram Sharma',     room: 'R-301' },
  { period: 2, time: '08:45 - 09:30', hi: 'विज्ञान',         en: 'Science',          teacher: 'Mr. Suresh Verma',   room: 'Lab-1' },
  { period: 3, time: '09:30 - 10:15', hi: 'हिंदी',           en: 'Hindi',            teacher: 'Mrs. Priya Singh',   room: 'R-301' },
  { period: 4, time: '10:15 - 10:30', hi: 'अंतराल',          en: 'Break',            teacher: '—',                  room: '—' },
  { period: 5, time: '10:30 - 11:15', hi: 'अंग्रेज़ी',        en: 'English',          teacher: 'Mr. Anil Yadav',     room: 'R-302' },
  { period: 6, time: '11:15 - 12:00', hi: 'सामाजिक विज्ञान', en: 'Social Science',   teacher: 'Mr. Vijay Patel',    room: 'R-301' },
];

export default function StudentDashboard() {
  const { t, lang } = useLanguage();
  const { user } = useAuthStore();
  const studentId = 'demo-student-id';

  const { data: analytics } = useQuery({
    queryKey: ['student-analytics', studentId],
    queryFn: () => apiService.analytics.student(studentId).then(r => r.data.data),
  });

  const { data: homework } = useQuery({
    queryKey: ['homework', studentId],
    queryFn: () => apiService.homework.getAll({ limit: 5 }).then(r => r.data.data),
  });

  const currentDay = new Date().toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { weekday: 'long' });
  const attendancePct = Number(analytics?.attendance?.percentage ?? 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-brand-300 text-sm mb-1 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('नमस्ते', 'Hello')} 👋
              </p>
              <h1 className={`text-2xl font-bold ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {user?.firstName} {user?.lastName}
              </h1>
              <p className={`text-brand-200 text-sm mt-1 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('कक्षा 8 - A', 'Class 8 - A')} | {t('रोल नं', 'Roll No.')}: 15
              </p>
            </div>
            <div className="text-right">
              <div className="text-4xl font-bold text-gold-400">{attendancePct}%</div>
              <p className={`text-brand-300 text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('उपस्थिति', 'Attendance')}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-xs text-brand-300 mb-1.5">
              <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('उपस्थिति प्रगति', 'Attendance progress')}</span>
              <span>{t('75% न्यूनतम आवश्यक', '75% minimum required')}</span>
            </div>
            <div className="w-full bg-brand-800 rounded-full h-2">
              <div
                className={cn('h-2 rounded-full transition-all', attendancePct >= 75 ? 'bg-green-400' : 'bg-red-400')}
                style={{ width: `${Math.min(attendancePct, 100)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              hi: 'उपस्थिति',       en: 'Attendance',
              value: `${analytics?.attendance?.present ?? 0} ${t('दिन', 'days')}`,
              sub: `${analytics?.attendance?.total ?? 0} ${t('में से', 'total')}`,
              icon: CheckCircle, color: 'bg-green-500',
            },
            {
              hi: 'औसत प्रतिशत',   en: 'Avg Score',
              value: `${analytics?.marks?.avg_percentage ?? '—'}%`,
              sub: t('सभी परीक्षाओं में', 'across all exams'),
              icon: TrendingUp, color: 'bg-blue-500',
            },
            {
              hi: 'लंबित गृहकार्य', en: 'Pending HW',
              value: analytics?.homework?.overdue ?? 0,
              sub: t('समय सीमा पार', 'overdue'),
              icon: BookOpen, color: analytics?.homework?.overdue > 0 ? 'bg-red-500' : 'bg-green-500',
            },
            {
              hi: 'लंबित फीस',     en: 'Pending Fees',
              value: analytics?.fees?.pending_fees ? '₹' + Number(analytics.fees.pending_fees).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN') : '₹0',
              sub: t('बकाया राशि', 'due amount'),
              icon: Award, color: analytics?.fees?.pending_fees > 0 ? 'bg-orange-500' : 'bg-green-500',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.en} className="bg-card border border-border rounded-2xl p-4">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', stat.color)}>
                  <Icon size={20} className="text-white" />
                </div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className={`text-xs font-medium text-foreground mt-0.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t(stat.hi, stat.en)}</p>
                <p className={`text-xs text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>{stat.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Today's Timetable */}
          <div className="lg:col-span-3 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Calendar size={18} className="text-brand-600" />
              <h3 className={`font-semibold ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('आज का समय सारणी', "Today's Timetable")} — {currentDay}
              </h3>
            </div>
            <div className="space-y-2">
              {timetableMock.map((period) => {
                const isBreak = period.en === 'Break';
                const now = new Date();
                const [startH, startM] = period.time.split(' - ')[0].split(':').map(Number);
                const [endH, endM]   = period.time.split(' - ')[1].split(':').map(Number);
                const isActive  = now.getHours() > startH || (now.getHours() === startH && now.getMinutes() >= startM);
                const isOver    = now.getHours() > endH   || (now.getHours() === endH   && now.getMinutes() >= endM);
                const isCurrent = isActive && !isOver;

                return (
                  <div key={period.period} className={cn(
                    'flex items-center gap-3 p-3 rounded-xl transition-all',
                    isBreak ? 'bg-muted/30 text-muted-foreground' :
                    isCurrent ? 'bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800' :
                    isOver ? 'opacity-50' : 'hover:bg-muted/30'
                  )}>
                    <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                      isCurrent ? 'bg-brand-800 text-white' : 'bg-muted text-muted-foreground')}>
                      {isBreak ? '☕' : period.period}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn(`text-sm font-medium ${lang === 'hi' ? 'font-hindi' : ''}`, isBreak && 'text-muted-foreground')}>
                          {t(period.hi, period.en)}
                        </p>
                        {isCurrent && (
                          <span className={`text-xs bg-brand-100 text-brand-700 px-1.5 py-0.5 rounded ${lang === 'hi' ? 'font-hindi' : ''}`}>
                            {t('अभी', 'Now')}
                          </span>
                        )}
                      </div>
                      {!isBreak && <p className="text-xs text-muted-foreground">{period.teacher} • {period.room}</p>}
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock size={11} />
                      <span>{period.time.split(' - ')[0]}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Homework */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen size={18} className="text-orange-500" />
              <h3 className={`font-semibold ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('लंबित गृहकार्य', 'Pending Homework')}
              </h3>
            </div>
            <div className="space-y-3">
              {(homework ?? []).slice(0, 4).map((hw: {
                id: string; title: string; subject_name: string; due_date: string;
              }) => {
                const dueDate = new Date(hw.due_date);
                const isOverdue = dueDate < new Date();
                return (
                  <div key={hw.id} className={cn('p-3 rounded-xl border',
                    isOverdue ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'border-border hover:bg-muted/30')}>
                    <p className="text-sm font-medium">{hw.title}</p>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">{hw.subject_name}</span>
                      <span className={cn('text-xs', isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground')}>
                        {isOverdue ? `⚠️ ${t('देर हो गई', 'Overdue')}` : '📅'} {dueDate.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                      </span>
                    </div>
                  </div>
                );
              })}
              {(!homework || homework.length === 0) && (
                <div className="text-center py-8 text-muted-foreground">
                  <div className="text-3xl mb-2">✅</div>
                  <p className={`text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
                    {t('सभी गृहकार्य पूर्ण!', 'All homework done!')}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
