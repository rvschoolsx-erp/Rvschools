import { Request } from 'express';

export type UserRole = 'admin' | 'teacher' | 'parent' | 'student';
export type Gender = 'male' | 'female' | 'other';
export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type ExamType = 'unit_test' | 'monthly' | 'quarterly' | 'half_yearly' | 'annual' | 'practical';
export type FeeStatus = 'pending' | 'paid' | 'overdue' | 'waived' | 'partial';
export type NotificationType = 'attendance' | 'homework' | 'fee' | 'exam' | 'announcement' | 'result' | 'general';
export type AdmissionStatus = 'active' | 'inactive' | 'transferred' | 'graduated' | 'suspended';

export interface JwtPayload {
  userId: string;
  role: UserRole;
  email?: string;
  phone?: string;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  errors?: Record<string, string[]>;
}

export interface User {
  id: string;
  email?: string;
  phone?: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatarUrl?: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Student {
  id: string;
  userId: string;
  admissionNumber: string;
  rollNumber?: string;
  sectionId?: string;
  dateOfBirth: Date;
  gender: Gender;
  bloodGroup?: string;
  admissionStatus: AdmissionStatus;
  user?: User;
  section?: Section;
}

export interface Teacher {
  id: string;
  userId: string;
  employeeId: string;
  designation?: string;
  department?: string;
  joiningDate: Date;
  experienceYears: number;
  user?: User;
}

export interface Section {
  id: string;
  classId: string;
  name: string;
  capacity: number;
  roomNumber?: string;
  class?: Class;
}

export interface Class {
  id: string;
  name: string;
  numericLevel: number;
  academicYearId: string;
}

export interface Attendance {
  id: string;
  studentId: string;
  sectionId: string;
  date: Date;
  status: AttendanceStatus;
  markedBy: string;
  remarks?: string;
}

export interface ServiceError extends Error {
  statusCode?: number;
  errors?: Record<string, string[]>;
}
