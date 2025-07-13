# Implementation Plan: Expanded User Roles

### Objective
Transform the single-role system into a flexible multi-role professional identity system that accurately represents industry professionals.

### User Story / Business Goal
As an A&R professional, I need my profile to accurately reflect my specific profession, which is different from a musician or manager, so I can network effectively.

### Current State Assessment
The profiles table has a single role column with values 'creator', 'owner', or 'admin'. This conflates system permissions with professional identity. Users can only have one role, limiting how they represent themselves professionally.

### Required High-Level Changes
1. **Database Schema Refactor**: Create roles lookup table and profile_roles join table for many-to-many relationships
2. **System Role Separation**: Rename existing role column to system_role for permissions only
3. **Role Data Migration**: Migrate existing creator/owner roles to new professional role system
4. **User Settings UI**: Add role selection interface to profile settings with multi-select
5. **Profile Display**: Update profile components to display all selected professional roles
6. **Onboarding Update**: Modify onboarding flow to select professional roles instead of system role
7. **Browse/Filter Updates**: Add role-based filtering to future discovery pages
8. **Studio Ownership Logic**: Derive "owner" status from studio relationships, not roles

### Success Criteria
- [ ] New roles table contains: Musician, Podcaster, Voice Actor, A&R, Engineer, Manager, Studio Owner
- [ ] profile_roles join table links profiles to multiple roles
- [ ] Existing profiles.role renamed to system_role with values simplified to 'user' and 'admin'
- [ ] All existing 'creator' users migrated to appropriate professional roles
- [ ] All existing 'owner' users migrated to 'Studio Owner' professional role
- [ ] Profile settings page includes multi-select role picker
- [ ] User profiles display all selected roles with appropriate formatting
- [ ] Onboarding flow updated to select professional roles (not system roles)
- [ ] Studio ownership derived from studios.owner_id relationship
- [ ] RLS policies updated to use system_role for permissions
- [ ] No breaking changes to existing authentication/authorization logic