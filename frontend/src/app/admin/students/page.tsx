'use client';
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Download, Eye, Edit, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn, formatDate, getInitials } from '@/lib/utils';

const statusColors: Record<string, string> = {
  active:      'bg-green-100 text-green-700',
  inactive:    'bg-gray-100 text-gray-600',
  transferred: 'bg-blue-100 text-blue-700',
  graduated:   'bg-purple-100 text-purple-700',
  suspended:   'bg-red-100 text-red-700',
};

export default function StudentsPage() {
  const { t, lang } = useLanguage();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [searchInput, setSearchInput] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['students', page, search, statusFilter],
    queryFn: () => apiService.students.getAll({ page, limit: 15, search, status: statusFilter })
                    .then(r => r.data),
  });

  const students = data?.data ?? [];
  const pagination = data?.pagination;

  const statusLabel = (s: string) => ({
    active:      t('सक्रिय', 'Active'),
    inactive:    t('निष्क्रिय', 'Inactive'),
    graduated:   t('उत्तीर्ण', 'Graduated'),
    transferred: t('स्थानांतरित', 'Transferred'),
    suspended:   t('निलंबित', 'Suspended'),
  }[s] ?? s);

  return (
    <AppLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('छात्र प्रबंधन', 'Student Management')}
            </h1>
            <p className="text-muted-foreground text-sm">
              {t('कुल', 'Total')} {pagination?.total ?? '—'} {t('छात्र नामांकित', 'students enrolled')}
            </p>
          </div>
          <Link
            href="/admin/students/new"
            className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            <Plus size={16} />
            <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('नया छात्र', 'Add Student')}</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('नाम, प्रवेश संख्या से खोजें...', 'Search by name, admission no...')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
              className={`w-full pl-9 pr-4 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${lang === 'hi' ? 'font-hindi' : ''}`}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className={`border border-input rounded-lg px-3 py-2 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring ${lang === 'hi' ? 'font-hindi' : ''}`}
          >
            <option value="active">{t('सक्रिय छात्र', 'Active Students')}</option>
            <option value="inactive">{t('निष्क्रिय', 'Inactive')}</option>
            <option value="graduated">{t('उत्तीर्ण', 'Graduated')}</option>
            <option value="transferred">{t('स्थानांतरित', 'Transferred')}</option>
          </select>

          <button
            onClick={() => apiService.students.getAll({ limit: 10000 }).then(() => {})}
            className="flex items-center gap-2 border border-border px-3 py-2 rounded-lg text-sm hover:bg-accent transition-colors"
          >
            <Download size={15} />
            <span>Export</span>
          </button>
        </div>

        {/* Table */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-card">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  {[
                    { hi: 'छात्र', en: 'Student' },
                    { hi: 'प्रवेश संख्या', en: 'Adm. No.' },
                    { hi: 'कक्षा', en: 'Class' },
                    { hi: 'दिनांक', en: 'Date' },
                    { hi: 'स्थिति', en: 'Status' },
                    { hi: 'कार्य', en: 'Actions' },
                  ].map((col, i) => (
                    <th key={col.en} className={`text-left px-4 py-3.5 font-semibold text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}
                      ${i === 1 ? 'hidden sm:table-cell' : i === 2 ? 'hidden md:table-cell' : i === 3 ? 'hidden lg:table-cell' : i === 5 ? 'text-right' : ''}`}>
                      {t(col.hi, col.en)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {isLoading
                  ? Array.from({ length: 8 }).map((_, i) => (
                      <tr key={i} className="animate-pulse">
                        <td className="px-4 py-3.5"><div className="h-10 bg-muted rounded-lg" /></td>
                        <td className="px-4 py-3.5 hidden sm:table-cell"><div className="h-4 bg-muted rounded w-24" /></td>
                        <td className="px-4 py-3.5 hidden md:table-cell"><div className="h-4 bg-muted rounded w-20" /></td>
                        <td className="px-4 py-3.5 hidden lg:table-cell"><div className="h-4 bg-muted rounded w-24" /></td>
                        <td className="px-4 py-3.5"><div className="h-6 bg-muted rounded-full w-16" /></td>
                        <td className="px-4 py-3.5"><div className="h-8 bg-muted rounded w-20 ml-auto" /></td>
                      </tr>
                    ))
                  : students.map((s: {
                      id: string; first_name: string; last_name: string;
                      email?: string; avatar_url?: string; admission_number: string;
                      class_name?: string; section_name?: string;
                      admission_date: string; admission_status: string; gender: string;
                    }) => (
                      <tr key={s.id} className="hover:bg-muted/30 transition-colors group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-800 dark:text-brand-300 font-semibold text-sm flex-shrink-0">
                              {s.avatar_url
                                ? <img src={s.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                                : getInitials(s.first_name, s.last_name)
                              }
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{s.first_name} {s.last_name}</p>
                              <p className="text-xs text-muted-foreground">{s.email || s.gender}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 hidden sm:table-cell text-muted-foreground font-mono text-xs">
                          {s.admission_number}
                        </td>
                        <td className="px-4 py-3.5 hidden md:table-cell">
                          {s.class_name && (
                            <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs px-2 py-1 rounded-lg font-medium">
                              {s.class_name} - {s.section_name}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 hidden lg:table-cell text-muted-foreground text-xs">
                          {s.admission_date ? formatDate(s.admission_date) : '—'}
                        </td>
                        <td className="px-4 py-3.5">
                          <span className={cn(
                            'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
                            statusColors[s.admission_status] ?? 'bg-gray-100 text-gray-600'
                          )}>
                            {statusLabel(s.admission_status)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Link href={`/admin/students/${s.id}`}
                              className="p-1.5 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30 text-blue-600 transition-colors"
                              title={t('देखें', 'View')}>
                              <Eye size={15} />
                            </Link>
                            <Link href={`/admin/students/${s.id}/edit`}
                              className="p-1.5 rounded-lg hover:bg-yellow-50 text-yellow-600 transition-colors"
                              title={t('संपादित करें', 'Edit')}>
                              <Edit size={15} />
                            </Link>
                            <button
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                              title={t('हटाएं', 'Delete')}>
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>

            {!isLoading && students.length === 0 && (
              <div className="text-center py-16 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-3 bg-muted rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-8 h-8">
                    <path d="M12 14l9-5-9-5-9 5 9 5z" />
                    <path d="M12 14l6.16-3.422a12 12 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12 12 0 01.665-6.479L12 14z" />
                  </svg>
                </div>
                <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई छात्र नहीं मिला', 'No students found')}</p>
              </div>
            )}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="border-t border-border px-4 py-3 flex items-center justify-between bg-muted/30">
              <p className="text-xs text-muted-foreground">
                {((page - 1) * 15) + 1}–{Math.min(page * 15, pagination.total)} of {pagination.total}
              </p>
              <div className="flex items-center gap-1">
                <button onClick={() => setPage(p => p - 1)} disabled={!pagination.hasPrev}
                  className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <span className="px-3 py-1 text-sm font-medium">{page} / {pagination.totalPages}</span>
                <button onClick={() => setPage(p => p + 1)} disabled={!pagination.hasNext}
                  className="p-1.5 rounded-lg border border-border hover:bg-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
