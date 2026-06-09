'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar, CheckCircle, XCircle, Clock, Save, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

type AttendanceStatus = 'present' | 'absent' | 'late';

export default function TeacherAttendancePage() {
  const { t, lang } = useLanguage();
  const qc = useQueryClient();
  const today = new Date().toISOString().split('T')[0];
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedDate, setSelectedDate] = useState(today);
  const [marks, setMarks] = useState<Record<string, AttendanceStatus>>({});

  const { data: teacherAnalytics } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => apiService.analytics.teacher('me').then(r => r.data.data),
  });

  const sections: { id: string; section_name: string; class_name: string; student_count: number }[] =
    teacherAnalytics?.sections ?? [];

  const { data: existingAttendance, isLoading: loadingAttendance } = useQuery({
    queryKey: ['section-attendance', selectedSection, selectedDate],
    queryFn: () => apiService.attendance.getSection(selectedSection, selectedDate).then(r => r.data.data),
    enabled: !!selectedSection,
  });

  useEffect(() => {
    if (!existingAttendance) return;
    const existing: Record<string, AttendanceStatus> = {};
    (existingAttendance ?? []).forEach((a: { student_id: string; status: AttendanceStatus }) => {
      existing[a.student_id] = a.status;
    });
    setMarks(existing);
  }, [existingAttendance]);

  const students: { id: string; first_name: string; last_name: string; roll_number: string }[] =
    existingAttendance?.students ?? existingAttendance ?? [];

  const saveMutation = useMutation({
    mutationFn: () => apiService.attendance.mark({
      sectionId: selectedSection,
      date: selectedDate,
      records: Object.entries(marks).map(([studentId, status]) => ({ studentId, status })),
    }),
    onSuccess: () => {
      toast.success(t('उपस्थिति सफलतापूर्वक सहेजी गई', 'Attendance saved successfully'));
      qc.invalidateQueries({ queryKey: ['section-attendance', selectedSection, selectedDate] });
    },
    onError: () => toast.error(t('कुछ गलत हुआ', 'Something went wrong')),
  });

  const setAll = (status: AttendanceStatus) => {
    const all: Record<string, AttendanceStatus> = {};
    students.forEach((s) => { all[s.id] = status; });
    setMarks(all);
  };

  const counts = students.reduce(
    (acc, s) => {
      const st = marks[s.id] ?? 'present';
      acc[st] = (acc[st] ?? 0) + 1;
      return acc;
    },
    { present: 0, absent: 0, late: 0 } as Record<AttendanceStatus, number>
  );

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('उपस्थिति', 'Attendance')}
            </h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('छात्रों की उपस्थिति दर्ज करें', 'Mark student attendance')}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('कक्षा / अनुभाग', 'Class / Section')}
            </label>
            <select
              value={selectedSection}
              onChange={e => { setSelectedSection(e.target.value); setMarks({}); }}
              className="border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[200px]"
            >
              <option value="">-- {t('अनुभाग चुनें', 'Select Section')} --</option>
              {sections.map(s => (
                <option key={s.id} value={s.id}>
                  {s.class_name} - {s.section_name} ({s.student_count} {t('छात्र', 'students')})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('दिनांक', 'Date')}
            </label>
            <input
              type="date"
              value={selectedDate}
              max={today}
              onChange={e => setSelectedDate(e.target.value)}
              className="border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {!selectedSection && (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <Users size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>
              {t('उपस्थिति दर्ज करने के लिए कक्षा चुनें', 'Select a section to mark attendance')}
            </p>
          </div>
        )}

        {selectedSection && (
          <>
            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              {([
                { status: 'present', hi: 'उपस्थित',   en: 'Present', icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-900/20' },
                { status: 'absent',  hi: 'अनुपस्थित', en: 'Absent',  icon: XCircle,     color: 'text-red-600   bg-red-50   dark:bg-red-900/20'   },
                { status: 'late',    hi: 'देर से',     en: 'Late',    icon: Clock,       color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20' },
              ] as const).map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.status} className={cn('rounded-2xl border border-border p-4 text-center', item.color)}>
                    <Icon size={22} className="mx-auto mb-1" />
                    <p className="text-2xl font-bold">{counts[item.status]}</p>
                    <p className={`text-xs font-medium mt-0.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t(item.hi, item.en)}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('सभी को चिह्नित करें:', 'Mark all as:')}
              </span>
              {(['present', 'absent', 'late'] as AttendanceStatus[]).map(s => (
                <button key={s} onClick={() => setAll(s)}
                  className={cn('text-xs px-3 py-1.5 rounded-lg font-medium border transition-colors',
                    s === 'present' ? 'border-green-200 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/20 dark:border-green-800 dark:text-green-400' :
                    s === 'absent'  ? 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400' :
                    'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:border-yellow-800 dark:text-yellow-400'
                  )}>
                  {s === 'present' ? t('उपस्थित', 'Present') : s === 'absent' ? t('अनुपस्थित', 'Absent') : t('देर से', 'Late')}
                </button>
              ))}
            </div>

            {/* Student list */}
            <div className="bg-card border border-border rounded-2xl overflow-hidden">
              {loadingAttendance ? (
                <div className="p-8 text-center text-muted-foreground">
                  <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('लोड हो रहा है...', 'Loading...')}</p>
                </div>
              ) : students.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई छात्र नहीं मिला', 'No students found')}</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {students.map((student, idx) => {
                    const status = marks[student.id] ?? 'present';
                    return (
                      <div key={student.id} className="flex items-center justify-between px-5 py-3 hover:bg-muted/20">
                        <div className="flex items-center gap-3">
                          <span className="text-xs text-muted-foreground w-6 text-center">{student.roll_number ?? idx + 1}</span>
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                            status === 'present' ? 'bg-green-100 text-green-700' :
                            status === 'absent'  ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700')}>
                            {student.first_name?.[0]}{student.last_name?.[0]}
                          </div>
                          <span className="font-medium text-sm">{student.first_name} {student.last_name}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          {(['present', 'absent', 'late'] as AttendanceStatus[]).map(s => (
                            <button key={s} onClick={() => setMarks(prev => ({ ...prev, [student.id]: s }))}
                              className={cn('flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                                status === s
                                  ? s === 'present' ? 'bg-green-500 text-white border-green-500' :
                                    s === 'absent'  ? 'bg-red-500 text-white border-red-500' :
                                    'bg-yellow-500 text-white border-yellow-500'
                                  : 'border-border bg-background text-muted-foreground hover:bg-muted/50'
                              )}>
                              {s === 'present' ? <CheckCircle size={11} /> : s === 'absent' ? <XCircle size={11} /> : <Clock size={11} />}
                              <span className={lang === 'hi' ? 'font-hindi' : ''}>
                                {s === 'present' ? t('उप', 'P') : s === 'absent' ? t('अन', 'A') : t('दे', 'L')}
                              </span>
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending || students.length === 0}
                className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-6 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {saveMutation.isPending
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Save size={16} />}
                <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('उपस्थिति सहेजें', 'Save Attendance')}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </AppLayout>
  );
}
