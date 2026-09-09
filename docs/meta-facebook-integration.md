# Meta / Facebook Job Discovery Integration Guide

This guide documents the official Meta (Facebook) Job Discovery architecture, setup instructions, permissions, security controls, and platform boundaries implemented in the **Personal Email Generator** system.

---

## 1. Architectural Overview & Policy Compliance

### Meta Platform Realities & Graph API Boundaries
1. **Deprecation of Facebook Jobs:** Meta formally discontinued the native "Jobs on Facebook" feature in early 2023. There is no official global job board API provided by Meta.
2. **Global Feed Search Deprecation:** The `/search?type=post` endpoint was permanently deprecated by Meta. Third-party applications cannot perform arbitrary public feed keyword searches across Facebook users.
3. **Facebook Groups Access:** Accessing group posts via Graph API requires the `groups_access_member_info` permission, which mandates **Meta Business Verification**, an App Review submission with video proof, and the explicit installation of the app by the Group Admin inside the Facebook Group settings.
4. **Scraping Prohibition:** Meta strictly prohibits automated headless scraping, account password automation, session cookie extraction, and CAPTCHA circumvention under Section 3.2.1 of Meta’s Commercial Terms and Platform Terms.

### Our Compliant Architecture
To provide a sustainable, safe, and policy-compliant workflow, this integration delivers:
- **Official Meta OAuth 2.0 Flow:** Secure account connection with state-based CSRF protection, short-lived token exchange, and automatic upgrade to 60-day long-lived tokens.
- **Pages Feed Discovery:** Automatically fetches posts from Facebook Pages the user manages or has authorized via `pages_show_list` and `pages_read_engagement`.
- **Compliant Structured Post Ingestion:** Supports ingestion of specific developer job posts and group discussion URLs, parsing contact emails, locations, titles, and technical requirements.
- **Deterministic Deduplication:** Uses SHA-256 content hashing (`computeJobHash`) and `sourcePostId` checks to ensure no duplicate job records or repetitive email drafts are created.
- **Profile Resume Matching:** Evaluates discovered job postings against your developer profile (React, Next.js, Node.js, TypeScript, Full Stack Developer, etc.) and assigns transparent scoring tiers (90-100: Excellent Match, 75-89: Strong Match, 60-74: Potential Match, <60: Low Match).
- **Strict Human-in-the-Loop Safety:** Generated emails are saved as `DRAFT` applications (`/applications/[id]`). **Emails are NEVER automatically sent.** Final dispatch is handled exclusively through your existing Gmail integration following a 4-point manual verification modal.

---

## 2. Meta Developer App Setup Guide

### Step 1: Create a Meta App
1. Go to [developers.facebook.com](https://developers.facebook.com/) and log in with your Facebook account.
2. Click **My Apps** → **Create App**.
3. Select **Other** or **Business** as the use case.
4. Set an App Display Name (e.g., `Developer Job Discovery Assistant`) and enter your contact email.
5. Click **Create App**.

### Step 2: Configure Facebook Login
1. In your App Dashboard under **Add Products to Your App**, locate **Facebook Login** and click **Set Up**.
2. Select **Web** as the platform.
3. In the left navigation, navigate to **Facebook Login** → **Settings**.
4. Under **Valid OAuth Redirect URIs**, enter:
   - For local development: `http://localhost:3000/api/integrations/meta/callback`
   - For production: `https://your-production-domain.com/api/integrations/meta/callback`
5. Ensure **Client OAuth Login** and **Web OAuth Login** are enabled.
6. Click **Save Changes**.

### Step 3: Configure Required Permissions
In the Meta App Dashboard under **App Review** → **Permissions and Features**:
- `public_profile` (Default / Standard Access)
- `email` (Default / Standard Access)
- `pages_show_list` (Required for discovering Pages you manage)
- `pages_read_engagement` (Required for reading public posts from authorized Pages)

> **Note on Development Mode:** In Development Mode, your App can freely access any Facebook Page or account registered as an **Administrator**, **Developer**, or **Tester** in the App's **Roles** section without waiting for Meta App Review approval.

---

## 3. Environment Variables Configuration

Add the following keys to your `.env` file (refer to `.env.example`):

```env
# Meta / Facebook App Credentials
META_APP_ID=your_facebook_app_id_here
META_APP_SECRET=your_facebook_app_secret_here
META_REDIRECT_URI=http://localhost:3000/api/integrations/meta/callback
```

> **Security Note:** Tokens are encrypted in the database using AES-256-GCM encryption with your `TOKEN_ENCRYPTION_KEY`. Never expose your `META_APP_SECRET` on the client side.

---

## 4. End-to-End Workflow

```
       +------------------------------------+
       |  Connect Meta Account via OAuth    |
       |  (/integrations -> Meta Card)      |
       +-----------------+------------------+
                         |
                         v
       +------------------------------------+
       |   Discover & Ingest Job Posts      |
       |   (Pages API & Compliant Ingestion)|
       +-----------------+------------------+
                         |
                         v
       +------------------------------------+
       |   Evaluate Resume Match & Score    |
       |   (Target Skills & Role Matching)  |
       +-----------------+------------------+
                         |
                         v
       +------------------------------------+
       |   Save to PostgreSQL via Prisma    |
       |   (Status: MATCHED or DISCOVERED)  |
       +-----------------+------------------+
                         |
                         v
       +------------------------------------+
       |   Generate AI Draft Application    |
       |   (Status: EMAIL_GENERATED)        |
       +-----------------+------------------+
                         |
                         v
       +------------------------------------+
       |   Manual Human Review              |
       |   (/applications/[id])             |
       +-----------------+------------------+
                         |
                         v
       +------------------------------------+
       |   Final Dispatch via Existing      |
       |   Untouched Gmail Integration      |
       +------------------------------------+
```

---

## 5. API Reference

| Endpoint | Method | Description |
|---|---|---|
| `/api/integrations/meta/connect` | `GET` | Initiates OAuth flow, sets CSRF state cookie, redirects to Meta dialog. |
| `/api/integrations/meta/callback` | `GET` | Validates CSRF state, exchanges code for long-lived token, saves encrypted credentials. |
| `/api/integrations/meta/status` | `GET` | Returns connection status, account name, and token expiration. |
| `/api/integrations/meta/disconnect` | `POST` | Marks account disconnected and clears active session. |
| `/api/jobs/facebook/search` | `GET` | Filters discovered posts by status, tier, keywords, and skills. |
| `/api/jobs/facebook/sync` | `POST` | Triggers sync from connected Pages and compliant structured posts. |
| `/api/jobs/matches` | `GET` | Returns profile-matched opportunities sorted by match score. |
| `/api/jobs/facebook/[id]/status` | `PATCH` | Updates status (`APPROVED`, `REJECTED`, `REVIEW_REQUIRED`). |
| `/api/jobs/facebook/[id]/generate-email` | `POST` | Generates a draft application email linked to manual review. |

---

## 6. Safety Audit & Verification Checklist

- [x] **No automated email sending:** System strictly prohibits background dispatch; human confirmation is mandatory.
- [x] **Existing Gmail integration untouched:** `src/services/gmail.service.ts` and `/api/integrations/gmail/*` remain completely intact.
- [x] **Zero scraping / account hijacking:** No browser puppeteering or session stealing.
- [x] **AES-256-GCM Encryption:** All access tokens encrypted at rest.
- [x] **Deduplication:** Hashing ensures zero repetitive spam.
