// API Configuration for LLM Recipe Generation
export const API_CONFIG = {
  // Replace these with your actual API credentials
  LLM_API_ENDPOINT: import.meta.env.VITE_LLM_API_ENDPOINT || import.meta.env.VITE_OPENAI_API_ENDPOINT || 'YOUR_LLM_API_ENDPOINT',
  LLM_API_KEY: import.meta.env.VITE_LLM_API_KEY || import.meta.env.VITE_OPENAI_API_KEY || 'YOUR_API_KEY',
  LLM_MODEL: import.meta.env.VITE_LLM_MODEL || import.meta.env.VITE_OPENAI_MODEL || 'meta-llama/llama-4-scout-17b-16e-instruct',
  
  // API settings optimized for Llama model
  MAX_TOKENS: 2500, // Increased for better recipe generation
  TEMPERATURE: 0.8, // Slightly higher for more creativity
  
  // Supported models including your Llama model
  SUPPORTED_MODELS: [
    'meta-llama/llama-4-scout-17b-16e-instruct',
    'gpt-3.5-turbo',
    'gpt-4',
    'gpt-4-turbo',
    'claude-3-haiku',
    'claude-3-sonnet',
    'claude-3-opus'
  ]
};

// Validate API configuration
export function validateApiConfig(): boolean {
  const config = API_CONFIG;
  
  if (config.LLM_API_ENDPOINT === 'YOUR_LLM_API_ENDPOINT' || 
      config.LLM_API_KEY === 'YOUR_API_KEY') {
    console.warn('API credentials not configured. Please set your API endpoint and key in .env file.');
    return false;
  }
  
  return true;
}
