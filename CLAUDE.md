# AlumniConnect — CLAUDE.md

## Project Overview

**AlumniConnect** is an NCPL (training institute) alumni referral and professional reference platform. Trainees can discover alumni, request job referrals or professional references, and track request status. Alumni manage incoming requests and respond via a dashboard.

- **Frontend:** React.js 18 + Tailwind CSS (deployed as SPA)
- **Backend:** Node.js/Express 4 + Supabase (PostgreSQL + Storage)
- **Deployment:** Vercel (serverless functions + static hosting)
- **Auth:** JWT (7-day expiry)
- **Email:** Nodemailer via Gmail SMTP
- **File Storage:** Supabase Storage (PDF resumes)
- **Mobile App:** Expo/React Native (separate UI, same backend API)
- **Repo:** `sreechandana-kottapalli/alumniconnect`
- **Dev Branch:** `claude/review-claude-docs-R8Nbv`

---

## Directory Structure

```
AlumniConnect/
├── CLAUDE.md                         # This file
├── package.json                      # Root: Expo mobile app config
├── app.json                          # Expo configuration
├── App.js                            # Expo entry point (React Native)
├── index.js                          # Expo registration
├── README.md                         # Project README
├── vercel.json                       # Vercel deployment config
├── package-lock.json

├── api/
│   └── index.js                      # Vercel serverless entry (re-exports backend/server.js)

├── backend/
│   ├── server.js                     # Express app (port 5000 / Vercel serverless)
│   ├── package.json                  # Backend dependencies
│   ├── .env.example                  # Env vars template
│   ├── seed.js                       # Database seeder
│   ├── setup.js                      # Setup utilities
│   ├── update-alumni-emails.js       # Alumni data update script
│   ├── config/
│   │   ├── supabase.js               # Lazy-init Supabase client (proxy pattern)
│   │   └── schema.sql                # PostgreSQL schema + triggers
│   ├── models/
│   │   ├── User.js                   # User auth + profile queries
│   │   ├── Alumni.js                 # Alumni search + filters
│   │   └── ReferralRequest.js        # Referral CRUD + status
│   ├── controllers/
│   │   ├── authController.js         # register, login, getMe
│   │   ├── alumniController.js       # searchAlumni, getAlumniById, getFilterOptions
│   │   └── referralController.js     # createRequest, getMyRequests, updateStatus, etc.
│   ├── routes/
│   │   ├── auth.js                   # POST /register, /login; GET /me
│   │   ├── alumni.js                 # GET /search, /:id, /filters/options
│   │   ├── referral.js               # POST/GET/PUT/DELETE /referrals/*
│   │   └── upload.js                 # POST/DELETE /upload/resume
│   ├── middleware/
│   │   ├── auth.js                   # JWT protect middleware
│   │   ├── errorHandler.js           # Global error handler
│   │   ├── rateLimiter.js            # express-rate-limit configs (4 tiers)
│   │   └── upload.js                 # Multer PDF config (5MB max)
│   ├── services/
│   │   ├── emailService.js           # 6 Nodemailer email functions
│   │   └── storageService.js         # Supabase Storage upload/delete
│   └── templates/
│       └── emailTemplates.js         # 6 HTML email templates (inline CSS)

├── frontend/
│   ├── package.json                  # React + Tailwind + Axios
│   ├── tailwind.config.js            # Design system (NCPL colors + shadows)
│   ├── postcss.config.js
│   └── src/
│       ├── App.js                    # Router + route definitions
│       ├── App.css                   # Component styles
│       ├── index.js                  # React entry point
│       ├── index.css                 # Tailwind utilities
│       ├── context/
│       │   └── AuthContext.js        # Auth state (JWT + localStorage)
│       ├── services/
│       │   ├── api.js                # Axios instance + interceptors
│       │   └── referralAPI.js        # Referral-specific API wrappers
│       ├── hooks/
│       │   └── useAlumniSearch.js    # Search state (350ms debounce)
│       ├── components/
│       │   ├── AlumniCard.jsx        # Alumni profile grid card
│       │   ├── FilterPanel.jsx       # Search filter dropdowns
│       │   ├── LoadingSpinner.jsx    # Loading indicator
│       │   ├── Navbar.jsx            # Top nav + logout
│       │   ├── Pagination.jsx        # Page controls
│       │   ├── RequestCard.jsx       # Referral request display
│       │   └── StatusTracker.jsx     # Status badge + timeline
│       └── pages/
│           ├── LoginPage.jsx         # Login / register toggle
│           ├── SearchPage.jsx        # Alumni search + grid
│           ├── AlumniProfilePage.jsx # Single alumni full profile
│           ├── ReferralDashboard.jsx # Candidate request management
│           ├── AlumniRequestPanel.jsx# Alumni incoming requests
│           └── RequestForm.jsx       # Create referral/reference form

├── navigation/
│   └── MainNavigator.js              # React Native navigation
├── screens/                          # React Native screens
├── constants/                        # Shared constants
└── docs/
    ├── api-samples.md                # API endpoint examples
    └── referral-system-design.md     # Full system design doc
```

