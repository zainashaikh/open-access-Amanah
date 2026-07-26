# amanah-atlas-open-access-2026

# Amanah Atlas

Amanah Atlas is a DMV-focused student platform built to help Muslim students find volunteer opportunities, SSL forms, study-friendly halal places, resume support, and community-based opportunities in one place.

## What it does

- Helps students discover real volunteer, internship, mosque-based, and SSL opportunities.
- Lets users create and submit MCPS SSL forms.
- Shows halal-friendly cafes and restaurants for studying.
- Includes outreach features to message opportunity admins.
- Supports resume building and personalized recommendations.
- Includes an AI chatbot for guidance and student support.
- Supports Google sign-in and email sign-up with verification.

## Features

- Google OAuth login.
- Email sign-up with verification code.
- SSL form creation, filling, download, and admin submission.
- Sent & received SSL tracking.
- Study Cafes with filters and real location data.
- Mosque-based opportunities.
- Resume builder with generated bullet points.
- Personalized extracurricular recommendations.
- AI chatbot powered by Gemini.
- Dismissible notifications.
- Account deletion and re-signup support.

## Tech Stack

- Frontend: React / Next.js
- Backend: Supabase
- Authentication: Google OAuth + Supabase Auth
- AI: Google Gemini API via Google AI Studio
- Email: Resend or SendGrid
- Maps and places: Overpass API, Nominatim, Geoapify
- PDF generation: pdf-lib or Puppeteer

## APIs and Documentation Used

### Base44
- Base44 Docs: https://docs.base44.com/
- Base44 Backend: https://base44.com/backend

### Google / Gemini
- Google AI Studio / Gemini API Docs: https://ai.google.dev/gemini-api/docs
- Gemini API Reference: https://ai.google.dev/api
- Gemini All Methods: https://ai.google.dev/api/all-methods
- Gemini Document Processing: https://ai.google.dev/gemini-api/docs/document-processing
- Google OAuth 2.0: https://developers.google.com/identity/protocols/oauth2
- Google OAuth Consent Screen: https://developers.google.com/workspace/guides/configure-oauth-consent

### Supabase
- Supabase Docs: https://supabase.com/docs
- Supabase API Docs: https://api.supabase.com/api/v1
- Supabase Google Auth: https://supabase.com/docs/guides/auth/social-login/auth-google
- Supabase Storage: https://supabase.com/docs/guides/storage
- Supabase Email Functions: https://supabase.com/docs/guides/functions/examples/send-emails

### Email
- Resend Docs: https://resend.com/docs
- SendGrid Docs: https://docs.sendgrid.com/
- Nodemailer: https://nodemailer.com/
- Emailable API: https://emailable.com/api
- Twilio Email Validation: https://www.twilio.com/en-us/products/email-api/email-address-validation-api
- EmailListVerify API: https://emaillistverify.com/api

### Maps / Places
- Overpass API User Manual: https://dev.overpass-api.de/overpass-doc/en/
- Overpass Language Guide: https://wiki.openstreetmap.org/Overpass_API/Language_Guide
- Nominatim Usage Policy: https://operations.osmfoundation.org/policies/nominatim/
- Geoapify Places API: https://www.geoapify.com/places-api/
- Geoapify Place Details API: https://apidocs.geoapify.com/docs/place-details/

### SSL / MCPS
- MCPS SSL Office: https://www.montgomeryschoolsmd.org/departments/ssl/
- MCPS SSL FAQ: https://www.montgomeryschoolsmd.org/departments/ssl/pages/faq/
- MCPS SSL Form PDF: https://ww2.montgomeryschoolsmd.org/departments/forms/pdf/560-51.pdf
- MCPS SSL Form Detail Page: https://ww2.montgomeryschoolsmd.org/departments/forms/detail.aspx?formID=346&formNumber=560-50
- MCPS SSL Form Reference PDF: https://www.montgomeryschoolsmd.org/siteassets/schools/middle-schools/g-m/westms/uploadedfiles/news/ssl-verification-form560-51.pdf
- MCPS SSL Example School Page: https://www.montgomeryschoolsmd.org/schools/wjhs/ssl/

### PDF Tools
- pdf-lib: https://pdf-lib.js.org/
- Puppeteer: https://pptr.dev/

## Setup

1. Clone the repository.
2. Install dependencies.
3. Add your environment variables.
4. Run the app locally.

```bash
npm install
npm run dev
```

## Environment Variables

Example variables used by the project:

```bash
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
GEMINI_API_KEY=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
RESEND_API_KEY=
GEOAPIFY_API_KEY=
EMAIL_VERIFY_API_KEY=
```

## Project Notes

This project was built with Base44 during the prototyping stage and later moved toward a custom backend stack using Supabase, Google Gemini, and external APIs to keep the app fully functional and production-ready.

## License

MIT LICENSE

Team Members: Zaina Shaikh, Tasbeeh Abdelmoneim, Aisha Ahmed
