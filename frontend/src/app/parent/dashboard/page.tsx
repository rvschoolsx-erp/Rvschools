'use client';
import { useQuery } from '@tanstack/react-query';
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { GraduationCap, CheckCircle, BookOpen, CreditCard, Bell, TrendingUp, AlertTriangle } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { apiService } from '@/lib/api';
import { useAuthStore } from '@/store/authStore';
import { formatCurrency, getGradeColor, cn } from '@/lib/utils';

export default function ParentDashboard() {
  const { user } = useAuthStore();
  // In production, fetch the parent's children list first
  const studentId = 'demo-student-id';

  const { data: analytics } = useQuery({
    queryKey: ['student-analytics', studentId],
    queryFn: () => apiService.analytics.student(studentId).then(r => r.data.data),
  });

  const { data: marksData } = useQuery({
    queryKey: ['student-marks', studentId],
    queryFn: () => apiService.marks.getStudent(studentId).then(r => r.data.data),
  });

  const { data: feesData } = useQuery({
    queryKey: ['student-fees', studentId],
    queryFn: () => apiService.fees.getStudent(studentId).then(r => r.data.data),
  });

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => apiService.notifications.getAll(true).then(r => r.data.data),
  });

  const attendancePercent = Number(analytics?.attendance?.percentage ?? 0);
  const radialData = [{ name: 'उपस्थिति', value: attendancePercent, fill: attendancePercent >= 90 ? '#16a34a' : attendancePercent >= 75 ? '#f59e0b' : '#dc2626' }];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold font-hindi">
            नमस्ते, {user?.firstName} जी!
          </h1>
          <p className="text-muted-foreground text-sm mt-1">अपने बच्चे की प्रगति देखें</p>
        </div>

        {/* Child Selector (for multiple children) */}
        <div className="bg-gradient-to-r from-brand-800 to-brand-700 rounded-2xl p-5 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gold-400 flex items-center justify-center text-brand-900 font-bold text-xl">
              R
            </div>
            <div>
              <p className="font-bold text-lg font-hindi">राहुल कुमार शर्मा</p>
              <p className="text-brand-200 text-sm">कक्षा 8 - A | प्रवेश: 2021/001234</p>
            </div>
            <div className="ml-auto text-right">
              <span className="bg-green-500/20 border border-green-400/30 text-green-300 text-xs px-3 py-1 rounded-full">
                सक्रिय
              </span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            {
              label: 'उपस्थिति',
              value: `${analytics?.attendance?.percentage ?? '—'}%`,
              sub: `${analytics?.attendance?.present ?? 0} दिन उपस्थित`,
              icon: CheckCircle,
              color: 'bg-green-50 dark:bg-green-900/20',
              iconColor: 'text-green-600',
              alert: attendancePercent < 75,
            },
            {
              label: 'औसत अंक',
              value: `${analytics?.marks?.avg_percentage ?? '—'}%`,
              sub: 'सभी विषयों का औसत',
              icon: TrendingUp,
              color: 'bg-blue-50 dark:bg-blue-900/20',
              iconColor: 'text-blue-600',
              alert: false,
            },
            {
              label: 'लंबित गृहकार्य',
              value: analytics?.homework?.overdue ?? 0,
              sub: `${analytics?.homework?.total ?? 0} कुल असाइनमेंट`,
              icon: BookOpen,
              color: 'bg-orange-50 dark:bg-orange-900/20',
              iconColor: 'text-orange-600',
              alert: Number(analytics?.homework?.overdue) > 0,
            },
            {
              label: 'लंबित फीस',
              value: formatCurrency(feesData?.summary?.totalPending ?? 0),
              sub: `कुल ${formatCurrency(feesData?.summary?.totalDue ?? 0)}`,
              icon: CreditCard,
              color: 'bg-yellow-50 dark:bg-yellow-900/20',
              iconColor: 'text-yellow-600',
              alert: (feesData?.summary?.totalPending ?? 0) > 0,
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className={cn('rounded-2xl border border-border p-4 relative', stat.color)}>
                {stat.alert && (
                  <div className="absolute top-3 right-3">
                    <AlertTriangle size={14} className="text-orange-500" />
                  </div>
                )}
                <Icon size={22} className={cn('mb-3', stat.iconColor)} />
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs font-medium text-foreground font-hindi mt-0.5">{stat.label}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{stat.sub}</p>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Attendance Gauge */}
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <h3 className="font-semibold font-hindi mb-4">उपस्थिति प्रतिशत</h3>
            <ResponsiveContainer width="100%" height={180}>
              <RadialBarChart cx="50%" cy="50%" innerRadius="60%" outerRadius="90%"
                data={radialData} startAngle={90} endAngle={-270}>
                <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                <RadialBar dataKey="value" cornerRadius={10} angleAxisId={0} />
              </RadialBarChart>
            </ResponsiveContainer>
            <p className={cn(
              'text-4xl font-bold -mt-16 mb-4',
              attendancePercent >= 90 ? 'text-green-600' : attendancePercent >= 75 ? 'text-yellow-600' : 'text-red-600'
            )}>
              {attendancePercent}%
            </p>
            {attendancePercent < 75 && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 text-xs text-red-600 font-hindi">
                ⚠️ उपस्थिति 75% से कम है। कृपया ध्यान दें।
              </div>
            )}
          </div>

          {/* Recent Marks */}
          <div className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold font-hindi mb-4">हाल के परीक्षा परिणाम</h3>
            <div className="space-y-3">
              {(marksData ?? []).slice(0, 6).map((mark: {
                subject_name: string; exam_name: string;
                marks_obtained: number; max_marks: number; is_absent: boolean;
              }, i: number) => {
                const pct = mark.is_absent ? 0 : (mark.marks_obtained / mark.max_marks) * 100;
                const grade = pct >= 91 ? 'A+' : pct >= 81 ? 'A' : pct >= 71 ? 'B+' : pct >= 61 ? 'B' : pct >= 51 ? 'C+' : pct >= 41 ? 'C' : pct >= 33 ? 'D' : 'F';

                return (
                  <div key={i} className="flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium truncate">{mark.subject_name}</p>
                        <div className="flex items-center gap-2 ml-2">
                          <span className="text-xs text-muted-foreground">
                            {mark.is_absent ? 'AB' : `${mark.marks_obtained}/${mark.max_marks}`}
                          </span>
                          <span className={cn('text-xs font-bold px-1.5 py-0.5 rounded', getGradeColor(grade))}>
                            {grade}
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-1.5">
                        <div
                          className={cn(
                            'h-1.5 rounded-full transition-all',
                            pct >= 75 ? 'bg-green-500' : pct >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          )}
                          style={{ width: `${Math.max(pct, 2)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
              {(!marksData || marksData.length === 0) && (
                <p className="text-center text-muted-foreground text-sm py-8 font-hindi">
                  कोई परीक्षा परिणाम उपलब्ध नहीं
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold font-hindi flex items-center gap-2">
              <Bell size={18} /> अधिसूचनाएं
            </h3>
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
              {notifications?.length ?? 0} नई
            </span>
          </div>
          <div className="space-y-2">
            {(notifications ?? []).slice(0, 5).map((n: {
              id: string; title: string; body: string; type: string; created_at: string; is_read: boolean;
            }) => (
              <div key={n.id} className={cn(
                'flex items-start gap-3 p-3 rounded-xl border transition-colors',
                !n.is_read ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800' : 'border-border hover:bg-muted/30'
              )}>
                <div className="text-xl flex-shrink-0">
                  {n.type === 'attendance' ? '📋' : n.type === 'fee' ? '💰' : n.type === 'exam' ? '📝' : '🔔'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{n.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{n.body}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(n.created_at).toLocaleDateString('hi-IN')}
                  </p>
                </div>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-1.5" />
                )}
              </div>
            ))}
            {(!notifications || notifications.length === 0) && (
              <p className="text-center text-muted-foreground text-sm py-6 font-hindi">
                कोई नई अधिसूचना नहीं
              </p>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
