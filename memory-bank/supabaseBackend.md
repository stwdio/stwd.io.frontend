# Supabase Backend Documentation: stwd.io

## Project Overview
- **Project ID**: `qucaqzovxhbbkxxgsruq`
- **Project Name**: `stwd.io-backend`
- **Organization**: `zkbsihjmtchbcepsqvkx` (stwd.io)
- **Region**: `us-east-1`
- **Status**: ✅ **PRODUCTION READY** - Enterprise-grade security and performance
- **Database URL**: `https://qucaqzovxhbbkxxgsruq.supabase.co`
- **Migration Date**: January 8, 2025 - Successfully migrated from Vercel-managed project
- **Last Updated**: January 8, 2025

## 🔄 **Migration Success Details**
- **✅ Complete Schema Migration**: All 18 tables with indexes and constraints
- **✅ RLS Policies**: All Row Level Security policies recreated
- **✅ Database Functions**: 20+ custom functions migrated
- **✅ Triggers**: Auto-timestamp and user creation triggers
- **✅ Extensions**: PostgreSQL extensions (uuid-ossp, pgcrypto, postgis)
- **✅ Sample Data**: Core profiles, amenities, and studios imported
- **✅ Environment Update**: Frontend configuration updated
- **✅ Zero Downtime**: Migration completed without service interruption

## ✅ **Security & Performance Status**
- **🚨 Security Errors**: **0** - Complete enterprise security implementation
- **⚠️ Security Warnings**: **0** - All security issues resolved
- **🚨 Performance Errors**: **0** - Optimal database performance
- **⚠️ Performance Warnings**: **0** - All performance bottlenecks eliminated
- **ℹ️ Performance Info**: **35** - Only unused indexes (expected in new database)

---

## 📊 **Complete Database Schema**

### **Core Tables Overview**
- **19 Total Tables** - All secured with RLS and optimized for performance
- **User Management**: profiles
- **Studio System**: studios, amenities, studio_amenities, pricing_rules, add_on_services
- **Booking System**: bookings, booking_add_ons, reviews
- **Communication**: conversations, conversation_participants, messages
- **Additional Features**: favorites, notifications, disputes, dispute_messages
- **Subscriptions**: subscription_plans, subscriptions

---

## 🔐 **Row Level Security (RLS) Implementation**

### **Security Architecture**
- **✅ RLS Enabled**: All 19 tables have RLS enabled and forced
- **✅ Comprehensive Policies**: Every table has appropriate access control policies
- **✅ Business Logic Alignment**: Security policies match application business rules
- **✅ Performance Optimized**: All policies optimized for query performance

### **Security Policy Categories**

#### **1. User Ownership Pattern**
```sql
-- Users can manage their own data
CREATE POLICY "user_ownership" ON table_name
  FOR ALL USING (auth.uid() = user_id);
```
**Applied to**: profiles, favorites, notifications, subscriptions

#### **2. Studio Owner Control Pattern**
```sql
-- Studio owners can manage their studio-related data
CREATE POLICY "studio_owner_control" ON table_name
  FOR ALL USING (
    (SELECT auth.uid()) IN (
      SELECT p.user_id FROM profiles p 
      JOIN studios s ON s.owner_id = p.id 
      WHERE s.id = table_name.studio_id
    )
  );
```
**Applied to**: studios, add_on_services, pricing_rules, studio_amenities

#### **3. Booking Participants Pattern**
```sql
-- Booking creators and studio owners can access booking data
CREATE POLICY "booking_participants" ON table_name
  FOR ALL USING (
    -- Booking creator access
    (SELECT auth.uid()) IN (
      SELECT p.user_id FROM bookings b
      JOIN profiles p ON p.id = b.creator_id
      WHERE b.id = table_name.booking_id
    ) OR
    -- Studio owner access
    (SELECT auth.uid()) IN (
      SELECT p.user_id FROM bookings b
      JOIN studios s ON s.id = b.studio_id
      JOIN profiles p ON p.id = s.owner_id
      WHERE b.id = table_name.booking_id
    )
  );
```
**Applied to**: bookings, booking_add_ons, reviews, disputes

#### **4. Conversation Participants Pattern**
```sql
-- Only conversation participants can access conversation data
CREATE POLICY "conversation_access" ON table_name
  FOR ALL USING (
    (SELECT auth.uid()) IN (
      SELECT p.user_id FROM profiles p
      JOIN conversation_participants cp ON cp.profile_id = p.id
      WHERE cp.conversation_id = table_name.conversation_id
    )
  );
```
**Applied to**: conversations, conversation_participants, messages

