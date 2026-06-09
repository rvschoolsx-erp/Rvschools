'use client';
import { useQuery } from '@tanstack/react-query';
import { Award, TrendingUp } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { getGradeColor, cn } from '@/lib/utils';

export default function StudentMarksPage() {
  const { t, lang } = useLanguage();
  const studentId = 'demo-student-id';

  const { data, isLoading } = useQuery({
    queryKey: ['student-marks-full', studentId],
    queryFn: () => apiService.marks.getStudent(studentId).then(r => r.data.data),
  });

  const marks: {
    subject_name: string; exam_name: string; exam_type: string;
    marks_obtained: number; max_marks: number; is_absent: boolean;
  }[] = data ?? [];

  const grouped = marks.reduce((acc, m) => {
    if (!acc[m.exam_name]) acc[m.exam_name] = [];
    acc[m.exam_name].push(m);
    return acc;
  }, {} as Record<string, typeof marks>);

  const overallPct = marks.length
    ? Math.round(marks.filter(m => !m.is_absent)
        .reduce((s, m) => s + (m.marks_obtained / m.max_marks) * 100, 0) / marks.filter(m => !m.is_absent).length)
    : 0;

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('मेरे अंक', 'My Marks')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('सभी परीक्षाओं के परिणाम', 'Results across all examinations')}
            </p>
          </div>
        </div>

        {/* Overall */}
        {marks.length > 0 && (
          <div className="bg-gradient-to-br from-brand-900 to-brand-700 rounded-2xl p-6 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                <TrendingUp size={28} className="text-gold-400" />
              </div>
              <div>
                <p className={`text-brand-300 text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('समग्र प्रदर्शन', 'Overall Performance')}</p>
                <p className="text-4xl font-bold text-gold-400">{overallPct}%</p>
                <p className={`text-brand-200 text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {marks.length} {t('विषयों में', 'subjects')}
                </p>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : marks.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <Award size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई परीक्षा परिणाम नहीं', 'No exam results yet')}</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([examName, examMarks]) => {
              const examPct = examMarks.filter(m => !m.is_absent)
                .reduce((s, m) => s + (m.marks_obtained / m.max_marks) * 100, 0) / examMarks.filter(m => !m.is_absent).length;
              const totalObt = examMarks.filter(m => !m.is_absent).reduce((s, m) => s + m.marks_obtained, 0);
              const totalMax = examMarks.reduce((s, m) => s + m.max_marks, 0);
              return (
                <div key={examName} className="bg-card border border-border rounded-2xl overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-muted/30">
                    <h3 className="font-semibold text-sm">{examName}</h3>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-muted-foreground">{totalObt}/{totalMax}</span>
                      <span className={cn('text-sm font-bold', examPct >= 75 ? 'text-green-600' : examPct >= 50 ? 'text-yellow-600' : 'text-red-600')}>
                        {Math.round(examPct)}%
                      </span>
                    </div>
                  </div>
                  <div className="divide-y divide-border">
                    {examMarks.map((m, i) => {
                      const pct = m.is_absent ? 0 : (m.marks_obtained / m.max_marks) * 100;
                      const grade = pct >= 91 ? 'A+' : pct >= 81 ? 'A' : pct >= 71 ? 'B+' : pct >= 61 ? 'B' : pct >= 51 ? 'C+' : pct >= 41 ? 'C' : pct >= 33 ? 'D' : 'F';
                      return (
                        <div key={i} className="flex items-center gap-3 px-5 py-3">
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <p className="text-sm font-medium">{m.subject_name}</p>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {m.is_absent ? t('अनुपस्थित', 'Absent') : `${m.marks_obtained}/${m.max_marks}`}
                                </span>
                                <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', getGradeColor(grade))}>
                                  {m.is_absent ? 'AB' : grade}
                                </span>
                              </div>
                            </div>
                            {!m.is_absent && (
                              <div className="w-full bg-muted rounded-full h-1.5">
                                <div className={cn('h-1.5 rounded-full', pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500')}
                                  style={{ width: `${pct}%` }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
