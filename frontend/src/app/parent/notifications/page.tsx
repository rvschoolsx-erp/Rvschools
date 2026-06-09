'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Bell, CheckCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function ParentNotificationsPage() {
  const { t, lang } = useLanguage();
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications-parent'],
    queryFn: () => apiService.notifications.getAll().then(r => r.data.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (ids: string[]) => apiService.notifications.markRead(ids),
    onSuccess: () => {
      toast.success(t('सभी पढ़ा गया', 'Marked as read'));
      qc.invalidateQueries({ queryKey: ['notifications-parent'] });
    },
  });

  const notifications: {
    id: string; title: string; body: string; type: string;
    created_at: string; is_read: boolean;
  }[] = data ?? [];

  const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);

  const typeIcon: Record<string, string> = {
    attendance: '📋', fee: '💰', exam: '📝', announcement: '📢', result: '🏆', general: '🔔', homework: '📚',
  };

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('सूचनाएं', 'Notifications')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('सभी अधिसूचनाएं', 'All your notifications')}
            </p>
          </div>
          {unreadIds.length > 0 && (
            <button
              onClick={() => markReadMutation.mutate(unreadIds)}
              disabled={markReadMutation.isPending}
              className="flex items-center gap-2 text-sm text-brand-600 hover:text-brand-800 font-medium"
            >
              <CheckCheck size={16} />
              <span className={lang === 'hi' ? 'font-hindi' : ''}>{t('सभी पढ़ें', 'Mark all read')}</span>
            </button>
          )}
        </div>

        {unreadIds.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span className={`text-sm text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {unreadIds.length} {t('अपठित सूचनाएं', 'unread notifications')}
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-card border border-border rounded-2xl p-12 text-center text-muted-foreground">
            <Bell size={40} className="mx-auto mb-3 opacity-30" />
            <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई सूचना नहीं', 'No notifications')}</p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map(n => (
              <div key={n.id} className={cn(
                'flex items-start gap-4 p-4 rounded-2xl border transition-colors cursor-pointer',
                !n.is_read
                  ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800'
                  : 'bg-card border-border hover:bg-muted/30'
              )} onClick={() => !n.is_read && markReadMutation.mutate([n.id])}>
                <div className="text-2xl flex-shrink-0 mt-0.5">
                  {typeIcon[n.type] ?? '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={cn('text-sm font-semibold', !n.is_read ? 'text-foreground' : 'text-muted-foreground')}>
                      {n.title}
                    </p>
                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(n.created_at).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN', {
                      day: 'numeric', month: 'short', year: 'numeric',
                    })}
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
