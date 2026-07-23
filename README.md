# VitalScan AI

> **AI-Powered Health Screening & Intelligent Health Assistant**

**VitalScan AI** is an AI-powered health screening platform that helps users perform preliminary assessments of visible health conditions using image analysis, conversational AI, voice assistance, and personalized health insights.

Built for accessibility and early awareness, VitalScan AI enables users to upload images, receive AI-generated educational insights, interact with an intelligent health assistant, and monitor their screening history through an intuitive dashboard.

> **Disclaimer:** VitalScan AI is an educational AI assistant and does **not** replace professional medical diagnosis or treatment.

---

# Problem

Millions of people lack immediate access to healthcare professionals for preliminary screening of visible conditions. Delayed awareness often leads to unnecessary complications and increased healthcare costs.

VitalScan AI bridges this gap by providing an intelligent first layer of health awareness that is available anytime, anywhere.

---

# Objectives

* Improve access to preliminary health screening
* Encourage early detection and health awareness
* Deliver AI-powered educational guidance
* Provide a secure and user-friendly digital health experience

---

# Key Features

## AI Health Screening

* Upload or capture images
* AI-powered visual analysis
* Confidence scoring
* Risk level assessment
* Personalized recommendations

---

## AI Health Assistant

* Conversational health assistant
* Context-aware responses
* Better engineered Gemini prompts
* Educational guidance
* Follow-up recommendations

---

## Voice Assistance

* Voice input
* AI voice reader
* Accessible interaction
* Hands-free experience

---

## Health Analytics Dashboard

* Personal screening history
* Risk trend visualization
* Health statistics
* Activity overview
* User insights

---

## Secure Authentication

* Email authentication
* Protected user accounts
* Row Level Security (RLS)
* Secure data storage

---

## Medical Knowledge Library

Browse common visible health conditions with educational information including:

* Symptoms
* Causes
* Prevention
* Self-care guidance
* When to seek medical attention

---

# AI Features

VitalScan AI demonstrates multiple practical AI capabilities:

* AI-powered medical image interpretation
* Intelligent conversational health assistant
* Prompt-engineered medical guidance
* Confidence-based risk assessment
* Context-aware recommendations
* Voice-enabled interaction

---

# Architecture

```
                 +----------------------+
                 |      Next.js App     |
                 |  React + TypeScript  |
                 +----------+-----------+
                            |
                            |
                 +----------v-----------+
                 |      Supabase        |
                 | Auth • Database      |
                 | Storage • Security   |
                 +----------+-----------+
                            |
                            |
                 +----------v-----------+
                 |     Gemini AI        |
                 | Image Analysis       |
                 | AI Chat              |
                 | Prompt Engine        |
                 +----------------------+
```

---

# Technology Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui

### Backend

* Supabase
* PostgreSQL
* Row Level Security
* Storage

### Artificial Intelligence

* Google Gemini AI
* Prompt Engineering
* Image Analysis
* Conversational AI

### Deployment

* Vercel

---

# Screenshots

Add screenshots before submission.

```
docs/screenshots/

landing-page.png

dashboard.png

health-scan.png

analysis-result.png

chat-assistant.png

analytics-dashboard.png
```

---

# Live Demo

**Application**

https://vital-scan.vercel.app

---

# Local Installation

Clone the repository

```bash
git clone https://github.com/PhunkyGeek/sympto-scan.git

cd vitalscan-ai
```

Install dependencies

```bash
npm install
```

Create environment variables

```bash
cp .env.example .env.local
```

Run locally

```bash
npm run dev
```

---

# Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=

NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=

SUPABASE_SERVICE_ROLE_KEY=

GEMINI_API_KEY=
```

---

# Project Structure

```
app/
components/
hooks/
lib/
public/
supabase/
types/
utils/
docs/
```

---

# Privacy & Security

* Secure Authentication
* Encrypted communication
* Protected user data
* Row Level Security
* Secure cloud storage

---

# Medical Disclaimer

VitalScan AI is **not** a medical device.

The platform provides educational AI-generated insights only and should never replace licensed medical professionals.

Always consult qualified healthcare providers for diagnosis, treatment, or emergencies.

---

# SDG Impact

VitalScan AI supports **United Nations Sustainable Development Goal 3 – Good Health and Well-being** by improving health awareness, encouraging early detection, and making educational health information more accessible.

---

# Future Roadmap

* Wearable device integration
* Multi-language support
* Telemedicine integration
* AI-powered health reports
* Doctor referral system
* Advanced predictive analytics

---

# License

Licensed under the MIT License.

---

# Developer

Built with using Next.js, Supabase, Google Gemini AI, and modern web technologies.

---

If you found this project useful, please consider giving it a star.
