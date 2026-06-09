'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookMarked, Eye, CheckCircle, Clock, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminExamsPage() {
  const { t, lang } = useLanguage();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-exams'],
    queryFn: () => apiService.exams.getAll().then(r => r.data.data),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => apiService.exams.publish(id),
    onSuccess: () => {
      toast.success(t('परीक्षा प्रकाशित की गई', 'Exam published'));
      qc.invalidateQueries({ queryKey: ['admin-exams'] });
    },
    onError: () => toast.error(t('कुछ गलत हुआ', 'Something went wrong')),
  });

  const exams: {
    id: string; name: string; exam_type: string; start_date: string; end_date: string;
    is_published: boolean; class_name?: string;
  }[] = data ?? [];

  const typeLabel: Record<string, { hi: string; en: string }> = {
    unit_test:   { hi: 'यूनिट टेस्ट', en: 'Unit Test' },
    monthly:     { hi: 'मासिक',       en: 'Monthly' },
    quarterly:   { hi: 'त्रैमासिक',   en: 'Quarterly' },
    half_yearly: { hi: 'अर्धवार्षिक', en: 'Half Yearly' },
    annual:      { hi: 'वार्षिक',      en: 'Annual' },
    practical:   { hi: 'प्रायोगिक',   en: 'Practical' },
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('परीक्षाएं', 'Exams')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('परीक्षा सूची और प्रबंधन', 'Exam management')}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : exams.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <BookMarked size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई परीक्षा नहीं', 'No exams found')}</p>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {[
                    { hi: 'परीक्षा नाम', en: 'Exam Name' },
                    { hi: 'प्रकार',      en: 'Type' },
                    { hi: 'कक्षा',       en: 'Class' },
                    { hi: 'दिनांक',      en: 'Dates' },
                    { hi: 'स्थिति',      en: 'Status' },
                    { hi: 'कार्रवाई',   en: 'Action' },
                  ].map(h => (
                    <th key={h.en} className={`text-left px-4 py-3 text-xs font-semibold text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>
                      {t(h.hi, h.en)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {exams.map(exam => {
                  const tl = typeLabel[exam.exam_type];
                  return (
                    <tr key={exam.id} className="hover:bg-muted/20">
                      <td className="px-4 py-3 font-medium">{exam.name}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full font-medium">
                          {tl ? t(tl.hi, tl.en) : exam.exam_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{exam.class_name ?? '—'}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">
                        {new Date(exam.start_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')} —{' '}
                        {new Date(exam.end_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={cn('flex items-center gap-1 text-xs font-medium w-fit',
                          exam.is_published ? 'text-green-600' : 'text-yellow-600')}>
                          {exam.is_published ? <CheckCircle size={12} /> : <Clock size={12} />}
                          {exam.is_published ? t('प्रकाशित', 'Published') : t('ड्राफ्ट', 'Draft')}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {!exam.is_published && (
                          <button
                            onClick={() => publishMutation.mutate(exam.id)}
                            disabled={publishMutation.isPending}
                            className="flex items-center gap-1 text-xs bg-brand-800 hover:bg-brand-700 text-white px-3 py-1.5 rounded-lg font-medium transition-colors"
                          >
                            <Eye size={12} />
                            <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('प्रकाशित करें', 'Publish')}</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
