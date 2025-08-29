# Overview

This project is a comprehensive EdTech platform admin dashboard called "Matsci" built as a full-stack web application. It provides role-based access control for managing educational content, users, and analytics in an online learning environment. The platform supports super administrators, teachers, sales staff, and support personnel with different permission levels and feature access.

The application follows a modern, card-based design system with glassmorphism and neumorphism effects, implementing a responsive interface for managing courses, classes, tests, students, teachers, campaigns, and analytics.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript using Vite as the build tool
- **Routing**: Wouter for client-side routing with role-based page access
- **State Management**: TanStack Query (React Query) for server state management and caching
- **UI Framework**: Custom design system built on Radix UI primitives with Tailwind CSS
- **Component Architecture**: Modular component structure with reusable UI components, charts, and modals
- **Form Handling**: React Hook Form with Zod schema validation for type-safe form management

## Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with role-based endpoint protection
- **File Structure**: Monorepo structure with shared schemas between client and server
- **Middleware**: Custom authentication middleware and request logging

## Authentication & Authorization
- **Provider**: Replit OIDC (OpenID Connect) integration
- **Session Management**: Express sessions with PostgreSQL storage using connect-pg-simple
- **Role-Based Access Control (RBAC)**: Four user roles (super_admin, teacher, sales, support) with different permission levels
- **Security**: Passport.js integration with OIDC strategy for secure authentication flows

## Data Layer
- **Database**: PostgreSQL with Neon serverless connection pooling
- **ORM**: Drizzle ORM with schema-first approach using drizzle-zod for type validation
- **Schema Management**: Centralized schema definitions in shared directory for consistency
- **Migration System**: Drizzle Kit for database migrations and schema evolution

## Design System
- **Theme**: Modern glassmorphism and neumorphism effects with CSS custom properties
- **Typography**: Poppins for headings, Inter for body text
- **Color System**: Primary blue (#2563EB), secondary teal (#14B8A6) with comprehensive semantic color tokens
- **Components**: Comprehensive UI component library including data tables, charts, modals, and forms
- **Responsive Design**: Mobile-first approach with Tailwind CSS breakpoints

## Data Visualization
- **Charts**: Recharts library for sales trends, student growth analytics, and dashboard metrics
- **Dashboard**: Role-specific analytics with real-time data updates
- **Export Features**: Data export capabilities for reports and analytics

## File Management
- **Structure**: Asset management system for course materials, user uploads, and static resources
- **Storage**: File upload and management with URL-based asset serving

# External Dependencies

## Core Framework Dependencies
- **React Ecosystem**: React 18, React DOM, React Hook Form, TanStack Query for modern React patterns
- **TypeScript**: Full TypeScript support across client and server with strict type checking
- **Vite**: Fast development server and optimized production builds

## UI and Styling
- **Radix UI**: Complete accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Lucide React**: Modern icon library for consistent iconography
- **Class Variance Authority**: Type-safe component variant management

## Backend Infrastructure
- **Express.js**: Web application framework for Node.js
- **Passport.js**: Authentication middleware with OIDC strategy
- **Express Session**: Session management with PostgreSQL store

## Database and ORM
- **Neon Database**: Serverless PostgreSQL with connection pooling (@neondatabase/serverless)
- **Drizzle ORM**: Type-safe ORM with schema management (drizzle-orm, drizzle-kit)
- **Drizzle Zod**: Schema validation integration for type safety

## Authentication
- **OpenID Client**: OIDC integration for Replit authentication
- **Memoizee**: Function memoization for optimized authentication flows
- **Connect PG Simple**: PostgreSQL session store for Express sessions

## Development Tools
- **TSX**: TypeScript execution for development server
- **ESBuild**: Fast JavaScript bundler for production builds
- **Replit Plugins**: Development environment integration (@replit/vite-plugin-*)

## Data Visualization
- **Recharts**: React chart library for analytics and dashboard visualizations
- **Date-fns**: Date manipulation and formatting utilities

## Validation and Forms
- **Zod**: TypeScript-first schema validation
- **Hookform Resolvers**: React Hook Form integration with Zod validation