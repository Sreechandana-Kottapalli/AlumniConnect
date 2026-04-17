# AlumniConnect — Project Context for Claude Code Sessions

> **Read this first in every new session.**
> This file tracks the full state of the project so any Claude session can continue without re-explaining history.

---

## Project Overview

**NCPL Alumni Connect** — A web platform where NCPL training institute trainees can search for alumni, send referral/reference requests, and schedule meetings with them.

- **Frontend**: React 18 (Create React App, Tailwind CSS, React Router v6)
- **Backend**: Node.js + Express (Supabase/PostgreSQL, JWT auth, Nodemailer)
- **Database + Storage**: Supabase (PostgreSQL for data, Storage bucket for resume PDFs)
- **Deployment**: Vercel (frontend static + backend as serverless function via `api/index.js`)
- **Active Branch**: `claude/add-alumni-search-feature-FVXZI`
- **GitHub Repo**: `sreechandana-kottapalli/alumniconnect`

---

## Repository Structure

```
AlumniConnect/
├── api/
│   └── index.js                  # Vercel serverless entry point (re-exports backend/server.js)
├── vercel.json                   # Vercel deployment config
├── backend/
│   ├── server.js                 # Express app entry point
│   ├── seed.js                   # DB seeder (run: npm run seed)
│   ├── update-alumni-emails.js   # One-time script: set all alumni emails
│   ├── setup.js                  # Env/DB validation check script
│   ├── .env.example              # Template for environment variables
│   ├── config/
│   │   └── supabase.js           # Lazy-init Supabase client (Proxy pattern)
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── alumniController.js
│   │   ├── referralController.js
│   │   └── scheduleController.js # NEW: public scheduling endpoints
│   ├── models/
│   │   ├── User.js               # Supabase users table
│   │   ├── Alumni.js             # Supabase alumni table
│   │   └── ReferralRequest.js    # Supabase referral_requests table
│   ├── routes/
│   │   ├── auth.js
│   │   ├── alumni.js
│   │   ├── referral.js
│   │   ├── schedule.js           # NEW: /api/schedule/:requestId (public, no auth)
│   │   └── upload.js
│   ├── services/
│   │   ├── emailService.js       # Nodemailer (Gmail SMTP)
│   │   └── storageService.js     # Supabase Storage (resume uploads)
│   ├── templates/
│   │   └── emailTemplates.js     # 7 HTML email templates
│   └── middleware/
│       ├── auth.js               # JWT protect middleware
│       ├── errorHandler.js
│       ├── rateLimiter.js
│       └── upload.js             # Multer (resume PDF)
└── frontend/
    └── src/
        ├── App.js                # React Router setup
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── SearchPage.jsx        # Candidate searches alumni
        │   ├── AlumniProfilePage.jsx # Alumni profile with "Mail Request" button
        │   ├── RequestForm.jsx       # Submit referral/reference request
        │   ├── ReferralDashboard.jsx # Candidate's request history
        │   ├── AlumniRequestPanel.jsx# Alumni manages incoming requests
        │   └── SchedulePage.jsx      # NEW: public scheduling page (no login)
        ├── components/
        │   ├── Navbar.jsx
        │   ├── AlumniCard.jsx
        │   ├── RequestCard.jsx       # CandidateRequestCard + AlumniRequestCard
        │   ├── FilterPanel.jsx
        │   ├── Pagination.jsx
        │   ├── StatusTracker.jsx
        │   └── LoadingSpinner.jsx
        ├── services/
        │   ├── api.js                # Axios base + authAPI + alumniAPI
        │   └── referralAPI.js        # All referral + scheduling API calls
        ├── context/
        │   └── AuthContext.js        # JWT auth state
        └── hooks/
            └── useAlumniSearch.js
```

---

## Supabase Database Schema

