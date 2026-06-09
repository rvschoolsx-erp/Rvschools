'use client';
import { useQuery } from '@tanstack/react-query';
import { BookMarked, Calendar, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function TeacherExamsPage() {
  const { t, lang } = useLanguage();

  const { data: exams, isLoading } = useQuery({
    queryKey: ['exams-teacher-list'],
    queryFn: () => apiService.exams.getAll().then(r => r.data.data),
  });

  const examList: {
    id: string; name: string; exam_type: string; start_date: string; end_date: string;
    is_published: boolean; class_name: string;
  }[] = exams ?? [];

  const upcoming = examList.filter(e => new Date(e.start_date) >= new Date());
  const past     = examList.filter(e => new Date(e.start_date) < new Date());

  const typeLabel = (type: string) => {
    const map: Record<string, { hi: string; en: string }> = {
      unit_test:   { hi: 'यूनिट टेस्ट',       en: 'Unit Test' },
      monthly:     { hi: 'मासिक',              en: 'Monthly' },
      quarterly:   { hi: 'त्रैमासिक',          en: 'Quarterly' },
      half_yearly: { hi: 'अर्धवार्षिक',        en: 'Half Yearly' },
      annual:      { hi: 'वार्षिक',             en: 'Annual' },
      practical:   { hi: 'प्रायोगिक',          en: 'Practical' },
    };
    return map[type] ? t(map[type].hi, map[type].en) : type;
  };

  const ExamCard = ({ exam }: { exam: typeof examList[0] }) => {
    const start = new Date(exam.start_date);
    const end   = new Date(exam.end_date);
    const isNow = new Date() >= start && new Date() <= end;
    return (
      <div className={cn('bg-card border rounded-2xl p-5 flex flex-col gap-3',
        isNow ? 'border-brand-400 dark:border-brand-600' : 'border-border')}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-semibold text-sm">{exam.name}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{exam.class_name}</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="text-xs font-medium bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2.5 py-1 rounded-full">
              {typeLabel(exam.exam_type)}
            </span>
            {exam.is_published
              ? <span className="text-xs text-green-600 font-medium">{t('प्रकाशित', 'Published')}</span>
              : <span className="text-xs text-yellow-600 font-medium">{t('अप्रकाशित', 'Draft')}</span>}
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className={`flex items-center gap-1 ${lang === 'hi' ? 'font-hindi' : ''}`}>
            <Calendar size={11} />
            {start.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
          </span>
          <span>—</span>
          <span className={`flex items-center gap-1 ${lang === 'hi' ? 'font-hindi' : ''}`}>
            <Clock size={11} />
            {end.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
          </span>
          {isNow && (
            <span className={`ml-auto text-brand-600 font-medium ${lang === 'hi' ? 'font-hindi' : ''}`}>
              🟢 {t('चल रही है', 'Ongoing')}
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
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('परीक्षा', 'Exams')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('आगामी और पिछली परीक्षाएं', 'Upcoming and past examinations')}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : examList.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <BookMarked size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई परीक्षा नहीं', 'No exams found')}</p>
          </div>
        ) : (
          <>
            {upcoming.length > 0 && (
              <div>
                <h2 className={`text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('आगामी परीक्षाएं', 'Upcoming Exams')} ({upcoming.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {upcoming.map(e => <ExamCard key={e.id} exam={e} />)}
                </div>
              </div>
            )}
            {past.length > 0 && (
              <div>
                <h2 className={`text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('पिछली परीक्षाएं', 'Past Exams')} ({past.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-60">
                  {past.map(e => <ExamCard key={e.id} exam={e} />)}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
