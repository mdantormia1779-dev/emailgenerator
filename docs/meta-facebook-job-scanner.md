# Meta / Facebook Job Scanner & Discovery Integration

This document serves as the complete technical, operational, and security guide for the **Meta / Facebook Job Scanner** within the **Personal Email Generator** platform.

---

## 1. Architectural Overview & Design Principles

The Meta Job Scanner automated discovery system was built to discover developer opportunities relevant to your profile, match and score them transparently against your technical resume, and prepare customized application drafts for human review.

```
+-----------------------------------------------------------------------------------+
|                        AUTOMATED DISCOVERY & SYNC PIPELINE                        |
|                                                                                   |
|  START -> Query Supported Meta Endpoints -> Follow API Cursors (paging.next)     |
|        -> Normalize Jobs -> Deduplicate (SHA-256) -> Match Resume & Calculate     |
|        -> Save to Database (Status: MATCHED / DISCOVERED) -> Complete             |
+------------------------------------------+----------------------------------------+
                                           |
                                           v
+-----------------------------------------------------------------------------------+
|                           HUMAN-IN-THE-LOOP SAFETY FLOW                           |
|                                                                                   |
|  Discovered Job -> Generate Email (DRAFT only) -> Review Screen (/applications/[id])
|  -> 4 Manual Confirmations -> User clicks Send -> EXISTING UNTOUCHED GMAIL        |
+-----------------------------------------------------------------------------------+
```

---

## 2. Meta Developer App Setup

To connect to official Meta APIs:

