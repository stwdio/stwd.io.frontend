# stwd.io - The Marketplace for Recording Studios

🎧 **stwd.io** is a global online marketplace designed to connect musicians, podcasters, bands, and producers with professional recording studios. It functions as a powerful, intuitive platform that combines the discovery of Airbnb with the rich, location-aware data of Google Maps, all tailored specifically for the creative industry.

## The Problem

For decades, the process of finding and booking a recording studio has been fragmented, inefficient, and opaque.

**For Creators:** Finding the right studio involves endless Google searches, sifting through outdated websites, relying on word-of-mouth, and sending countless emails to inquire about availability, gear, and pricing. There is no single source of truth.

**For Studio Owners:** Marketing a studio and managing inquiries is an administrative burden. Owners rely on passive directory listings or social media, and managing bookings via email and phone calls leads to double-bookings, missed opportunities, and wasted time that could be spent on clients.

## The Solution

stwd.io replaces this outdated ecosystem with a centralized, transparent, and streamlined platform that benefits everyone.

- **For Creators:** We provide a frictionless discovery and booking experience. We empower them to find the perfect space for their sound, filtering by location, price, gear, and amenities, and booking their session with confidence through a secure platform.

- **For Studio Owners:** We provide an all-in-one business management tool. We transform a studio's passive online presence into an active revenue-generating engine with tools for managing listings, calendars, client communication, and analytics.

- **For the Platform:** An internal admin layer ensures quality and trust. Admins oversee the ecosystem to verify listings, mediate disputes, and ensure a smooth, professional experience for all users.

## The User Journey: A Tale of Three Roles

The platform is built around three core user personas: the Creator, the Studio Owner, and the Platform Admin. Their journeys are intertwined and designed to create a safe and thriving marketplace.

### 🧑‍🎤 The Creator's Story: Maya, the Singer-Songwriter

> *"As a singer-songwriter in London, I need to find an affordable studio with a quality vocal booth and a real acoustic piano to record my 3-song EP this month."*

Maya's journey on stwd.io looks like this:

1. **Onboarding:** Maya signs up using her Google account and identifies herself as a "Creator."
2. **Discovery & Filtering:** She searches for studios in "London" and filters by her budget and required amenities ("Vocal Booth," "Piano").
3. **Evaluation:** She explores a studio's detail page, viewing photos, gear lists, and reviews from other artists.
4. **Communication:** She uses the built-in messaging to ask the owner a specific question about the piano.
5. **Booking:** Confident in her choice, she securely books her session through the platform.
6. **Post-Session:** After her recording, she leaves a 5-star review, helping other creators in the community.

### 🏢 The Studio Owner's Story: David, the Entrepreneur

> *"As the owner of a professional project studio in London, I want to fill my empty calendar slots, attract new clients beyond word-of-mouth, and spend less time on administrative tasks."*

David's journey on stwd.io looks like this:

1. **Onboarding:** David signs up and selects "Studio Owner." He is redirected to his business dashboard.
2. **Listing Management:** He creates a detailed profile for his studio, uploading high-quality photos, listing his gear, and setting his hourly rate. He then publishes the listing to make it live.
3. **Receiving a Booking:** He receives an email and a dashboard notification for Maya's message and booking request. He uses the platform to manage all communication.
4. **Dashboard Management:** His dashboard is his single source of truth. He sees his upcoming bookings and uses the analytics widgets to track his monthly revenue and profile views.
5. **Growth:** Positive reviews boost his studio's visibility. He subscribes to a "Pro" plan to unlock promotional tools and further grow his business.

### ⚙️ The Admin's Story: Alex, the Platform Operator

> *"As a platform admin for stwd.io, my job is to ensure the integrity of the marketplace, support our users, and maintain a high standard of quality for all listings."*

Alex's journey is about oversight and support:

1. **Verification:** Alex logs into a special admin dashboard and sees that David has created a new studio listing. Alex reviews the listing to ensure it meets platform standards (e.g., has real photos, a clear description). After confirming the studio is legitimate, Alex awards it a "Verified" badge, which builds trust and helps it stand out to creators like Maya.

2. **Dispute Mediation:** A month later, a creator reports an issue with a booking at a different studio, claiming essential equipment was broken. A "dispute" is created on the platform. Alex receives a notification and can view the entire communication history between the creator and the owner.

3. **Resolution:** Acting as a neutral third party, Alex uses the dispute resolution tools to mediate the issue, arriving at a fair outcome based on the platform's terms of service. This intervention maintains trust in the ecosystem.

