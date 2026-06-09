'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { useAuthStore } from '@/store/authStore';
import { useBrand } from '@/contexts/BrandContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  LayoutDashboard, Users, GraduationCap, UserCheck, BookOpen,
  ClipboardList, CreditCard, BarChart2, Bell, Settings,
  LogOut, Menu, Sun, Moon, ChevronDown, BookMarked,
  Award, FileText, Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const adminNav = [
  { hi: 'डैशबोर्ड',    en: 'Dashboard',    href: '/admin/dashboard',      icon: LayoutDashboard },
  { hi: 'छात्र',        en: 'Students',      href: '/admin/students',       icon: GraduationCap },
  { hi: 'शिक्षक',      en: 'Teachers',      href: '/admin/teachers',       icon: Users },
  { hi: 'अभिभावक',    en: 'Parents',       href: '/admin/parents',        icon: UserCheck },
  { hi: 'उपस्थिति',   en: 'Attendance',    href: '/admin/attendance',     icon: ClipboardList },
  { hi: 'परीक्षा',      en: 'Exams',         href: '/admin/exams',          icon: BookMarked },
  { hi: 'फीस',          en: 'Fees',          href: '/admin/fees',           icon: CreditCard },
  { hi: 'रिपोर्ट',      en: 'Reports',       href: '/admin/reports',        icon: FileText },
  { hi: 'एनालिटिक्स',  en: 'Analytics',     href: '/admin/analytics',      icon: BarChart2 },
  { hi: 'सूचनाएं',     en: 'Notifications', href: '/admin/notifications',  icon: Bell },
  { hi: 'सेटिंग्स',    en: 'Settings',      href: '/admin/settings',       icon: Settings },
];

const teacherNav = [
  { hi: 'उपस्थिति',   en: 'Attendance',  href: '/teacher/attendance', icon: ClipboardList },
  { hi: 'अंक',         en: 'Marks',       href: '/teacher/marks',      icon: Award },
  { hi: 'गृहकार्य',   en: 'Homework',    href: '/teacher/homework',   icon: BookOpen },
  { hi: 'परीक्षा',     en: 'Exams',       href: '/teacher/exams',      icon: BookMarked },
];

const parentNav = [
  { hi: 'डैशबोर्ड',   en: 'Dashboard',     href: '/parent/dashboard',     icon: LayoutDashboard },
  { hi: 'उपस्थिति',   en: 'Attendance',    href: '/parent/attendance',    icon: ClipboardList },
  { hi: 'फीस',         en: 'Fees',          href: '/parent/fees',          icon: CreditCard },
  { hi: 'सूचनाएं',    en: 'Notifications', href: '/parent/notifications', icon: Bell },
];

const studentNav = [
  { hi: 'डैशबोर्ड',  en: 'Dashboard',     href: '/student/dashboard',    icon: LayoutDashboard },
  { hi: 'उपस्थिति',  en: 'Attendance',    href: '/student/attendance',   icon: ClipboardList },
  { hi: 'अंक',        en: 'Marks',         href: '/student/marks',        icon: Award },
  { hi: 'गृहकार्य',  en: 'Homework',      href: '/student/homework',     icon: BookOpen },
  { hi: 'टाइमटेबल',  en: 'Timetable',     href: '/student/timetable',    icon: BookMarked },
];

const navByRole: Record<string, typeof adminNav> = {
  admin:   adminNav,
  teacher: teacherNav,
  parent:  parentNav,
  student: studentNav,
};

export function AppLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useTheme();
  const brand = useBrand();
  const { lang, toggleLang, t } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const initials = brand.schoolName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase()).join('');
  const nav = navByRole[user?.role ?? 'student'] ?? studentNav;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  const Sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-brand-700">
        {brand.logoUrl ? (
          <img src={brand.logoUrl} alt={brand.schoolName} className="w-10 h-10 rounded-xl object-cover flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-gold-400 flex items-center justify-center text-brand-900 font-bold text-base flex-shrink-0">
            {initials || 'SC'}
          </div>
        )}
        {sidebarOpen && (
          <div className="overflow-hidden">
            <p className="font-bold text-sm text-white leading-tight truncate max-w-[150px]">
              {brand.schoolName}
            </p>
            {!brand.whiteLabelEnabled && (
              <p className="text-xs text-brand-400 truncate">SchoolConnect</p>
            )}
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                isActive
                  ? 'bg-gold-500/20 text-gold-300 border border-gold-500/30'
                  : 'text-brand-300 hover:text-white hover:bg-brand-700',
              )}
              title={!sidebarOpen ? t(item.hi, item.en) : undefined}
            >
              <Icon size={18} className="flex-shrink-0" />
              {sidebarOpen && (
                <span className={lang === 'hi' ? 'font-hindi' : ''}>
                  {t(item.hi, item.en)}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-brand-700 p-3">
        <div className={cn('flex items-center gap-3 px-2 py-2 rounded-lg', sidebarOpen && 'mb-2')}>
          <div className="w-8 h-8 rounded-full bg-gold-400 flex items-center justify-center text-brand-900 font-bold text-sm flex-shrink-0">
            {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
          </div>
          {sidebarOpen && (
            <div className="overflow-hidden flex-1">
              <p className="text-sm font-medium text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-brand-400 capitalize">{user?.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-brand-300 hover:text-red-400 hover:bg-red-500/10 transition-all"
          title={!sidebarOpen ? t('लॉगआउट', 'Logout') : undefined}
        >
          <LogOut size={16} />
          {sidebarOpen && <span>{t('लॉगआउट', 'Logout')}</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-950">
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:flex flex-col bg-brand-900 transition-all duration-300 flex-shrink-0',
          sidebarOpen ? 'w-64' : 'w-16'
        )}
      >
        {Sidebar}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-brand-900 z-10 flex flex-col">
            {Sidebar}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 flex-shrink-0 shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu size={20} />
            </button>
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="hidden sm:flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-200">
                <Home size={14} />
              </Link>
              <ChevronDown size={14} className="-rotate-90" />
              <span className="capitalize font-medium text-gray-800 dark:text-gray-200">
                {user?.role === 'admin'   ? t('एडमिन पैनल', 'Admin Panel') :
                 user?.role === 'teacher' ? t('शिक्षक पैनल', 'Teacher Panel') :
                 user?.role === 'parent'  ? t('अभिभावक पोर्टल', 'Parent Portal') :
                                           t('छात्र पोर्टल', 'Student Portal')}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Toggle */}
            {mounted && (
              <button
                onClick={toggleLang}
                className="px-2.5 py-1.5 rounded-lg text-xs font-semibold border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors min-w-[40px] text-center"
                title={lang === 'en' ? 'Switch to Hindi' : 'Switch to English'}
              >
                {lang === 'en' ? 'हि' : 'EN'}
              </button>
            )}

            {/* Theme Toggle */}
            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            <Link href={`/${user?.role}/notifications`} className="relative p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
              <Bell size={18} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>

            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-white font-bold text-sm">
                {user?.firstName?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-tight">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
