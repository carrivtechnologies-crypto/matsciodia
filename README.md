# MatSci Admin Panel

A full-stack TypeScript application with React frontend and Express backend for managing educational content, courses, and students.

## Features

- **Frontend**: React + Vite with TypeScript
- **Backend**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Session-based authentication
- **UI**: Tailwind CSS + Radix UI components
- **State Management**: TanStack Query for server state
- **Forms**: React Hook Form with Zod validation

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- npm or yarn

## Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd MatSciAdmin
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   
   Create a `.env` file in the root directory:
   ```env
   PORT=5000
   DATABASE_URL=postgres://user:password@localhost:5432/matsci
   SESSION_SECRET=your-secret-key-here
   ```

4. **Database Setup**
   
   Update the `DATABASE_URL` in your `.env` file to point to your PostgreSQL database.
   
   Push the database schema:
   ```bash
   npm run db:push
   ```

## Development

### Start Development Server
```bash
npm run dev
```

This starts the backend server with hot reload using `tsx`.

### Frontend Development
The frontend is served by the backend in development mode. The backend automatically sets up Vite middleware for hot reload.

### Type Checking
```bash
npm run check
```

## Production

### Build
```bash
npm run build
```

This builds both the frontend (Vite) and backend (TypeScript compilation).

### Start Production Server
```bash
npm start
```

## Project Structure

```
MatSciAdmin/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom hooks
│   │   └── lib/           # Utilities
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication
│   ├── storage.ts        # Database operations
│   └── vite.ts           # Vite middleware
├── shared/               # Shared code
│   └── schema.ts         # Database schema
├── tsconfig.json         # Frontend TypeScript config
├── tsconfig.server.json  # Backend TypeScript config
└── vite.config.ts        # Vite configuration
```

## Authentication

The application uses session-based authentication. In development mode, a mock user is automatically created for testing purposes.

For production, implement proper authentication by modifying the `server/auth.ts` file.

## API Endpoints

- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout  
- `GET /api/auth/user` - Get current user
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course
- `GET /api/classes` - Get all classes
- `POST /api/classes` - Create class
- `GET /api/students` - Get all students
- `POST /api/students` - Create student

## Deployment

The application is ready for deployment on platforms like:
- Render
- Railway  
- Vercel
- Heroku

Make sure to set the appropriate environment variables in your deployment platform.

## License

MIT 