---

## Database Schema

### `users` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | auto |
| name | TEXT NOT NULL | |
| email | TEXT NOT NULL UNIQUE | |
| password | TEXT NOT NULL | bcrypt hash |
| role | 'trainee'\|'alumni'\|'admin' | |
| batch | TEXT | |
| domain | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | auto-updated by trigger |

### `alumni` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| full_name | TEXT NOT NULL | |
| email | TEXT NOT NULL UNIQUE | |
| company | TEXT NOT NULL | |
| job_role | TEXT NOT NULL | |
| technologies | TEXT[] | GIN index |
| years_of_experience | INTEGER | >= 0 |
| linkedin_profile | TEXT | |
| availability_status | 'available'\|'busy'\|'not_available' | |
| profile_photo | TEXT | |
| batch | TEXT | |
| location | TEXT | |
| bio | TEXT | |
| domain | TEXT | |
| avatar_initials | TEXT | |
| avatar_color | TEXT | hex color |
| created_at / updated_at | TIMESTAMPTZ | auto-maintained |

### `referral_requests` table
| Column | Type | Notes |
|--------|------|-------|
| id | UUID PK | |
| candidate_id | UUID FK → users | CASCADE |
| alumni_id | UUID FK → alumni | CASCADE |
| request_type | 'referral'\|'reference' | |
| target_job_role | TEXT | |
| target_company | TEXT | |
| job_description_url | TEXT | |
| resume_url | TEXT | Supabase public URL |
| resume_path | TEXT | storage path (for deletion) |
| linkedin_url | TEXT | |
| portfolio_url | TEXT | |
| personal_message | TEXT | 20–1000 chars |
| status | 'pending'\|'accepted'\|'rejected'\|'in_progress'\|'completed' | |
| alumni_response | TEXT | max 1000 chars |
| additional_info_request | TEXT | max 500 chars |
| status_history | JSONB | [{status, note, changed_at}] |
| completed_at | TIMESTAMPTZ | |
| created_at / updated_at | TIMESTAMPTZ | auto-maintained |

**Indexes:** `(candidate_id, created_at DESC)`, `(alumni_id, status, created_at DESC)`, `status`, GIN on `technologies`

---

## API Routes

### Authentication (Public)
```
POST /api/auth/register    body: {name, email, password, role?, batch?, domain?}
POST /api/auth/login       body: {email, password}
GET  /api/auth/me          header: Bearer <token>
GET  /api/health           returns env var status
```

### Alumni (Protected)
```
GET /api/alumni/search           ?q, technology, company, jobRole, minExp, maxExp, availability, sortBy, sortOrder, page, limit
GET /api/alumni/filters/options  returns {technologies[], companies[], jobRoles[], availabilityStatuses[]}
GET /api/alumni/:id
```

### Referrals (Protected)
```
POST   /api/referrals                  create request (trainee)
GET    /api/referrals/my               own requests (trainee)
GET    /api/referrals/incoming         incoming requests (alumni)
GET    /api/referrals/stats            dashboard stats
GET    /api/referrals/:id              single request (owner/alumni)
PUT    /api/referrals/:id/status       update status (alumni/admin)
DELETE /api/referrals/:id              cancel pending (trainee)
GET    /api/referrals/admin/all        all requests (admin)
```

### Upload (Protected)
```
POST   /api/upload/resume              multipart/form-data, field: resume (PDF, <5MB)
DELETE /api/upload/resume/:publicId
```

---

## Frontend Routes
| Path | Component | Access |
|------|-----------|--------|
| /login | LoginPage | Public (redirects if authed) |
| /search | SearchPage | Private |
| /alumni/:id | AlumniProfilePage | Private |
| /referrals | ReferralDashboard | Private |
| /request/:alumniId | RequestForm | Private |
| /alumni/requests | AlumniRequestPanel | Private |
| * | redirect /search | — |

---

## Environment Variables

All vars go in `backend/.env` (or Vercel dashboard for production):

```bash
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=resumes

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d

# Email (Gmail SMTP)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password          # Gmail App Password (not account password)
EMAIL_FROM="NCPL Alumni Connect <your_gmail@gmail.com>"

# App
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000    # prod: Vercel domain

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000           # 15 min
RATE_LIMIT_MAX=100
```

