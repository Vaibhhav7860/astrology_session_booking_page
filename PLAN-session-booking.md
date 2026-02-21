# Project Plan: Session Booking System for "INTO THE STAR"

## Overview
Architect and successfully implement a sophisticated session booking system for astrologer Priya Shree Mandal under the brand "INTO THE STAR". The system has a public-facing booking page for users and a secure admin/dashboard for the astrologer to manage availability and view successful bookings. The design must feature a unique "liquid-glass" and "glassmorphism" aesthetic with an astrology theme, explicitly avoiding common purple/blue gradients.

## Project Type
**WEB & BACKEND**
- Primary Agents: `frontend-specialist`, `backend-specialist`, `database-architect`

## Success Criteria
1. **Dynamic Pricing:** Real-time AED to local currency conversion using ExchangeRate-API based on selected country code.
2. **Availability Management:** Astrologer can securely log in via Environment Variable Password to add/edit IST/GST availability.
3. **Complex Form Inputs:** Accurate capture of DOB, exact Time of Birth, Time Zone (IST/GST), and responsive Session Slot selection.
4. **Seamless Payment:** Checkout redirects smoothly to superprofile.io.
5. **Post-Payment Flow:** Redirects to a themed Thank You page with order details and tailored instructions.
6. **Automated Notifications:** Instant email to user (Booking Confirmation details) and admin (New Booking alert) via Resend.
7. **Premium UI/UX:** High-end liquid-glass and glassmorphism aesthetic without using cliché colors. Fully responsive and SEO-optimized.

## Tech Stack
### Frontend (Next.js)
- **Framework:** Next.js (React)
- **Styling:** Tailwind CSS (Custom liquid-glass, glassmorphism utilities, animations)
- **Emails:** Resend + React Email (Beautiful structured emails)
- **Currency API:** ExchangeRate-API (Client-side / API route usage)
- **Payment Gateway:** superprofile.io integration (Redirection)

### Backend (FastAPI)
- **Primary Backend/Database Interaction:** FastAPI (Python) will handle ALL backend logic, including heavy data processing (availability intersecting, DB management) AND lightweight tasks (triggering Resend emails, fetching currency data).
- **Database:** MongoDB
- **ODM:** PyMongo (Synchronous driver for MongoDB) + Pydantic for validation.
- **Admin Auth:** Simple Environment Variable Password verification on the Admin portal.

## File Structure (Proposed)
```text
/
├── frontend/                     # Next.js Application
│   ├── src/
│   │   ├── app/
│   │   │   ├── (public)/         # Booking flow
│   │   │   │   ├── page.tsx      # Main Booking Page
│   │   │   │   └── thank-you/    # Post-payment page
│   │   │   ├── admin/            # Admin portal
│   │   │   │   ├── login/        
│   │   │   │   └── dashboard/    
│   │   ├── components/
│   │   │   ├── ui/               # liquid-glass, glassmorphism inputs, buttons, cards
│   │   │   └── form/             # Booking form components
│   │   └── lib/                  # Utils, API clients (requests to FastAPI)
│   └── public/                   # Animated brand logos, static assets
└── backend/                      # FastAPI Application
    ├── main.py                   # FastAPI entry point
    ├── api/                      # Routing (availability, bookings, emails, currency)
    ├── core/                     # Config, security (Admin password check)
    ├── models/                   # Pydantic Models
    ├── services/                 # Business logic (Resend client, ExchangeRate)
    └── templates/                # Email HTML templates (or React Email rendered to static)
```

## Task Breakdown

### 1. Database & Backend Setup [P0]
- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`, `python-patterns`
- **Dependencies:** None
- **INPUT:** Project initialized, FastAPI & MongoDB credentials.
- **OUTPUT:** FastAPI server connected to MongoDB, defining collections for `Availability` and `Bookings`. API endpoints for fetching/creating availability and saving bookings.
- **VERIFY:** cURL/Postman requests to FastAPI routes successfully write to and read from MongoDB.

### 2. Admin Security & Dashboard API [P0]
- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`
- **Dependencies:** Task 1
- **INPUT:** FastAPI running.
- **OUTPUT:** Endpoint to verify Admin Environment Variable Password. Endpoint to fetch all bookings in tabular data format. Endpoint to add/remove available time slots in IST/GST.
- **VERIFY:** Incorrect password rejects request. Correct password returns JWT/Session token allowing access to dashboard APIs.

### 3. Frontend Skeleton & Design System [P1]
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `tailwind-patterns`
- **Dependencies:** None
- **INPUT:** Next.js initialized.
- **OUTPUT:** Global CSS with liquid glass design tokens (avoiding purple/blue). Reusable `<GlassCard>`, `<FluidInput>`, and animated brand logo components. Fully SEO optimized layout wrapper.
- **VERIFY:** Next.js compiles. Visual inspection matches the premium liquid-glass, glassmorphism aesthetic constraints.

### 4. Admin Dashboard UI [P1]
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`
- **Dependencies:** Task 2, Task 3
- **INPUT:** Admin backend APIs and glass components.
- **OUTPUT:** `/admin/login` page and a protected `/admin/dashboard` page. UI for the astrologer to view the tabular bookings and manage availability slots.
- **VERIFY:** Successfully log in using the simple password. Can view simulated bookings and add new valid slots.

### 5. Session Booking Form & Dynamic Pricing [ P1]
- **Agent:** `frontend-specialist`
- **Skills:** `frontend-design`, `react-best-practices`
- **Dependencies:** Task 3
- **INPUT:** Base AED price from astrologer config.
- **OUTPUT:** The public booking form capturing Personal Details, Birth Details (Calendar + precise HH:MM time), and Contact. Dynamic pricing implementation: selecting country code queries FastAPI which returns the real-time converted string.
- **VERIFY:** Selecting "US" shows USD price accurately fetched from FastAPI (which uses ExchangeRate-API). Form validates all inputs correctly.

### 6. Slot Selection & Payment Integration [P2]
- **Agent:** `frontend-specialist`, `backend-specialist`
- **Skills:** `api-patterns`
- **Dependencies:** Task 1, Task 5
- **INPUT:** FastAPI availability endpoints, superprofile.io integration docs.
- **OUTPUT:** Form queries FastAPI for available slots based on the selected date. Converts display to IST/GST based on user toggle. Upon submit, formats payload and initiates redirect to superprofile.io.
- **VERIFY:** Only available slots are clickable. Form submit logs the correct data and triggers the external redirect.

### 7. Post-Payment & Email Notifications [P2]
- **Agent:** `backend-specialist`
- **Skills:** `api-patterns`, `python-patterns`
- **Dependencies:** Task 5, Task 6
- **INPUT:** Resend API key, successful payment webhook/redirect data.
- **OUTPUT:** `/thank-you` page displaying the targeted thank you note and instructions. FastAPI route using FastAPI-Mail or Resend Python SDK to send distinct styled emails to the User and Astrologer.
- **VERIFY:** Accessing thank-you page displays correct data. Test booking triggers both user and admin emails with correct aesthetics and data.

## ✅ PHASE X COMPLETE
- Lint: ✅ Pass
- Security: ✅ No critical issues
- Build: ✅ Success
- Color Audit: ✅ Pass (No purple or violet hex)
- Date: 2026-02-21
