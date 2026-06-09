'use client';
import { useQuery } from '@tanstack/react-query';
import { Users, Phone, Mail, User } from 'lucide-react';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { useLanguage } from '@/contexts/LanguageContext';
import { apiService } from '@/lib/api';

const demoParents = [
  { id: '1', first_name: 'Vinod',   last_name: 'Kumar',    email: 'vinod.kumar@example.com',  phone: '9876543210', occupation: 'Business',  children_names: ['Rahul Kumar'] },
  { id: '2', first_name: 'सुनीता',  last_name: 'देवी',     email: 'sunita.d@example.com',      phone: '9876543221', occupation: 'Housewife', children_names: ['Priya Devi'] },
  { id: '3', first_name: 'Mahesh',  last_name: 'Yadav',    email: 'mahesh.y@example.com',      phone: '9876543222', occupation: 'Farmer',    children_names: ['Suresh Yadav'] },
  { id: '4', first_name: 'कमला',   last_name: 'सिंह',     email: 'kamla.s@example.com',       phone: '9876543223', occupation: 'Teacher',   children_names: ['Kavita Singh', 'Ravi Singh'] },
  { id: '5', first_name: 'Ramesh',  last_name: 'Gupta',    email: 'ramesh.g@example.com',      phone: '9876543224', occupation: 'Shopkeeper',children_names: ['Neha Gupta'] },
  { id: '6', first_name: 'Santosh', last_name: 'Sharma',   email: 'santosh.s@example.com',     phone: '9876543225', occupation: 'Driver',    children_names: ['Manish Sharma'] },
];

export default function AdminParentsPage() {
  const { t, lang } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-parents'],
    queryFn: () => apiService.students.getAll({ role: 'parent', limit: 50 }).then(r => r.data.data),
  });

  const parents: {
    id: string; first_name: string; last_name: string; email?: string; phone?: string;
    occupation?: string; children_names?: string[];
  }[] = (data?.data ?? data ?? []).length > 0 ? (data?.data ?? data ?? []) : demoParents;

  return (
    <AppLayout>
      <div className="space-y-5">
        <div className="page-header">
          <div>
            <h1 className={`page-title ${lang === 'hi' ? 'font-hindi' : ''}`}>{t('अभिभावक', 'Parents')}</h1>
            <p className={`text-muted-foreground text-sm ${lang === 'hi' ? 'font-hindi' : ''}`}>
              {t('सभी पंजीकृत अभिभावक', 'All registered parents')}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-4 py-2 rounded-xl text-sm font-medium">
            <Users size={15} />
            {parents.length} {t('अभिभावक', 'Parents')}
          </div>
        </div>

        {isLoading ? (
          <div className="bg-card border border-border rounded-2xl p-10 text-center">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {parents.map(p => (
              <div key={p.id} className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-11 h-11 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-700 dark:text-purple-300 font-bold text-base flex-shrink-0">
                    {p.first_name?.[0]}{p.last_name?.[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{p.first_name} {p.last_name}</p>
                    {p.occupation && (
                      <p className="text-xs text-purple-600 font-medium mt-0.5">{p.occupation}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  {p.phone && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone size={11} />
                      {p.phone}
                    </div>
                  )}
                  {p.email && (
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail size={11} />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}
                  {p.children_names && p.children_names.length > 0 && (
                    <div className="flex items-start gap-1.5 text-xs text-muted-foreground mt-2 pt-2 border-t border-border">
                      <User size={11} className="mt-0.5 flex-shrink-0" />
                      <span className={lang === 'hi' ? 'font-hindi' : ''}>
                        {p.children_names.join(', ')}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
