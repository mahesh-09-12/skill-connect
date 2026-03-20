# 🚀 SkillConnect

**SkillConnect** is a full-stack community-driven learning platform that combines **online courses, discussions, and a creator economy** into a single ecosystem.

It enables users to **learn, teach, collaborate, and earn** — all in one place.

---

## 🌟 Features

### 🎓 Learning Platform

* Create and publish courses
* Modular course structure (Modules → Lessons)
* Video-based learning system
* Course enrollment using coins

### 👨‍🏫 Creator System

* Instructors can create and manage courses
* Earn coins when users enroll
* Dashboard to manage content and earnings

### 💬 Community System

* Create and join communities
* Discussion threads inside communities
* Like, comment, and reply system

### 🪙 Coin Economy

* Earn coins via:

  * Signup bonus
  * Daily rewards
  * Course creation
* Spend coins to enroll in courses
* Transaction history tracking

### 📊 Dashboard

* Learning progress tracking
* Course analytics
* Wallet & transaction overview
* Activity feed

---

## 🛠 Tech Stack

### Frontend

* Next.js (App Router)
* TypeScript
* TailwindCSS
* ShadCN UI
* Lucide Icons

### Backend

* Next.js API Routes
* Prisma ORM
* PostgreSQL (Railway)

### Other

* JWT Authentication
* Local + Cloudinary video uploads
* Turbopack (Dev)

---

## 🧱 Architecture Overview

```
User
├── Courses (Instructor)
├── Enrollments
├── Discussions
├── Comments
└── Coin Transactions

Course
└── Modules
└── Lessons (Video)

Community
└── Discussions
└── Comments
```

---

## 🔐 Authentication

* JWT-based authentication
* Stored in HTTP cookies
* Protected API routes

---

## 💰 Coin System

| Action            | Coins |
| ----------------- | ----- |
| Signup Bonus      | +100  |
| Daily Reward      | +50   |
| Course Enrollment | -X    |
| Course Earnings   | +X    |

---

## 📁 Project Structure

```
src/
├── app/
│   ├── api/
│   ├── dashboard/
│   ├── courses/
│   ├── communities/
│
├── components/
├── lib/
│   └── prisma.ts
│
├── styles/
└── utils/
```

---

## ⚙️ Setup Instructions

### 1. Clone Repo

```bash
git clone https://github.com/your-username/skillconnect.git
cd skillconnect
```

---

### 2. Install Dependencies

```bash
npm install
```

---

### 3. Setup Environment Variables

Create a `.env` file:

```env
DATABASE_URL=your_postgres_url
JWT_SECRET=your_secret_key

# Cloudinary

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

---

### 4. Prisma Setup

```bash
npx prisma generate
npx prisma db push
```

---

### 5. Run Dev Server

```bash
npm run dev
```

---

## 🚧 Current Status

⚠️ This project is under active development.

Some systems (like coin transactions and analytics) are evolving and being stabilized.

---

## 📌 Roadmap

* [ ] Notifications system
* [ ] Advanced analytics dashboard
* [ ] Course reviews & ratings
* [ ] Real-time discussions
* [ ] Payment integration
* [ ] Role-based moderation

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repo
2. Create a feature branch
3. Submit a PR

---

## 📄 License

MIT License

---

## 👤 Author

Built with ❤️ by **Mahesh**

---

## 💡 Vision

SkillConnect aims to become a **decentralized learning ecosystem** where:

> Anyone can teach
> Anyone can learn
> And everyone grows together 🚀
