'use client';
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CreditCard, TrendingUp, AlertCircle, CheckCircle, Search, Plus, Download } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { StatsCard } from '@/components/ui/StatsCard';
import { apiService } from '@/lib/api';
import { formatCurrency, cn } from '@/lib/utils';

const statusBadge: Record<string, string> = {
  paid:    'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  overdue: 'bg-red-100 text-red-700',
  partial: 'bg-blue-100 text-blue-700',
  waived:  'bg-gray-100 text-gray-600',
};

export default function FeesPage() {
  const [tab, setTab] = useState<'dashboard' | 'overdue' | 'payment'>('dashboard');
  const [paymentModal, setPaymentModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: dashboard } = useQuery({
    queryKey: ['fees-dashboard'],
    queryFn: () => apiService.fees.getDashboard().then(r => r.data.data),
  });

  const { data: overdueList } = useQuery({
    queryKey: ['fees-overdue'],
    queryFn: () => apiService.fees.getOverdue().then(r => r.data.data),
    enabled: tab === 'overdue',
  });

  const { register, handleSubmit, reset } = useForm<{
    feeId: string; studentId: string; amount: number;
    paymentMethod: string; transactionRef: string; remarks: string;
  }>();

  const paymentMutation = useMutation({
    mutationFn: (data: unknown) => apiService.fees.recordPayment(data),
    onSuccess: () => {
      toast.success('भुगतान सफलतापूर्वक दर्ज किया गया');
      reset();
      setPaymentModal(false);
      queryClient.invalidateQueries({ queryKey: ['fees-dashboard'] });
    },
  });

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className="page-title font-hindi">फीस प्रबंधन</h1>
            <p className="text-muted-foreground text-sm">शुल्क संग्रह एवं भुगतान प्रबंधन</p>
          </div>
          <button
            onClick={() => setPaymentModal(true)}
            className="flex items-center gap-2 bg-brand-800 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium"
          >
            <Plus size={16} />
            <span className="font-hindi">भुगतान दर्ज करें</span>
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="कुल बकाया"
            value={formatCurrency(dashboard?.total_due ?? 0)}
            icon={CreditCard}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            title="जमा हुई फीस"
            value={formatCurrency(dashboard?.total_collected ?? 0)}
            icon={CheckCircle}
            iconBg="bg-green-100"
            iconColor="text-green-600"
            trend={{ value: Number(dashboard?.collection_rate ?? 0), label: 'संग्रह दर' }}
          />
          <StatsCard
            title="लंबित राशि"
            value={formatCurrency(dashboard?.pending ?? 0)}
            icon={AlertCircle}
            iconBg="bg-yellow-100"
            iconColor="text-yellow-600"
          />
          <StatsCard
            title="आज जमा"
            value={formatCurrency(dashboard?.collected_today ?? 0)}
            icon={TrendingUp}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'भुगतान हो चुका', value: dashboard?.paid_count ?? 0, color: 'text-green-600' },
            { label: 'लंबित', value: dashboard?.pending_count ?? 0, color: 'text-yellow-600' },
            { label: 'बकाया', value: dashboard?.overdue_count ?? 0, color: 'text-red-600' },
          ].map(s => (
            <div key={s.label} className="bg-card border border-border rounded-xl p-4 text-center">
              <p className={cn('text-3xl font-bold', s.color)}>{s.value}</p>
              <p className="text-xs text-muted-foreground font-hindi mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/50 rounded-xl p-1 w-fit">
          {[
            { key: 'dashboard', label: 'डैशबोर्ड' },
            { key: 'overdue', label: 'बकाया सूची' },
          ].map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as 'dashboard' | 'overdue')}
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all font-hindi',
                tab === t.key ? 'bg-white dark:bg-gray-800 shadow text-foreground' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Monthly Trend */}
        {tab === 'dashboard' && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold font-hindi mb-4">मासिक संग्रह</h3>
            <div className="space-y-2">
              {dashboard?.monthlyTrend?.slice(-6).map((m: { month: string; collected: number }) => (
                <div key={m.month} className="flex items-center gap-4">
                  <span className="w-20 text-xs text-muted-foreground">{m.month}</span>
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-brand-600 transition-all"
                      style={{
                        width: `${Math.min((Number(m.collected) / (Number(dashboard.total_due) / 12)) * 100, 100)}%`
                      }}
                    />
                  </div>
                  <span className="w-28 text-xs font-medium text-right">{formatCurrency(m.collected)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Overdue List */}
        {tab === 'overdue' && (
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold font-hindi">बकाया फीस सूची</h3>
              <button className="flex items-center gap-1.5 text-xs border border-border px-3 py-1.5 rounded-lg hover:bg-accent">
                <Download size={13} />
                Export
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/50 border-b border-border">
                    {['छात्र', 'कक्षा', 'फीस प्रकार', 'देय राशि', 'जमा', 'बकाया', 'नियत तिथि'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground font-hindi">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {overdueList?.map((fee: {
                    id: string; first_name: string; last_name: string; admission_number: string;
                    class_name: string; section_name: string; fee_type: string;
                    amount_due: number; amount_paid: number; balance: number; due_date: string;
                  }) => (
                    <tr key={fee.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <p className="font-medium">{fee.first_name} {fee.last_name}</p>
                        <p className="text-xs text-muted-foreground">{fee.admission_number}</p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{fee.class_name} {fee.section_name}</td>
                      <td className="px-4 py-3 text-xs">{fee.fee_type}</td>
                      <td className="px-4 py-3 font-medium">{formatCurrency(fee.amount_due)}</td>
                      <td className="px-4 py-3 text-green-600">{formatCurrency(fee.amount_paid)}</td>
                      <td className="px-4 py-3 text-red-600 font-semibold">{formatCurrency(fee.balance)}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs bg-red-50 text-red-600 px-2 py-1 rounded-lg">
                          {new Date(fee.due_date).toLocaleDateString('hi-IN')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {paymentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-card rounded-2xl shadow-2xl w-full max-w-md p-6">
              <h3 className="font-bold text-lg mb-4 font-hindi">भुगतान दर्ज करें</h3>
              <form onSubmit={handleSubmit(d => paymentMutation.mutate(d))} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Fee ID</label>
                  <input {...register('feeId', { required: true })} placeholder="Fee record ID"
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 font-hindi">राशि (₹)</label>
                  <input {...register('amount', { required: true, min: 1 })} type="number" placeholder="0"
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1 font-hindi">भुगतान विधि</label>
                  <select {...register('paymentMethod')}
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring">
                    <option value="cash">नकद</option>
                    <option value="upi">UPI</option>
                    <option value="bank_transfer">बैंक ट्रांसफर</option>
                    <option value="cheque">चेक</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1">Transaction Ref</label>
                  <input {...register('transactionRef')} placeholder="UTR / Cheque No."
                    className="w-full border border-input rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={() => setPaymentModal(false)}
                    className="flex-1 border border-border py-2.5 rounded-xl text-sm hover:bg-accent transition-colors font-hindi">
                    रद्द करें
                  </button>
                  <button type="submit" disabled={paymentMutation.isPending}
                    className="flex-1 bg-brand-800 hover:bg-brand-700 text-white py-2.5 rounded-xl text-sm font-medium font-hindi">
                    {paymentMutation.isPending ? 'सहेजा जा रहा है...' : 'भुगतान दर्ज करें'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
