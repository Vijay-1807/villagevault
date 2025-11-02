import { useState, useRef, useEffect } from 'react'
import { aiService } from '../services/aiService'
import { Send, Bot, User, Loader2, Settings } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const AIChatPage = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Namaste! I\'m your VillageVault AI assistant. I can help you with emergency guidance, weather insights, health advice, and general village information. How can I assist you today?',
      timestamp: new Date()
    }
  ])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showModelSwitcher, setShowModelSwitcher] = useState(false)
  const [currentModel, setCurrentModel] = useState(aiService.getCurrentModel())
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsLoading(true)

    try {
      const response = await aiService.chat(inputMessage.trim())
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.content,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, aiMessage])
    } catch (error) {
      console.error('AI chat error:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I\'m having trouble connecting right now. Please try again later.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const switchModel = (modelName: string) => {
    aiService.switchModel(modelName)
    setCurrentModel(modelName)
    setShowModelSwitcher(false)
    // Add a message about model switch
    let modelDisplayName = ''
    if (modelName === 'gemini-pro-direct') {
      modelDisplayName = 'Gemini Pro (Direct)'
    } else if (modelName === 'gemini-pro-rapidapi') {
      modelDisplayName = 'Gemini Pro (RapidAPI)'
    } else {
      modelDisplayName = modelName.split('/').pop()?.replace(':free', '') || modelName
    }
    
    const switchMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: `✅ Switched to ${modelDisplayName} model. Ready to help!`,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, switchMessage])
  }

  const quickActions = [
    { label: 'Emergency Help', query: 'What should I do in case of a medical emergency?' },
    { label: 'Weather Info', query: 'What\'s the weather like today and any precautions?' },
    { label: 'Health Tips', query: 'Give me some health tips for village life' },
    { label: 'Farming Advice', query: 'What farming advice do you have for this season?' }
  ]

  return (
    <div className="h-full flex flex-col bg-gray-50 overflow-hidden">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-3 sm:px-4 md:px-6 py-3 sm:py-4 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500/80 to-pink-500/80 rounded-lg sm:rounded-xl flex items-center justify-center flex-shrink-0">
              <Bot className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 truncate">
                VillageVault AI
              </h1>
              <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                Powered by {
                  currentModel === 'gemini-pro-direct' 
                    ? 'Gemini Pro' 
                    : currentModel === 'gemini-pro-rapidapi'
                    ? 'Gemini Pro (RapidAPI)'
                    : currentModel.split('/').pop()?.replace(':free', '') || currentModel
                }
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setShowModelSwitcher(!showModelSwitcher)}
              className="flex items-center justify-center px-2.5 sm:px-3 py-2 text-xs sm:text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors min-h-[44px] w-full sm:w-auto"
            >
              <Settings className="h-4 w-4 mr-1.5 sm:mr-2" />
              <span className="hidden sm:inline">Switch Model</span>
              <span className="sm:hidden">Model</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Switcher */}
      {showModelSwitcher && (
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 pb-3 sm:pb-4">
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-3 sm:p-4">
            <h3 className="text-xs sm:text-sm font-medium text-gray-900 mb-2 sm:mb-3">Choose AI Model</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {aiService.getAvailableModels().map((model) => {
                const isCurrent = currentModel === model
                const isGeminiDirect = model === 'gemini-pro-direct'
                const isGeminiRapidAPI = model === 'gemini-pro-rapidapi'
                const isGemini = isGeminiDirect || isGeminiRapidAPI
                
                let displayName = ''
                let providerName = ''
                
                if (isGeminiDirect) {
                  displayName = 'Gemini Pro'
                  providerName = 'Google'
                } else if (isGeminiRapidAPI) {
                  displayName = 'Gemini Pro'
                  providerName = 'RapidAPI'
                } else {
                  displayName = model.split('/').pop()?.replace(':free', '') || model
                  providerName = model.split('/')[0]
                }
                
                return (
                  <button
                    key={model}
                    onClick={() => switchModel(model)}
                    className={`p-3 text-left rounded-lg border transition-colors ${
                      isCurrent
                        ? 'bg-purple-50 border-purple-200 text-purple-900'
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium">{displayName}</div>
                      {isCurrent && <span className="text-xs bg-purple-100 text-purple-600 px-2 py-1 rounded">Current</span>}
                    </div>
                    <div className="text-xs text-gray-500">{providerName}</div>
                    {isGemini && (
                      <div className="text-xs text-blue-600 mt-1">
                        ⚡ Powered by Google Gemini {isGeminiDirect ? '(Direct)' : '(RapidAPI)'}
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
            <div className="mt-3 text-xs text-gray-500">
              💡 <strong>Auto-Fallback System:</strong> If one model fails, the system automatically tries others. 
            </div>
          </div>
        </div>
      )}

      {/* Chat Container */}
      <div className="flex-1 flex flex-col overflow-hidden p-3 sm:p-4 md:p-6">
        <div className="bg-white rounded-lg sm:rounded-xl shadow-sm border border-gray-200 h-full flex flex-col max-w-7xl mx-auto w-full">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 sm:p-4 md:p-6 space-y-3 sm:space-y-4 min-h-0">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] sm:max-w-[80%] rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-4 py-2 sm:py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-1.5 sm:gap-2">
                    {message.role === 'assistant' && (
                      <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    )}
                    {message.role === 'user' && (
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-wrap break-words">
                        {message.content}
                      </p>
                      <p className="text-[10px] sm:text-xs text-gray-500 mt-1.5">
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 border border-gray-200 rounded-lg sm:rounded-xl md:rounded-2xl px-3 sm:px-4 py-2 sm:py-3">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <Bot className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500" />
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin text-purple-500" />
                    <span className="text-xs sm:text-sm">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(action.query)}
                  className="px-2 sm:px-3 py-1.5 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-full border border-gray-300 transition-colors min-h-[36px] sm:min-h-[40px]"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Input */}
          <div className="p-2 sm:p-3 md:p-4 border-t border-gray-200 flex-shrink-0">
            <div className="flex gap-1.5 sm:gap-2">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 px-3 sm:px-4 py-2 sm:py-3 bg-white border border-gray-300 rounded-lg sm:rounded-xl text-xs sm:text-sm md:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-purple-500 min-h-[44px]"
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="px-3 sm:px-4 py-2 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg sm:rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <Send className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIChatPage