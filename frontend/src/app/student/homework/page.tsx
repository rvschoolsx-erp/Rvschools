'use client';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Calendar, AlertTriangle, CheckCircle } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function StudentHomeworkPage() {
  const { t, lang } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['student-homework'],
    queryFn: () => apiService.homework.getAll({ limit: 20 }).then(r => r.data.data),
  });

  const homework: {
    id: string; title: string; description: string; subject_name: string;
    class_name: string; section_name: string; due_date: string; max_marks: number;
    submitted?: boolean;
  }[] = data ?? [];

  const pending  = homework.filter(h => !h.submitted);
  const overdue  = pending.filter(h => new Date(h.due_date) < new Date());
  const upcoming = pending.filter(h => new Date(h.due_date) >= new Date());
  const done     = homework.filter(h => h.submitted);

  const HWCard = ({ hw }: { hw: typeof homework[0] }) => {
    const due = new Date(hw.due_date);
    const isOverdue = due < new Date() && !hw.submitted;
    const daysLeft  = Math.ceil((due.getTime() - Date.now()) / 86400000);
    return (
      <div className={cn(
        'bg-card border rounded-2xl p-5 flex flex-col gap-3',
        hw.submitted ? 'border-green-200 dark:border-green-800 opacity-70' :
        isOverdue    ? 'border-red-200   dark:border-red-800'   :
        daysLeft <= 2 ? 'border-yellow-200 dark:border-yellow-800' : 'border-border'
      )}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-2.5">
            <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5',
              hw.submitted ? 'bg-green-100 text-green-600' :
              isOverdue    ? 'bg-red-100   text-red-600'   : 'bg-brand-100 text-brand-700')}>
              {hw.submitted ? <CheckCircle size={16} /> : isOverdue ? <AlertTriangle size={16} /> : <BookOpen size={16} />}
            </div>
            <div>
              <p className="font-semibold text-sm">{hw.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{hw.subject_name} • {hw.class_name}-{hw.section_name}</p>
            </div>
          </div>
          {hw.max_marks && (
            <span className="text-xs font-medium bg-muted px-2 py-1 rounded-lg flex-shrink-0">{hw.max_marks} {t('अंक', 'marks')}</span>
          )}
        </div>
        {hw.description && <p className="text-xs text-muted-foreground line-clamp-2">{hw.description}</p>}
        <div className="flex items-center justify-between mt-auto">
          <span className={`flex items-center gap-1 text-xs ${lang === 'hi' ? 'font-hindi' : ''} ${isOverdue ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
            <Calendar size={11} />
            {isOverdue ? '⚠️ ' : ''}{t('अंतिम', 'Due')}: {due.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
          </span>
          {!hw.submitted && !isOverdue && (
            <span className={cn('text-xs font-medium', daysLeft <= 2 ? 'text-yellow-600' : 'text-muted-foreground')}>
              {daysLeft} {t('दिन शेष', 'days left')}
            </span>
          )}
          {hw.submitted && (
            <span className={`text-xs text-green-600 font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>
              ✓ {t('जमा', 'Submitted')}
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('गृहकार्य', 'Homework')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('लंबित और जमा गृहकार्य', 'Pending and submitted assignments')}
            </p>
          </div>
        </div>

        {/* Summary badges */}
        <div className="flex flex-wrap gap-3">
          {overdue.length > 0 && (
            <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl text-sm font-medium">
              <AlertTriangle size={14} />
              <span className={lang === 'hi' ? 'font-hindi' : ''}>{overdue.length} {t('समय सीमा पार', 'Overdue')}</span>
            </div>
          )}
          <div className={`flex items-center gap-2 bg-brand-50 dark:bg-brand-900/20 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-400 px-4 py-2 rounded-xl text-sm font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>
            <BookOpen size={14} />
            {upcoming.length} {t('लंबित', 'Pending')}
          </div>
          {done.length > 0 && (
            <div className={`flex items-center gap-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-2 rounded-xl text-sm font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>
              <CheckCircle size={14} />
              {done.length} {t('जमा', 'Done')}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : homework.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई गृहकार्य नहीं', 'No homework assigned')}</p>
          </div>
        ) : (
          <div className="space-y-5">
            {overdue.length > 0 && (
              <div>
                <p className={`text-xs font-semibold text-red-600 uppercase tracking-wide mb-3 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('समय सीमा पार', 'Overdue')} ({overdue.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {overdue.map(h => <HWCard key={h.id} hw={h} />)}
                </div>
              </div>
            )}
            {upcoming.length > 0 && (
              <div>
                <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('लंबित', 'Pending')} ({upcoming.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map(h => <HWCard key={h.id} hw={h} />)}
                </div>
              </div>
            )}
            {done.length > 0 && (
              <div>
                <p className={`text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('जमा', 'Submitted')} ({done.length})
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {done.map(h => <HWCard key={h.id} hw={h} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
