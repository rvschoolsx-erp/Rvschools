# शहीद राम सिंह विद्यालय — Smart School ERP & Parent Portal

## Overview

A production-ready, full-stack School Management ERP system built for **शहीद राम सिंह विद्यालय**.
Supports 1,000–100,000+ students with role-based access for Admins, Teachers, Parents, and Students.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                        INTERNET / CDN (CloudFront)                   │
└───────────────────────────┬─────────────────────────────────────────┘
                            │
              ┌─────────────▼──────────────┐
              │    API Gateway / Load       │
              │    Balancer (AWS ALB)       │
              └──────┬──────────┬──────────┘
                     │          │
         ┌───────────▼──┐  ┌───▼───────────┐
         │  Next.js 15  │  │  Express.js   │
         │  Frontend    │  │  Backend API  │
         │  (Vercel)    │  │  (AWS ECS)    │
         └──────────────┘  └───┬───────────┘
                               │
              ┌────────────────┼────────────────┐
              │                │                │
     ┌────────▼─────┐  ┌───────▼──────┐  ┌─────▼───────┐
     │  PostgreSQL  │  │    Redis     │  │   AWS S3    │
     │  (RDS)       │  │  (ElastiC.)  │  │  (Storage)  │
     └──────────────┘  └──────────────┘  └─────────────┘
```

---

## Technology Stack

| Layer        | Technology                                          |
|-------------|-----------------------------------------------------|
| Frontend    | Next.js 15, React 19, TypeScript, Tailwind CSS, ShadCN UI |
| State Mgmt  | Zustand, React Query (TanStack)                     |
| Backend     | Node.js, Express.js, TypeScript                     |
| Database    | PostgreSQL 16 (AWS RDS)                             |
| Cache       | Redis 7 (AWS ElastiCache)                           |
| Storage     | AWS S3                                              |
| Auth        | JWT + Refresh Tokens + RBAC                         |
| Notify      | Firebase Push, Twilio SMS, Nodemailer SMTP          |
| DevOps      | Docker, GitHub Actions, AWS ECS/ECR                 |
| Monitoring  | Winston, Morgan, AWS CloudWatch                     |

---

## User Roles & Permissions

| Feature              | Admin | Teacher | Parent | Student |
|----------------------|-------|---------|--------|---------|
| Student Management   | ✅    | 👁️      | ❌     | ❌      |
| Teacher Management   | ✅    | ❌      | ❌     | ❌      |
| Attendance (Enter)   | ✅    | ✅      | ❌     | ❌      |
| Attendance (View)    | ✅    | ✅      | ✅     | ✅      |
| Marks (Enter)        | ✅    | ✅      | ❌     | ❌      |
| Marks (View)         | ✅    | ✅      | ✅     | ✅      |
| Homework (Assign)    | ✅    | ✅      | ❌     | ❌      |
| Homework (View)      | ✅    | ✅      | ✅     | ✅      |
| Fees (Manage)        | ✅    | ❌      | 👁️     | ❌      |
| Reports              | ✅    | ✅      | ✅     | ✅      |
| Analytics            | ✅    | ✅      | 👁️     | ❌      |
| Notifications        | ✅    | ✅      | ✅     | ✅      |

---

## Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/smart-school-erp.git
cd smart-school-erp

# Start all services with Docker
docker-compose up -d

# Backend setup
cd backend
cp .env.example .env
npm install
npm run migrate
npm run seed
npm run dev

# Frontend setup
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

---

## Environment Variables

### Backend `.env`
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://user:password@localhost:5432/school_erp
REDIS_URL=redis://localhost:6379
JWT_SECRET=your-super-secret-jwt-key-min-64-chars
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
AWS_ACCESS_KEY_ID=your-aws-key
AWS_SECRET_ACCESS_KEY=your-aws-secret
AWS_BUCKET_NAME=school-erp-uploads
AWS_REGION=ap-south-1
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=school@example.com
SMTP_PASS=your-smtp-password
TWILIO_SID=your-twilio-sid
TWILIO_TOKEN=your-twilio-token
TWILIO_FROM=+91XXXXXXXXXX
FIREBASE_SERVER_KEY=your-firebase-server-key
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW=15
RATE_LIMIT_MAX=100
```

### Frontend `.env.local`
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_NAME=शहीद राम सिंह विद्यालय
NEXT_PUBLIC_APP_NAME_EN=Shaheed Ram Singh Vidyalaya
```

---

## Development Roadmap

### Phase 1 — Core Foundation (Weeks 1–6)
- [x] Authentication & Authorization (JWT, RBAC)
- [x] Student Management (CRUD, enrollment)
- [x] Teacher Management
- [x] Attendance Module
- [x] Marks/Grades Entry
- [x] Basic Dashboard

### Phase 2 — Academic & Finance (Weeks 7–12)
- [x] Exam Management
- [x] Report Card Generation (PDF)
- [x] Homework Module
- [x] Fees & Transactions
- [x] Notifications (Push, SMS, Email)
- [x] Analytics Dashboards

### Phase 3 — Advanced Features (Weeks 13–20)
- [ ] AI Performance Prediction
- [ ] Face Recognition Attendance
- [ ] Bus GPS Tracking
- [ ] Online Examinations
- [ ] Live Classes (WebRTC)
- [ ] Mobile Apps (React Native)
- [ ] AI Chatbot

---

## Team Requirements

| Role                  | Count | Duration |
|-----------------------|-------|----------|
| Backend Engineer      | 2     | 5 months |
| Frontend Engineer     | 2     | 5 months |
| DevOps Engineer       | 1     | 2 months |
| UI/UX Designer        | 1     | 2 months |
| QA Engineer           | 1     | 3 months |
| Project Manager       | 1     | 5 months |

---

## Cost Estimation (Monthly — Production)

| Service              | Cost (USD/month) |
|----------------------|-----------------|
| AWS RDS PostgreSQL   | ~$50            |
| AWS ECS (Backend)    | ~$80            |
| AWS ElastiCache      | ~$30            |
| AWS S3               | ~$10            |
| Vercel (Frontend)    | ~$20            |
| Twilio SMS           | ~$30            |
| Firebase             | Free tier       |
| **Total**            | **~$220/month** |

---

## License
MIT License — शहीद राम सिंह विद्यालय © 2024
