import { AI_CONFIG } from '../config/aiConfig'

interface AIConfig {
  apiKey: string
  baseUrl: string
  model: string
  isPaidPlan: boolean
}

interface AIResponse {
  content: string
  usage?: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

class AIService {
  private config: AIConfig
  private lastRequestTime: number = 0
  private requestCount: number = 0
  // Rate limiting configuration (currently using checkRateLimit method instead)
  // private readonly RATE_LIMIT_DELAY = AI_CONFIG.IS_PAID_PLAN ? AI_CONFIG.PAID_PLAN.RATE_LIMIT_DELAY : AI_CONFIG.FREE_PLAN.RATE_LIMIT_DELAY
  // private readonly MAX_REQUESTS_PER_MINUTE = AI_CONFIG.IS_PAID_PLAN ? AI_CONFIG.PAID_PLAN.MAX_REQUESTS_PER_MINUTE : AI_CONFIG.FREE_PLAN.MAX_REQUESTS_PER_MINUTE

  constructor() {
    // Set default model based on availability (Direct Gemini > DeepSeek > GLM)
    let defaultModel = AI_CONFIG.IS_PAID_PLAN ? AI_CONFIG.PAID_PLAN.MODEL : AI_CONFIG.FREE_PLAN.MODEL
    
    // Prefer Direct Gemini if enabled
    if (AI_CONFIG.GEMINI_DIRECT.ENABLED) {
      defaultModel = AI_CONFIG.GEMINI_DIRECT.MODEL
    } else {
      defaultModel = 'deepseek/deepseek-v3.1:free'
    }
    
    this.config = {
      apiKey: AI_CONFIG.API_KEY,
      baseUrl: AI_CONFIG.BASE_URL,
      model: defaultModel,
      isPaidPlan: AI_CONFIG.IS_PAID_PLAN
    }
  }

  // Method to switch to a different free model
  switchModel(modelName: string) {
    this.config.model = modelName
    console.log(`Switched to model: ${modelName}`)
  }

  // Get current model info
  getCurrentModel() {
    return this.config.model
  }

  // Get available free models (including Gemini Pro if enabled)
  getAvailableModels() {
    const models = []
    
    // Add Direct Gemini Pro first if enabled
    if (AI_CONFIG.GEMINI_DIRECT.ENABLED) {
      models.push(AI_CONFIG.GEMINI_DIRECT.MODEL)
    }
    
    // Add other models as fallback
    models.push(...AI_CONFIG.ALTERNATIVE_FREE_MODELS)
    
    return models
  }

  // Auto-fallback to next available model with proper delays
  private async tryWithFallback(message: string, context?: string): Promise<AIResponse> {
    const models = []
    
    // Add Direct Gemini Pro first if enabled
    if (AI_CONFIG.GEMINI_DIRECT.ENABLED) {
      models.push(AI_CONFIG.GEMINI_DIRECT.MODEL)
    }
    
    // Add other models as fallback
    models.push(...AI_CONFIG.ALTERNATIVE_FREE_MODELS)
    
    const currentModelIndex = models.indexOf(this.config.model)
    const errorMessages: string[] = []
    let has401Error = false
    let has429Error = false
    
    // Try current model first
    try {
      return await this.makeAPICall(message, context)
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error)
      errorMessages.push(errorMsg)
      if (errorMsg.includes('401') || errorMsg.includes('Unauthorized')) has401Error = true
      if (errorMsg.includes('429')) has429Error = true
      
      console.log(`Model ${this.config.model} failed: ${errorMsg}, trying fallback models...`)
      
      // Try other models in order of reliability with delays (limit to 3 attempts)
      const maxAttempts = Math.min(3, models.length - 1)
      let attempts = 0
      
      for (let i = 0; i < models.length && attempts < maxAttempts; i++) {
        if (i === currentModelIndex) continue // Skip current model
        
        attempts++
        try {
          this.config.model = models[i]
          console.log(`Trying fallback model: ${models[i]} (attempt ${attempts}/${maxAttempts})`)
          
          // Add delay between fallback attempts to avoid rate limiting
          if (attempts > 1) {
            await new Promise(resolve => setTimeout(resolve, 2000)) // 2 second delay
          }
          
          const result = await this.makeAPICall(message, context)
          console.log(`Fallback successful with ${models[i]}`)
          return result
        } catch (fallbackError) {
          const fallbackErrorMsg = fallbackError instanceof Error ? fallbackError.message : String(fallbackError)
          errorMessages.push(fallbackErrorMsg)
          if (fallbackErrorMsg.includes('401') || fallbackErrorMsg.includes('Unauthorized')) has401Error = true
          if (fallbackErrorMsg.includes('429')) has429Error = true
          
          console.log(`Fallback model ${models[i]} also failed: ${fallbackErrorMsg}`)
          
          // If it's a 429 error, wait longer before trying next model
          if (fallbackErrorMsg.includes('429')) {
            console.log('Rate limit detected, waiting 5 seconds...')
            await new Promise(resolve => setTimeout(resolve, 5000))
          }
          
          continue
        }
      }
      
      // If all models fail, return fallback response with helpful message
      console.log('All models failed, using fallback response')
      console.log('Error summary:', errorMessages)
      
      if (has401Error) {
        return {
          content: `⚠️ **API Configuration Issue**

I'm currently unable to connect to AI services due to API key authentication issues (401 Unauthorized).

**Possible Causes:**
- OpenRouter API key is missing or invalid
- Gemini API key is missing or invalid  
- API key has expired or been revoked

**To Fix:**
1. Check environment variables: \`VITE_OPENROUTER_API_KEY\` and \`VITE_GEMINI_API_KEY\`
2. Verify API keys in the configuration file
3. Contact the administrator to update API credentials

**Temporary Response:**
${this.getFallbackResponse(message)}

*Note: This is a fallback response while API issues are resolved.*`
        }
      }
      
      if (has429Error) {
        return {
          content: `⏱️ **Rate Limit Exceeded**

AI services are currently rate-limited (429 Too Many Requests). Please try again in a few minutes.

**Why this happened:**
- Gemini API free tier limits have been reached
- Too many requests in a short time

**Temporary Response:**
${this.getFallbackResponse(message)}

*Note: This is a fallback response. Please wait a few minutes and try again.*`
        }
      }
      
      return {
        content: `⚠️ **Service Temporarily Unavailable**

All AI services are currently unavailable. Please try again later.

**Temporary Response:**
${this.getFallbackResponse(message)}

*Note: This is a fallback response while services are restored.*`
      }
    }
  }

