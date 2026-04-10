# Sehat Setu Full Stack Platform

![NodeJS](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)
![AI](https://img.shields.io/badge/AI-Symptom%20Checker-blue?style=for-the-badge)

**Sehat Setu Full Stack** is an integrated health management ecosystem. It combines an AI-powered diagnostic engine with a comprehensive patient-doctor consultation platform, providing a seamless end-to-end experience for healthcare delivery.

## ✨ Project Components

- **[backend/](backend/):** The core API server built with Node.js and Express. Handles authentication, database orchestration, and external service integrations (Twilio, Razorpay, Cloudinary).
- **[frontend/](frontend/):** The user interface for patients, doctors, and administrators.
- **[AI-SYMPTOM-CHECKER/](AI-SYMPTOM-CHECKER/):** Modular AI services for preliminary health assessments and symptom analysis.

## 🚀 Key Features

- **Automated Triage:** AI-driven symptom checker for immediate patient guidance.
- **Secure Consultations:** Robust backend support for virtual appointments and medical history management.
- **Real-Time Alerts:** Integrated Twilio service for appointment reminders and critical health alerts.
- **Global Compliance:** Built with modern security practices including role-based access control and encrypted data storage.

## 🛠️ Tech Stack

- **Backend:** Node.js, Express, MongoDB (Mongoose).
- **Frontend:** React, Tailwind CSS.
- **AI/ML:** Custom symptom analysis logic.
- **Services:** Twilio (SMS/Voice), Cloudinary (Image/PDF Storage), Razorpay (Payments).

## 📦 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB
- API keys for Twilio, Cloudinary, and Razorpay.

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/2k33cse992574/SehatSetu-Full.git
   cd SehatSetu-Full
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   cp .env.example .env
   ```
   *Edit `.env` with your credentials.*

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install
   ```

4. **Running the App:**
   - Start Backend: `cd backend && npm start`
   - Start Frontend: `cd frontend && npm start` (or `npm run dev`)

## 📝 License
This project is open-source.
