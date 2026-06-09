'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, BookOpen, Calendar, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function TeacherHomeworkPage() {
  const { t, lang } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', sectionId: '', subjectId: '', dueDate: '', maxMarks: '' });

  const { data: homeworkList, isLoading } = useQuery({
    queryKey: ['homework-teacher'],
    queryFn: () => apiService.homework.getAll().then(r => r.data.data),
  });

  const { data: teacherData } = useQuery({
    queryKey: ['teacher-analytics'],
    queryFn: () => apiService.analytics.teacher('me').then(r => r.data.data),
  });

  const sections: { id: string; section_name: string; class_name: string }[] = teacherData?.sections ?? [];

  const createMutation = useMutation({
    mutationFn: () => apiService.homework.create({
      title: form.title,
      description: form.description,
      sectionId: form.sectionId,
      subjectId: form.subjectId,
      dueDate: form.dueDate,
      maxMarks: form.maxMarks ? Number(form.maxMarks) : null,
    }),
    onSuccess: () => {
      toast.success(t('गृहकार्य सफलतापूर्वक जोड़ा गया', 'Homework created successfully'));
      qc.invalidateQueries({ queryKey: ['homework-teacher'] });
      setShowForm(false);
      setForm({ title: '', description: '', sectionId: '', subjectId: '', dueDate: '', maxMarks: '' });
    },
    onError: () => toast.error(t('कुछ गलत हुआ', 'Something went wrong')),
  });

  const hwList: { id: string; title: string; subject_name: string; section_name: string; class_name: string; due_date: string; created_at: string }[] =
    homeworkList ?? [];

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('गृहकार्य', 'Homework')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('गृहकार्य बनाएं और प्रबंधित करें', 'Create and manage homework assignments')}
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
          >
            <Plus size={16} />
            <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('नया गृहकार्य', 'New Homework')}</span>
          </button>
        </div>

        {/* Create form */}
        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className={`font-semibold ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('नया गृहकार्य जोड़ें', 'Add New Homework')}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground">
                <X size={18} />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('शीर्षक *', 'Title *')}
                </label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder={t('गृहकार्य का शीर्षक', 'Homework title')}
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('कक्षा / अनुभाग *', 'Class / Section *')}
                </label>
                <select value={form.sectionId} onChange={e => setForm(p => ({ ...p, sectionId: e.target.value }))}
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  <option value="">-- {t('चुनें', 'Select')} --</option>
                  {sections.map(s => <option key={s.id} value={s.id}>{s.class_name} - {s.section_name}</option>)}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('अंतिम तिथि *', 'Due Date *')}
                </label>
                <input type="date" value={form.dueDate} min={new Date().toISOString().split('T')[0]}
                  onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('अधिकतम अंक', 'Max Marks')}
                </label>
                <input type="number" value={form.maxMarks} min="0" max="100"
                  onChange={e => setForm(p => ({ ...p, maxMarks: e.target.value }))}
                  placeholder="10"
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="md:col-span-2">
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>
                  {t('विवरण', 'Description')}
                </label>
                <textarea value={form.description} rows={3}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder={t('गृहकार्य का विवरण...', 'Homework description...')}
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-4">
              <button onClick={() => setShowForm(false)}
                className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors">
                {t('रद्द करें', 'Cancel')}
              </button>
              <button onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.title || !form.sectionId || !form.dueDate}
                className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors disabled:opacity-50">
                {createMutation.isPending
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <Plus size={14} />}
                <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('जोड़ें', 'Create')}</span>
              </button>
            </div>
          </div>
        )}

        {/* Homework list */}
        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center text-muted-foreground">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          </div>
        ) : hwList.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <BookOpen size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई गृहकार्य नहीं', 'No homework yet')}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {hwList.map(hw => {
              const due = new Date(hw.due_date);
              const isOverdue = due < new Date();
              return (
                <div key={hw.id} className={cn(
                  'bg-card border rounded-2xl p-5 flex flex-col gap-3',
                  isOverdue ? 'border-red-200 dark:border-red-800' : 'border-border'
                )}>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-sm">{hw.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{hw.class_name} - {hw.section_name} • {hw.subject_name}</p>
                    </div>
                    <span className={cn('text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0',
                      isOverdue ? 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400' : 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400')}>
                      {isOverdue ? t('समाप्त', 'Expired') : t('सक्रिय', 'Active')}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar size={12} />
                    <span className={lang === 'hi' ? 'font-hindi' : ''}>
                      {t('अंतिम तिथि', 'Due')}: {due.toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                    </span>
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