4. **Platform Health:** Alex uses the admin dashboard to monitor key platform metrics like total bookings, new user sign-ups, and revenue, ensuring the health and growth of the stwd.io community.

## 🚀 Our Vision

Our vision for stwd.io is to become the essential operating system for the creative space industry, empowering creativity by removing friction and building connections within a trusted, professionally-managed global community.

## The stwd.io Technical Architecture: A Supabase-First Philosophy

Our architectural philosophy for stwd.io is built on a single guiding principle: leverage the full power of the Supabase ecosystem to create a robust, scalable, and maintainable platform with minimal moving parts. We consciously avoid external APIs and services where a native Supabase feature can provide a superior, more integrated solution.

This approach allows us to move faster, reduce costs, and maintain a clean, comprehensible codebase. Our stack is not just a collection of technologies; it's a tightly integrated system.

### Pillar 1: The Frontend - A Modern, Performant Experience

The frontend is designed for a best-in-class user experience, SEO performance, and developer efficiency.

**Framework: Next.js (with App Router)**

We use Next.js for its hybrid capabilities. Public-facing pages like the main landing page and individual studio detail pages are Server-Side Rendered (SSR) for optimal SEO and fast initial loads. Interactive, protected areas like the Owner Dashboard are rendered on the client, providing a snappy, app-like feel.

**UI System: shadcn/ui**

We chose shadcn/ui because it is not a traditional component library; it's a design system built on convention. We copy components directly into our project, giving us full control over their code and style. This avoids dependency bloat and ensures perfect consistency, as everything is styled with Tailwind CSS. We do not use any custom CSS files, enforcing a strict adherence to the design system.

**The Accelerator: @supabase/ui-react**

To accelerate development, we use Supabase's own UI components where it makes sense. The prime example is the `<Auth />` component, which handles our entire authentication flow (sign-up, sign-in, password reset) in a secure, pre-built, and themeable block.

### Pillar 2: The Backend - Supabase as the Complete Backend-as-a-Service

This is the cornerstone of our architecture. We treat Supabase as our entire backend, not just a database.

**The Database: PostgreSQL with Superpowers**

- We use Postgres as our single source of truth for all data (profiles, studios, bookings, etc.).
- **PostGIS Extension (CRITICAL)**: This is how we avoid expensive, external mapping services like Google Places API. We use PostGIS for all geographic data, allowing us to perform incredibly fast and efficient "find studios near me" or radius-based queries directly in the database.
- **JSONB Data Type**: For flexible, unstructured data like a studio's gear list, we leverage the jsonb type, giving owners the freedom to list their equipment without schema constraints.

**The Identity Layer: Supabase Auth**

Supabase Auth is our complete user management solution. It handles sign-ups, logins, and session management. Our entire authorization system is built on this foundation, with a custom profiles table linked via foreign key to auth.users. A Postgres trigger automatically creates a profile for every new user, making the system seamless.

**The File System: Supabase Storage**

We do not use external services like S3 directly. All user-generated content, primarily high-resolution studio photos and user avatars, is managed through Supabase Storage. This simplifies our security model, as we can write RLS policies that grant access to storage objects based on our database rules.

**The Logic Layer: Edge Functions**

For all server-side logic that doesn't belong in the client, we use Supabase Edge Functions. This allows us to have a "serverless" backend, eliminating the need to manage a traditional server. Our key use cases are:

- **Stripe Webhooks**: Handling payment confirmations to update booking statuses.
- **Notifications**: Sending transactional emails (e.g., via Resend) for booking confirmations or new messages.
- **Geocoding Proxy**: When a studio owner enters an address, an Edge Function sends it to a free geocoding service (like Nominatim) to get coordinates, which are then stored in our PostGIS database. This completely abstracts away the paid API dependency from our frontend.

### Pillar 3: The Security Model - Row Level Security (RLS)

Security is not an afterthought; it's built into our database core.

**RLS is Always On**: Every table in our database has Row Level Security enabled and forced.

**Policies, Not API Endpoints**: We do not build traditional REST API endpoints like `/api/studios/[id]`. Instead, our security rules live directly in the database as RLS policies. This is a more secure and declarative approach. For example:

- "Owners can only update their own studios"
- "A review can only be created for a booking that is 'completed'"

**Helper Functions & SECURITY DEFINER**: Complex, protected actions (like confirming a booking) are encapsulated in SECURITY DEFINER Postgres functions. This ensures that a user can only perform actions they are authorized to, with logic that cannot be bypassed by the client. This is the ultimate layer of our security model.