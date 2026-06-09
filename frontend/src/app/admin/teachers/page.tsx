'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, Mail, Phone, Award } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';

export default function AdminTeachersPage() {
  const { t, lang } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-students-list'],
    queryFn: () => apiService.students.getAll({ role: 'teacher', limit: 50 }).then(r => r.data.data),
  });

  const teachers: {
    id: string; first_name: string; last_name: string; email: string; phone: string;
    designation?: string; department?: string; experience_years?: number; employee_id?: string;
  }[] = data?.data ?? data ?? [];

  const demoTeachers = [
    { id: '1', first_name: 'Anita',  last_name: 'Joshi',  email: 'teacher@school.com', phone: '—',          designation: 'TGT Science',       department: 'Science',   experience_years: 6,  employee_id: 'EMP-099' },
    { id: '2', first_name: 'राम',   last_name: 'शर्मा',  email: 'ram.sharma@srsv.edu.in', phone: '9876543211', designation: 'PGT Mathematics', department: 'Science',   experience_years: 14, employee_id: 'EMP-001' },
    { id: '3', first_name: 'प्रिया', last_name: 'सिंह',   email: 'priya.singh@srsv.edu.in',phone: '9876543212', designation: 'TGT Hindi',       department: 'Languages', experience_years: 12, employee_id: 'EMP-002' },
    { id: '4', first_name: 'सुरेश', last_name: 'वर्मा',  email: 'suresh.verma@srsv.edu.in',phone: '9876543213', designation: 'PGT Physics',     department: 'Science',   experience_years: 9,  employee_id: 'EMP-003' },
  ];

  const displayList = teachers.length > 0 ? teachers : demoTeachers;

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('शिक्षक', 'Teachers')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('सभी शिक्षक और स्टाफ', 'All teaching staff')}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-2 rounded-xl text-sm font-medium">
            <Users size={15} />
            {displayList.length} {t('शिक्षक', 'Teachers')}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayList.map((teacher) => (
              <div key={teacher.id} className="bg-card border border-border rounded-2xl p-5 flex gap-4 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 rounded-2xl bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-brand-700 dark:text-brand-300 font-bold text-lg flex-shrink-0">
                  {teacher.first_name?.[0]}{teacher.last_name?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{teacher.first_name} {teacher.last_name}</p>
                      <p className="text-xs text-brand-600 font-medium mt-0.5">{teacher.designation}</p>
                    </div>
                    {teacher.employee_id && (
                      <span className="text-xs bg-muted px-2 py-1 rounded-lg font-mono flex-shrink-0">{teacher.employee_id}</span>
                    )}
                  </div>
                  <div className="mt-2 space-y-1">
                    {teacher.email && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail size={11} />
                        <span className="truncate">{teacher.email}</span>
                      </div>
                    )}
                    {teacher.phone && teacher.phone !== '—' && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Phone size={11} />
                        {teacher.phone}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Award size={11} />
                      <span className={lang === 'hi' ? 'font-hindi' : ''}>
                        {teacher.department} • {teacher.experience_years} {t('वर्ष', 'yrs')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
