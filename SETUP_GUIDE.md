# How to Run — शहीद राम सिंह विद्यालय ERP

## ✅ Your System
- Node.js v22 ✅
- npm 10 ✅
- No Docker / PostgreSQL → Use free cloud services (5 min setup)

---

## STEP 1 — Free PostgreSQL Database (Supabase)

1. Go to **https://supabase.com** → Sign up free
2. Click **"New Project"** → Name it `school-erp` → Set a password → Click Create
3. Wait ~2 minutes for it to provision
4. Go to **Settings → Database → Connection string**
5. Select **"URI"** tab → Copy the connection string
   - It looks like: `postgresql://postgres:[PASSWORD]@db.xxxxx.supabase.co:5432/postgres`
6. Open `backend\.env` and replace the `DATABASE_URL` line with your string

Then run your schema:
7. In Supabase → go to **SQL Editor**
8. Paste the content of `database\schema.sql` → Click Run
9. Paste the content of `database\seed.sql` → Click Run

---

## STEP 2 — Free Redis Cache (Upstash) [OPTIONAL]

> The app works without Redis — caching is disabled but everything still functions.

1. Go to **https://upstash.com** → Sign up free
2. Click **"Create Database"** → Region: `ap-southeast-1` → Click Create
3. Click your database → Copy the **"Redis URL"** (starts with `redis://:...`)
4. Paste it in `backend\.env` as the `REDIS_URL` value

---

## STEP 3 — Install & Run

### Option A: Double-click START.bat (easiest)
```
Double-click:  E:\persnoal\smart-school-erp\START.bat
```
This opens two terminal windows (backend + frontend) and your browser.

### Option B: Manual (two terminals)

**Terminal 1 — Backend:**
```powershell
cd E:\persnoal\smart-school-erp\backend
npm run dev
```
You should see:
```
✅ PostgreSQL connected
🚀 Server running on port 5000
```

**Terminal 2 — Frontend:**
```powershell
cd E:\persnoal\smart-school-erp\frontend
npm run dev
```
You should see:
```
▲ Next.js 15.0.3
✓ Ready on http://localhost:3000
```

---

## STEP 4 — Open in Browser

Open: **http://localhost:3000**

### Login Credentials
| Role      | Email/Phone                   | Password    |
|-----------|-------------------------------|-------------|
| Admin     | admin@srsv.edu.in             | admin123    |
| Teacher   | ram.sharma@srsv.edu.in        | teacher123  |
| Parent    | 9876543230                    | teacher123  |
| Student   | rahul.sharma@srsv.edu.in     | teacher123  |

---

## Routes

| URL                     | Page                    |
|-------------------------|-------------------------|
| /                       | Public Homepage (Hindi) |
| /login                  | Login page              |
| /admin/dashboard        | Admin Dashboard         |
| /admin/students         | Student Management      |
| /admin/attendance       | Mark Attendance         |
| /admin/fees             | Fee Management          |
| /admin/analytics        | Analytics & Charts      |
| /teacher/marks          | Enter Marks             |
| /parent/dashboard       | Parent Portal           |
| /student/dashboard      | Student Dashboard       |

---

## Backend API

| URL                          | Description       |
|------------------------------|-------------------|
| http://localhost:5000/health | Health check      |
| http://localhost:5000/api/v1/auth/login | Login |
| http://localhost:5000/api/v1/students   | Students |
| http://localhost:5000/api/v1/attendance | Attendance |

---

## Common Issues

**"Cannot connect to database"**
→ Check `DATABASE_URL` in `backend\.env`

**"Module not found"**
→ Run `npm install` again in that folder

**Port 5000 or 3000 already in use**
→ Change `PORT=5001` in `backend\.env`
→ Run frontend with: `npx next dev -p 3001`
