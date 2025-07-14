# Price Model Refactor - Technical Overview

## Feature Summary
The Price Model Refactor introduces multi-currency support, daily rate pricing, and flexible price display options. Studios can now set prices in their local currency and choose between showing specific rates or price tiers for budget-conscious discovery.

## User Stories Implemented

### 1. Multi-Currency Support
**As a** studio owner in Europe  
**I want to** list my prices in Euros  
**So that** local clients understand my rates without conversion

**Implementation:**
- 10 major currencies supported (USD, EUR, GBP, CAD, AUD, JPY, CNY, INR, BRL, MXN)
- Currency stored per studio
- Symbol and formatting per currency

### 2. Daily Rate Pricing
**As a** studio owner  
**I want to** show daily rates instead of hourly  
**So that** clients can better budget for full-day sessions

**Implementation:**
- Automatic migration from hourly to daily (hourly × 8)
- Daily rate as primary pricing metric
- Decimal support for precise pricing

### 3. Price Tier Privacy
**As a** boutique studio owner  
**I want to** show a price range instead of exact rates  
**So that** I can discuss custom pricing with serious inquiries

**Implementation:**
- Three-tier system: Budget ($), Mid-range ($$), Premium ($$$)
- Toggle between specific rate and tier display
- Clear tier descriptions for users

## Technical Architecture

### Database Schema
```sql
-- Add pricing columns to studios table
ALTER TABLE studios 
ADD COLUMN daily_rate DECIMAL(10,2),
ADD COLUMN price_tier INTEGER DEFAULT 2,
ADD COLUMN currency TEXT DEFAULT 'USD';

-- Migrate existing hourly rates
UPDATE studios 
SET daily_rate = hourly_rate * 8
WHERE hourly_rate IS NOT NULL;
```

### Currency Configuration
```typescript
// lib/constants/currencies.ts
export const SUPPORTED_CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'BRL', symbol: 'R$', name: 'Brazilian Real' },
  { code: 'MXN', symbol: '$', name: 'Mexican Peso' }
]

export const PRICE_TIERS = {
  1: { symbol: '$', label: 'Budget', description: 'Up to $800/day' },
  2: { symbol: '$$', label: 'Mid-range', description: '$800-$2000/day' },
  3: { symbol: '$$$', label: 'Premium', description: 'Over $2000/day' }
}
```

### TypeScript Types
```typescript
interface Studio {
  id: number
  name: string
  hourly_rate: number | null  // Legacy field
  daily_rate: number | null   // New primary rate
  currency: string            // Currency code
  price_tier: number          // 1, 2, or 3
  // ... other fields
}
```

## User Journey

### 1. Studio Owner Setup
- Owner edits studio details
- Selects currency from dropdown (defaults to USD)
- Chooses price display mode:
  - Specific: Enter exact daily rate
  - Tier: Select budget range
- Saves preferences

### 2. Price Display Toggle
```
[Show pricing as: ( ) Specific rate  (•) Price tier only]

If Specific:
┌─────────────────────────┐
│ Daily Rate              │
│ [$1,200    ] USD ▼      │
└─────────────────────────┘

If Tier:
┌─────────────────────────┐
│ Select Price Tier       │
│ ( ) $ Budget            │
│ (•) $$ Mid-range        │
│ ( ) $$$ Premium         │
└─────────────────────────┘
```

### 3. Client Discovery
- Browse page shows prices:
  - Specific: "$1,200/day"
  - Tier: "$$ Mid-range"
- Filters work with both modes
- Clear pricing expectations

### 4. International Users
- US user sees: "$1,200/day"
- UK studio shows: "£950/day"
- Japanese studio: "¥15,000/day"
- No confusion about currency

## Implementation Details

### Form Component
```tsx
// Studio form pricing section
<div className="space-y-4">
  <Select
    label="Currency"
    value={formData.currency}
    onChange={(e) => setFormData({...formData, currency: e.target.value})}
  >
    {SUPPORTED_CURRENCIES.map(currency => (
      <option key={currency.code} value={currency.code}>
        {currency.symbol} {currency.name}
      </option>
    ))}
  </Select>

  <RadioGroup
    label="Show pricing as"
    value={priceDisplay}
    onChange={setPriceDisplay}
  >
    <Radio value="specific">Specific rate</Radio>
    <Radio value="tier">Price tier only</Radio>
  </RadioGroup>

  {priceDisplay === 'specific' ? (
    <Input
      label="Daily Rate"
      type="number"
      value={formData.daily_rate}
      prefix={getCurrencySymbol(formData.currency)}
    />
  ) : (
    <RadioGroup
      label="Price Tier"
      value={formData.price_tier}
      onChange={(value) => setFormData({...formData, price_tier: value})}
    >
      {Object.entries(PRICE_TIERS).map(([tier, info]) => (
        <Radio key={tier} value={tier}>
          {info.symbol} {info.label} - {info.description}
        </Radio>
      ))}
    </RadioGroup>
  )}
</div>
```