  // Make API call with current model
  private async makeAPICall(message: string, context?: string): Promise<AIResponse> {
    // Check if using direct Gemini API
    if (this.config.model === AI_CONFIG.GEMINI_DIRECT.MODEL) {
      return await this.makeDirectGeminiAPICall(message, context)
    }

    // Use OpenRouter API for other models
    const response = await fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': window.location.origin,
        'X-Title': 'VillageVault'
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: [
          {
            role: 'system',
            content: `You are a helpful AI assistant for VillageVault, a village communication system. You help villagers with information, emergency guidance, and general queries. Be friendly, helpful, and culturally sensitive to Indian village context.${context ? `\n\nContext: ${context}` : ''}`
          },
          {
            role: 'user',
            content: message
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    })

    if (!response.ok) {
      const errorMessage = `API request failed: ${response.status}`
      console.error(`Model ${this.config.model} failed with status ${response.status}`)
      
      // Handle specific error types
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded (429) for model ${this.config.model}`)
      } else if (response.status === 400) {
        throw new Error(`Bad request (400) for model ${this.config.model} - model may not be available`)
      } else if (response.status === 401) {
        throw new Error(`Unauthorized (401) - API key issue`)
      } else {
        throw new Error(`${errorMessage} for model ${this.config.model}`)
      }
    }

    const data = await response.json()
    
    return {
      content: data.choices[0].message.content,
      usage: data.usage
    }
  }

  // Make API call to Direct Google Gemini API
  private async makeDirectGeminiAPICall(message: string, context?: string): Promise<AIResponse> {
    const systemPrompt = `You are a helpful AI assistant for VillageVault, a village communication system. You help villagers with information, emergency guidance, and general queries. Be friendly, helpful, and culturally sensitive to Indian village context.${context ? `\n\nContext: ${context}` : ''}`
    
    // Use gemini-2.0-flash-lite for best performance (30 RPM vs 15 RPM)
    // Alternative: gemini-2.5-flash-lite (newer version, better daily limit: 1K vs 200)
    const modelName = 'gemini-2.0-flash-lite' // Best RPM (30), 1M TPM, 200 RPD
    // Options:
    // - gemini-2.0-flash-lite: 30 RPM (best for requests), 1M TPM, 200 RPD ✅ RECOMMENDED
    // - gemini-2.5-flash-lite: 15 RPM, 250K TPM, 1K RPD (best daily limit)
    // - gemini-2.0-flash: 15 RPM, 1M TPM, 200 RPD (current, good balance)
    // - gemini-2.5-flash: 10 RPM, 250K TPM, 250 RPD (newer version)
    // - gemini-2.5-pro: 2 RPM, 125K TPM, 50 RPD (most powerful, lowest limits)
    // Use v1 API instead of v1beta for better compatibility
    const baseUrl = AI_CONFIG.GEMINI_DIRECT.BASE_URL.replace('/v1beta', '/v1')
    const url = `${baseUrl}/models/${modelName}:generateContent?key=${AI_CONFIG.GEMINI_DIRECT.API_KEY}`
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: `${systemPrompt}\n\nUser question: ${message}` }
            ]
          }
        ]
      })
    })

    if (!response.ok) {
      const errorMessage = `Gemini API request failed: ${response.status}`
      console.error(`Direct Gemini Pro failed with status ${response.status}`)
      
      if (response.status === 429) {
        throw new Error(`Rate limit exceeded (429) for Gemini Pro`)
      } else if (response.status === 400) {
        throw new Error(`Bad request (400) for Gemini Pro`)
      } else if (response.status === 401 || response.status === 403) {
        throw new Error(`Unauthorized (${response.status}) - Gemini API key issue`)
      } else {
        throw new Error(`${errorMessage}`)
      }
    }

    const data = await response.json()
    
    // Direct Gemini API response structure
    let content = ''
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      content = data.candidates[0].content.parts[0].text
    } else if (data.response) {
      content = data.response
    } else if (typeof data === 'string') {
      content = data
    } else {
      content = JSON.stringify(data)
    }
    
    return {
      content: content,
      usage: data.usageMetadata || undefined
    }
  }

  private async checkRateLimit(): Promise<boolean> {
    // Always allow requests, but add smart delays to avoid 429 errors
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime

    // Reset counter every minute
    if (timeSinceLastRequest > 60000) {
      this.requestCount = 0
    }

    // Smart delay to avoid 429 errors
    if (timeSinceLastRequest < 3000) { // 3 second delay between requests
      await new Promise(resolve => setTimeout(resolve, 3000 - timeSinceLastRequest))
    }

    this.lastRequestTime = Date.now()
    this.requestCount++
    return true
  }

  private getFallbackResponse(message: string): string {
    const lowerMessage = message.toLowerCase()
    
    if (lowerMessage.includes('emergency') || lowerMessage.includes('help')) {
      return `🚨 **Emergency Response Guide:**

**Immediate Actions:**
1. **Stay Calm** - Take deep breaths
2. **Assess Safety** - Are you in immediate danger?
3. **Call Emergency Services:**
   - Police: 100
   - Medical: 108
   - Fire: 101
4. **Contact Village Sarpanch** - Use the SOS feature
5. **Alert Neighbors** - Get help from nearby villagers

**For Medical Emergencies:**
- Keep the person still and comfortable
- Don't move them unless necessary
- Apply pressure to stop bleeding
- Keep airways clear

**For Natural Disasters:**
- Move to higher ground if flooding
- Stay indoors during storms
- Have emergency supplies ready

*Note: AI is temporarily unavailable due to high usage. This is a pre-written emergency guide.*`
    }
    
    if (lowerMessage.includes('weather')) {
      return `🌤️ **Weather Information:**

**Current Weather Tips:**
- Check the Weather Widget on your dashboard
- Stay hydrated in hot weather
- Wear appropriate clothing
- Be cautious during storms

**Seasonal Advice:**
- **Summer**: Drink plenty of water, avoid direct sun
- **Monsoon**: Be careful of flooding, check drainage
- **Winter**: Keep warm, check on elderly neighbors

**Farming Weather:**
- Monitor soil moisture
- Plan irrigation accordingly
- Protect crops from extreme weather

*Note: AI is temporarily unavailable. Check the Weather Widget for real-time data.*`
    }
    
    if (lowerMessage.includes('health') || lowerMessage.includes('medical')) {
      return `🏥 **Health Tips for Village Life:**

**General Health:**
- Drink clean, boiled water
- Wash hands regularly
- Eat fresh, local vegetables
- Get regular exercise

**Common Village Health Issues:**
- **Water-borne diseases**: Boil water, maintain hygiene
- **Mosquito-borne**: Use mosquito nets, clear standing water
- **Heat stroke**: Stay hydrated, avoid midday sun
- **Snake bites**: Stay calm, immobilize limb, seek help

**When to Seek Medical Help:**
- High fever (above 102°F)
- Severe pain
- Difficulty breathing
- Unconsciousness
- Severe bleeding

**Emergency Contacts:**
- Village Health Center
- Nearest Hospital
- Emergency: 108

*Note: AI is temporarily unavailable. Contact local health workers for specific advice.*`
    }
    
    if (lowerMessage.includes('farming') || lowerMessage.includes('crop')) {
      return `🌾 **Farming Advice:**

**Seasonal Farming Tips:**
- **Kharif Season**: Rice, maize, cotton
- **Rabi Season**: Wheat, barley, mustard
- **Summer**: Vegetables, fruits

**Soil Health:**
- Test soil pH regularly
- Use organic compost
- Rotate crops
- Maintain proper drainage

**Water Management:**
- Plan irrigation schedules
- Use drip irrigation for efficiency
- Harvest rainwater
- Monitor water quality

**Pest Control:**
- Use natural pesticides
- Companion planting
- Regular field inspection
- Integrated pest management

*Note: AI is temporarily unavailable. Consult local agricultural extension officers.*`
    }

    return `🤖 **VillageVault Assistant**

I'm temporarily experiencing high demand, but I can still help you with:

**Quick Help Topics:**
- 🚨 **Emergency Help** - Safety and emergency procedures
- 🌤️ **Weather Info** - Weather tips and precautions  
- 🏥 **Health Tips** - Village health and medical advice
- 🌾 **Farming Advice** - Agricultural guidance and tips

**Alternative Help:**
- Use the **SOS feature** for emergencies
- Check the **Weather Widget** for current conditions
- Contact your **Village Sarpanch** for urgent matters
- Visit the **Village Info** section for resources

*I'll be back to full AI assistance soon!*`
  }

  // Chat with AI assistant
  async chat(message: string, context?: string): Promise<AIResponse> {
    try {
      // Check rate limit first
      const canMakeRequest = await this.checkRateLimit()
      
      if (!canMakeRequest) {
        console.log('Rate limit exceeded, using fallback response')
        return {
          content: this.getFallbackResponse(message)
        }
      }

      // Use fallback system to try multiple models
      return await this.tryWithFallback(message, context)
    } catch (error) {
      console.error('AI chat error:', error)
      // Return fallback response instead of throwing error
      return {
        content: this.getFallbackResponse(message)
      }
    }
  }

  // Analyze emergency SOS reports
  async analyzeEmergency(sosDescription: string, location: string): Promise<AIResponse> {
    const prompt = `Analyze this emergency report and provide immediate guidance:

Emergency: ${sosDescription}
Location: ${location}

Please provide:
1. Emergency level assessment (Low/Medium/High/Critical)
2. Immediate actions to take
3. Who to contact first
4. Safety precautions
5. Estimated response time needed

Keep response concise and actionable.`

    try {
      return await this.chat(prompt, 'Emergency analysis for village SOS system')
    } catch (error) {
      // Fallback emergency analysis
      const emergencyLevel = sosDescription.toLowerCase().includes('critical') || 
                           sosDescription.toLowerCase().includes('urgent') ? 'HIGH' : 'MEDIUM'
      
      return {
        content: `🚨 **Emergency Analysis:**

**Emergency Level:** ${emergencyLevel}
**Location:** ${location}

**Immediate Actions:**
1. **Stay Safe** - Move to a safe location if needed
2. **Call Emergency Services:**
   - Police: 100
   - Medical: 108
   - Fire: 101
3. **Contact Village Sarpanch** immediately
4. **Alert Neighbors** for additional help

**Safety Precautions:**
- Keep calm and assess the situation
- Don't put yourself in danger
- Gather important documents if safe to do so
- Stay in communication with authorities

**Response Time:** Immediate action required

*Note: AI analysis temporarily unavailable. This is a general emergency guide.*`
      }
    }
  }

  // Weather insights and predictions
  async getWeatherInsights(weatherData: any, location: string): Promise<AIResponse> {
    const prompt = `Analyze this weather data for ${location} and provide insights:

Weather: ${JSON.stringify(weatherData)}

Please provide:
1. Weather summary and conditions
2. Health recommendations based on weather
3. Agricultural advice for farmers
4. Safety warnings if any
5. Clothing/activity suggestions

Keep it relevant for village life and farming.`

    try {
      return await this.chat(prompt, 'Weather analysis for village community')
    } catch (error) {
      return {
        content: `🌤️ **Weather Insights for ${location}:**

**General Weather Tips:**
- Check the Weather Widget for real-time data
- Stay hydrated in hot weather
- Be cautious during storms
- Dress appropriately for conditions

**Health Recommendations:**
- Drink plenty of water
- Avoid direct sun during peak hours
- Keep warm in cold weather
- Watch for heat stroke symptoms

**Farming Advice:**
- Monitor soil moisture levels
- Plan irrigation accordingly
- Protect crops from extreme weather
- Check drainage systems

*Note: AI analysis temporarily unavailable. Check the Weather Widget for current conditions.*`
      }
    }
  }

  // Village data analytics
  async analyzeVillageData(data: any): Promise<AIResponse> {
    const prompt = `Analyze this village data and provide insights:

Data: ${JSON.stringify(data)}

Please provide:
1. Key trends and patterns
2. Areas of concern
3. Recommendations for improvement
4. Community health insights
5. Suggestions for village development

Focus on actionable insights for village administration.`

    return this.chat(prompt, 'Village data analysis for administration')
  }

  // Generate emergency alerts
  async generateEmergencyAlert(emergencyType: string, details: string): Promise<AIResponse> {
    const prompt = `Generate an emergency alert message for villagers:

Emergency Type: ${emergencyType}
Details: ${details}

Create a clear, urgent message that:
1. Explains the emergency clearly
2. Provides immediate safety instructions
3. Tells villagers what to do
4. Includes contact information
5. Is written in simple, understandable language

Make it suitable for SMS/WhatsApp broadcast to all villagers.`

    return this.chat(prompt, 'Emergency alert generation for village communication')
  }

  // Health and safety advice
  async getHealthAdvice(topic: string, context?: string): Promise<AIResponse> {
    const prompt = `Provide health and safety advice for villagers on: ${topic}

${context ? `Context: ${context}` : ''}

Please provide:
1. Clear, simple explanations
2. Practical steps to take
3. When to seek medical help
4. Prevention tips
5. Local resources if available

Keep it relevant for rural Indian villages.`

    return this.chat(prompt, 'Health advice for village community')
  }
}

export const aiService = new AIService()
