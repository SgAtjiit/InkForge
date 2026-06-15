# InkForge

<p name="tech-stack-badges" align="center">
  <img src="https://img.shields.io/badge/React_19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
  <img src="https://img.shields.io/badge/Vite_6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS v4" />
  <img src="https://img.shields.io/badge/Node.js_v22-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express_5-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express 5" />
  <img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/NeonDB-00E599?style=for-the-badge&logo=neon&logoColor=black" alt="Neon Serverless" />
  <img src="https://img.shields.io/badge/Drizzle_ORM-C5F74F?style=for-the-badge&logo=drizzle&logoColor=black" alt="Drizzle ORM" />
  <img src="https://img.shields.io/badge/OpenRouter_AI-FF6F61?style=for-the-badge&logo=openai&logoColor=white" alt="OpenRouter AI" />
  <img src="https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white" alt="Cloudinary" />
  <img src="https://img.shields.io/badge/JWT_Auth-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT Auth" />
  <img src="https://img.shields.io/badge/Nodemailer-22B573?style=for-the-badge&logo=nodemailer&logoColor=white" alt="Nodemailer" />
</p>

<p align="center">
  <strong>InkForge</strong> is a fullstack publishing & blogging platform engineered for technical writers, software architects, and developer communities. Featuring automated LLM-powered content moderation, dual-mode feed pagination, instant admin publishing, and glassmorphic light design system.
</p>

---

## 🌟 Key Highlights & Core Features

### 🔐 1. Enterprise JWT Authentication & Token Rotation
- **Dual-Token System**: Short-lived Access Tokens (15-minute expiry) paired with HttpOnly, `SameSite=Strict` Refresh Tokens (7-day expiry).
- **Automated Refresh Queue**: Client-side Axios interceptors automatically capture `401 Unauthorized` responses and silently refresh access tokens without disrupting user flow.
- **Stateful Revocation**: Database-backed `refresh_tokens` table enables token family rotation, multi-device tracking, and instant security revocation.

### 🤖 2. OpenRouter AI Automated Content Moderation Pipeline
- **Asynchronous Processing**: Non-blocking `setImmediate` execution inspects submitted articles out-of-band via OpenRouter (`meta-llama/llama-3.3-70b-instruct`).
- **Structured JSON Moderation**: AI evaluates posts for code safety, offensive language, spam, and technical relevance, returning structured JSON flags (`severity`, `issues`, `suggestedContent`).
- **Automated Routing**: Safe posts transition to `published`, while flagged posts route to `needs_review` for human admin inspection.

### 👑 3. Admin Moderation Inspector & Instant Publishing
- **Role-Based Access Control (RBAC)**: Secure `/admin` route guard protecting privileged platform operations.
- **Moderation Inspector Modal**: Interactive side-by-side diff modal comparing original post content against AI-suggested modifications.
- **Admin Direct Publish**: Admins bypass moderation queues using an **Instant Publish** action for immediate article distribution.

### ⚡ 4. Dual-Mode Feed & Search Architecture
- **Home Feed (`/`)**: Cursor-based infinite scrolling feed optimized for real-time content discovery.
- **Explore Search (`/explore`)**: Offset-paginated full-text search grid supporting query filters, tag browsing, and jump-to-page navigation (`< 1 2 3 4 5 >`).

### 🖼️ 5. Direct Signed Cloudinary Image Uploads
- **Secure Signatures**: Server generates short-lived SHA-256 HMAC upload signatures (`/api/v1/upload/signature`), allowing client browsers to upload images directly to Cloudinary CDN.
- **Progress Tracking**: Drag-and-drop file upload UI with real-time percentage upload progress bars and instant preview thumbnails.

### 💬 6. Threaded Comments & Bookmark Gallery
- **Nested Comment Trees**: Self-referencing PostgreSQL relation (`parentCommentId`) supporting multi-level nested discussion threads.
- **Saved Posts Gallery**: Instant bookmarking functionality with dedicated personal gallery view (`/saved`).

### 🎨 7. Stitch Light Theme & Glassmorphism
- **Design System**: Curated color palette featuring Plus Jakarta Sans headlines, Inter body typography, Slate-50 background canvas (`#f8fafc`), and indigo accent primary tokens.
- **Micro-Interactions**: Glassmorphic white cards (`.glass-card`), soft borders, smooth hover animations, and toast notification alerts.

---

## 📐 System Architecture

```
                                  +-----------------------+
                                  |   React 19 + Vite     |
                                  |   Frontend Client     |
                                  +-----------+-----------+
                                              |
                                HTTP REST / JSON Payload
                                              |
                                              v
                                  +-----------------------+
                                  |   Express 5 Backend   |
                                  |   Node.js (v22 Engine)|
                                  +---+-------+-------+---+
                                      |       |       |
                 +--------------------+       |       +--------------------+
                 |                            |                            |
                 v                            v                            v
   +---------------------------+  +------------------------+  +--------------------------+
   |   Neon PostgreSQL DB      |  |  OpenRouter AI (Llama) |  |   Cloudinary CDN Storage |
   |  (Drizzle ORM Driver)     |  |  (Content Moderation)  |  |  (Direct Signed Uploads) |
   +---------------------------+  +------------------------+  +--------------------------+
```

---

## 🗄️ Database Schema & Relational Models

InkForge utilizes **Neon PostgreSQL** managed via **Drizzle ORM** with 6 relational tables:

