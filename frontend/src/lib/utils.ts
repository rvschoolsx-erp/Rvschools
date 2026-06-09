import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
  }).format(Number(amount));
}

export function formatDate(date: string | Date, locale = 'hi-IN'): string {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(new Date(date));
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase();
}

export function getGradeColor(grade: string): string {
  const map: Record<string, string> = {
    'A+': 'text-green-600 bg-green-50',
    'A':  'text-green-600 bg-green-50',
    'B+': 'text-blue-600 bg-blue-50',
    'B':  'text-blue-600 bg-blue-50',
    'C+': 'text-yellow-600 bg-yellow-50',
    'C':  'text-yellow-600 bg-yellow-50',
    'D':  'text-orange-600 bg-orange-50',
    'F':  'text-red-600 bg-red-50',
  };
  return map[grade] ?? 'text-gray-600 bg-gray-50';
}

export function getAttendanceColor(percentage: number): string {
  if (percentage >= 90) return 'text-green-600';
  if (percentage >= 75) return 'text-yellow-600';
  return 'text-red-600';
}

export function truncate(str: string, length: number): string {
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function getAcademicYear(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  return month >= 4 ? `${year}-${(year + 1).toString().slice(2)}` : `${year - 1}-${year.toString().slice(2)}`;
}
