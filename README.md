# Qpact v2 — Talent as a Service

Production-quality frontend. React 18 + TypeScript + Tailwind CSS + Framer Motion + React Router + React Hook Form + Zod.

## Quick start

```bash
unzip qpact-v2.zip && cd qpact
npm install
npm run dev       # http://localhost:5173
npm run build     # production build
```

## Demo credentials

| Role      | Email                   | Password   |
|-----------|-------------------------|------------|
| Client    | client@acme.com         | qpact123   |
| Recruiter | asha@talentbridge.in    | qpact123   |
| **Admin** | **admin@qpact.io**      | **admin123** |

> Create Account: enter any 6-digit OTP. `000000` simulates failure.

## Folder structure

```
src/
  types/          Domain types (Candidate, User, Role…)
  constants/      Technologies, skills, page size, demo creds
  lib/            mockData, utils, validation schemas
  store/          auth · resources · cart · toast (React Context)
  shared/
    components/
      ui/         Button, Input, Modal, ConfirmDialog, CandidateCard,
                  Badge, Pagination, Toast, OTP, Logo…
      layout/     AppShell, Sidebar, Topbar, PageTransition
    hooks/        (ready for custom hooks)
  modules/
    auth/         LoginPage, CreateAccountPage, ForgotPasswordPage,
                  OtpModal
    client/       ClientDashboard, CandidateDetailsPage, CartPage
    recruiter/    RecruiterDashboard, AddResourcePage
    admin/        AdminOverview, AdminRecruiters, AdminCandidates,
                  AdminClients, AdminAddCandidate
  routes/         ProtectedRoute (auth + role guard)
  App.tsx         All routes
  main.tsx        Root render + providers
```

## What's in each module

### Client
- Talent pool: 60 candidates from all recruiters (20 + 30 + 10)
- Collapsible filter bar: technology, skill, experience slider, rate slider, search
- Candidate cards: photo centred at top, name, tech, experience, rate, skills, documents
- Candidate detail page with downloadable reports
- Shortlist (cart): add/remove/clear, Contact Sales modal (single instance, no duplicates)

### Recruiter
- Card view only (no summary stat cards, no table)
- Own candidates only — data isolation enforced at store level
- Add / Edit / Delete with form validation and document uploads
- Pagination on card grid

### Admin (new)
- Overview dashboard with platform stats
- Recruiter management: create, list, edit, delete
- Candidate management: list all, filter (tech/skill/exp/rate/search), add, edit, delete, pagination
- Client list with search

### Data sync
All three roles share a single `ResourceProvider`. Any add/edit/delete by recruiter or admin instantly reflects on the client dashboard.
