'use client';
import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Save, Building2, Palette, Phone, Globe, Shield, BadgeCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import { AppLayout } from '@/components/layouts/AdminLayout';
import { apiService } from '@/lib/api';
import { cn } from '@/lib/utils';

const settingsSchema = z.object({
  school_name: z.string().min(2, 'School name required'),
  school_name_hindi: z.string().optional(),
  logo_url: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  primary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  secondary_color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Must be a valid hex color'),
  tagline: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Invalid email').or(z.literal('')).optional(),
  website: z.string().url('Must be a valid URL').or(z.literal('')).optional(),
  affiliation: z.string().optional(),
  established_year: z.number().int().min(1800).max(2025).optional().or(z.nan()).optional(),
});

type SettingsForm = z.infer<typeof settingsSchema>;

const planBadge: Record<string, { label: string; color: string }> = {
  basic:    { label: 'Basic',    color: 'bg-gray-100 text-gray-700' },
  standard: { label: 'Standard', color: 'bg-blue-100 text-blue-700' },
  premium:  { label: 'Premium',  color: 'bg-purple-100 text-purple-700' },
};

export default function AdminSettingsPage() {
  const queryClient = useQueryClient();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['school-settings'],
    queryFn: () => apiService.schoolSettings.get().then(r => r.data.data),
  });

  const { register, handleSubmit, reset, watch, formState: { errors, isDirty } } = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      school_name: '',
      school_name_hindi: '',
      logo_url: '',
      primary_color: '#1d4ed8',
      secondary_color: '#f59e0b',
      tagline: '',
      address: '',
      city: '',
      state: '',
      phone: '',
      email: '',
      website: '',
      affiliation: '',
    },
  });

  useEffect(() => {
    if (settings) {
      reset({
        school_name: settings.school_name || '',
        school_name_hindi: settings.school_name_hindi || '',
        logo_url: settings.logo_url || '',
        primary_color: settings.primary_color || '#1d4ed8',
        secondary_color: settings.secondary_color || '#f59e0b',
        tagline: settings.tagline || '',
        address: settings.address || '',
        city: settings.city || '',
        state: settings.state || '',
        phone: settings.phone || '',
        email: settings.email || '',
        website: settings.website || '',
        affiliation: settings.affiliation || '',
        established_year: settings.established_year || undefined,
      });
    }
  }, [settings, reset]);

  const mutation = useMutation({
    mutationFn: (data: SettingsForm) => apiService.schoolSettings.update(data),
    onSuccess: () => {
      toast.success('Settings saved! Refresh to see branding changes.');
      queryClient.invalidateQueries({ queryKey: ['school-settings'] });
    },
    onError: () => toast.error('Failed to save settings'),
  });

  const primaryColor = watch('primary_color');
  const secondaryColor = watch('secondary_color');
  const logoUrl = watch('logo_url');
  const schoolName = watch('school_name');

  const plan = settings?.plan || 'basic';
  const badge = planBadge[plan] || planBadge.basic;

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-12 bg-muted rounded-xl" />
          ))}
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6 max-w-3xl">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-hindi">विद्यालय सेटिंग्स</h1>
            <p className="text-muted-foreground text-sm mt-1">Customize your school's branding and information</p>
          </div>
          <div className={cn('flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold', badge.color)}>
            <BadgeCheck size={14} />
            {badge.label} Plan
          </div>
        </div>

        <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="space-y-6">

          {/* Preview Card */}
          <div className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-muted-foreground mb-4 flex items-center gap-2">
              <Palette size={14} /> Live Preview
            </h3>
            <div className="flex items-center gap-4 p-4 rounded-xl" style={{ background: primaryColor }}>
              {logoUrl ? (
                <img src={logoUrl} alt="Logo" className="w-12 h-12 rounded-xl object-cover" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg" style={{ background: secondaryColor, color: primaryColor }}>
                  {schoolName?.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('') || 'SC'}
                </div>
              )}
              <div>
                <p className="font-bold text-white">{schoolName || 'Your School Name'}</p>
                <p className="text-xs opacity-70 text-white">School Management Portal</p>
              </div>
            </div>
          </div>

          {/* School Info */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <Building2 size={16} /> School Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">School Name (English) *</label>
                <input {...register('school_name')} className="input-field w-full" placeholder="e.g. Delhi Public School" />
                {errors.school_name && <p className="text-red-500 text-xs mt-1">{errors.school_name.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 font-hindi">स्कूल का नाम (हिंदी)</label>
                <input {...register('school_name_hindi')} className="input-field w-full" placeholder="दिल्ली पब्लिक स्कूल" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Tagline / Motto</label>
                <input {...register('tagline')} className="input-field w-full" placeholder="e.g. Excellence in Education" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Affiliation</label>
                <input {...register('affiliation')} className="input-field w-full" placeholder="CBSE / UP Board / ICSE" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Established Year</label>
                <input {...register('established_year', { valueAsNumber: true })} type="number" min="1800" max="2025" className="input-field w-full" placeholder="1985" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Address</label>
                <input {...register('address')} className="input-field w-full" placeholder="123, Main Road" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">City</label>
                <input {...register('city')} className="input-field w-full" placeholder="Lucknow" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">State</label>
                <input {...register('state')} className="input-field w-full" placeholder="Uttar Pradesh" />
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <Phone size={16} /> Contact Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Phone</label>
                <input {...register('phone')} className="input-field w-full" placeholder="+91 98765 43210" />
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Email</label>
                <input {...register('email')} type="email" className="input-field w-full" placeholder="info@school.com" />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Website</label>
                <input {...register('website')} className="input-field w-full" placeholder="https://school.com" />
                {errors.website && <p className="text-red-500 text-xs mt-1">{errors.website.message}</p>}
              </div>
            </div>
          </div>

          {/* Branding */}
          <div className="bg-card border border-border rounded-2xl p-6 space-y-5">
            <h3 className="font-semibold flex items-center gap-2 text-foreground">
              <Palette size={16} /> Branding & White-Label
              {plan !== 'premium' && (
                <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Premium Only</span>
              )}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Logo URL</label>
                <input
                  {...register('logo_url')}
                  className={cn('input-field w-full', plan !== 'premium' && 'opacity-50 cursor-not-allowed')}
                  placeholder="https://cdn.school.com/logo.png"
                  disabled={plan !== 'premium'}
                />
                {errors.logo_url && <p className="text-red-500 text-xs mt-1">{errors.logo_url.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Primary Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={primaryColor || '#1d4ed8'}
                    className={cn('w-10 h-10 rounded-lg border border-border cursor-pointer p-1', plan !== 'premium' && 'opacity-50 cursor-not-allowed')}
                    disabled={plan !== 'premium'}
                    readOnly
                  />
                  <input {...register('primary_color')} className={cn('input-field flex-1 font-mono', plan !== 'premium' && 'opacity-50')} disabled={plan !== 'premium'} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5">Secondary / Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={secondaryColor || '#f59e0b'}
                    className={cn('w-10 h-10 rounded-lg border border-border cursor-pointer p-1', plan !== 'premium' && 'opacity-50 cursor-not-allowed')}
                    disabled={plan !== 'premium'}
                    readOnly
                  />
                  <input {...register('secondary_color')} className={cn('input-field flex-1 font-mono', plan !== 'premium' && 'opacity-50')} disabled={plan !== 'premium'} />
                </div>
              </div>
            </div>
            {plan !== 'premium' && (
              <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-xl p-4 flex items-start gap-3">
                <Shield size={16} className="text-purple-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-purple-800 dark:text-purple-300">White-Label requires Premium Plan</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400 mt-1">Upgrade to Premium to set custom logo, colors, and domain. Your clients see only your brand.</p>
                </div>
                <a href="/pricing" target="_blank" className="ml-auto text-xs bg-purple-600 text-white px-3 py-1.5 rounded-lg hover:bg-purple-500 transition-colors whitespace-nowrap flex-shrink-0">
                  Upgrade →
                </a>
              </div>
            )}
          </div>

          {/* Subscription Info */}
          <div className="bg-card border border-border rounded-2xl p-6">
            <h3 className="font-semibold flex items-center gap-2 text-foreground mb-4">
              <BadgeCheck size={16} /> Subscription
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground text-xs mb-1">Current Plan</p>
                <span className={cn('font-bold capitalize px-2 py-1 rounded-lg text-sm', badge.color)}>{plan}</span>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Expires On</p>
                <p className="font-medium">{settings?.plan_expiry ? new Date(settings.plan_expiry).toLocaleDateString('en-IN') : 'N/A'}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs mb-1">Renew</p>
                <a href="/pricing" target="_blank" className="text-blue-600 hover:underline text-xs font-medium">View Plans →</a>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={mutation.isPending || !isDirty}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              {mutation.isPending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Save size={16} />}
              Save Settings
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
