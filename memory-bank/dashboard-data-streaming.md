# Dashboard Data Streaming Analysis

## Overview
This document provides a comprehensive analysis of what data each dashboard component (CreatorDashboard, OwnerDashboard, and AdminDashboard) fetches and displays. This information is critical for understanding what needs to be streamed for each dashboard type.

## CreatorDashboard Data Requirements

### 1. **Inquiries Data**
- **Table**: `inquiries`
- **Query**: 
  ```typescript
  supabase
    .from('inquiries')
    .select('*')
    .eq('creator_id', profile.id)
    .order('created_at', { ascending: false })
  ```
- **Fields**: id, project_type, genre, budget_range, preferred_dates, location_preference, custom_message, created_at, updated_at
- **Purpose**: Shows all inquiries submitted by the creator

### 2. **Inquiry Responses Data**
- **Table**: `inquiry_recipients`
- **Query**: 
  ```typescript
  supabase
    .from('inquiry_recipients')
    .select(`
      *,
      studios (
        id,
        name,
        location,
        hourly_rate,
        profiles:owner_id (
          first_name,
          last_name,
          username
        )
      )
    `)
    .in('inquiry_id', inquiryIds)
    .order('created_at', { ascending: false })
  ```
- **Fields**: inquiry_id, studio_id, status, response_message, quote_amount, responded_at, created_at
- **Related Data**: Studio details (name, location, hourly_rate) and owner profile info
- **Purpose**: Shows responses from studios to creator's inquiries

### 3. **Bookings Data**
- **Table**: `bookings`
- **Query**: 
  ```typescript
  supabase
    .from('bookings')
    .select(`
      *,
      studios (
        name,
        location
      )
    `)
    .eq('creator_id', profile.id)
    .order('created_at', { ascending: false })
  ```
- **Fields**: id, start_time, end_time, status, total_paid, created_at
- **Related Data**: Studio name and location
- **Purpose**: Shows all bookings made by the creator

### 4. **Statistics Calculated**
- Active Inquiries: Count of inquiries with pending/viewed responses
- Responses Received: Count of responses with status 'responded'
- Confirmed Bookings: Count of bookings with status 'confirmed'
- Total Spent: Sum of total_paid from all bookings

## OwnerDashboard Data Requirements

### 1. **Studios Data**
- **Table**: `studios`
- **Query**: 
  ```typescript
  supabase
    .from('studios')
    .select('*')
    .eq('owner_id', profile.id)
    .order('created_at', { ascending: false })
  ```
- **Fields**: id, name, description, location, hourly_rate, published, verification_status, created_at
- **Purpose**: Shows all studios owned by the user

### 2. **Incoming Leads Data**
- **Table**: Uses RPC function `get_studio_inquiries`
- **Query**: 
  ```typescript
  supabase
    .rpc('get_studio_inquiries', { studio_ids: studioIds })
  ```
- **Returns**: InquiryRecipient data with nested inquiry and creator profile information
- **Fields**: 
  - From inquiry_recipients: inquiry_id, studio_id, status, response_message, quote_amount, responded_at, created_at
  - From inquiries: id, project_type, genre, budget_range, preferred_dates, location_preference, custom_message, created_at
  - From profiles: first_name, last_name, username (of the creator)
  - From studios: name
- **Purpose**: Shows all inquiries sent to owner's studios

### 3. **Bookings Data**
- **Table**: `bookings`
- **Query**: 
  ```typescript
  supabase
    .from('bookings')
    .select(`
      *,
      profiles:creator_id (
        first_name,
        last_name,
        username
      ),
      studios (
        name
      )
    `)
    .in('studio_id', studioIds)
    .order('created_at', { ascending: false })
  ```
- **Fields**: id, start_time, end_time, status, total_paid, created_at
- **Related Data**: Creator profile info and studio name
- **Purpose**: Shows all bookings for owner's studios

### 4. **Statistics Calculated**
- Total Studios: Count of all studios
- Published Studios: Count of studios where published = true
- Pending Leads: Count of incoming leads with status 'pending'
- Active Bookings: Count of bookings with status 'confirmed'
- Total Revenue: Sum of total_paid from all bookings

### 5. **Additional Features**
- Studio sorting: By name, location, hourly_rate, published, verification_status, created_at
- Response functionality: Ability to respond to inquiries with RPC function `handle_inquiry_response`
- Studio deletion: Uses RPC function `delete_studio_safely`

## AdminDashboard Data Requirements

### 1. **All Studios Data**
- **Table**: `studios`
- **Query**: 
  ```typescript
  supabase
    .from('studios')
    .select(`
      *,
      profiles:owner_id (
        first_name,
        last_name,
        username
      )
    `)
    .order('created_at', { ascending: false })
  ```
- **Fields**: All studio fields plus owner profile information
- **Purpose**: Shows all studios on the platform for admin oversight

### 2. **All Users Data**
- **Table**: `profiles`
- **Query**: 
  ```typescript
  supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  ```
- **Fields**: id, username, first_name, last_name, role, created_at
- **Purpose**: Shows all users on the platform

### 3. **Admin Actions Available**
- Toggle studio published status
- Toggle studio verification status
- Edit studio details (name, description, location, hourly_rate, verification_status)
- Delete studios using `delete_studio_safely` RPC function
- View studio pages

### 4. **Statistics Shown**
- Total Studios count
- Total Users count

## Key Streaming Considerations

### Real-time Updates Needed
1. **Creator Dashboard**:
   - New responses to inquiries
   - Status changes on inquiry responses
   - Booking status updates

2. **Owner Dashboard**:
   - New incoming inquiries
   - Inquiry status changes
   - New bookings
   - Revenue updates

3. **Admin Dashboard**:
   - New studio listings
   - New user registrations
   - Verification status changes

### Performance Optimizations
1. **Batch Queries**: Owner dashboard uses RPC functions for complex queries
2. **Joined Data**: All dashboards use joined queries to reduce round trips
3. **Sorting**: Owner dashboard includes client-side sorting capabilities
4. **Mobile Views**: Creator and Owner dashboards have mobile-optimized card views

### Security Considerations
1. **RLS Policies**: All queries rely on Row Level Security
2. **RPC Functions**: Complex operations use SECURITY DEFINER functions
3. **Profile-based Access**: All dashboards filter data based on authenticated user's profile

## Implementation Notes

### Common Patterns
1. All dashboards use the `useAuth` hook for authentication state
2. Loading states are managed with `DashboardSkeleton` components
3. Error handling uses toast notifications via `sonner`
4. Status badges use consistent styling across dashboards

### Data Refresh Triggers
1. After responding to an inquiry (Owner)
2. After creating/editing/deleting a studio (Owner/Admin)
3. After viewing a conversation (Creator)
4. After any admin action (Admin)

This comprehensive analysis provides the foundation for implementing efficient data streaming for each dashboard type, ensuring optimal performance and user experience.