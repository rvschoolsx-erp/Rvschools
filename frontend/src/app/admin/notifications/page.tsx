'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, Send, Plus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function AdminNotificationsPage() {
  const { t, lang } = useLanguage();
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', type: 'general' as const });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-notifications'],
    queryFn: () => apiService.notifications.getAll().then(r => r.data.data),
  });

  const broadcastMutation = useMutation({
    mutationFn: () => apiService.notifications.broadcast({ title: form.title, body: form.body, type: form.type }),
    onSuccess: () => {
      toast.success(t('सूचना भेजी गई', 'Notification sent'));
      qc.invalidateQueries({ queryKey: ['admin-notifications'] });
      setShowForm(false);
      setForm({ title: '', body: '', type: 'general' });
    },
    onError: () => toast.error(t('कुछ गलत हुआ', 'Something went wrong')),
  });

  const notifications: {
    id: string; title: string; body: string; type: string;
    is_broadcast: boolean; sent_at: string; created_at: string;
  }[] = data ?? [];

  const typeIcon: Record<string, string> = { attendance: '📋', fee: '💰', exam: '📝', announcement: '📢', result: '🏆', general: '🔔', homework: '📚' };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('सूचनाएं', 'Notifications')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('सूचनाएं भेजें और प्रबंधित करें', 'Send and manage notifications')}
            </p>
          </div>
          <button onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors">
            <Plus size={16} />
            <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('नई सूचना', 'New Notification')}</span>
          </button>
        </div>

        {showForm && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`font-semibold ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('नई सूचना भेजें', 'Send New Notification')}</h3>
              <button onClick={() => setShowForm(false)} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('शीर्षक *', 'Title *')}</label>
                <input type="text" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div>
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('प्रकार', 'Type')}</label>
                <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value as typeof form.type }))}
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {[['general','General','सामान्य'],['fee','Fee','फीस'],['exam','Exam','परीक्षा'],['attendance','Attendance','उपस्थिति'],['announcement','Announcement','घोषणा']].map(([v,en,hi]) => (
                    <option key={v} value={v}>{t(hi,en)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={`block text-xs font-medium text-muted-foreground mb-1.5 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('संदेश *', 'Message *')}</label>
                <textarea value={form.body} rows={3} onChange={e => setForm(p => ({ ...p, body: e.target.value }))}
                  className="w-full border border-input rounded-lg px-3 py-2.5 bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="flex justify-end gap-3">
                <button onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50">{t('रद्द', 'Cancel')}</button>
                <button onClick={() => broadcastMutation.mutate()} disabled={broadcastMutation.isPending || !form.title || !form.body}
                  className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm disabled:opacity-50">
                  {broadcastMutation.isPending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={14} />}
                  <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('भेजें', 'Send')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center"><div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : notifications.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई सूचना नहीं', 'No notifications yet')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className="bg-card border border-border rounded-xl p-4 flex items-start gap-3 hover:bg-muted/20">
                <span className="text-xl flex-shrink-0">{typeIcon[n.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">{n.title}</p>
                    <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0',
                      n.is_broadcast ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300' : 'bg-muted text-muted-foreground')}>
                      {n.is_broadcast ? t('प्रसारण', 'Broadcast') : t('लक्षित', 'Targeted')}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">
                    {new Date(n.created_at).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