### Table: `users`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| name | TEXT | |
| email | TEXT UNIQUE | |
| password | TEXT | bcrypt hashed |
| role | TEXT | `trainee` or `alumni` |
| batch | TEXT | |
| domain | TEXT | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### Table: `alumni`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| full_name | TEXT | |
| email | TEXT | All set to `sreechandanamakkapati@gmail.com` |
| company | TEXT | |
| job_role | TEXT | |
| technologies | TEXT[] | Array of tech stacks |
| years_of_experience | INTEGER | |
| linkedin_profile | TEXT | |
| availability_status | TEXT | `available`, `busy`, `not_available` |
| profile_photo | TEXT | |
| batch | TEXT | |
| location | TEXT | |
| domain | TEXT | |
| bio | TEXT | |
| avatar_initials | TEXT | |
| avatar_color | TEXT | hex colour |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### Table: `referral_requests`
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| candidate_id | UUID FK → users | |
| alumni_id | UUID FK → alumni | |
| request_type | TEXT | `referral` or `reference` |
| target_job_role | TEXT | |
| target_company | TEXT | |
| job_description_url | TEXT | optional |
| resume_url | TEXT | Supabase Storage public URL |
| resume_path | TEXT | Supabase Storage path |
| linkedin_url | TEXT | optional |
| portfolio_url | TEXT | optional |
| personal_message | TEXT | |
| status | TEXT | `pending`, `accepted`, `rejected`, `in_progress`, `completed` |
| alumni_response | TEXT | alumni's reply text |
| additional_info_request | TEXT | |
| status_history | JSONB | array of `{status, note, changed_at}` |
| alumni_availability | JSONB | `{date, time, notes, set_at}` — **requires migration below** |
| completed_at | TIMESTAMPTZ | |
| created_at | TIMESTAMPTZ | |
| updated_at | TIMESTAMPTZ | |

### Storage Bucket
- Bucket name: `resumes` (auto-created on first upload if missing)
- Public read access required

---

## ⚠️ PENDING DATABASE MIGRATION

**Run this SQL in Supabase Dashboard → SQL Editor before deploying:**

```sql
ALTER TABLE referral_requests
  ADD COLUMN IF NOT EXISTS alumni_availability JSONB;
```

This is required for the alumni scheduling feature to work.

---

## Vercel Environment Variables (Required)

Set all of these in **Vercel → Project → Settings → Environment Variables**:

| Variable | Value | Status |
|----------|-------|--------|
| `SUPABASE_URL` | `https://your-project.supabase.co` | Must be set |
| `SUPABASE_SERVICE_ROLE_KEY` | service role key from Supabase | Must be set |
| `JWT_SECRET` | any long random string | Must be set |
| `EMAIL_USER` | your Gmail address | **MUST SET — emails broken without this** |
| `EMAIL_PASS` | Gmail App Password (NOT regular password) | **MUST SET — emails broken without this** |
| `EMAIL_FROM` | `NCPL Alumni Connect <your@gmail.com>` | Must be set |
| `FRONTEND_URL` | `https://your-vercel-deployment.vercel.app` | Must be set |
| `SUPABASE_STORAGE_BUCKET` | `resumes` | Must be set |
| `NODE_ENV` | `production` | Already set in vercel.json |

**To generate Gmail App Password:**
1. Google Account → Security → 2-Step Verification (must be ON)
2. App passwords → create one named "AlumniConnect"
3. Use the 16-char code as `EMAIL_PASS`

---

## Vercel Deployment Config (`vercel.json`)

```json
{
  "version": 2,
  "buildCommand": "npm --prefix frontend install && npm --prefix frontend run build && npm --prefix backend install",
  "outputDirectory": "frontend/build",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)",     "destination": "/index.html" }
  ],
  "env": { "NODE_ENV": "production" },
  "regions": ["bom1"]
}
```

**Critical rules — never break these:**
- `api/index.js` MUST exist and re-export the Express app
- The `functions` key must NOT be used (causes build error: "pattern doesn't match any Serverless Functions inside the api directory")
- `rewrites` must use `/api/index` (not `/backend/server.js`)

---

## API Routes

### Auth (public)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user (requires token) |

