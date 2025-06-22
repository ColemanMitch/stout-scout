# 🍺 StoutScout - The Dead Poet's Loyalty Tracker

A modern, mobile-friendly Guinness loyalty tracking web app for The Dead Poet bar in NYC. Built with React, TypeScript, Node.js, and PostgreSQL.

## ✨ Features

### 🏆 **Leaderboard & Analytics**
- Real-time patron rankings
- Total pints tracking
- Quick stats dashboard
- Visual medal indicators (gold, silver, bronze)

### 🍺 **Smart Pint Logging**
- **Bulk Operations**: Log multiple pints for multiple patrons in one action
- **Quick Search**: Find patrons instantly by name or ID
- **Mobile-Friendly**: Optimized for tablets and phones
- **Keyboard Shortcuts**: Ctrl+1 (Leaderboard), Ctrl+2 (Log Pints)
- **Real-time Updates**: Automatic data refresh after logging

### 🎯 **Efficient Workflow**
- Side-by-side patron selection and logging
- Add All functionality for filtered patrons
- Clear visual feedback and confirmations
- Error handling and validation

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Tailwind CSS** for styling
- **Vite** for fast development
- **Responsive Design** for mobile/tablet use

### Backend
- **Node.js** with Express
- **TypeScript** for type safety
- **Prisma ORM** for database management
- **PostgreSQL** for data storage

### Database Schema
- **Patrons**: Customer profiles with loyalty tracking
- **Pints**: Individual pint records with timestamps
- **Users**: Bartender/manager accounts
- **Milestones**: Achievement tracking

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/stout-scout.git
cd stout-scout
```

### 2. Backend Setup
```bash
cd api
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database credentials

# Run database migrations
npx prisma migrate dev

# Seed the database with sample data
npm run seed

# Start the development server
npx ts-node --transpile-only src/index.ts
```

### 3. Frontend Setup
```bash
cd web
npm install

# Start the development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000

## 📱 Usage Guide

### For Bartenders
1. **Switch to Log Pints tab** (Ctrl+2)
2. **Search for patrons** using the search bar
3. **Click patrons** to add them to the queue
4. **Adjust quantities** with +/- buttons
5. **Log all pints** with one click

### For Managers
1. **View leaderboard** (Ctrl+1) for patron rankings
2. **Monitor stats** in the quick stats cards
3. **Use bulk operations** for busy periods
4. **Track progress** with real-time updates

## 🔧 API Endpoints

### Core Endpoints
- `GET /health` - API status check
- `GET /api/patrons` - List all patrons
- `GET /api/leaderboard` - Top patrons ranking
- `GET /api/milestones` - Achievement milestones
- `POST /api/pints` - Log multiple pints (bulk)

### Bulk Pint Logging
```json
POST /api/pints
{
  "pints": [
    {
      "patronId": "patron-uuid",
      "bartenderId": "bartender-uuid",
      "quantity": 3,
      "pouredAt": "2024-01-15T20:30:00Z" // optional
    }
  ]
}
```

## 🎨 Design Philosophy

### Mobile-First
- Responsive design for tablets and phones
- Touch-friendly interface elements
- Optimized for bar environment use

### Efficiency-Focused
- Bulk operations reduce logging time
- Search functionality prevents errors
- Keyboard shortcuts for power users

### Guinness-Inspired
- Orange/amber color scheme
- Professional, pub-appropriate design
- Clear visual hierarchy

## 🗄️ Database Schema

```sql
-- Patrons table
CREATE TABLE patrons (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  email VARCHAR,
  birthday DATE,
  joined_at TIMESTAMP DEFAULT NOW(),
  loyalty_program_joined_at TIMESTAMP DEFAULT NOW(),
  total_pints INTEGER DEFAULT 0
);

-- Pints table  
CREATE TABLE pints (
  id UUID PRIMARY KEY,
  patron_id UUID REFERENCES patrons(id),
  bartender_id UUID REFERENCES users(id),
  poured_at TIMESTAMP DEFAULT NOW()
);

-- Users table (bartenders/managers)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  role VARCHAR NOT NULL
);

-- Milestones table
CREATE TABLE milestones (
  id UUID PRIMARY KEY,
  name VARCHAR NOT NULL,
  pint_target INTEGER NOT NULL,
  description TEXT
);
```

## 🔒 Environment Variables

### Backend (.env)
```env
DATABASE_URL="postgresql://username:password@localhost:5432/stoutscout"
PORT=4000
NODE_ENV=development
```

## 📦 Project Structure

```
stout-scout/
├── api/                    # Backend Node.js/Express
│   ├── src/
│   │   ├── index.ts       # Main server file
│   │   └── routes/        # API route handlers
│   ├── prisma/
│   │   ├── schema.prisma  # Database schema
│   │   └── seed.ts        # Sample data
│   └── package.json
├── web/                    # Frontend React app
│   ├── src/
│   │   ├── App.tsx        # Main application
│   │   └── components/    # React components
│   └── package.json
└── README.md
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **The Dead Poet** - For the inspiration and real-world use case
- **Guinness** - For the iconic brand that inspired this project
- **React & TypeScript** - For the excellent developer experience
- **Tailwind CSS** - For the beautiful, responsive design system

---

**Built with 🍺 and ❤️ for The Dead Poet bar in NYC** 