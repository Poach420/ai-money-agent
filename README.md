# AI Money Agent — SA Edition

Production-ready web + PWA application for South African job seekers. AI-powered job matching and auto-application system.

## ✅ Features Implemented

### Core Functionality
- ✅ **AI Auto-Apply**: Generates custom cover letters using EMERGENT_LLM_KEY (OpenAI GPT-4o-mini)
- ✅ **Smart Job Matching**: Calculates match scores (0-100) based on skills, location, job type
- ✅ **Credit System**: Free (3 credits), Starter (20), Premium (Unlimited)
- ✅ **South African Focus**: ZAR currency, SA job sources (mock data with 10 real SA jobs)
- ✅ **Admin Dashboard**: Full control, unlimited credits, user management, analytics

### User Flows
- ✅ Signup/Login with JWT authentication
- ✅ Profile management (name, city, province, skills, CV upload)
- ✅ Browse AI-matched job opportunities (10 seeded SA jobs)
- ✅ Auto-apply with AI-generated cover letters
- ✅ Track applications with status updates
- ✅ Wallet system (ready for KYC integration)
- ✅ Referral system with R50 rewards

### Tech Stack
- **Frontend**: React 19, Tailwind CSS, shadcn/ui, Framer Motion
- **Backend**: FastAPI, Python 3.11
- **Database**: MongoDB (Motor async driver)
- **AI**: emergentintegrations with EMERGENT_LLM_KEY
- **Auth**: JWT tokens, bcrypt password hashing

### Design
- ✅ Dark mode by default (toggle available)
- ✅ Primary color: #6C5CE7 (purple)
- ✅ Secondary color: #00B894 (teal)
- ✅ Responsive mobile-first design
- ✅ Smooth animations with Framer Motion

## 🚀 Live Demo

**Preview URL**: https://careerhunt-sa.preview.emergentagent.com

**Test Accounts**:
- Regular User: `john@example.com` / `password123`
- Admin User: `admin@aimoney.sa` / `admin123`

## 📋 Environment Setup

See `.env.example` for all required environment variables.

**AI Integration**: Already configured with EMERGENT_LLM_KEY
**Payment Integration**: Ready for PayFast/Stripe credentials (sandbox mode)

## 🎯 Key Features

### Free Tier Experience
- Sign up → Get 3 free auto-apply credits
- Browse 10 AI-matched SA jobs  
- AI generates professional cover letters
- Application tracking dashboard

### Admin Features  
- Access `/admin` dashboard
- Grant unlimited credits
- View all users and applications
- System analytics and stats

## 🧪 Testing Checklist ✅

1. ✅ Create account → AI match scores working
2. ✅ Free plan → 3 credits → verify deduction
3. ✅ Auto-apply → AI cover letter generated → apply URL opens
4. ✅ Admin unlimited credits working
5. ✅ 10 SA jobs seeded and browsable
6. ✅ Application tracking functional
7. ✅ Referral system operational

## 📦 Deployment

- Full source code at `/app`
- MongoDB database ready
- Environment variables in `.env.example`
- PWA enabled via CRA
- Supervisor configuration included

## 🏆 Status

**Production build complete**
- Preview: https://careerhunt-sa.preview.emergentagent.com
- Admin: `/admin` 
- Tests: ✅ PASS
- Ready for credentials and live deployment

---

**Built with Emergent** • January 2025 • South Africa 🇿🇦
