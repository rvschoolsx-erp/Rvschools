'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store/authStore';
import { Eye, EyeOff, LogIn, BookOpen } from 'lucide-react';

const loginSchema = z.object({
  identifier: z.string().min(3, 'ईमेल या फोन नंबर दर्ज करें'),
  password:   z.string().min(1, 'पासवर्ड दर्ज करें'),
});

type LoginForm = z.infer<typeof loginSchema>;

const demoAccounts = [
  { role: 'admin',   label: 'Admin',    identifier: 'admin@school.com',   password: 'admin123' },
  { role: 'teacher', label: 'Teacher',  identifier: 'teacher@school.com', password: 'teacher123' },
  { role: 'parent',  label: 'Parent',   identifier: '9876543210',         password: 'parent123' },
  { role: 'student', label: 'Student',  identifier: 'student@school.com', password: 'student123' },
];

const roleRedirects: Record<string, string> = {
  admin:   '/admin/dashboard',
  teacher: '/teacher/attendance',
  parent:  '/parent/dashboard',
  student: '/student/dashboard',
};

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuthStore();
  const router = useRouter();

  const {
    register, handleSubmit, setValue,
    formState: { errors },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data.identifier, data.password);
      const user = useAuthStore.getState().user;
      toast.success(`स्वागत है, ${user?.firstName}!`);
      router.push(roleRedirects[user?.role ?? 'student']);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message;
      toast.error(msg || 'लॉगिन विफल। कृपया पुनः प्रयास करें।');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-brand-900 via-brand-800 to-brand-700 text-white flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-gold-400 blur-3xl" />
          <div className="absolute bottom-20 right-20 w-72 h-72 rounded-full bg-blue-400 blur-3xl" />
        </div>

        <div className="relative z-10 text-center max-w-md">
          <div className="w-24 h-24 rounded-full bg-gold-400 flex items-center justify-center text-brand-900 font-bold text-4xl mx-auto mb-8 shadow-xl">
            श
          </div>
          <h1 className="text-4xl font-bold mb-2 font-hindi">शहीद राम सिंह विद्यालय</h1>
          <p className="text-brand-200 text-xl mb-8">Shaheed Ram Singh Vidyalaya</p>
          <p className="text-brand-300 leading-relaxed mb-10">
            ज्ञान, संस्कार और उत्कृष्टता का केंद्र। डिजिटल युग में शिक्षा की नई परिभाषा।
          </p>

          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { icon: '👨‍🎓', label: '5000+ छात्र' },
              { icon: '👨‍🏫', label: '200+ शिक्षक' },
              { icon: '🏆', label: '30+ वर्ष' },
              { icon: '📊', label: '98% परिणाम' },
            ].map(item => (
              <div key={item.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-2xl mb-1">{item.icon}</div>
                <p className="text-brand-200 text-xs font-hindi">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right — Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gray-50 dark:bg-gray-950">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="w-16 h-16 rounded-full bg-brand-800 flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
              श
            </div>
            <h2 className="text-xl font-bold text-brand-800 font-hindi">शहीद राम सिंह विद्यालय</h2>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">पोर्टल में लॉगिन</h2>
              <p className="text-gray-500 text-sm mt-1">अपना ईमेल या फोन नंबर दर्ज करें</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  ईमेल / फोन नंबर
                </label>
                <input
                  {...register('identifier')}
                  type="text"
                  placeholder="email@example.com या 9876543210"
                  className="w-full px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                  autoComplete="username"
                />
                {errors.identifier && (
                  <p className="text-red-500 text-xs mt-1">{errors.identifier.message}</p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    पासवर्ड
                  </label>
                  <Link href="/forgot-password" className="text-xs text-brand-600 hover:underline">
                    पासवर्ड भूल गए?
                  </Link>
                </div>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
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
                className="w-full bg-brand-800 hover:bg-brand-700 disabled:bg-brand-400 text-white font-semibold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogIn size={18} />
                )}
                {isLoading ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}
              </button>
            </form>

            {/* Demo Accounts */}
            <div className="mt-6">
              <p className="text-xs text-center text-gray-400 mb-3">डेमो खाते</p>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((demo) => (
                  <button
                    key={demo.role}
                    type="button"
                    onClick={() => {
                      setValue('identifier', demo.identifier);
                      setValue('password', demo.password);
                    }}
                    className="text-xs bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-300 transition-colors text-left"
                  >
                    <span className="font-medium">{demo.label}</span>
                    <span className="block opacity-60 truncate">{demo.identifier}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <p className="text-center text-xs text-gray-400 mt-6">
            <Link href="/" className="hover:text-gray-600">← मुख्य पृष्ठ पर वापस जाएं</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
