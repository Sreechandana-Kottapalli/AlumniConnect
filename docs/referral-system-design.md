# NCPL Alumni Connect — Referral & Professional Reference System
## System Design Document

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NCPL Alumni Connect                              │
│                  Referral & Reference Connect Module                    │
└─────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┐     HTTPS / REST API     ┌──────────────────────┐
│   React.js Frontend  │ ◄──────────────────────► │  Node.js / Express   │
│   (Tailwind CSS)     │       /api/*              │  Backend API         │
│                      │                           │                      │
│  Pages:              │   JWT Bearer Token        │  Routes:             │
│  • LoginPage         │ ──────────────────►       │  /api/auth           │
│  • SearchPage        │                           │  /api/alumni         │
│  • AlumniProfilePage │                           │  /api/referrals      │
│  • ReferralDashboard │                           │  /api/upload         │
│  • AlumniRequestPanel│                           │                      │
│  • RequestForm       │   FormData (PDF)          │  Middleware:         │
│                      │ ──────────────────►       │  • JWT auth          │
└──────────────────────┘                           │  • Rate limiter      │
                                                   │  • Multer upload     │
                                                   │  • Error handler     │
                                                   └──────────┬───────────┘
                                                              │
                              ┌───────────────────────────────┤
                              │                               │
                    ┌─────────▼──────┐             ┌─────────▼──────────┐
                    │   MongoDB       │             │   Cloudinary        │
                    │   (Mongoose)    │             │   (PDF Storage)     │
                    │                │             │                     │
                    │  Collections:  │             │  Folder:            │
                    │  • users       │             │  ncpl_alumni_connect│
                    │  • alumni      │             │  /resumes           │
                    │  • referral    │             │                     │
                    │    requests    │             └─────────────────────┘
                    └────────────────┘
                                                   ┌─────────────────────┐
                                                   │   Nodemailer (SMTP) │
                                                   │   Gmail / SendGrid  │
                                                   │                     │
                                                   │  Email Types:       │
                                                   │  • New Request      │
                                                   │  • Accepted         │
                                                   │  • Rejected         │
                                                   │  • Info Needed      │
                                                   │  • Completed        │
                                                   └─────────────────────┘
```

---

## 2. Deployment Architecture (Vercel)

```
Vercel Deployment (Single Project)
┌────────────────────────────────────────────────┐
│                                                │
│  /api/*  ──►  backend/server.js               │
│              (@vercel/node serverless fn)      │
│                                                │
│  /*      ──►  frontend/build/                  │
│              (@vercel/static-build)            │
│              SPA fallback → index.html         │
│                                                │
└────────────────────────────────────────────────┘

Environment Variables (set in Vercel dashboard):
  MONGO_URI, JWT_SECRET, CLOUDINARY_*, EMAIL_*, FRONTEND_URL
```

---

## 3. Database Schemas

### User Schema
```
users {
  _id            : ObjectId
  name           : String (required)
  email          : String (unique, required)
  password       : String (bcrypt hashed, select: false)
  role           : "trainee" | "alumni" | "admin"
  batch          : String (optional)
  domain         : String (optional)
  createdAt      : Date
  updatedAt      : Date
}
```

### Alumni Schema
```
alumni {
  _id                : ObjectId
  fullName           : String (required)
  email              : String (unique, required)
  company            : String (required)
  jobRole            : String (required)
  technologies       : [String] (required, min: 1)
  yearsOfExperience  : Number (required, min: 0)
  linkedinProfile    : String
  availabilityStatus : "available" | "busy" | "not_available"
  profilePhoto       : String (URL)
  batch              : String
  location           : String
  bio                : String (max: 500)
  domain             : String
  avatarInitials     : String
  avatarColor        : String (hex)
  createdAt          : Date
  updatedAt          : Date

  Indexes:
    - Text: fullName, company, jobRole, technologies, domain, bio
    - Field: technologies, company, jobRole, yearsOfExperience
}
```

### ReferralRequest Schema
```
referralrequests {
  _id                    : ObjectId
  candidate              : ObjectId → User (required)
  alumni                 : ObjectId → Alumni (required)
  requestType            : "referral" | "reference" (required)
  targetJobRole          : String (required, max: 150)
  targetCompany          : String (required, max: 150)
  jobDescriptionUrl      : String (optional)
  resumeUrl              : String (required)
  resumePublicId         : String (Cloudinary id for deletion)
  linkedinUrl            : String (optional)
  portfolioUrl           : String (optional)
  personalMessage        : String (required, 20–1000 chars)
  status                 : "pending" | "accepted" | "rejected"
                         | "in_progress" | "completed"
  alumniResponse         : String (max: 1000)
  additionalInfoRequest  : String (max: 500)
  statusHistory          : [{
      status    : String,
      note      : String,
      changedAt : Date
  }]
  completedAt            : Date (auto-set on completion)
  createdAt              : Date
  updatedAt              : Date

  Indexes:
    - { candidate: 1, createdAt: -1 }
    - { alumni: 1, status: 1, createdAt: -1 }
    - { status: 1 }

  Business Rules:
    - One active request per (candidate, alumni, requestType) combination
    - Active = status in [pending, accepted, in_progress]
    - Cannot update rejected or completed requests
    - Only the submitting candidate can cancel a pending request
    - Only the target alumni (email match) or admin can update status
}
```

---

## 4. API Endpoints

### Authentication
| Method | Endpoint           | Access  | Description                     |
|--------|--------------------|---------|---------------------------------|
| POST   | /api/auth/register | Public  | Register new user               |
| POST   | /api/auth/login    | Public  | Login, receive JWT              |
| GET    | /api/auth/me       | Private | Get current user profile        |

### Alumni Search
| Method | Endpoint                        | Access  | Description                     |
|--------|--------------------------------|---------|---------------------------------|
| GET    | /api/alumni/search             | Private | Search alumni with filters      |
| GET    | /api/alumni/:id                | Private | Get single alumni profile       |
| GET    | /api/alumni/filters/options    | Private | Filter dropdown data            |

**Search Query Parameters:**
- `q` — full-text keyword
- `technology` — comma-separated techs (OR logic)
- `company` — partial match
- `jobRole` — partial match
- `minExp` / `maxExp` — experience range
- `availability` — available | busy | not_available
- `sortBy` — fullName | company | yearsOfExperience | createdAt
- `sortOrder` — asc | desc
- `page` / `limit` — pagination (max 50/page)

### Referral / Reference Requests
| Method | Endpoint                     | Access         | Description                      |
|--------|------------------------------|----------------|----------------------------------|
| POST   | /api/referrals               | Candidate      | Create referral/reference request|
| GET    | /api/referrals/my            | Candidate      | Get own submitted requests       |
| GET    | /api/referrals/incoming      | Alumni         | Get incoming requests            |
| GET    | /api/referrals/stats         | Both           | Dashboard statistics             |
| GET    | /api/referrals/:id           | Owner or Alumni| Get single request details       |
| PUT    | /api/referrals/:id/status    | Alumni / Admin | Update request status            |
| DELETE | /api/referrals/:id           | Candidate      | Cancel pending request           |
| GET    | /api/referrals/admin/all     | Admin only     | View all requests                |

**Status Update Body:**
```json
{
  "status": "accepted | rejected | in_progress | completed",
  "alumniResponse": "Optional message to candidate",
  "additionalInfoRequest": "What additional info is needed (for in_progress)"
}
```

### File Upload
| Method | Endpoint                     | Access   | Description                |
|--------|------------------------------|----------|----------------------------|
| POST   | /api/upload/resume           | Private  | Upload PDF resume (max 5MB)|
| DELETE | /api/upload/resume/:publicId | Private  | Remove uploaded resume     |

---

## 5. Request Workflow Diagrams

### 5a. Referral Request Flow

```
Candidate                  Platform                   Alumni
    │                          │                          │
    │  Search by tech/company  │                          │
    │─────────────────────────►│                          │
    │                          │                          │
    │  View Alumni Profile     │                          │
    │─────────────────────────►│                          │
    │                          │                          │
    │  Click "Request Referral"│                          │
    │─────────────────────────►│                          │
    │                          │                          │
    │  Fill RequestForm:       │                          │
    │  • Upload Resume (PDF)   │──► Cloudinary            │
    │  • Target Job/Company    │                          │
    │  • LinkedIn/Portfolio    │                          │
    │  • Personal Message      │                          │
    │  • Submit                │                          │
    │─────────────────────────►│                          │
    │                          │  Store ReferralRequest   │
    │                          │  (status: pending)       │
    │                          │                          │
    │                          │  Send Email Notification │
    │                          │─────────────────────────►│
    │                          │                          │
    │  "Request Submitted" ✓   │                          │
    │◄─────────────────────────│                          │
    │                          │                          │
    │                          │   Alumni reviews request │
    │                          │   [Accept/Reject/Info]   │
    │                          │◄─────────────────────────│
    │                          │                          │
    │                          │  Update status in DB     │
    │                          │                          │
    │  Email: Status Update    │                          │
    │◄─────────────────────────│                          │
    │                          │                          │
    │  Track on Dashboard      │                          │
    │─────────────────────────►│                          │
```

### 5b. Request Status Lifecycle

```
                    ┌──────────────────────────────────────┐
                    │         Status State Machine          │
                    └──────────────────────────────────────┘

    Submit
      │
      ▼
  ┌────────┐   Accept    ┌──────────┐   Complete  ┌───────────┐
  │PENDING │────────────►│ ACCEPTED │────────────►│ COMPLETED │
  └────────┘             └──────────┘             └───────────┘
      │                       │
      │   Reject          Request Info
      │                       │
      ▼                       ▼
  ┌────────┐           ┌─────────────┐
  │REJECTED│           │  IN_PROGRESS│
  └────────┘           └─────────────┘
  (terminal)           (awaiting more
                        info from
                        candidate)

  REJECTED and COMPLETED are terminal — no further updates allowed.
  Candidate can cancel while status is PENDING only.
```

---

## 6. Role-Based Access Control

```
┌─────────────────────────────────────────────────────────┐
│                  Permission Matrix                       │
├──────────────────────┬──────────────┬───────────────────┤
│ Feature              │ Trainee      │ Alumni    │ Admin  │
├──────────────────────┼──────────────┼───────────┼────────┤
│ Search alumni        │     ✓        │     ✓     │   ✓   │
│ View alumni profile  │     ✓        │     ✓     │   ✓   │
│ Submit request       │     ✓        │     ✗     │   ✓   │
│ View own requests    │     ✓        │     ✗     │   ✓   │
│ Cancel own request   │     ✓        │     ✗     │   ✓   │
│ View incoming reqs   │     ✗        │     ✓     │   ✓   │
│ Accept/Reject reqs   │     ✗        │     ✓     │   ✓   │
│ View all requests    │     ✗        │     ✗     │   ✓   │
│ Upload resume        │     ✓        │     ✗     │   ✓   │
└──────────────────────┴──────────────┴───────────┴────────┘

Alumni identification: User.email must match an Alumni document's email.
```

---

## 7. Email Notification Matrix

| Event                     | Recipient  | Template                    |
|---------------------------|------------|-----------------------------|
| New request submitted     | Alumni     | newRequestToAlumni          |
| Request accepted          | Candidate  | acceptanceToCandidate       |
| Request declined          | Candidate  | rejectionToCandidate        |
| More info requested       | Candidate  | additionalInfoToCandidate   |
| Request completed         | Candidate  | completionToCandidate       |

All emails are fire-and-forget (non-blocking). Email failures are logged but do not fail the API response.

**Email Template Placeholders:**

| Placeholder       | Description                             |
|-------------------|-----------------------------------------|
| `{{alumniName}}`  | Full name of the alumni                 |
| `{{candidateName}}`| Full name of the candidate             |
| `{{requestType}}` | "Job Referral" or "Professional Reference"|
| `{{company}}`     | Target company name                     |
| `{{jobRole}}`     | Target job role                         |
| `{{message}}`     | Personal message from candidate         |
| `{{resumeLink}}`  | Direct Cloudinary PDF URL               |
| `{{acceptLink}}`  | Deep link to accept in dashboard        |
| `{{rejectLink}}`  | Deep link to reject in dashboard        |

---

## 8. Security Implementation

### Input Validation
- All request bodies validated with `express-validator`
- File type: only `application/pdf` accepted by Multer
- File size: 5 MB maximum enforced at Multer level
- Message length: 20–1000 characters enforced at DB and API level
- URL fields: `isURL()` validation on all link fields

### Authentication & Authorization
- JWT with 7-day expiry; secret from env variable
- `protect` middleware on all `/api/alumni/*`, `/api/referrals/*`, `/api/upload/*`
- Access control checks: candidate vs. alumni vs. admin enforced in controllers
- Alumni matched to requests by email (not by trusting a client-sent ID)

### Rate Limiting
- Global: 100 req / 15 min per IP
- Auth endpoints: 10 req / 15 min (brute-force prevention)
- Resume upload: 20 req / hour
- Referral creation: 15 req / hour

### Duplicate Prevention
- `ReferralRequest.hasDuplicate()` static method checks for active requests
  before creating a new one (same candidate + alumni + type)

### Data Privacy
- Alumni email addresses are protected by Mongoose schema — email is only
  returned when the authenticated user is the request's own candidate or
  the admin. It is NOT included in the public alumni search results.
- Resume URLs are Cloudinary signed URLs (raw resource type)

---

## 9. Frontend Component Tree

```
App.js (Router + AuthProvider)
│
├── LoginPage.jsx
│   └── auth/register forms
│
├── SearchPage.jsx  (candidate alumni discovery)
│   ├── Navbar.jsx
│   ├── FilterPanel.jsx
│   ├── AlumniCard.jsx  (→ navigate to /alumni/:id)
│   ├── Pagination.jsx
│   └── LoadingSpinner.jsx
│
├── AlumniProfilePage.jsx  (full alumni details + CTA)
│   ├── Navbar.jsx
│   ├── "Request Referral" button → /request/:id?type=referral
│   └── "Request Reference" button → /request/:id?type=reference
│
├── RequestForm.jsx  (submit referral/reference)
│   ├── Navbar.jsx
│   ├── Alumni snapshot card
│   ├── Request type selector
│   ├── Resume PDF drag-and-drop upload
│   ├── Form fields (role, company, message, links)
│   └── Upload progress bar
│
├── ReferralDashboard.jsx  (candidate home for referrals)
│   ├── Navbar.jsx
│   ├── Stats cards (total, pending, accepted, completed)
│   ├── "My Requests" tab
│   │   ├── CandidateRequestCard.jsx
│   │   └── StatusTracker.jsx
│   └── "Find Alumni" tab
│       └── AlumniMiniCard (quick search + request buttons)
│
└── AlumniRequestPanel.jsx  (alumni request management)
    ├── Navbar.jsx
    ├── Stats cards
    ├── Status filter tabs
    └── AlumniRequestCard.jsx
        ├── Accept / Reject / Request Info / Complete buttons
        ├── Resume / LinkedIn / JD links
        └── Response text area
```

---

## 10. Folder Structure

```
AlumniConnect/
├── vercel.json                     # Vercel deployment config
│
├── backend/
│   ├── server.js                   # Express app entry point
│   ├── package.json
│   ├── .env.example
│   ├── seed.js                     # Database seeder
│   ├── config/
│   │   └── db.js                   # MongoDB connection
│   ├── models/
│   │   ├── User.js
│   │   ├── Alumni.js
│   │   └── ReferralRequest.js      # NEW
│   ├── middleware/
│   │   ├── auth.js                 # JWT protect
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js          # NEW
│   │   └── upload.js               # NEW (Multer + Cloudinary)
│   ├── routes/
│   │   ├── auth.js
│   │   ├── alumni.js
│   │   ├── referral.js             # NEW
│   │   └── upload.js               # NEW
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── alumniController.js
│   │   └── referralController.js   # NEW
│   ├── services/
│   │   ├── cloudinaryService.js    # NEW
│   │   └── emailService.js         # NEW
│   └── templates/
│       └── emailTemplates.js       # NEW (HTML email templates)
│
├── frontend/
│   ├── package.json
│   ├── tailwind.config.js          # NEW
│   ├── postcss.config.js           # NEW
│   ├── public/
│   │   └── index.html
│   └── src/
│       ├── App.js                  # Updated with new routes
│       ├── App.css                 # Existing component styles
│       ├── index.js                # Updated (imports tailwind)
│       ├── index.css               # NEW (Tailwind directives)
│       ├── context/
│       │   └── AuthContext.js
│       ├── services/
│       │   ├── api.js              # Axios + JWT interceptor
│       │   └── referralAPI.js      # NEW
│       ├── hooks/
│       │   └── useAlumniSearch.js
│       ├── components/
│       │   ├── AlumniCard.jsx
│       │   ├── FilterPanel.jsx
│       │   ├── LoadingSpinner.jsx
│       │   ├── Navbar.jsx          # NEW (shared navbar)
│       │   ├── Pagination.jsx
│       │   ├── RequestCard.jsx     # NEW (candidate + alumni views)
│       │   └── StatusTracker.jsx   # NEW (progress stepper + badge)
│       └── pages/
│           ├── LoginPage.jsx
│           ├── SearchPage.jsx
│           ├── AlumniProfilePage.jsx   # Updated (+ CTA buttons)
│           ├── ReferralDashboard.jsx   # NEW
│           ├── AlumniRequestPanel.jsx  # NEW
│           └── RequestForm.jsx         # NEW
│
└── docs/
    ├── api-samples.md
    └── referral-system-design.md  # This document
```

---

## 11. Sample API Payloads

### Create Referral Request
```http
POST /api/referrals
Authorization: Bearer <token>
Content-Type: application/json

{
  "alumniId": "64f9b2c3a1e2d4f5e6a7b8d1",
  "requestType": "referral",
  "targetJobRole": "React Developer",
  "targetCompany": "TCS",
  "jobDescriptionUrl": "https://careers.tcs.com/job/456",
  "resumeUrl": "https://res.cloudinary.com/xyz/raw/upload/v1234/resumes/resume_uid_1234.pdf",
  "resumePublicId": "ncpl_alumni_connect/resumes/resume_uid_1234",
  "linkedinUrl": "https://linkedin.com/in/deepika-nair",
  "personalMessage": "Hi Priya, I am Deepika from NCPL batch 2024 studying React and Node.js. I came across a React Developer opening at TCS and would greatly appreciate if you could refer me internally. I have attached my resume and portfolio link. Thank you!"
}
```

**Response 201:**
```json
{
  "success": true,
  "message": "Request submitted successfully.",
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "candidate": "64f9b2c3a1e2d4f5e6a7b8c9",
    "alumni": "64f9b2c3a1e2d4f5e6a7b8d1",
    "requestType": "referral",
    "targetJobRole": "React Developer",
    "targetCompany": "TCS",
    "status": "pending",
    "statusHistory": [{ "status": "pending", "note": "Request submitted", "changedAt": "..." }],
    "createdAt": "2024-01-20T08:30:00.000Z"
  }
}
```

### Upload Resume
```http
POST /api/upload/resume
Authorization: Bearer <token>
Content-Type: multipart/form-data

resume: [PDF file binary]
```

**Response 201:**
```json
{
  "success": true,
  "message": "Resume uploaded successfully.",
  "data": {
    "url": "https://res.cloudinary.com/your-cloud/raw/upload/v1705744200/ncpl_alumni_connect/resumes/resume_uid_1705744200.pdf",
    "publicId": "ncpl_alumni_connect/resumes/resume_uid_1705744200",
    "originalName": "deepika_resume.pdf",
    "size": 204800
  }
}
```

### Update Request Status (Alumni)
```http
PUT /api/referrals/65a1b2c3d4e5f6a7b8c9d0e1/status
Authorization: Bearer <alumni-token>
Content-Type: application/json

{
  "status": "accepted",
  "alumniResponse": "Hi Deepika! I reviewed your resume and would be happy to refer you. I will submit your profile internally. Please keep your LinkedIn up to date and reach out to me directly."
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Request accepted successfully.",
  "data": {
    "_id": "65a1b2c3d4e5f6a7b8c9d0e1",
    "status": "accepted",
    "alumniResponse": "Hi Deepika! I reviewed your resume...",
    "statusHistory": [
      { "status": "pending", "note": "Request submitted", "changedAt": "..." },
      { "status": "accepted", "changedAt": "..." }
    ]
  }
}
```

### Get Stats
```http
GET /api/referrals/stats
Authorization: Bearer <token>
```

**Response 200 (Candidate):**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "pending": 2,
    "accepted": 1,
    "rejected": 1,
    "in_progress": 0,
    "completed": 1
  }
}
```

---

## 12. Quick Start

```bash
# 1. Clone and install
git clone <repo-url>
cd AlumniConnect/backend && npm install
cd ../frontend && npm install

# 2. Configure backend
cp backend/.env.example backend/.env
# Edit backend/.env with your MongoDB URI, JWT secret, Cloudinary + SMTP credentials

# 3. Seed the database
cd backend && npm run seed

# 4. Run both servers (two terminals)
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd frontend && npm start

# 5. Open http://localhost:3000
#    Login: deepika@ncpl.in / demo1234
```