### Price Display Logic
```tsx
// Studio card price display
function StudioPrice({ studio }: { studio: Studio }) {
  if (studio.daily_rate && studio.daily_rate > 0) {
    const currency = SUPPORTED_CURRENCIES.find(c => c.code === studio.currency)
    return (
      <span className="font-semibold">
        {currency?.symbol}{studio.daily_rate.toLocaleString()}/day
      </span>
    )
  }
  
  const tier = PRICE_TIERS[studio.price_tier]
  return (
    <span className="font-semibold">
      {tier.symbol} {tier.label}
    </span>
  )
}
```

### Migration Logic
```sql
-- Intelligent tier assignment based on rates
UPDATE studios SET price_tier = 
  CASE 
    WHEN daily_rate <= 800 THEN 1
    WHEN daily_rate <= 2000 THEN 2
    ELSE 3
  END
WHERE daily_rate IS NOT NULL;
```

## Filter Integration

### Price Range Filters
```tsx
// Browse page filters
const priceFilters = [
  { label: '$ Budget (Under $800/day)', value: '1' },
  { label: '$$ Mid-range ($800-$2000/day)', value: '2' },
  { label: '$$$ Premium (Over $2000/day)', value: '3' }
]

// Query logic
if (selectedPriceTiers.length > 0) {
  query = query.in('price_tier', selectedPriceTiers)
}
```

### Currency Considerations
- Filters use USD equivalents
- Future: Real-time conversion
- Current: Tier-based filtering

## Missing Features & Future Enhancements

### Currently Missing
1. **Currency Conversion**
   - No real-time exchange rates
   - No automatic conversion
   - Users see original currency only

2. **Package Pricing**
   - No multi-day discounts
   - No session packages
   - Daily rate only

3. **Dynamic Pricing**
   - No peak/off-peak rates
   - No seasonal pricing
   - No day-of-week variance

### Recommended Additions
1. **Live Currency Conversion**
   ```tsx
   const convertedPrice = await convertCurrency(
     studio.daily_rate,
     studio.currency,
     userCurrency
   )
   ```

2. **Package Builder**
   - 3-day package: 10% discount
   - Weekly rate: 15% discount
   - Monthly residency: 25% discount

3. **Smart Pricing Suggestions**
   - Market analysis
   - Competitor pricing
   - Demand-based recommendations

4. **Price History**
   - Track rate changes
   - Seasonal patterns
   - Booking conversion data

## Performance Considerations

### Database Indexing
```sql
-- Composite index for price filtering
CREATE INDEX idx_studios_price_filter 
ON studios(published, price_tier, currency);
```

### Caching Strategy
- Currency list: Static, long cache
- Price calculations: Cache per session
- Tier descriptions: Static assets

## Localization

### Currency Formatting
```typescript
function formatPrice(amount: number, currency: string, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

// Examples:
// formatPrice(1200, 'USD', 'en-US') → "$1,200"
// formatPrice(1200, 'EUR', 'de-DE') → "1.200 €"
// formatPrice(150000, 'JPY', 'ja-JP') → "¥150,000"
```

## Testing Scenarios

### Manual Testing
1. Set each currency → Verify symbol display
2. Switch price modes → Verify UI updates
3. Filter by tier → Verify results
4. International format → Verify locale

### Automated Testing
```typescript
describe('Price Model', () => {
  it('calculates daily rate from hourly', () => {
    const hourlyRate = 150
    const dailyRate = hourlyRate * 8
    expect(dailyRate).toBe(1200)
  })
  
  it('assigns correct price tier', () => {
    expect(getPriceTier(600)).toBe(1)  // Budget
    expect(getPriceTier(1500)).toBe(2) // Mid-range
    expect(getPriceTier(3000)).toBe(3) // Premium
  })
  
  it('formats currency correctly', () => {
    expect(formatPrice(1200, 'USD')).toBe('$1,200')
    expect(formatPrice(1200, 'EUR')).toBe('€1,200')
  })
})
```

## Implementation Status
✅ **COMPLETED** - July 13, 2025

The price model refactor is fully implemented with multi-currency support, daily rates, and flexible display options. Studios can now present pricing in ways that best suit their business model and target market.