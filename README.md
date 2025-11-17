# Nexva Admin Panel

Modern Next.js admin dashboard for managing Nexva AI chatbots.

## 🚀 Quick Start

```bash
# Setup (creates environment files automatically)
./setup.sh

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## ⚙️ Environment Configuration

The app supports **development** and **production** environments with dynamic configuration:

### Development (.env.local)
- API URL: `http://localhost:8000`
- Automatically created by `setup.sh`

### Production (.env.production)
- API URL: Your production backend URL

### Available Scripts
```bash
npm run dev           # Development mode
npm run build         # Build for development
npm run build:prod    # Build for production
npm start             # Start production server
```

### Environment Variables
- `NEXT_PUBLIC_API_URL`: Backend API base URL
- `NEXT_PUBLIC_ENV`: Environment (development/production)

**Note:** Chatbot API keys are fetched dynamically from the backend API, not stored in environment variables.

All API configurations are centralized in `app/config/api.ts`

## 🎨 Design

- Modern, clean UI inspired by Trae.ai
- Gradient backgrounds and glassmorphism effects
- Responsive design for all devices
- Dark mode support ready

## 📁 Structure

```
nexva-admin/
├── app/
│   ├── config/
│   │   └── api.ts          # API configuration
│   ├── page.tsx            # Landing page
│   ├── dashboard/
│   │   └── page.tsx        # Dashboard
│   ├── layout.tsx          # Root layout
│   └── globals.css         # Global styles
├── package.json
└── README.md
```

## 🎯 Features

- ✅ Dashboard overview with stats
- ✅ Chatbot management
- ✅ Real-time analytics
- ✅ Integration code snippets
- ✅ Search and filters
- ✅ Dynamic environment configuration
- ✅ Beautiful gradients and animations

## 🎨 Color Scheme

- Primary: Purple (#9333EA)
- Secondary: Blue (#3B82F6)
- Backgrounds: Gradients from purple to blue

## 📦 Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Lucide React Icons
- Radix UI Components

