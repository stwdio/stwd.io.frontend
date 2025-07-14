# Implementation Plan: URL Slug Refactor

### Objective
Replace numeric IDs in studio URLs with human-readable, SEO-friendly slugs while maintaining security and uniqueness.

### User Story / Business Goal
As a platform owner, I want our URLs to be professional and secure. They should use human-readable 'slugs' for studios (e.g., /studios/abbey-road) instead of exposing internal database IDs that can be guessed.

### Current State Assessment
Studios currently use numeric IDs in URLs (/studios/[id]). The studios table lacks a slug column. All internal links and routing use the numeric ID pattern. The database uses BIGINT auto-incrementing IDs which are predictable and expose internal structure.

### Required High-Level Changes
1. **Database Migration**: Add a unique slug column to the studios table with appropriate constraints
2. **Slug Generation Function**: Create a Postgres function that generates unique slugs from studio names
3. **Conflict Resolution**: Implement automatic suffix appending for duplicate slugs (e.g., abbey-road-2)
4. **Backfill Script**: Generate slugs for all existing studios in a one-time migration
5. **Frontend Routing**: Update all studio routes from /studios/[id] to /studios/[slug]
6. **Link Updates**: Update all components that generate studio links to use slugs
7. **API Updates**: Modify all database queries to support slug-based lookups
8. **Redirect Strategy**: Implement 301 redirects from old ID-based URLs to new slug-based URLs

### Success Criteria
- [ ] Studios table has a new slug TEXT UNIQUE NOT NULL column
- [ ] Postgres function generates URL-safe slugs (lowercase, hyphens, no special characters)
- [ ] Duplicate slug conflicts are automatically resolved with numeric suffixes
- [ ] All existing studios have unique slugs generated from their names
- [ ] Frontend routes use /studios/[slug] pattern exclusively
- [ ] Studio detail pages load correctly using slug-based URLs
- [ ] All studio links throughout the app use slug-based URLs
- [ ] Database queries efficiently lookup studios by slug
- [ ] Old ID-based URLs redirect to new slug-based URLs (301 permanent redirect)
- [ ] Studio creation/editing automatically generates/updates slugs
- [ ] No broken links or routing errors after migration