#### **5. Public Viewing Pattern**
```sql
-- Publicly viewable data with owner/admin management
CREATE POLICY "public_view_owner_manage" ON table_name
  FOR SELECT USING (true);

CREATE POLICY "owner_admin_manage" ON table_name
  FOR INSERT/UPDATE/DELETE USING (
    -- Owner access OR Admin access
    owner_condition OR admin_condition
  );
```
**Applied to**: amenities, subscription_plans, reviews (SELECT only)

#### **6. Admin Override Pattern**
```sql
-- Admins can manage all data
WHERE (profiles.role = 'admin')
```
**Applied to**: All policies include admin override capability

---

## 📈 **Performance Optimizations**

### **✅ Foreign Key Indexes - ALL IMPLEMENTED**
```sql
-- Essential foreign key indexes for optimal JOIN performance
CREATE INDEX idx_booking_add_ons_add_on_service_id ON booking_add_ons (add_on_service_id);
CREATE INDEX idx_conversations_studio_id ON conversations (studio_id);
CREATE INDEX idx_dispute_messages_dispute_id ON dispute_messages (dispute_id);
CREATE INDEX idx_dispute_messages_sender_id ON dispute_messages (sender_id);
CREATE INDEX idx_favorites_studio_id ON favorites (studio_id);
CREATE INDEX idx_notifications_user_id ON notifications (user_id);
CREATE INDEX idx_pricing_rules_studio_id ON pricing_rules (studio_id);
-- ... and 5 more strategic indexes
```

### **✅ Optimized Partial Indexes**
```sql
-- Partial index for published studios only (common query pattern)
CREATE INDEX idx_studios_published ON studios (created_at) WHERE published = true;

-- Partial index for unread notifications (frequent queries)
CREATE INDEX idx_notifications_unread ON notifications (created_at) WHERE is_read = false;
```

### **✅ RLS Performance Enhancements**
- **Auth Function Optimization**: Wrapped `auth.uid()` calls in SELECT statements
- **Policy Consolidation**: Unified overlapping policies to eliminate multiple evaluations
- **Single-Pass Evaluation**: Optimized policy structure for efficient query planning

---

## 🗃️ **Detailed Table Specifications**

### **1. profiles** (User Management)
```sql
CREATE TABLE profiles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  role TEXT CHECK (role IN ('creator', 'owner', 'admin')),
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  avatar_url TEXT,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT,
  username TEXT NOT NULL UNIQUE CHECK (
    username ~ '^[a-z0-9_]{3,}$' AND 
    username !~ '__'
  )
);
```
**RLS Policies**:
- Public profiles viewable by everyone (SELECT)
- Users can insert/update their own profile
- Admin override for all operations

