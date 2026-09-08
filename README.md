# JobApply AI - Personal AI Job Application Assistant

**JobApply AI** is a production-ready web application that helps software professionals analyze job postings, deterministically match their skills, generate factual tailored application emails, review details, and safely dispatch applications via Gmail.

---

## 🛡️ Non-Negotiable Core Invariants

1. **NEVER Automatically Send**: The application strictly enforces **Generate → Review → Confirm → Send**. Every single dispatch requires human review and 4 mandatory explicit confirmation checkboxes.
2. **Zero Hallucination Guarantee**: The AI assistant strictly derives experience, skills, projects, and achievements from the user's factual profile. If a job requires a skill not present in the user's profile, the system will **never** claim that the user has that skill.
3. **Duplicate Send Prevention**: Once an application is `SENT`, it is locked against accidental repeated dispatch.
4. **OAuth Security**: Gmail passwords are never stored. Access and refresh tokens are encrypted at rest using **AES-256-GCM**. Client secrets are never exposed to browser client code.

---

## 🚀 Primary 10-Step Workflow

```mermaid
graph TD
    S1[Step 1: Paste Job Posting] --> S2[Step 2: Structured AI Analysis]
    S2 --> S3[Step 3: Review Job & Select Recipient Email]
    S3 --> S4[Step 4: Deterministic Match Scoring]
    S4 --> S5[Step 5: Factual Email Synthesis]
    S5 --> S6[Step 6: Email & Attachment Editor]
    S6 --> S7[Step 7: Full Application Review]
    S7 --> S8[Step 8: Explicit 4-Checkbox Confirmation]
    S8 --> S9[Step 9: Server-side Gmail Dispatch]
    S9 --> S10[Step 10: Saved & Status Locked]
```

---

## 🧰 Tech Stack

- **Framework**: Next.js 15 (App Router, React 19, TypeScript)
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL with Prisma ORM
- **Validation**: Zod (Input validation, send safety schemas, file metadata)
- **AI Engine**: Google Gemini API (`@google/generative-ai` with structured JSON output + deterministic offline fallbacks)
- **Email Service**: Gmail API with OAuth 2.0 (`google-auth-library` + `googleapis`)
- **Cryptography**: AES-256-GCM token encryption
- **Storage**: Secure local filesystem storage with magic byte inspection
- **Testing**: Vitest (Unit & Integration tests)
- **Deployment**: Docker, Docker Compose

---

## 📁 Architecture Overview

```
c:\Web Development\emailgenerator\
├── prisma/
│   └── schema.prisma             # PostgreSQL schema with indexes and relations
├── src/
│   ├── app/
│   │   ├── layout.tsx            # Global layout with navigation
│   │   ├── dashboard/page.tsx    # Dashboard with KPIs & conversion rates
│   │   ├── applications/
│   │   │   ├── page.tsx          # Application Tracker (filters, search, table)
│   │   │   ├── new/page.tsx      # 10-Step Guided Flow
│   │   │   └── [id]/page.tsx     # Detail view, status updater, timeline, notes
│   │   ├── profile/page.tsx      # Factual Profile Manager
│   │   ├── resumes/page.tsx      # Resume upload and default selector
│   │   ├── integrations/page.tsx # Gmail OAuth connect & status
│   │   ├── settings/page.tsx     # Security architecture & system settings
│   │   └── api/                  # REST API Route Handlers
│   ├── components/
│   │   ├── ui/                   # Reusable UI primitives (Button, Card, Badge, Modal, Alert)
│   │   ├── layout/               # Sidebar and Navbar
│   │   └── application-flow/     # Focused components for the 10-step wizard
│   ├── lib/
│   │   ├── crypto.ts             # AES-256-GCM encryption/decryption
│   │   ├── email-parser.ts       # RFC-compliant email detection and cleaning
│   │   ├── errors.ts             # Friendly user-facing error handler
│   │   ├── prisma.ts             # Prisma client singleton
│   │   └── validation/           # Zod schemas (profile, job, send, resume)
│   ├── services/
│   │   ├── match.service.ts      # Deterministic 50/20/20/10 matching engine
│   │   ├── ai.service.ts         # Gemini AI structured analysis & email synthesis
│   │   ├── gmail.service.ts      # OAuth2, MIME formatting, and sending
│   │   ├── storage.service.ts    # Secure resume upload validation
│   │   └── application.service.ts# Pre-send verification & duplicate lock
│   └── types/                    # Shared TypeScript interfaces
├── tests/                        # Vitest test suite
├── Dockerfile                    # Multi-stage production container
└── docker-compose.yml            # PostgreSQL + Next.js orchestration
```

