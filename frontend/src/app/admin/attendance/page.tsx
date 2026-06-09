'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle, Clock, Save, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

type Status = 'present' | 'absent' | 'late' | 'excused';

interface StudentRecord {
  student_id: string;
  first_name: string;
  last_name: string;
  admission_number: string;
  roll_number?: string;
  status?: Status;
}

export default function AttendancePage() {
  const { t, lang } = useLanguage();
  const [selectedSection, setSelectedSection] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [attendance, setAttendance] = useState<Record<string, Status>>({});
  const queryClient = useQueryClient();

  const statusConfig = {
    present: { label: t('उपस्थित', 'Present'), color: 'bg-green-100 text-green-700 border-green-200', icon: CheckCircle2, iconColor: 'text-green-500' },
    absent:  { label: t('अनुपस्थित', 'Absent'), color: 'bg-red-100 text-red-700 border-red-200',     icon: XCircle,      iconColor: 'text-red-500' },
    late:    { label: t('देर से', 'Late'),      color: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: Clock,     iconColor: 'text-yellow-500' },
    excused: { label: t('माफ', 'Excused'),      color: 'bg-blue-100 text-blue-700 border-blue-200',   icon: AlertCircle,  iconColor: 'text-blue-500' },
  };

  const { data: sectionData, isLoading } = useQuery({
    queryKey: ['attendance-section', selectedSection, date],
    queryFn: () => apiService.attendance.getSection(selectedSection, date).then(r => r.data.data),
    enabled: !!selectedSection,
  });

  useEffect(() => {
    if (!sectionData) return;
    const init: Record<string, Status> = {};
    (sectionData as { students: StudentRecord[] }).students?.forEach((s) => {
      init[s.student_id] = (s.status as Status) || 'present';
    });
    setAttendance(init);
  }, [sectionData]);

  const saveMutation = useMutation({
    mutationFn: () => apiService.attendance.mark({
      sectionId: selectedSection,
      date,
      attendance: Object.entries(attendance).map(([studentId, status]) => ({ studentId, status })),
    }),
    onSuccess: () => {
      toast.success(t('उपस्थिति सफलतापूर्वक दर्ज की गई', 'Attendance saved successfully'));
      queryClient.invalidateQueries({ queryKey: ['attendance-section'] });
    },
    onError: () => toast.error(t('उपस्थिति दर्ज करने में त्रुटि', 'Error saving attendance')),
  });

  const markAll = (status: Status) => {
    const updated: Record<string, Status> = {};
    sectionData?.students?.forEach((s: StudentRecord) => { updated[s.student_id] = status; });
    setAttendance(updated);
  };

  const stats = sectionData?.students ? {
    present: Object.values(attendance).filter(s => s === 'present').length,
    absent:  Object.values(attendance).filter(s => s === 'absent').length,
    late:    Object.values(attendance).filter(s => s === 'late').length,
    total:   sectionData.students.length,
  } : null;

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('उपस्थिति', 'Attendance')}
            </h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('कक्षा की दैनिक उपस्थिति दर्ज करें', 'Record daily class attendance')}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-wrap gap-4 items-end">
          <div>
            <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('कक्षा/सेक्शन', 'Class / Section')}
            </label>
            <select
              value={selectedSection}
              onChange={e => setSelectedSection(e.target.value)}
              className={`border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring min-w-[180px] ${lang === 'hi' ? 'font-hindi' : ''}`}
            >
              <option value="">{t('सेक्शन चुनें', 'Select section')}</option>
              <option value="sec-6a">{t('कक्षा 6 - A', 'Class 6 - A')}</option>
              <option value="sec-7b">{t('कक्षा 7 - B', 'Class 7 - B')}</option>
              <option value="sec-8a">{t('कक्षा 8 - A', 'Class 8 - A')}</option>
              <option value="sec-10a">{t('कक्षा 10 - A', 'Class 10 - A')}</option>
            </select>
          </div>

          <div>
            <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('दिनांक', 'Date')}
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          {sectionData && (
            <div className="flex gap-2 ml-auto">
              <button onClick={() => markAll('present')}
                className={`bg-green-50 hover:bg-green-100 text-green-700 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('सभी उपस्थित', 'Mark All Present')}
              </button>
              <button onClick={() => markAll('absent')}
                className={`bg-red-50 hover:bg-red-100 text-red-700 text-xs px-3 py-2 rounded-lg font-medium transition-colors ${lang === 'hi' ? 'font-hindi' : ''}`}>
                {t('सभी अनुपस्थित', 'Mark All Absent')}
              </button>
            </div>
          )}
        </div>

        {/* Stats Bar */}
        {stats && (
          <div className="grid grid-cols-4 gap-3">
            {[
              { hi: 'कुल', en: 'Total', value: stats.total, color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200', text: 'text-blue-700' },
              { hi: 'उपस्थित', en: 'Present', value: stats.present, color: 'bg-green-50 dark:bg-green-900/20 border-green-200', text: 'text-green-700' },
              { hi: 'अनुपस्थित', en: 'Absent', value: stats.absent, color: 'bg-red-50 dark:bg-red-900/20 border-red-200', text: 'text-red-700' },
              { hi: 'देर से', en: 'Late', value: stats.late, color: 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200', text: 'text-yellow-700' },
            ].map(s => (
              <div key={s.en} className={cn('border rounded-xl p-3 text-center', s.color)}>
                <p className={cn('text-2xl font-bold', s.text)}>{s.value}</p>
                <p className={cn(`text-xs mt-0.5 ${lang === 'hi' ? 'font-hindi' : ''}`, s.text)}>{t(s.hi, s.en)}</p>
              </div>
            ))}
          </div>
        )}

        {/* Student List */}
        {!selectedSection ? (
          <div className="bg-card border border-border rounded-2xl p-16 text-center text-muted-foreground">
            <div className="text-5xl mb-3">📋</div>
            <p className={lang === 'hi' ? 'font-hindi' : ''}>
              {t('उपस्थिति लेने के लिए कक्षा और दिनांक चुनें', 'Select a class and date to take attendance')}
            </p>
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
                <div className="h-8 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {sectionData?.students?.map((student: StudentRecord, index: number) => {
              const currentStatus = attendance[student.student_id] || 'present';
              const config = statusConfig[currentStatus];
              const Icon = config.icon;

              return (
                <div
                  key={student.student_id}
                  className={cn(
                    'bg-card border rounded-xl p-4 flex items-center gap-4 transition-all',
                    currentStatus === 'present' ? 'border-green-200 dark:border-green-800' :
                    currentStatus === 'absent'  ? 'border-red-200 dark:border-red-800' :
                    currentStatus === 'late'    ? 'border-yellow-200 dark:border-yellow-800' :
                    'border-border'
                  )}
                >
                  <div className="w-8 text-center text-sm font-mono text-muted-foreground flex-shrink-0">
                    {student.roll_number || index + 1}
                  </div>
                  <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-800 font-semibold text-sm flex-shrink-0">
                    {(student.first_name[0] + student.last_name[0]).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-foreground">{student.first_name} {student.last_name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{student.admission_number}</p>
                  </div>
                  <div className="flex gap-1.5">
                    {(Object.keys(statusConfig) as Status[]).map((status) => {
                      const cfg = statusConfig[status];
                      const Ico = cfg.icon;
                      return (
                        <button
                          key={status}
                          onClick={() => setAttendance(prev => ({ ...prev, [student.student_id]: status }))}
                          className={cn(
                            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all',
                            currentStatus === status
                              ? cfg.color
                              : 'bg-muted/30 text-muted-foreground border-transparent hover:bg-muted'
                          )}
                        >
                          <Ico size={13} className={currentStatus === status ? cfg.iconColor : ''} />
                          <span className={`hidden sm:inline ${lang === 'hi' ? 'font-hindi' : ''}`}>{cfg.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Save Button */}
        {sectionData?.students?.length > 0 && (
          <div className="flex justify-end pt-2">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 disabled:bg-brand-400 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              {saveMutation.isPending
                ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Save size={16} />}
              <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('उपस्थिति सहेजें', 'Save Attendance')}</span>
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
