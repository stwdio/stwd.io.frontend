# Implementation Plan: User Settings

### Objective
Enhance the existing Account Settings page to allow users to manage their core identity including name, username, email, and password.

### User Story / Business Goal
As a registered user, I need a single 'Account Settings' page to control my core identity, including my name, public username, login email, and password.

### Current State Assessment
A basic settings page exists at /profile/settings with navigation cards for different settings sections. The /profile/settings/profile page allows basic profile editing. The profiles table has first_name, middle_name, last_name, and username columns. Username has constraints (lowercase, alphanumeric, underscores, no double underscores, minimum 3 characters).

### Required High-Level Changes
1. **Enhance Profile Settings Form**: Expand the existing /profile/settings/profile page to include all name fields (first, middle, last) and username editing
2. **Username Validation**: Implement real-time validation for username availability and format constraints
3. **Email Management**: Add email editing with Supabase Auth integration and verification flow
4. **Password Management**: Add secure password change functionality with current password confirmation
5. **Success Feedback**: Implement toast notifications for successful updates and clear error messaging
6. **Form State Management**: Use proper form validation and loading states during async operations

### Success Criteria
- [ ] Users can edit their first name, middle name, and last name
- [ ] Users can change their username with real-time validation showing availability
- [ ] Username changes respect existing constraints (lowercase, alphanumeric, underscores only)
- [ ] Users can update their email address, triggering a verification email
- [ ] Users can change their password by providing current password and new password
- [ ] All form fields show appropriate validation errors
- [ ] Loading states appear during save operations
- [ ] Success messages confirm when changes are saved
- [ ] Changes to auth-related fields (email, password) update both Supabase Auth and profiles table
- [ ] The settings page maintains responsive design on mobile devices