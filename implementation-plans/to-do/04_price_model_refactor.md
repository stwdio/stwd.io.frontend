# Implementation Plan: Price Model Refactor

### Objective
Transform studio pricing from hourly rates to daily rates with support for both specific prices and generalized price tiers.

### User Story / Business Goal
As a studio owner, I need to price my studio with either a specific daily rate (and currency) or a general price tier (e.g., '$$'). As a creator, I need to be able to filter studios by these new tiers and receive quotes in the studio's preferred currency.

### Current State Assessment
Studios table currently has an hourly_rate NUMERIC column. The pricing_rules table exists but appears to handle different rate types. All pricing displays and filters throughout the app are based on hourly rates. There is no currency support or price tier concept.

### Required High-Level Changes
1. **Database Migration**: Add daily_rate, price_tier, and currency columns while deprecating hourly_rate
2. **Data Migration**: Convert existing hourly rates to daily rates (hourly * 8) with tier defaults
3. **Studio Edit Form**: Update to support choosing between specific rate or price tier display
4. **Currency Selection**: Add currency dropdown when creating/editing studios
5. **Price Display Logic**: Implement conditional rendering based on studio's price display preference
6. **Browse Filters**: Replace hourly rate filters with price tier filters
7. **Currency Support**: Add currency selection and display formatting throughout
8. **Quote System Update**: Ensure quotes are generated in the studio's selected currency
9. **Database Functions**: Update any pricing-related RPC functions to use new model
10. **Search/Sort Logic**: Update browse page sorting to work with new price structure

### Success Criteria
- [ ] Studios table has new columns: daily_rate NUMERIC NULL, price_tier INT NOT NULL, currency TEXT NOT NULL DEFAULT 'USD'
- [ ] Existing studios migrated with daily_rate = hourly_rate * 8 and price_tier = 2 ($$)
- [ ] Studio edit form allows owners to choose between showing specific rate or tier
- [ ] Studio creation/edit forms include currency selection dropdown
- [ ] Price tiers display as $ (1), $$ (2), or $$$ (3) symbols
- [ ] Browse page filters include price tier selection (not numeric ranges)
- [ ] Studio cards show either "$150/day" format or "$$" tier based on owner preference
- [ ] Currency is stored and displayed correctly (supporting multiple currencies)
- [ ] Quote requests automatically use the studio's preferred currency
- [ ] Creators see quotes in the correct currency for each studio
- [ ] Sorting by price works correctly with mixed tier/rate displays
- [ ] All price displays throughout app updated to daily format
- [ ] Pricing information properly indexed for performance
- [ ] No breaking changes for existing bookings using old hourly rates