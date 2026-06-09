'use client';
import { useQuery } from '@tanstack/react-query';
import { CreditCard, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

export default function ParentFeesPage() {
  const { t, lang } = useLanguage();
  const studentId = 'demo-student-id';

  const { data, isLoading } = useQuery({
    queryKey: ['parent-fees', studentId],
    queryFn: () => apiService.fees.getStudent(studentId).then(r => r.data.data),
  });

  const fees: {
    id: string; fee_type: string; amount_due: number; amount_paid: number;
    due_date: string; status: string;
  }[] = data?.fees ?? data ?? [];

  const summary = data?.summary ?? {
    totalDue: fees.reduce((s, f) => s + Number(f.amount_due), 0),
    totalPaid: fees.reduce((s, f) => s + Number(f.amount_paid), 0),
    totalPending: fees.reduce((s, f) => s + Math.max(0, Number(f.amount_due) - Number(f.amount_paid)), 0),
  };

  const statusConfig = {
    paid:    { hi: 'जमा',     en: 'Paid',    color: 'bg-green-100  text-green-700  dark:bg-green-900/20  dark:text-green-400',  icon: CheckCircle },
    pending: { hi: 'लंबित',   en: 'Pending', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400', icon: Clock },
    overdue: { hi: 'बकाया',   en: 'Overdue', color: 'bg-red-100    text-red-700    dark:bg-red-900/20    dark:text-red-400',    icon: AlertTriangle },
    partial: { hi: 'आंशिक',  en: 'Partial', color: 'bg-blue-100   text-blue-700   dark:bg-blue-900/20   dark:text-blue-400',   icon: Clock },
    waived:  { hi: 'माफ',    en: 'Waived',  color: 'bg-muted      text-muted-foreground',                                       icon: CheckCircle },
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('फीस विवरण', 'Fee Details')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('बच्चे की फीस देखें', "View your child's fee details")}
            </p>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { hi: 'कुल फीस',    en: 'Total Due',     value: formatCurrency(summary.totalDue),     color: 'bg-blue-50   dark:bg-blue-900/20',   icon: CreditCard,     iconColor: 'text-blue-600' },
            { hi: 'जमा फीस',    en: 'Total Paid',    value: formatCurrency(summary.totalPaid),    color: 'bg-green-50  dark:bg-green-900/20',  icon: CheckCircle,    iconColor: 'text-green-600' },
            { hi: 'बकाया फीस',  en: 'Total Pending', value: formatCurrency(summary.totalPending), color: 'bg-red-50    dark:bg-red-900/20',    icon: AlertTriangle,  iconColor: 'text-red-600' },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.en} className={cn('rounded-2xl border border-border p-5', card.color)}>
                <Icon size={22} className={cn('mb-3', card.iconColor)} />
                <p className="text-2xl font-bold">{card.value}</p>
                <p className={`text-xs font-medium text-muted-foreground mt-1 ${lang === 'hi' ? 'font-hindi' : ''}`}>{t(card.hi, card.en)}</p>
              </div>
            );
          })}
        </div>

        {/* Fee records */}
        <div className="bg-card border border-border rounded-2xl overflow-hidden">
          <div className="border-b border-border px-5 py-3">
            <h3 className={`font-semibold text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('फीस विवरण', 'Fee Breakdown')}</h3>
          </div>
          {isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : fees.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <CreditCard size={40} className="mx-auto mb-3 opacity-30" />
              <p className={lang === 'hi' ? 'font-hindi' : ''}>{t('कोई फीस रिकॉर्ड नहीं', 'No fee records')}</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {fees.map(fee => {
                const cfg = statusConfig[fee.status as keyof typeof statusConfig] ?? statusConfig.pending;
                const Icon = cfg.icon;
                const pending = Math.max(0, Number(fee.amount_due) - Number(fee.amount_paid));
                return (
                  <div key={fee.id} className="flex items-center justify-between px-5 py-4 hover:bg-muted/20">
                    <div className="flex items-center gap-3">
                      <div className={cn('w-9 h-9 rounded-xl flex items-center justify-center', cfg.color)}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{fee.fee_type}</p>
                        <p className={`text-xs text-muted-foreground ${lang === 'hi' ? 'font-hindi' : ''}`}>
                          {t('देय', 'Due')}: {new Date(fee.due_date).toLocaleDateString(lang === 'hi' ? 'hi-IN' : 'en-IN')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold">{formatCurrency(Number(fee.amount_due))}</p>
                      {pending > 0 && (
                        <p className="text-xs text-red-600 font-medium">
                          {t('बकाया', 'Pending')}: {formatCurrency(pending)}
                        </p>
                      )}
                      <span className={cn('text-xs font-medium px-2 py-0.5 rounded-full', cfg.color)}>
                        {t(cfg.hi, cfg.en)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