### Alumni (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/alumni/search` | Search with filters |
| GET | `/api/alumni/:id` | Get alumni profile |
| GET | `/api/alumni/filters/options` | Dropdown options |

### Referrals (requires JWT)
| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/referrals` | Submit new request |
| GET | `/api/referrals/my` | Candidate: their requests |
| GET | `/api/referrals/incoming` | Alumni: requests addressed to them |
| GET | `/api/referrals/stats` | Dashboard statistics |
| GET | `/api/referrals/:id` | Single request detail |
| PUT | `/api/referrals/:id/status` | Alumni: update status |
| DELETE | `/api/referrals/:id` | Candidate: cancel pending request |
| GET | `/api/referrals/admin/all` | Admin: all requests |

### Schedule (PUBLIC — no auth required)
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/schedule/:requestId` | Get scheduling form info |
| POST | `/api/schedule/:requestId` | Submit availability (date + time + notes) |

### Debug / Health
| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check, shows `emailConfigured` status |
| POST | `/api/debug/send-test-email` | Test SMTP config (requires JWT) |

---

## Email System

**Service**: Nodemailer via Gmail SMTP  
**All alumni emails**: `sreechandanamakkapati@gmail.com`  
**Demo trainee**: `deepika@ncpl.in` / `demo1234`

### 7 Email Templates (`backend/templates/emailTemplates.js`)

| # | Template | Sent To | Trigger |
|---|----------|---------|---------|
| 1 | `newRequestToAlumni` | Alumni | New referral/reference request submitted |
| 2 | `acceptanceToCandidate` | Candidate | Alumni accepts request |
| 3 | `rejectionToCandidate` | Candidate | Alumni declines request |
| 4 | `additionalInfoToCandidate` | Candidate | Alumni requests more info |
| 5 | `completionToCandidate` | Candidate | Alumni marks request complete |
| 6 | `submissionConfirmationToCandidate` | Candidate | Confirmation on submission |
| 7 | `availabilityNotificationToCandidate` | Candidate | Alumni sets meeting availability |

Template 1 now includes a **"📅 Set My Availability"** button that links to the public scheduling page.

### Email Validation
`emailService.js` calls `validateEmailConfig()` before every send — throws a clear error if `EMAIL_USER` or `EMAIL_PASS` are missing (visible in Vercel function logs).

---

## Meeting Availability / Scheduling Feature

**Flow:**
1. Candidate submits referral/reference request
2. Alumni receives email with a purple **"📅 Set My Availability"** button
3. Button links to `{FRONTEND_URL}/schedule/{requestId}` — **public, no login**
4. Alumni fills in date, time, optional notes → submits
5. Candidate receives email with the proposed schedule details

**Frontend route**: `/schedule/:requestId` → `SchedulePage.jsx`  
**Backend**: `GET/POST /api/schedule/:requestId` → `scheduleController.js`  
**DB column**: `alumni_availability JSONB` in `referral_requests`

---

## Known Issues & What's Working

### ✅ Working
- User registration and login (JWT)
- Alumni search with filters (keyword, tech, company, role, experience, availability)
- Alumni profile page with "Mail Request" (Gmail compose) button
- Referral/reference request submission (stores in Supabase)
- Request dashboard for candidates (status tracking)
- Incoming requests panel for alumni (accept/reject/info/complete)
- Resume upload to Supabase Storage
- Supabase Storage bucket auto-created if missing
- Vercel deployment (frontend static + backend serverless via `api/index.js`)
- Email templates (all 7 templates coded and connected)
- Alumni scheduling page (public, no login)
- Health check endpoint shows email config status

### ⚠️ Requires User Action
- **Emails not sending**: `EMAIL_USER` and `EMAIL_PASS` env vars must be set in Vercel
- **Scheduling save failing**: Run SQL migration to add `alumni_availability` column
- **Action links in emails wrong**: `FRONTEND_URL` must be set to the real Vercel URL

### 🔍 How to Verify Email Works
Call after deploying:
```
POST /api/debug/send-test-email
Authorization: Bearer <your-jwt-token>
```
Returns `{ success: true }` if SMTP works, or a specific error + hint if not.

