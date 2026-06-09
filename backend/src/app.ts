import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { httpLogger } from './middleware/logger.middleware';
import { globalRateLimit } from './middleware/rateLimit.middleware';
import { globalErrorHandler, notFoundHandler } from './middleware/error.middleware';

// Route imports
import authRoutes from './modules/auth/auth.routes';
import studentRoutes from './modules/students/student.routes';
import attendanceRoutes from './modules/attendance/attendance.routes';
import marksRoutes from './modules/marks/marks.routes';
import feesRoutes from './modules/fees/fees.routes';
import notificationRoutes from './modules/notifications/notification.routes';
import analyticsRoutes from './modules/analytics/analytics.routes';
import teacherRoutes from './modules/teachers/teacher.routes';
import homeworkRoutes from './modules/homework/homework.routes';
import examRoutes from './modules/exams/exam.routes';
import reportRoutes from './modules/reports/report.routes';

const app = express();

// Security
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: env.NODE_ENV === 'production',
}));

// CORS
app.use(cors({
  origin: [env.FRONTEND_URL, 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
app.use(globalRateLimit);

// Logging
app.use(httpLogger);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(compression());

// Trust proxy for rate limiting behind load balancer
app.set('trust proxy', 1);

// Health check
app.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'शहीद राम सिंह विद्यालय ERP API',
    version: '1.0.0',
  });
});

// API Routes
const API = '/api/v1';
app.use(`${API}/auth`,           authRoutes);
app.use(`${API}/students`,       studentRoutes);
app.use(`${API}/teachers`,       teacherRoutes);
app.use(`${API}/attendance`,     attendanceRoutes);
app.use(`${API}/marks`,          marksRoutes);
app.use(`${API}/fees`,           feesRoutes);
app.use(`${API}/homework`,       homeworkRoutes);
app.use(`${API}/exams`,          examRoutes);
app.use(`${API}/notifications`,  notificationRoutes);
app.use(`${API}/analytics`,      analyticsRoutes);
app.use(`${API}/reports`,        reportRoutes);

// 404 & Error handlers
app.use(notFoundHandler);
app.use(globalErrorHandler);

export default app;