1. `users`: UUID Primary Key, email (unique, indexed), bcrypt password hash, role (`user`, `admin`), status (`active`, `suspended`, `banned`), avatar URL, bio.
2. `posts`: UUID Primary Key, FK -> `users.id`, title, content, slug (unique, indexed), status (`draft`, `pending`, `needs_review`, `approved`, `rejected`, `published`), `aiFlags` (JSONB), `aiSuggestedContent`, `publishedAt`.
3. `comments`: UUID Primary Key, FK -> `posts.id`, FK -> `users.id`, content, `parentCommentId` (Self-referencing FK for nested threads), status (`visible`, `flagged`, `deleted`).
4. `saved_posts`: Composite PK (`userId`, `postId`), savedAt timestamp.
5. `refresh_tokens`: UUID Primary Key, FK -> `users.id`, tokenHash, expiresAt, revoked status, deviceInfo.
6. `notifications`: UUID Primary Key, FK -> `users.id`, type, message, isRead.

---

## 🛠️ Tech Stack & Dependencies

### **Backend (`backend/`)**
- **Runtime Engine**: Node.js ES Modules (v22+)
- **Web Framework**: Express v5 (`express`)
- **Database & ORM**: PostgreSQL (Neon Serverless) + Drizzle ORM (`drizzle-orm`, `drizzle-kit`)
- **Security & Auth**: JWT (`jsonwebtoken`), Bcrypt (`bcryptjs`), Helmet (`helmet`), Rate Limiting (`express-rate-limit`), CORS (`cors`)
- **Validation**: Envalid (`envalid`), Zod (`zod`)
- **Media & Email**: Cloudinary SDK (`cloudinary`), Nodemailer (`nodemailer`)

### **Frontend (`frontend/`)**
- **Framework & Compiler**: React 19 + Vite (`@vitejs/plugin-react`)
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + Lucide React Icons (`lucide-react`)
- **Routing & HTTP**: React Router v7 (`react-router-dom`), Axios (`axios`)

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- Node.js v20+ installed
- Neon PostgreSQL connection string (or local PostgreSQL database)
- Cloudinary Account & API credentials (optional for image uploads)
- OpenRouter API Key (optional for AI moderation)

### 1. Repository Setup
```bash
git clone https://github.com/SgAtjiit/InkForge.git
cd InkForge
```

### 2. Backend Configuration & Setup
```bash
cd backend
npm install
```

Create a `.env` file in `backend/`:
```env
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173

# Database Connection (Neon PostgreSQL)
DB_URL=postgresql://neondb_owner:your_password@ep-example.us-east-2.aws.neon.tech/neondb?sslmode=verify-full

# Default Admin Credentials
ADMIN_EMAIL=admin@inkforge.dev
ADMIN_PASSWORD=AdminPass123

# JWT Authentication Secrets
JWT_ACCESS_SECRET=your_jwt_access_secret_min_32_chars
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_SECRET=your_jwt_refresh_secret_min_32_chars
JWT_REFRESH_EXPIRY=7d

# Cloudinary Credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# OpenRouter AI Moderation
OPENROUTER_API_KEY=sk-or-v1-your_openrouter_api_key
OPENROUTER_MODEL=meta-llama/llama-3.3-70b-instruct
```

Run database schema setup and seed 50 technical articles:
```bash
npm run db:seed
npm run dev
```

### 3. Frontend Configuration & Setup
In a new terminal window:
```bash
cd frontend
npm install
```

Create a `.env` file in `frontend/`:
```env
VITE_API_URL=http://localhost:5000/api/v1
```

Start the Vite development server:
```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🔐 Default Demo Accounts

| Role | Email | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@inkforge.dev` | `AdminPass123` | Full Access + `/admin` Moderation Dashboard + Instant Publishing |
| **User** | `alex.rivera@dev.io` | `UserPass123!` | Post Creation, Threaded Comments, Bookmarks |

---

## 📡 API Reference Overview

| Domain | Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- | :--- |
| **Auth** | `POST` | `/api/v1/auth/signup` | Register new user account | ❌ No |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate user & receive HttpOnly cookies | ❌ No |
| **Auth** | `POST` | `/api/v1/auth/refresh` | Rotate access & refresh tokens | 🔒 Cookie |
| **Auth** | `POST` | `/api/v1/auth/logout` | Revoke refresh token & clear cookies | 🔒 Yes |
| **Posts** | `GET` | `/api/v1/posts/feed` | Cursor-based infinite scroll feed | ❌ No |
| **Posts** | `GET` | `/api/v1/posts/explore` | Offset-paginated search grid | ❌ No |
| **Posts** | `GET` | `/api/v1/posts/:slug` | Get single post details by slug | ❌ No |
| **Posts** | `POST` | `/api/v1/posts` | Create new post (triggers AI moderation) | 🔒 Yes |
| **Upload**| `GET` | `/api/v1/upload/signature` | Generate signed Cloudinary upload signature | 🔒 Yes |
| **Comments**| `POST`| `/api/v1/comments` | Add comment or reply to thread | 🔒 Yes |
| **Saved** | `POST` | `/api/v1/saved-posts/:postId` | Toggle post bookmark | 🔒 Yes |
| **Admin** | `GET` | `/api/v1/admin/pending` | List posts pending AI/Admin moderation | 👑 Admin |
| **Admin** | `PATCH`| `/api/v1/admin/posts/:id/decide`| Approve or reject post content | 👑 Admin |

---

## 📄 License

Distributed under the **ISC License**. See `LICENSE` for more information.