---

## Seed Data

Run `npm run seed` from `backend/` to repopulate the database.

**Alumni records** (8 total, all with email `sreechandanamakkapati@gmail.com`):
- Priya Sharma — TCS — Software Engineer
- Ravi Kumar — Infosys — Java Developer
- Ananya Reddy — Wipro — Data Analyst
- Mohammed Farhan — Capgemini — QA Engineer
- Sneha Patel — HCL Technologies — DevOps Engineer
- Kiran Babu — Tech Mahindra — Android Developer
- Divya Menon — Accenture — React Developer
- Arjun Nair — Cognizant — Full Stack Developer

**Demo trainee user**: `deepika@ncpl.in` / `demo1234`

---

## Frontend Routes

| Path | Component | Auth |
|------|-----------|------|
| `/login` | LoginPage | Public (redirect to /search if logged in) |
| `/search` | SearchPage | Private |
| `/alumni/:id` | AlumniProfilePage | Private |
| `/request/:alumniId` | RequestForm | Private |
| `/referrals` | ReferralDashboard | Private |
| `/alumni/requests` | AlumniRequestPanel | Private |
| `/schedule/:requestId` | SchedulePage | **Public — no login needed** |

---

## Key Architecture Decisions

1. **Supabase client uses lazy-init Proxy** (`backend/config/supabase.js`) — env vars are only read on first DB call, preventing crashes at import time in serverless environments where vars may not be set yet.

2. **`api/index.js` is the Vercel entry point** — it re-exports `backend/server.js`. The `functions` key in `vercel.json` must NEVER reference `backend/server.js` directly.

3. **UUID validation** — `referral.js` route uses `.isUUID()` not `.isMongoId()` since Supabase uses UUIDs.

4. **Email errors are non-blocking** — email `.catch()` logs errors to Vercel function logs but does not fail the API response. Check Vercel → Logs if emails seem missing.

5. **`/api/schedule/:requestId` is fully public** — alumni can open the scheduling link from email without logging in. The request UUID is hard to guess.

6. **`resumePublicId`** — the frontend upload returns `publicId`; controller accepts both `resumePath` and `resumePublicId` and uses whichever is present.

---

## Git Commit History

```
4dfee3c fix: restore vercel.json to api/index pattern (remove functions key)
230e895 feat: add alumni meeting-availability scheduling via email link
67ec950 fix: surface email config errors and add test-email endpoint
612186f chore: add frontend/build to gitignore and commit frontend lock file
4f61807 fix: replace legacy Vercel builds+routes with modern functions+rewrites config
65a90bb fix: auto-create Supabase storage bucket to resolve "Bucket not found" error
7fd97a0 Fix ESLint unknown-rule error blocking Vercel build
d6100e1 Fix ESLint warnings that break Vercel CI build
25dc308 Migrate backend from MongoDB/Cloudinary to Supabase
db2c314 feat: add Referral & Reference Connect module + Vercel deployment config
6f5b143 feat: add alumni search feature with full backend and React frontend
584beca NCPL Alumni Connect - Initial commit
```

---

## Immediate Next Steps (for the Next Session)

1. **Run the SQL migration** in Supabase:
   ```sql
   ALTER TABLE referral_requests ADD COLUMN IF NOT EXISTS alumni_availability JSONB;
   ```

2. **Set Vercel env vars** — especially `EMAIL_USER`, `EMAIL_PASS`, `EMAIL_FROM`, `FRONTEND_URL`

3. **Verify emails work** by calling `POST /api/debug/send-test-email` with a valid JWT

4. **Merge `claude/add-alumni-search-feature-FVXZI` into `main`** once deployment is confirmed working

5. **Possible future features to build**:
   - Admin dashboard (user management, request overview)
   - Alumni can update their own profile
   - Notification badges on the dashboard for new incoming requests
   - Calendar invite generation (`.ics` file) when alumni sets availability
   - Rating/feedback system after request is completed