1. **Create an App:**
   - Go to [developers.facebook.com](https://developers.facebook.com/) and sign in.
   - Click **My Apps** &rarr; **Create App**.
   - Choose **Other** or **Business** as the app use case.
   - Set an App Display Name (e.g., `Job Discovery Scanner`) and enter your contact email.
   - Complete creation to reach the App Dashboard.

2. **Add Facebook Login Product:**
   - In the App Dashboard under **Add Products to Your App**, click **Set Up** on **Facebook Login**.
   - Select **Web**.
   - In the left sidebar, navigate to **Facebook Login** &rarr; **Settings**.
   - Enable **Client OAuth Login** and **Web OAuth Login**.
   - Enable **Enforce HTTPS** (required in production).

3. **Configure Valid OAuth Redirect URIs:**
   - Under **Valid OAuth Redirect URIs**, specify:
     - **Local Development:** `http://localhost:3000/api/integrations/meta/callback`
     - **Vercel Production:** `https://personalemailgenerator.vercel.app/api/integrations/meta/callback`
   - Click **Save Changes**.

---

## 3. Required Permissions & Meta App Review

### Standard / Development Access
In **Development Mode**, any developer or admin listed in your Meta App's **Roles** section can connect their account and test all supported endpoints without waiting for App Review.

### Required Permissions
| Permission | Purpose | App Review Required? |
|---|---|---|
| `public_profile` | Retrieves user name and account ID for connection display | Standard Access (Auto-approved) |
| `email` | User email identification | Standard Access (Auto-approved) |
| `pages_show_list` | Discovers Pages and communities managed by the user | Advanced Access (App Review for public users) |
| `pages_read_engagement` | Reads published feed posts from authorized Pages via Graph API | Advanced Access (App Review for public users) |

### Meta App Review Requirements (for Live Public Users)
- **Business Verification:** Requires official company documentation (e.g. utility bill or business license).
- **Video Demonstration:** Demonstrating how `pages_show_list` and `pages_read_engagement` are used to discover job announcements.
- **Privacy Policy:** Published publicly on your domain.

---

## 4. API Limitations & Why Browser Scraping Is Prohibited

### Meta Technical Boundaries
1. **Deprecation of "Jobs on Facebook":** In early 2023, Meta formally discontinued the native "Facebook Jobs" feature and decommissioned its job board endpoints.
2. **Global Feed Search Deprecation:** The `/search?type=post` endpoint was permanently closed by Meta. Third-party apps cannot query arbitrary public posts across Facebook timelines.
3. **Personal News Feed Deprecation:** `/me/home` is deprecated. Third-party apps cannot query the authenticated user's personal News Feed.
4. **Facebook Groups API Shutdown:** On April 22, 2024, Meta permanently shut down the Facebook Groups API (`groups_access_member_info`), removing all automated read/search capabilities for Facebook Groups.
5. **Arbitrary Pages:** Querying arbitrary third-party pages requires Page Public Content Access (PPCA), which requires strict Meta Business Verification and contracts.

### Why We Do NOT Use Headless Browser Scraping / Anti-Bot Bypass
- **Platform Terms & Legal Compliance:** Section 3.2.1 of Meta’s Commercial Terms strictly forbids automated data gathering, credential harvesting, cookie injection, and CAPTCHA bypassing.
- **Account Security:** Scraping tools inevitably result in temporary or permanent IP bans, Facebook account lockouts, and security checkpoints.
- **Compliant Alternative Implemented:**
  - Official Meta OAuth 2.0 connection with 60-day long-lived tokens.
  - Cursor-based feed synchronization for authorized Pages via Graph API v26.0 (`pages_show_list` & `pages_read_engagement`).
  - Compliant structured manual ingestion ("Import a Facebook Job Link/Post manually") for real developer job postings found in groups or external boards.

---

## 5. Automated Job Discovery & Pagination/Cursor Implementation

The discovery service is implemented in:
[`src/server/services/meta-job-scanner.service.ts`](file:///c:/Web%20Development/emailgenerator/src/server/services/meta-job-scanner.service.ts)

### Dedicated Functions
- `searchJobs(keyword, options)`: Queries authorized page feeds using Graph API v26.0 (configurable via `META_GRAPH_API_VERSION`).
- `fetchNextPage(nextCursorOrUrl, accessToken)`: Follows cursor-based pagination (`paging.cursors.after` and `paging.next`) automatically.
- `normalizeJob(raw)`: Formats posts into standardized `NormalizedJobOpportunity` records, detecting locations, employment types, and emails.
- `calculateMatchScore(job, profile)`: Scores postings against candidate skills and target developer roles.
- `removeDuplicates(jobs, existingHashes)`: Filters out duplicates using SHA-256 content hashes (`computeJobHash`) and source IDs.
- `syncJobs(userId, options)`: Orchestrates the multi-step sync workflow.

---

## 6. Rate Limiting & Safe API Handling

The integration includes exponential backoff in `fetchWithBackoff`:
- Detects HTTP `429 Too Many Requests`.
- Detects Meta Graph API rate limit error codes: `4`, `17`, `32`, `613`.
- Backoff Formula: `delay = Math.pow(2, attempt) * 1000 + Math.random() * 300` (up to 3 retries).
- Automatically aborts or slows down if limits are reached.

---

## 7. Resume Matching & Scoring Architecture

Target roles evaluated:
- `Frontend Developer`, `React Developer`, `Next.js Developer`, `MERN Stack Developer`, `Full Stack Developer`, `JavaScript Developer`, `TypeScript Developer`, `Node.js Developer`, `Software Engineer`, `Web Developer`.

Target skills evaluated:
- `React`, `Next.js`, `TypeScript`, `JavaScript`, `Node.js`, `Express.js`, `MongoDB`, `PostgreSQL`, `Prisma`, `REST API`, `Tailwind CSS`, `Git`, `GitHub`, `Docker`, `AWS`.

### Scoring Tiers
- **90–100:** `Excellent Match`
- **75–89:** `Strong Match`
- **60–74:** `Potential Match`
- **Below 60:** `Low Match`

Every opportunity stores `matchScore`, `matchedSkills`, and a transparent `matchReason` explaining why the posting matched your profile.

---

## 8. Strict Human-in-the-Loop Email Workflow

```
Discovered Job -> Click "Generate Email" -> Application Created (Status: DRAFT)
-> Redirects to /applications/[id] -> User Reviews Content & Tailors Draft
-> 4 Mandatory Human Checkboxes Verified -> User Clicks "Send via Gmail"
-> Existing Untouched Gmail Integration Dispatches Email
```

**Security Invariant:** Application emails are **NEVER** autonomously or automatically dispatched. Dispatch is exclusively manual.

---

## 9. Environment Variables Configuration

### Local `.env`
```env
# Meta / Facebook App Credentials
META_APP_ID=your_meta_app_id_here
META_APP_SECRET=your_meta_app_secret_here
META_REDIRECT_URI=http://localhost:3000/api/integrations/meta/callback

# Optional Custom Search Overrides
META_GRAPH_API_VERSION=v26.0
META_JOB_SEARCH_KEYWORDS=["Frontend Developer","React Developer","Next.js Developer","Node.js Developer"]
META_JOB_LOCATIONS=["Bangladesh","Remote"]
```

### Production (Vercel)
In your Vercel Project Settings under **Environment Variables**:
- `META_APP_ID`: Your Meta App ID
- `META_APP_SECRET`: Your Meta App Secret (Keep secret!)
- `META_REDIRECT_URI`: `https://personalemailgenerator.vercel.app/api/integrations/meta/callback`

> **Note:** Never prefix Meta credentials with `NEXT_PUBLIC_` to prevent leaking secrets to browser bundles.

---

## 10. Local Setup & Testing Commands

1. **Install dependencies & push database schema:**
   ```bash
   npm install
   npx prisma db push
   npx prisma generate
   ```

2. **Run test suite:**
   ```bash
   npm test
   ```

3. **Start local dev server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000/facebook-scanner` and `http://localhost:3000/integrations`.

4. **Verify production build:**
   ```bash
   npm run build
   ```

---

## 11. Vercel Deployment Steps

1. Push your repository to GitHub.
2. In Vercel, import the repository or link the project.
3. Add the required environment variables:
   - `DATABASE_URL` (Neon PostgreSQL)
   - `JWT_SECRET`
   - `TOKEN_ENCRYPTION_KEY`
   - `META_APP_ID`
   - `META_APP_SECRET`
   - `META_REDIRECT_URI=https://personalemailgenerator.vercel.app/api/integrations/meta/callback`
   - `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET`, `GMAIL_REDIRECT_URI` (Untouched Gmail setup)
4. Deploy the project.
5. In Meta Developer Console, verify that `https://personalemailgenerator.vercel.app/api/integrations/meta/callback` is listed under Valid OAuth Redirect URIs.
