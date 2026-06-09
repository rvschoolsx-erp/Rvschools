'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Award } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

interface MarkEntry {
  studentId: string;
  subjectId: string;
  marksObtained: number | '';
  isAbsent: boolean;
}

export default function TeacherMarksPage() {
  const [selectedExam, setSelectedExam] = useState('');
  const [marks, setMarks] = useState<Record<string, MarkEntry>>({});
  const queryClient = useQueryClient();

  const { data: exams } = useQuery({
    queryKey: ['exams-teacher'],
    queryFn: () => apiService.exams.getAll().then(r => r.data.data),
  });

  const { data: examData } = useQuery({
    queryKey: ['exam-marks', selectedExam],
    queryFn: () => apiService.marks.getExam(selectedExam).then(r => r.data.data),
    enabled: !!selectedExam,
  });

  useEffect(() => {
    if (!examData) return;
    const initial: Record<string, MarkEntry> = {};
    const d = examData as { data: { student_id: string; subject_code: string; marks_obtained: number; is_absent: boolean }[] };
    d.data?.forEach((m) => {
      initial[`${m.student_id}-${m.subject_code}`] = {
        studentId: m.student_id, subjectId: m.subject_code,
        marksObtained: m.marks_obtained ?? '', isAbsent: m.is_absent,
      };
    });
    setMarks(initial);
  }, [examData]);

  const saveMutation = useMutation({
    mutationFn: () => apiService.marks.enter({
      examId: selectedExam,
      marks: Object.values(marks).filter(m => m.marksObtained !== ''),
    }),
    onSuccess: () => {
      toast.success('अंक सफलतापूर्वक दर्ज किए गए');
      queryClient.invalidateQueries({ queryKey: ['exam-marks', selectedExam] });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title font-hindi">अंक प्रविष्टि</h1>
            <p className="text-muted-foreground text-sm">परीक्षा के अंक दर्ज करें</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-4">
          <label className="block text-xs font-medium text-muted-foreground mb-1.5 font-hindi">परीक्षा चुनें</label>
          <select
            value={selectedExam}
            onChange={e => setSelectedExam(e.target.value)}
            className="border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[280px]"
          >
            <option value="">-- परीक्षा चुनें --</option>
            {(exams ?? []).map((e: { id: string; name: string; exam_type: string }) => (
              <option key={e.id} value={e.id}>{e.name} ({e.exam_type})</option>
            ))}
          </select>
        </div>

        {examData && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground font-hindi">छात्र</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground font-hindi">विषय</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground font-hindi">अधिकतम</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground font-hindi">प्राप्त अंक</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground font-hindi">अनुपस्थित</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {(examData.data ?? []).map((row: {
                    student_id: string; first_name: string; last_name: string;
                    subject_name: string; subject_code: string; max_marks: number;
                    marks_obtained: number; is_absent: boolean;
                  }) => {
                    const key = `${row.student_id}-${row.subject_code}`;
                    const entry = marks[key];
                    const pct = entry?.marksObtained !== '' && !entry?.isAbsent
                      ? (Number(entry?.marksObtained) / row.max_marks) * 100 : null;

                    return (
                      <tr key={key} className="hover:bg-muted/20">
                        <td className="px-4 py-3 font-medium">{row.first_name} {row.last_name}</td>
                        <td className="px-4 py-3 font-hindi text-muted-foreground">{row.subject_name}</td>
                        <td className="px-4 py-3 text-center text-muted-foreground">{row.max_marks}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max={row.max_marks}
                              value={entry?.isAbsent ? '' : (entry?.marksObtained ?? '')}
                              disabled={entry?.isAbsent}
                              onChange={(e) => setMarks(prev => ({
                                ...prev,
                                [key]: { ...prev[key], studentId: row.student_id, subjectId: row.subject_code, marksObtained: e.target.value === '' ? '' : Number(e.target.value), isAbsent: false }
                              }))}
                              className="w-20 border border-input rounded-lg px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:bg-muted"
                            />
                            {pct !== null && (
                              <span className={cn('text-xs font-medium', pct >= 75 ? 'text-green-600' : pct >= 33 ? 'text-yellow-600' : 'text-red-600')}>
                                {pct.toFixed(0)}%
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={entry?.isAbsent ?? false}
                            onChange={(e) => setMarks(prev => ({
                              ...prev,
                              [key]: { ...prev[key], studentId: row.student_id, subjectId: row.subject_code, marksObtained: '', isAbsent: e.target.checked }
                            }))}
                            className="w-4 h-4 accent-red-500"
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="border-t border-border p-4 flex justify-end">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors"
              >
                {saveMutation.isPending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
                <span className="font-hindi">अंक सहेजें</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
