# Technical Context: stwd.io Frontend

## Technology Stack

### Core Framework
- **Next.js 15.2.4**: React framework with App Router
  - Server-side rendering and static generation
  - Built-in routing and API routes
  - Optimized performance and SEO
  - Vercel deployment optimization

### Language & Type Safety
- **TypeScript 5**: Full type safety across the application
  - Strict mode enabled
  - Type definitions for all external libraries
  - Custom type definitions for business logic
- **React 19**: Latest React with concurrent features

### Styling & UI
- **Tailwind CSS**: Utility-first CSS framework
  - Custom design tokens and configuration
  - Responsive design patterns
  - Dark/light theme support

- **shadcn/ui**: Modern component library
  - Radix UI primitives
  - Accessible components out of the box
  - Customizable with Tailwind CSS
  - Components: buttons, forms, dialogs, navigation, etc.

### Backend & Database
- **Supabase**: Backend-as-a-Service
  - PostgreSQL database with PostGIS for location data
  - Real-time subscriptions
  - Row Level Security (RLS)
  - Storage for images and files

### Authentication
- **Clerk**: Primary authentication provider
  - OAuth integration (Google and others)
  - User management and profiles
  - Session handling and security

### Package Management
- **pnpm**: Fast, efficient package manager
  - Workspace support for monorepo potential
  - Better disk space utilization
  - Faster installation times

## Development Environment

### Prerequisites
- Node.js 18+ (LTS recommended)
- pnpm package manager
- Git for version control
- VSCode (recommended) with TypeScript and Tailwind extensions

### Environment Configuration
```bash
# Required environment variables
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Development Scripts
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Type checking
pnpm type-check

# Linting
pnpm lint
```

## Project Configuration

### TypeScript Configuration
- Strict mode enabled in `tsconfig.json`
- Path aliases configured for clean imports
- Next.js specific TypeScript settings

### Tailwind Configuration
- Custom color palette in `tailwind.config.ts`
- Design system tokens
- Component-specific utilities
- Responsive breakpoints

### Next.js Configuration
- App Router enabled (default in Next.js 15)
- Image optimization configured
- React 19 with concurrent features
- Custom webpack configuration if needed

## Development Constraints

### Browser Support
- Modern browsers (ES2020+)
- Mobile-first responsive design
- Progressive Web App capabilities

### Performance Requirements
- Core Web Vitals optimization
- Image optimization and lazy loading
- Code splitting and bundle optimization
- Database query optimization

### Security Considerations
- HTTPS only in production
- Content Security Policy (CSP)
- XSS protection
- CSRF protection through Supabase
- Input validation and sanitization

## Third-Party Integrations

### Authentication
- **Clerk Authentication**: Primary authentication provider
- Multiple OAuth providers (Google, etc.)
- JWT token management and session handling
- User profile management

### Payments (Future)
- Stripe integration planned
- Secure payment processing
- Subscription management

### Maps & Location (Future)
- Google Maps API for studio locations
- Geocoding for address validation
- Distance calculations

### Media Storage
- Supabase Storage for images
- Image optimization and CDN
- File upload handling

## Database Schema Considerations

### User Management
- Profiles table extending Supabase auth.users
- Role-based access control
- User preferences and settings

### Studio Data
- Studios table with rich metadata
- Amenities and equipment tracking
- Pricing and availability data
- Media attachments (photos, audio samples)

### Booking System
- Bookings table with status tracking
- Calendar integration
- Payment tracking
- Communication logs

## Deployment & Infrastructure

### Hosting Platform
- **Vercel**: Optimized for Next.js applications
- Automatic deployments from Git
- Edge functions for global performance
- Preview deployments for testing

### CI/CD Pipeline
- GitHub Actions for automated testing
- Type checking and linting in CI
- Automated deployment to Vercel
- Environment-specific configurations

### Monitoring & Analytics
- Vercel Analytics for performance monitoring
- Error tracking with Sentry (planned)
- User analytics with privacy compliance

## Development Best Practices

### Code Quality
- ESLint configuration for code consistency
- Prettier for code formatting
- Husky for pre-commit hooks
- Conventional commits for clear history

### Testing Strategy
- Unit tests with Jest and React Testing Library
- Component testing for UI components
- Integration tests for critical user flows
- E2E tests with Playwright (planned)

### Documentation
- README.md with setup instructions
- Memory bank for project knowledge
- Component documentation with Storybook (planned)
- API documentation for backend integration

## Scalability Considerations

### Performance Optimization
- Static generation for public pages
- Server-side rendering for dynamic content
- Client-side caching strategies
- Database indexing and query optimization

### Code Organization
- Feature-based folder structure
- Shared component library
- Custom hooks for reusable logic
- Type-safe API layer

### Future Architecture
- Potential monorepo structure
- Micro-frontend considerations
- API gateway for service communication
- Caching layer for improved performance 