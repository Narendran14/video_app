# Video Upload Frontend

Modern Vite + React frontend for managing a video upload pipeline with role-based access control, polished UI, and a full mock mode so you can demo the experience without wiring a backend.

## Highlights

- 🎯 **Role-based dashboard** – Viewer, Editor, and Admin roles with tailored permissions and UI states
- 🚀 **Premium UI** – Glassmorphism top bar, modern cards, soft gradients, responsive layout, and darkened video modals
- 📹 **Upload pipeline simulation** – Multi-stage progress tracker (upload, process, analyze, finalize)
- 🏷️ **Status intelligence** – Color-coded badges for Safe / Processing / Flagged / Rejected videos plus filter controls
- 🗃️ **Library management** – Modal playback, delete controls (Editor/Admin), and instant refresh via localStorage persistence
- 🔐 **Mock authentication** – Signup / login shell with quick demo role buttons and persisted session

## Quick Start

```powershell
cd frontend
npm install
npm run dev
```

Visit the URL shown in the terminal (typically http://localhost:5174).

## Demo Accounts

Use any credentials or tap the quick-role buttons on the login screen. Suggested emails:

- `viewer@test.com` → Viewer (read-only, sees safe videos)
- `editor@test.com` → Editor (upload + manage videos)
- `admin@test.com` → Admin (full control)

All state (auth + uploads) persists in `localStorage`.

## Role Permissions

| Role   | Upload | Manage | View flagged | User management |
|--------|--------|--------|--------------|-----------------|
| Viewer | ❌     | ❌     | ❌           | ❌              |
| Editor | ✅     | ✅     | ✅           | ❌              |
| Admin  | ✅     | ✅     | ✅           | ✅ (placeholder) |

Viewers are shown only safe content and cannot access filters or delete buttons. Editors and Admins see the upload panel, filter controls, and destructive actions.

## Project Structure

```

├── App.jsx                # Shell layout, auth gating, role-aware panels
├── styles.css             # Design system (buttons, cards, modal, auth screen)
├── components/
│   ├── Login.jsx          # Registration/login mock with quick role presets
│   ├── UploadForm.jsx     # Drag-and-drop upload with staged progress
│   └── VideoList.jsx      # Filterable grid + modal playback experience
└── context/
    └── AuthContext.jsx    # Persists role/email/name to localStorage
```

## What’s New in This Iteration

- ✨ Elevated the entire design with gradients, glassmorphism, and refined typography
- 🧑🏻‍💻 Improved authentication screen with demo shortcuts and validation
- 📦 Added user metadata (email/name) to the auth context and upload records
- 🧭 Rebuilt the upload form: drag target, role badge, staged progress indicator
- 🗂️ Reimagined the video list cards, filters, and hover states
- 🎬 Added a cinematic modal overlay for playback (with background scroll lock)

## Next Steps (When Backend Is Ready)

1. Replace mock functions in `UploadForm.jsx` and `VideoList.jsx` with real API calls
2. Hook `AuthContext` into your auth endpoints (login/register, token handling)
3. Swap `URL.createObjectURL` for CDN/storage URLs returned by your backend
4. Extend role permissions or audit trails as your product requires

## Production Build

```powershell
npm run build
npm run preview
```

The optimized build lands in `dist/`.

---

Need the frontend wired to your existing backend APIs? Drop the endpoint specs (upload, list, stream, auth) and we can hook everything together quickly.

