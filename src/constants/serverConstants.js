export const SERVER_BASE_URL =
  import.meta.env.MODE === 'production'
    ? 'https://natours-backend-8mp4.onrender.com'
    : 'http://localhost:3000';

// Payment configuration
export const PAYMENT_CONFIG = {
  // Available payment methods by region
  STRIPE_SUPPORTED_COUNTRIES: ['US', 'CA', 'GB', 'AU', 'DE', 'FR', 'NL', 'SE', 'CH'],
  RAZORPAY_SUPPORTED_COUNTRIES: ['IN'],

  // Detect user's country (you can implement IP-based detection)
  getCurrentPaymentMethod: () => {
    // For now, we'll check if user is in India
    const userCountry = import.meta.env.VITE_USER_COUNTRY || 'IN'; // Default to India

    if (PAYMENT_CONFIG.RAZORPAY_SUPPORTED_COUNTRIES.includes(userCountry)) {
      return 'razorpay';
    } else if (PAYMENT_CONFIG.STRIPE_SUPPORTED_COUNTRIES.includes(userCountry)) {
      return 'stripe';
    } else {
      return 'demo'; // Fallback for unsupported regions
    }
  },

  // Payment method settings
  DEMO_MODE: import.meta.env.VITE_DEMO_MODE === 'true' || false,
};
