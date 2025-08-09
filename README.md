# ✈️ AeroPoints - Premium Award Travel Platform

A luxury award flight booking platform with a stunning Noir Luxe design theme, featuring real-time flight search, OAuth authentication, and premium member benefits.

## 🎨 Design Philosophy

**Noir Luxe Theme**: A sophisticated dark interface with gold accents that creates an exclusive, premium experience for high-net-worth travelers seeking award flight redemptions.

### Color Palette
- **Primary**: Gold (#FFD700)
- **Background**: Jet Black (#0A0A0A)
- **Accent**: Carbon Gray (#1C1C1E)
- **Typography**: Pure White + Soft Gray

## 🚀 Features

### Core Functionality
- **Real-time Award Flight Search**: Integration with Seats.aero API for live availability
- **OAuth Authentication**: Seamless login with Google, Apple, and LinkedIn
- **One-way Flight Search**: Optimized for award travel bookings
- **Multi-program Support**: Search across major loyalty programs
- **Mobile-First PWA**: Offline support and app-like experience

### Premium Features
- 28,000+ airports worldwide
- Real-time seat availability
- Points optimization algorithms
- Concierge services for premium members
- Lounge access information
- Sweet spot recommendations

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 14+ with TypeScript
- **Styling**: Tailwind CSS with custom Noir Luxe theme
- **UI Components**: Custom components with Framer Motion animations
- **Icons**: Lucide React
- **Forms**: React Hook Form + Zod validation
- **Authentication**: NextAuth.js
- **PWA**: next-pwa for offline functionality

### Backend
- **Framework**: Python FastAPI
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: OAuth with Authlib + JWT
- **Caching**: Redis
- **Email**: Resend API
- **Rate Limiting**: SlowAPI
- **Flight Data**: Seats.aero API integration

## 📁 Project Structure

```
# AeroPoints - Premium Award Flight Search Platform

## 🚀 Full-Stack Application with Backend Integration

A luxury award flight search platform with real-time airport search and flight booking capabilities.
├── frontend/                 # Next.js frontend application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   │   ├── ui/             # Base UI components
│   │   ├── layout/         # Layout components
│   │   ├── features/       # Feature components
│   │   └── forms/          # Form components
│   ├── public/             # Static assets
│   └── styles/             # Global styles
│
└── backend/                 # FastAPI backend application
    ├── app/
    │   ├── api/            # API endpoints
    │   ├── core/           # Core configuration
    │   ├── models/         # Database models
    │   ├── schemas/        # Pydantic schemas
    │   ├── services/       # Business logic
    │   └── utils/          # Utility functions
    └── requirements.txt     # Python dependencies
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Python 3.9+
- PostgreSQL 13+
- Redis (optional for caching)

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be available at `http://localhost:3000`

### Backend Setup

```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Create .env file from template
cp .env.example .env
# Edit .env with your configuration

# Run the server
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## 🔐 Environment Variables

### Frontend (.env.local)
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Backend (.env)
```env
DATABASE_URL=postgresql://user:password@localhost/aeropoints
SECRET_KEY=your-secret-key
SEATS_AERO_API_KEY=your-api-key
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 📊 Database Setup

```bash
# Create database
createdb aeropoints

# Run migrations (from backend directory)
alembic init alembic
alembic revision --autogenerate -m "Initial migration"
alembic upgrade head
```

## 🎯 Success Metrics

| Metric | Target |
|--------|--------|
| Page Load Time | < 2.5s |
| API Response Time | < 500ms |
| OAuth Login Success | > 98% |
| Booking Conversion | > 20% |
| Uptime | 99.9% |

## 🚢 Deployment

### Frontend
- **Recommended**: Vercel
- Build command: `npm run build`
- Output directory: `.next`

### Backend
- **Recommended**: Railway or Render
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Database
- **Recommended**: Railway PostgreSQL or Supabase

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is proprietary and confidential.

## 🏆 Key Differentiators

- **Noir Luxe Visual Identity**: Striking black & gold aesthetic
- **Real-time Search**: Award seat availability from 28K+ airports
- **OAuth First UX**: Frictionless logins for VIP travelers
- **Mobile-First & PWA**: Always accessible on-the-go
- **Platinum Membership**: Concierge, lounge access, early deals

## 📧 Contact

For inquiries about AeroPoints, please contact the development team.

---

**AeroPoints** - *Experience luxury travel with premium award flight search*
