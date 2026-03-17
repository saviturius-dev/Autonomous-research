# Literature Agent

A secure, full-stack research system that leverages AI to fetch academic papers, generate hypotheses, train ML models, and produce critiqued research reports.

## Features

- **Research Papers**: Browse and manage academic papers from arXiv
- **Hypothesis Generation**: Create research hypotheses based on papers
- **ML Experiments**: Train Random Forest and Logistic Regression models
- **Research Reports**: Generate and analyze final research findings
- **User Authentication**: Secure login and signup with Supabase Auth
- **Data Isolation**: Row-level security ensures users only access their own data
- **Beautiful UI**: Modern, responsive interface with Tailwind CSS

## Tech Stack

### Frontend
- **React 19** - User interface
- **Vite** - Build tooling
- **Tailwind CSS** - Styling
- **Lucide React** - Icons
- **React Router** - Navigation
- **TypeScript** - Type safety

### Backend
- **Express.js** - REST API server
- **Node.js** - Runtime environment
- **TypeScript** - Type safety
- **CORS** - Cross-origin request handling

### Database
- **Supabase** - PostgreSQL database with authentication
- **Row Level Security** - Automatic data access control
- **JWT Authentication** - Secure token-based auth

## Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account (free tier works)

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env
   ```

3. Get your Supabase credentials:
   - Go to [supabase.com](https://supabase.com) and create a new project
   - Copy your project URL and Anon Key to `.env`
   - Copy your Service Role Key to `.env` (backend only)

4. Run the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3001`

## Available Scripts

```bash
# Development
npm run dev          # Start development server

# Production
npm run build        # Build for production
npm run start        # Start production server

# Quality
npm run lint         # Type check with TypeScript
npm run clean        # Remove build artifacts
```

## Security

This application implements industry-standard security practices:

- ✅ JWT Authentication with Supabase
- ✅ Row Level Security in database
- ✅ CORS protection
- ✅ HTTP security headers
- ✅ Input validation
- ✅ Secure credential management

See [SECURITY.md](./SECURITY.md) for detailed security information.

## Environment Variables

### Frontend (Safe to expose)
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Backend (Server-side only)
```env
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
PORT=3001
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3001
```

## Project Structure

```
project/
├── src/                          # Frontend React application
│   ├── components/               # UI components
│   ├── contexts/                # State management
│   ├── hooks/                   # Custom hooks
│   ├── pages/                   # Page components
│   ├── App.tsx                  # Main app
│   └── main.tsx                 # Entry point
├── api/
│   └── index.ts                 # Express backend
├── dist/                        # Built application
├── index.html                   # HTML template
├── vite.config.ts               # Vite config
├── tsconfig.json                # TypeScript config
├── .env.example                 # Environment template
├── SECURITY.md                  # Security guide
└── README.md                    # This file
```

## Deployment

### Vercel (Recommended)
1. Push to GitHub
2. Connect to Vercel
3. Set environment variables
4. Deploy

### Other Platforms
Set `NODE_ENV=production` and run:
```bash
npm install && npm run build && npm run start
```

## Troubleshooting

**"Cannot find module" errors**
```bash
npm install
npm run lint
```

**Port already in use**
```bash
PORT=3002 npm run dev
```

**Build fails**
```bash
npm run clean
npm install
npm run build
```

## Support

For issues or questions, please check [SECURITY.md](./SECURITY.md) for security guidelines and contact your support team.
