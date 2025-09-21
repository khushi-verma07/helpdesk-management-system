# Customer Service & Ticketing System

A full-stack ticketing system built with Angular, Node.js, and MySQL.

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- MySQL/MariaDB
- Angular CLI

### Setup Instructions

1. **Database Setup:**
   ```bash
   cd database
   mysql -u root -p < schema.sql
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   npm install
   # Update .env with your database credentials
   npm run dev
   ```

3. **Frontend Setup:**
   ```bash
   cd frontend
   npm install
   ng serve
   ```

## 📁 Project Structure

```
ticketing-system/
├── frontend/           # Angular app
│   ├── src/app/
│   │   ├── components/ # Reusable components
│   │   ├── pages/      # Page components
│   │   ├── services/   # API services
│   │   ├── guards/     # Route guards
│   │   └── models/     # TypeScript interfaces
├── backend/            # Node.js API
│   └── src/
│       ├── routes/     # API routes
│       ├── controllers/# Business logic
│       ├── models/     # Database models
│       ├── middleware/ # Auth & validation
│       └── config/     # Configuration
└── database/           # MySQL schema
```

## 🔧 Tech Stack
- **Frontend:** Angular 18 + Angular Material + Tailwind CSS
- **Backend:** Node.js + Express + Socket.IO
- **Database:** MySQL/MariaDB
- **Authentication:** JWT

## 🌐 Default URLs
- Frontend: http://localhost:4200
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/api/health

## 👤 Default Admin
- Email: admin@ticketing.com
- Password: admin123