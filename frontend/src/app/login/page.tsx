'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { useBrand } from '@/contexts/BrandContext';
import { Eye, EyeOff, LogIn } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(3, 'Email or phone number required'),
  password:   z.string().min(1, 'Password required'),
});

type LoginForm = z.infer<typeof loginSchema>;

const demoAccounts = [
  { role: 'admin',   label: 'Admin',   identifier: 'admin@school.com',   password: 'admin123' },
  { role: 'teacher', label: 'Teacher', identifier: 'teacher@school.com', password: 'teacher123' },
  { role: 'parent',  label: 'Parent',  identifier: '9876543210',         password: 'parent123' },
  { role: 'student', label: 'Student', identifier: 'student@school.com', password: 'student123' },
];

const roleRedirects: Record<string, string> = {
  admin:   '/admin/dashboard',
  teacher: '/teacher/attendance',
  parent:  '/parent/dashboard',
  student: '/student/dashboard',
};

const roleIcons: Record<string, string> = {
  admin: '🛡️', teacher: '👨‍🏫', parent: '👨‍👩‍👧', student: '🎓',
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const brand = useBrand();
  const router = useRouter();

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.identifier, data.password);
      const user = useAuthStore.getState().user;
      toast.success(`Welcome, ${user?.firstName}!`);
      router.push(roleRedirects[user?.role ?? 'student']);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } }; message?: string })?.response?.data?.message
        || (err as { message?: string })?.message
        || 'Unknown error';
      alert('LOGIN ERROR: ' + msg);
      toast.error(msg || 'Login failed. Please try again.');
    }
  };

  const initials = brand.schoolName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase())
    .join('');

  return (
    <div className="min-h-screen flex">
      {/* Left — School Branding */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-[#0f2140] via-[#1a3c6e] to-[#1d4ed8] text-white flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-yellow-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-blue-400 blur-3xl" />
        </div>
        <div className="relative z-10 text-center max-w-sm">
          {brand.logoUrl ? (
            <img src={brand.logoUrl} alt={brand.schoolName} className="w-24 h-24 rounded-full object-cover mx-auto mb-6 shadow-xl" />
          ) : (
            <div className="w-24 h-24 rounded-full bg-yellow-400 flex items-center justify-center text-blue-900 font-bold text-3xl mx-auto mb-6 shadow-xl">
              {initials || 'SC'}
            </div>
          )}
          <h1 className="text-3xl font-bold mb-2">{brand.schoolName}</h1>
          {brand.schoolNameHindi && brand.schoolNameHindi !== 'मेरा विद्यालय' && (
            <p className="text-blue-200 text-lg mb-2" style={{ fontFamily: 'Noto Sans Devanagari, sans-serif' }}>
              {brand.schoolNameHindi}
            </p>
          )}
          <p className="text-blue-300 mb-8 text-sm leading-relaxed">{brand.tagline}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            {[
              { icon: '👨‍🎓', label: 'Students' },
              { icon: '👨‍🏫', label: 'Teachers' },
              { icon: '📊', label: 'Analytics' },
              { icon: '💰', label: 'Fee Portal' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-blue-200 text-xs">{item.label}</p>
              </div>
            ))}
          </div>

          {!brand.whiteLabelEnabled && (
            <p className="text-blue-400/60 text-xs mt-8">Powered by SchoolConnect</p>
          )}
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-14 h-14 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
              {initials || 'SC'}
            </div>
            <h2 className="text-lg font-bold text-gray-900">{brand.schoolName}</h2>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Sign In to Portal</h2>
              <p className="text-gray-500 text-sm mt-1">Enter your email or phone number</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Email / Phone Number
                </label>
                <input
                  {...register('identifier')}
                  type="text"
                  placeholder="email@school.com or 9876543210"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  autoComplete="username"
                />
                {errors.identifier && (
                  <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                  <Link href="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot password?</Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-300 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading
                  ? <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <LogIn size={18} />
                }
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6">
              <p className="text-xs text-center text-gray-400 mb-3">Demo accounts (development only)</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map(demo => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => {
                      setValue('identifier', demo.identifier);
                      setValue('password', demo.password);
                    }}
                    className="text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 transition-colors text-left"
                  >
                    <span className="font-medium">{roleIcons[demo.role]} {demo.label}</span>
                    <span className="block opacity-50 truncate text-[11px]">{demo.identifier}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link href="/" className="hover:text-gray-600">← Back to SchoolConnect</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
