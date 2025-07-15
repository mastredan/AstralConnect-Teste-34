# ASTRUS - Astrological Social Network

## Overview

ASTRUS is a modern astrological social network that connects people through their celestial interests. Built with a full-stack TypeScript architecture, it features user authentication, astrological profiles, social feeds, and location-based services specifically for Brazilian users.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

### Authentication Security Fix (July 15, 2025)
- Fixed critical security vulnerability where any email could access the system
- Implemented proper database validation for login attempts
- Added email-based registration system with zodiac sign calculation
- Created dedicated login page with proper authentication flow
- Registration now creates both user record and astrological profile
- Only users with existing accounts in database can now log in

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with custom configuration
- **UI Library**: Radix UI components with shadcn/ui styling system
- **Styling**: Tailwind CSS with custom mystical theme (deep space, cosmic purple, starlight blue)
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query for server state management
- **Forms**: React Hook Form with Zod validation
- **Animation**: Framer Motion for smooth transitions and effects

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store

## Key Components

### Authentication System
- **Provider**: Custom authentication with email-based login
- **Session Storage**: PostgreSQL-backed sessions using express-session
- **User Management**: Registration validates against existing users in database
- **Security**: HTTP-only cookies with secure flags
- **Login Flow**: Only users with accounts in database can log in
- **Registration Flow**: Creates user record and astrological profile simultaneously

### Astral Map System
- **Astronomical Calculations**: Swiss Ephemeris for precise planetary positions
- **AI-Enhanced Interpretations**: OpenAI integration for personalized content
- **Countdown Animation**: 15-second animated countdown with zodiac symbols
- **Motivational Phrases**: Dynamic AI-generated phrases during map creation
- **Professional Modal**: Expandable sections with smooth animations

### Database Schema
- **Users**: Basic profile information with Replit integration
- **Astrological Profiles**: Birth data, zodiac signs, location information
- **Posts**: Social media posts with different types (text, horoscope, images)
- **Brazilian Locations**: States stored locally, municipalities fetched from IBGE API
- **Communities**: User groups based on interests
- **Social Features**: Follow system for user connections

### UI Components
- **Glass Card Effects**: Mystical glassmorphism design
- **Star Field Animation**: Animated background with floating stars
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Theme System**: Custom CSS variables for consistent mystical theming

## Data Flow

1. **Authentication Flow**:
   - User authenticates via Replit Auth
   - Server validates and creates/updates user record
   - Session established with PostgreSQL storage

2. **Profile Creation**:
   - User completes astrological profile form
   - Birth location validated against Brazilian location database
   - Zodiac sign calculated from birth date

3. **Social Features**:
   - Users create posts with different types (text, horoscope)
   - Feed displays posts from followed users
   - Real-time updates via React Query

4. **Location Services**:
   - Brazilian states are pre-populated in database
   - Municipalities fetched dynamically from IBGE API when state is selected
   - Real-time data ensures all 5,571 Brazilian municipalities are available
   - Cascading dropdowns for location selection with complete coverage
   - Birth location stored for astrological calculations

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database connection
- **drizzle-orm**: Type-safe database operations
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI components
- **framer-motion**: Animation library
- **react-hook-form**: Form management
- **zod**: Schema validation

### Development Tools
- **Vite**: Fast development server and build tool
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Production bundling for server code

### Authentication
- **openid-client**: OpenID Connect implementation
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

## Deployment Strategy

### Development
- **Hot Reload**: Vite development server with HMR
- **Database**: Neon Database with connection pooling
- **Environment**: Development-specific middleware and error handling

### Production
- **Build Process**: 
  - Frontend: Vite builds to `dist/public`
  - Backend: ESBuild bundles server to `dist/index.js`
- **Serving**: Express serves static files in production
- **Database**: PostgreSQL with connection pooling via Neon
- **Session Storage**: PostgreSQL-backed sessions for scalability

### Configuration
- **Environment Variables**: Database URL, session secrets, OAuth credentials
- **Database Migrations**: Drizzle Kit for schema management
- **TypeScript Compilation**: Shared types between client and server

The application follows a modern full-stack architecture with emphasis on type safety, user experience, and mystical theming that aligns with the astrological content domain.