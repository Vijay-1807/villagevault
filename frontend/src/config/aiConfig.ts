// AI Configuration for VillageVault
export const AI_CONFIG = {
  // OpenRouter API Configuration
  API_KEY: import.meta.env.VITE_OPENROUTER_API_KEY || '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',
  BASE_URL: 'https://openrouter.ai/api/v1',
  
  // Plan Configuration
  IS_PAID_PLAN: true, // Set to true for unlimited free usage
  
  // Free Plan Settings - Using Direct Gemini Pro (1st priority)
  FREE_PLAN: {
    MODEL: 'gemini-pro-direct', // Direct Gemini Pro API (1st - more reliable)
    RATE_LIMIT_DELAY: 2000, // 2 second delay to avoid rate limits
    MAX_REQUESTS_PER_MINUTE: 60, // Higher limit with direct API
    DAILY_LIMIT: 1000, // Higher daily limit
  },
  
  // Paid Plan Settings (unlimited free usage)
  PAID_PLAN: {
    MODEL: 'gemini-pro-direct', // Direct Gemini Pro API (1st - more reliable)
    RATE_LIMIT_DELAY: 0, // No delay for unlimited usage
    MAX_REQUESTS_PER_MINUTE: 1000, // Much higher limit
    DAILY_LIMIT: -1, // Unlimited
  },
  
  // Direct Google Gemini API Configuration
  GEMINI_DIRECT: {
    ENABLED: true, // Using direct Gemini API
    API_KEY: import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAAv7Uxf6itcWBHdwgeezBnHthvYii8vXQ',
    BASE_URL: 'https://generativelanguage.googleapis.com/v1', // Using v1 for better compatibility
    MODEL: 'gemini-pro-direct'
  },

  // Alternative Free Models (ordered by preference)
  ALTERNATIVE_FREE_MODELS: [
    'deepseek/deepseek-v3.1:free', // DeepSeek V3.1 - Fast everyday use (2nd)
    'z-ai/glm-4.5-air:free', // GLM 4.5 Air - Light, stable chat (3rd)
    'nvidia/nemotron-nano-9b-v2:free', // NVIDIA Nemotron - General reasoning
    'alibaba/tongyi-deepresearch-30b-a3b:free' // Tongyi DeepResearch - Deep research
  ]
}

// Usage Information
export const USAGE_INFO = {
  FREE_PLAN: {
    description: "Free tier with rate limits",
    cost: "$0/month",
    limitations: [
      "Rate limited (30 requests/minute)",
      "Daily usage limits",
      "Limited to free models only",
      "May experience 429 errors during high usage"
    ],
    benefits: [
      "Completely free",
      "Good for testing and small villages",
      "Fallback responses when rate limited"
    ]
  },
  
  PAID_PLAN: {
    description: "Pay-per-use with higher limits",
    cost: "~$0.001-0.01 per request (very cheap)",
    limitations: [
      "Requires payment method",
      "Pay for each API call"
    ],
    benefits: [
      "Much higher rate limits",
      "Access to premium models",
      "No daily limits",
      "Better reliability",
      "Unlimited usage"
    ]
  }
}

// How to upgrade to paid plan:
export const UPGRADE_INSTRUCTIONS = `
To upgrade to unlimited AI chat:

1. Go to OpenRouter.ai
2. Add payment method (credit card)
3. Set spending limit (e.g., $10/month)
4. Change IS_PAID_PLAN to true in this config
5. Optionally change model to premium version

Cost: Very cheap - typically $0.001-0.01 per chat message
For a village of 100 people: ~$5-10/month for unlimited AI assistance
`