---

## ⚙️ Installation & Setup

### Prerequisites
- Node.js 18+ (tested on Node 20 / 24)
- PostgreSQL (or Docker)

### 1. Clone & Install
```bash
cd emailgenerator
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Configure your keys in `.env`:
```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/jobapplyai?schema=public"

# Security (32-byte hex for AES-256)
TOKEN_ENCRYPTION_KEY="0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef"
AUTH_SECRET="super-secret-auth-key-change-in-production-min-32-chars"

# Google Gemini API
GEMINI_API_KEY="your-gemini-api-key"

# Google OAuth (Gmail API)
GMAIL_CLIENT_ID="your-client-id.apps.googleusercontent.com"
GMAIL_CLIENT_SECRET="your-client-secret"
GMAIL_REDIRECT_URI="http://localhost:3000/api/integrations/gmail/callback"

# Demo Mode (enables built-in simulation if keys are omitted)
DEMO_MODE="true"
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

To sync your database schema:
```bash
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Tests

The application includes unit and integration tests covering email parsing, deterministic match calculation, Zod validation, and the critical send safety guardrails:

```bash
npm test
```

### Critical Send Verification Tests
- **Unconfirmed dispatch test**: Verifies that any request missing any of the 4 confirmations throws HTTP 400 and **never** calls the Gmail API.
- **Duplicate send prevention**: Verifies that an application already marked `SENT` throws HTTP 409 Conflict.

---

## 📡 API Documentation

### Profile
- `GET /api/profile` - Retrieve candidate profile, skills, projects, and experience.
- `PUT /api/profile` - Update profile facts with Zod validation.

### Resumes
- `GET /api/resumes` - List uploaded resumes and default status.
- `POST /api/resumes` - Upload PDF/DOCX file (max 5MB, MIME validated).
- `DELETE /api/resumes/:id` - Delete resume file from storage and database.

### Job Intelligence
- `POST /api/jobs/analyze` - Extract company, title, requirements, skills, and recipient emails.
- `POST /api/jobs/match` - Deterministic match calculation (50% skills, 20% experience, 20% projects, 10% other).
- `POST /api/jobs/generate-email` - Synthesize tailored email strictly grounded in profile facts.

### Applications
- `GET /api/applications` - List applications with search and status filtering.
- `POST /api/applications` - Create a new application record.
- `GET /api/applications/:id` - Retrieve application details, email history, and audit timeline.
- `PATCH /api/applications/:id` - Update status, notes, or metadata.
- `DELETE /api/applications/:id` - Delete application record.

### Send via Gmail
- `POST /api/applications/:id/send`
  - **Pre-send checks**: Authenticated user, application exists, belongs to user, recipient valid, subject non-empty, body non-empty, resume exists, Gmail connected, not already sent, **all 4 explicit confirmation flags true**.

### Integrations
- `GET /api/integrations/gmail/connect` - Get Google OAuth consent URL.
- `GET /api/integrations/gmail/callback` - Exchange code and encrypt tokens at rest.
- `GET /api/integrations/gmail/status` - Check Gmail account connection status.
- `POST /api/integrations/gmail/disconnect` - Revoke and disconnect Gmail.

---

## 🐳 Docker Deployment

To launch the entire stack with PostgreSQL:

```bash
docker compose up -d --build
```
The application will be accessible at [http://localhost:3000](http://localhost:3000).
