export const TEST_USERS = {
  CREATOR: {
    email: 'claude@stwd.io',
    password: '6@&#@9@49z61Z',
    role: 'creator',
    expectedDashboard: '/browse'
  },
  STUDIO_OWNER: {
    email: 'owner.test@stwd.io',
    password: 'TestPassword123!',
    role: 'owner', 
    expectedDashboard: '/profile/dashboard'
  },
  NEW_USER: {
    email: 'newuser.test@stwd.io',
    password: 'NewPassword123!',
    role: null,
    expectedDashboard: '/onboarding'
  }
} as const;

export const TEST_STUDIO_DATA = {
  name: "Test Recording Studio",
  location: "Los Angeles, CA",
  hourlyRate: 150,
  amenities: ["Sound Isolation", "Pro Tools", "Mixing Console"],
  description: "Professional recording studio for all your creative needs"
} as const;

export const TEST_SEARCH_FILTERS = {
  location: "Los Angeles",
  priceRange: { min: 100, max: 200 },
  amenities: ["Pro Tools", "Sound Isolation"],
  equipment: ["API 1608", "Genelec 1031A"]
} as const;

export const TEST_NAVIGATION_ROUTES = {
  PUBLIC: [
    '/',
    '/browse',
    '/studios/29', // Example studio ID
    '/auth/login'
  ],
  PROTECTED: [
    '/lists',
    '/profile/dashboard',
    '/onboarding'
  ],
  AUTH_REDIRECT: [
    '/auth/login',
    '/auth/signup'
  ]
} as const;