---

## Rate Limiting

| Limiter | Window | Max | Applied To |
|---------|--------|-----|------------|
| global | 15 min | 100 | all /api/* |
| auth | 15 min | 10 | /api/auth/* |
| upload | 1 hour | 20 | /api/upload/* |
| referral | 1 hour | 15 | POST /api/referrals |

---

## Email System

**6 email functions in `backend/services/emailService.js`:**

| Function | Recipient | Trigger |
|----------|-----------|---------|
| notifyAlumniNewRequest | Alumni | New referral request created |
| notifyCandidateRequestSubmitted | Candidate | Confirmation of submission |
| notifyCandidateAccepted | Candidate | Request accepted |
| notifyCandidateRejected | Candidate | Request rejected |
| notifyCandidateAdditionalInfo | Candidate | Alumni requests more info |
| notifyCandidateCompleted | Candidate | Request completed |

- All emails are **non-blocking** (errors logged, don't fail the API response)
- Templates use inline CSS for email-client compatibility
- Brand colors: primary `#1A3C6E`, secondary `#F4A823`
- Gmail requires an **App Password** (2FA must be enabled on the Gmail account)

---

## Business Rules

1. **Duplicate prevention:** One active request per (candidate, alumni, requestType). Active = pending, accepted, or in_progress. Returns 409 on duplicate.
2. **Status lifecycle:**
   - `pending` → accept → `accepted` → complete → `completed`
   - `pending` → reject → `rejected`
   - `accepted`/`in_progress` → request info → `in_progress`
   - `rejected` and `completed` are terminal states
3. **Access control:**
   - Trainees see only their own requests
   - Alumni see incoming requests matched by **email** (not client-sent ID)
   - Admin sees all requests
4. **File upload:** PDF only, max 5 MB
5. **Message length:** 20–1000 characters

---

## Key Architecture Decisions

- **Lazy Supabase init:** Client created on first use, not at import time — required for Vercel cold starts
- **Proxy pattern:** `config/supabase.js` forwards all method calls transparently
- **Email-based alumni matching:** Avoids trusting client-sent alumni IDs for authorization
- **Model normalization:** All DB rows normalized to camelCase + `_id` suffix
- **Non-blocking emails:** `emailService.js` never throws; errors are logged only
- **Status history:** `status_history` JSONB column appended on every state change (full audit trail)
- **Vercel rewrite rule:** `/api/(.*)` → `/api/index` — this pattern **must not be changed**

---

## Deployment (Vercel)

**`vercel.json`:**
```json
{
  "version": 2,
  "buildCommand": "npm --prefix frontend install && npm --prefix frontend run build && npm --prefix backend install",
  "outputDirectory": "frontend/build",
  "rewrites": [
    { "source": "/api/(.*)", "destination": "/api/index" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "regions": ["bom1"]
}
```

**`api/index.js`** simply re-exports `backend/server.js` as the Vercel serverless function. This file and its import path must remain intact.

---

## Local Development

```bash
# Backend
cd backend
cp .env.example .env   # fill in values
npm install
npm run dev            # nodemon on port 5000

# Frontend
cd frontend
npm install
npm start              # CRA dev server on port 3000 (proxies /api to :5000)

# Seed database
cd backend
node seed.js
```

---

## Seed Data

The seeder (`backend/seed.js`) populates:
- **8 alumni** with varied companies, technologies, and availability statuses
- **1 demo trainee** user

Run `node seed.js` from the `backend/` directory after setting up `.env`.

---

## Design System (Tailwind)

```javascript
Colors:
  primary:   #1A3C6E   (dark blue — NCPL brand)
  secondary: #F4A823   (orange — accent)
  ncpl.*:    success, error, warn, info variants

Shadows: card, card-hover
Font:    Inter
```

Preflight is **disabled** in `tailwind.config.js` — base styles come from `App.css`.

---

## Mobile App (Expo)

The React Native app at the repo root is a **separate UI** from the web frontend. It uses the same backend API. Screens include: Home, Profile, Alumni, AlumniDetail, Stories, Chatbot. Navigation is handled by `@react-navigation`.

---

## Next Steps / Known Issues

- Email delivery requires `EMAIL_USER`, `EMAIL_PASS`, and `EMAIL_FROM` to be set in Vercel env vars
- Gmail App Password (not account password) required — enable 2FA first at myaccount.google.com
- Admin dashboard (`/api/referrals/admin/all`) exists in backend but has no frontend page yet
- Mobile app and web frontend are not feature-parity; mobile is a separate development track
- No real-time notifications (WebSockets) — all notifications are email-only
