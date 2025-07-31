# stwd.io Platform Audit Report - February 2025

This report details the current implementation status of new features and refactors planned for the stwd.io platform.

---

### 1. The Social Model

**1a. Public "Follow" System**
*   **Status:** Partially Present
*   **Analysis:**
    *   **Frontend:** A complete follow system exists with "Follow" buttons on profile cards and profile pages. The UI components include `useFollowUser()`, `useUnfollowUser()`, `useFollowStudio()`, and `useUnfollowStudio()` hooks. The FollowersList and FollowingList components display followers/following. However, follower/following counts ARE displayed in these list components, which contradicts the new requirement to remove counts.
    *   **Backend:** A `social_connections` table exists with columns for `follower_id`, `following_user_id`, and `following_studio_id`. This supports one-way follows for both users and studios. The table has proper constraints ensuring a user can only follow either a user OR a studio in each row.

**1b. Private "Connection" System**
*   **Status:** Not Present
*   **Analysis:**
    *   **Frontend:** No UI exists for sending, accepting, or viewing connection requests. The `/connect` route exists but only redirects to `/connect/chat`. No "Connections" page or connection management interface exists.
    *   **Backend:** No 'connections' table or similar structure exists in the database schema. Only the one-way `social_connections` table is present.

---

### 2. The Studio Model

**2a. Studios as Organizations**
*   **Status:** Not Present
*   **Analysis:**
    *   **Frontend:** The studio dashboard has no interface for adding or managing team members. Studios are displayed with a single owner throughout the UI.
    *   **Backend:** The 'studios' table has a one-to-one 'owner_id' column (type: uuid). No 'studio_members' or similar join table exists to support multiple team members per studio.

---

### 3. The Communication Model

**3a. Gated 1-on-1 Chat**
*   **Status:** Not Present
*   **Analysis:**
    *   **Frontend:** The 'Message' button is visible on all user profiles regardless of connection status. Clicking it redirects to `/chat?user=${username}` without any connection checks.
    *   **Backend:** The chat system uses `chat_conversations`, `chat_participants`, and `chat_messages` tables. There are no RLS policies or application logic that check for an accepted connection between participants before allowing chat.

**3b. Open Studio Chat**
*   **Status:** Already Present
*   **Analysis:**
    *   **Frontend:** The 'Contact Studio' button on studio cards and detail pages correctly initiates a chat without requiring any connection.
    *   **Backend:** The backend logic already allows users to message studios freely, so this feature is considered 'Already Present'.

**3c. Group Chat Creation**
*   **Status:** Partially Present
*   **Analysis:**
    *   **Frontend:** The UI for creating group chats or a 'group chat basket' does not exist. The chat system only supports 1-on-1 conversations through the UI.
    *   **Backend:** The messaging schema supports multiple participants per conversation via the `chat_conversations` table with an `is_group` boolean field and the `chat_participants` join table. The backend infrastructure is ready but not utilized.

**3d. Concierge-Led Enquiry Chat**
*   **Status:** Not Present
*   **Analysis:**
    *   **Frontend:** The quote submission form exists and creates inquiries via the quote basket, but it does not create a special 'Enquiry Chat' or add a concierge user. Quote submissions go to an `inquiries` table, not the chat system.
    *   **Backend:** No 'concierge' user role or logic exists to automatically add this user to new quote-based conversations. The inquiries system is separate from the chat system.

---

### 4. The Discovery & UI Model

**4a. Price Display Refactor**
*   **Status:** Not Present
*   **Analysis:**
    *   **Frontend:** Studio cards prominently display price tiers using the `getPriceTierSymbol()` function showing $, $$, or $$$. The filter panel includes price tier filtering with checkboxes for each tier. Price information is still very visible in the discovery experience.
    *   **Backend:** No changes needed on the backend, this is a frontend-only task. The price data remains in the database but display logic needs updating.

**4b. The "Connections" Page**
*   **Status:** Not Present
*   **Analysis:**
    *   **Frontend:** While a route exists at '/connect', it merely redirects to '/connect/chat'. The quotes page at '/connect/quotes' exists but serves a different purpose. No dedicated connections management page exists for displaying accepted connections and managing requests.
    *   **Backend:** This is dependent on the 'Connection System' from task 1b being implemented first. Without a connections table and request system, this page cannot be built.

---

## Summary

The platform currently has a partial implementation of the social follow system but lacks the private connection system entirely. The studio model remains single-owner based without team support. The communication model is completely open without any gating based on connections. Price information is still prominently displayed throughout the discovery experience. Most significantly, the two-way connection system that would enable gated chat and the connections page is completely absent from both frontend and backend.