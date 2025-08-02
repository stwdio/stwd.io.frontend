# AI Prompt for RLS Solution

## Your Task

You are a PostgreSQL Row Level Security (RLS) expert. I need you to analyze the attached documentation (`chat-system-rls-documentation.md`) and design a complete solution to fix the RLS recursion issues in the stwd.io chat system.

## Required Analysis Steps

1. **Read and understand** the entire `chat-system-rls-documentation.md` file
2. **Research online** for:
   - PostgreSQL RLS best practices for chat/messaging systems
   - Common solutions to RLS recursion errors (code 42P17)
   - Supabase-specific RLS patterns and recommendations
   - Examples of successful chat system RLS implementations

3. **Identify the root causes** of the recursion:
   - Map out the exact circular dependency chains
   - Understand why current policies create infinite loops
   - Analyze the interaction between all three tables

4. **Design a comprehensive solution** that:
   - Eliminates ALL recursion possibilities
   - Maintains the security requirements for all three chat types
   - Optimizes for performance
   - Supports all existing functionality

## Deliverables Required

### 1. Root Cause Analysis
- Detailed explanation of why recursion occurs
- Visual diagram of the circular dependencies
- Specific policy combinations that trigger errors

### 2. Complete RLS Policy Redesign
Provide SQL migrations that:
- Drop all existing problematic policies
- Create new policies that avoid recursion
- Include comments explaining each policy's purpose
- Cover all tables: `chat_conversations`, `chat_messages`, `chat_participants`

### 3. Implementation Plan
Step-by-step migration plan including:
- Order of policy changes to avoid breaking existing functionality
- Any required database function changes
- Temporary policies during migration if needed
- Rollback strategy if issues occur

### 4. Testing Strategy
- Specific test cases for each chat type
- Edge cases to verify recursion is eliminated
- Performance testing recommendations

### 5. Alternative Approaches
If RLS policies alone cannot solve this:
- Database schema changes that would help
- Hybrid approach using functions + policies
- Trade-offs of each alternative

## Constraints and Requirements

### Must Maintain:
- Security: Users can only access conversations they participate in
- All three chat types must work: 1:1, group, and enquiry
- Concierge user special permissions
- Real-time subscriptions compatibility

### Must Avoid:
- Any possibility of recursion errors
- Performance degradation
- Security vulnerabilities
- Breaking changes to existing data

### Technical Context:
- Supabase (PostgreSQL) backend
- Cannot modify application code (only database)
- Must work with existing schema
- Must support future scalability

## Success Criteria

Your solution is successful when:
1. Zero recursion errors occur in any chat operation
2. All three chat types function correctly
3. Security requirements are maintained
4. Performance is equal or better than current
5. Implementation is maintainable and documented

Please provide a complete, production-ready solution that permanently resolves these RLS recursion issues.

## Additional Research Keywords

To help your research, investigate these specific topics:
- "PostgreSQL RLS circular dependency solutions"
- "Supabase chat system RLS patterns"
- "PostgreSQL policy recursion error 42P17"
- "RLS best practices for many-to-many relationships"
- "PostgreSQL SECURITY DEFINER vs RLS policies"
- "Materialized views for RLS optimization"

Focus on finding real-world examples of chat systems that solved similar RLS recursion issues.