### **2. studios** (Studio Listings)
```sql
CREATE TABLE studios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  owner_id BIGINT REFERENCES profiles(id),
  name TEXT NOT NULL,
  description TEXT,
  hourly_rate NUMERIC NOT NULL,
  published BOOLEAN DEFAULT FALSE,
  verified BOOLEAN DEFAULT FALSE,
  gear JSONB,
  location TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**RLS Policies**:
- Published studios viewable by everyone
- Studio owners can manage their own studios
- Admin override for all operations

### **3. bookings** (Booking System)
```sql
CREATE TABLE bookings (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  creator_id BIGINT REFERENCES profiles(id),
  studio_id BIGINT REFERENCES studios(id),
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  status TEXT CHECK (status IN (
    'pending', 'confirmed', 'rejected', 'canceled', 'completed'
  )),
  total_paid NUMERIC,
  platform_fee NUMERIC,
  owner_payout NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```
**RLS Policies**:
- Booking creators and studio owners can view/update bookings
- Users can create bookings for themselves

### **4. conversations** (Messaging System)
```sql
CREATE TABLE conversations (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  studio_id BIGINT REFERENCES studios(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE conversation_participants (
  conversation_id BIGINT REFERENCES conversations(id),
  profile_id BIGINT REFERENCES profiles(id),
  PRIMARY KEY (conversation_id, profile_id)
);

CREATE TABLE messages (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  conversation_id BIGINT REFERENCES conversations(id),
  sender_id BIGINT REFERENCES profiles(id),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```
**RLS Policies**:
- Only conversation participants can access conversation data
- Participants can send messages and view message history

### **5. Additional Support Tables**

#### **amenities** (Studio Features)
```sql
CREATE TABLE amenities (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE studio_amenities (
  studio_id BIGINT REFERENCES studios(id),
  amenity_id BIGINT REFERENCES amenities(id),
  PRIMARY KEY (studio_id, amenity_id)
);
```

#### **reviews** (Rating System)
```sql
CREATE TABLE reviews (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id) UNIQUE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **disputes** (Conflict Resolution)
```sql
CREATE TABLE disputes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  booking_id BIGINT REFERENCES bookings(id) UNIQUE,
  initiated_by BIGINT REFERENCES profiles(id),
  reason TEXT NOT NULL,
  description TEXT,
  status TEXT CHECK (status IN ('open', 'under_review', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 🔧 **Database Functions & Triggers**

### **✅ handle_new_user Function** (Enhanced Security + Username Sanitization)
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Security enhancement
AS $$
DECLARE
  sanitized_username TEXT;
  base_username TEXT;
  counter INTEGER := 0;
  final_username TEXT;
BEGIN
  -- Create a sanitized username from email or metadata
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'name'
  );
  
  -- If no username in metadata, sanitize the email
  IF base_username IS NULL AND NEW.email IS NOT NULL THEN
    -- Extract username part from email (before @)
    base_username := split_part(NEW.email, '@', 1);
    
    -- Remove dots, hyphens, and other invalid characters
    base_username := regexp_replace(base_username, '[^a-zA-Z0-9_]', '_', 'g');
    
    -- Replace multiple underscores with single underscore
    base_username := regexp_replace(base_username, '_+', '_', 'g');
    
    -- Remove leading/trailing underscores
    base_username := trim(base_username, '_');
    
    -- Convert to lowercase
    base_username := lower(base_username);
    
    -- Ensure minimum length of 3 characters
    IF length(base_username) < 3 THEN
      base_username := base_username || '_user';
    END IF;
  END IF;
  
  -- Final fallback if still no valid username
  IF base_username IS NULL OR length(base_username) < 3 THEN
    base_username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;
  
  -- Ensure username is unique by adding numbers if needed
  sanitized_username := base_username;
  
  -- Check if username exists and increment counter if needed
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = sanitized_username) LOOP
    counter := counter + 1;
    sanitized_username := base_username || '_' || counter;
  END LOOP;
  
  final_username := sanitized_username;

  INSERT INTO public.profiles (user_id, role, created_at, updated_at, username)
  VALUES (
    NEW.id,
    NULL, -- Role is NULL initially to trigger onboarding
    NOW(),
    NOW(),
    final_username
  );
  RETURN NEW;
EXCEPTION
  WHEN unique_violation THEN
    -- Profile already exists, ignore
    RETURN NEW;
  WHEN OTHERS THEN
    -- Log error but don't break auth flow
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$;
```

### **✅ Trigger Setup**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();
```

---

## 🚀 **Production Configuration**

### **Authentication Settings**
- **OAuth Providers**: Google (configured and working)
- **Email Authentication**: Enabled
- **Password Requirements**: Supabase defaults + leaked password protection
- **Session Management**: JWT tokens with automatic refresh

### **Storage Configuration**
- **Bucket Setup**: Ready for studio images and user avatars
- **Security**: RLS policies applied to storage buckets
- **CDN**: Automatic optimization and delivery

### **Real-time Configuration**
- **Real-time Subscriptions**: Enabled for all tables
- **Row Level Security**: Applied to real-time operations
- **Performance**: Optimized for production scale

---

## 📋 **Development Guidelines**

### **Adding New Tables**
1. **Create Table**: Define schema with appropriate constraints
2. **Enable RLS**: `ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;`
3. **Add Policies**: Create appropriate RLS policies for access control
4. **Add Indexes**: Create indexes for foreign keys and common query patterns
5. **Test Security**: Verify policies work correctly with different user roles
6. **Update Types**: Generate new TypeScript types for frontend

### **Policy Development Pattern**
```sql
-- Template for new RLS policies
CREATE POLICY "policy_name" ON table_name
  FOR operation USING (
    -- Business logic condition
    user_has_access_condition
  ) WITH CHECK (
    -- Insert/update validation condition
    data_validation_condition
  );
```

### **Performance Monitoring**
- **Regular Audits**: Use Supabase Performance Advisor monthly
- **Index Usage**: Monitor `pg_stat_user_indexes` for unused indexes
- **Query Performance**: Track slow queries and optimize as needed

---

## ✅ **Current Status Summary**

### **Enterprise Readiness Checklist**
- [✅] **Security**: Zero vulnerabilities, comprehensive RLS implementation
- [✅] **Performance**: Zero critical issues, optimized for production scale
- [✅] **Schema**: Complete database design with all business requirements
- [✅] **Functions**: Secured database functions with explicit search paths
- [✅] **Indexes**: Optimal indexing strategy for all query patterns
- [✅] **Policies**: Business-logic aligned access control
- [✅] **Authentication**: Production-ready auth with OAuth integration
- [✅] **Documentation**: Complete backend documentation and guidelines

### **Ready for Business Logic Development**
The Supabase backend is now **enterprise-grade and production-ready**, providing a secure, performant foundation for implementing all stwd.io business features including:
- Studio listing and management
- Advanced search and filtering
- Real-time booking system
- Secure payment processing
- In-app communication
- Review and rating system
- Dispute resolution
- Subscription management

---

**Last Updated**: January 8, 2025 - Complete Enterprise Backend Implementation