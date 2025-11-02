# AI API Key Setup Guide

The Interview Prep Bot requires an AI API key to generate questions and provide feedback. Here are your options:

## Option 1: Google Gemini API (Recommended - FREE Tier Available!) ⭐

**Best Choice:** Gemini offers a generous free tier with better rate limits than OpenAI's free tier.

1. **Get a FREE API Key:**
   - Go to https://aistudio.google.com/app/apikey
   - Sign in with your Google account
   - Click "Create API Key"
   - Copy the key

2. **Add to `.env` file in `backend/` directory:**
   ```env
   GEMINI_API_KEY=your-gemini-api-key-here
   ```

3. **That's it!** No payment required for basic usage.

**Benefits:**
- ✅ Generous free tier (60 requests per minute)
- ✅ No credit card required
- ✅ Better rate limits than OpenAI free tier
- ✅ High-quality responses

## Option 2: OpenAI API

**Cost:** Pay-per-use (very affordable for testing)

1. **Get an API Key:**
   - Go to https://platform.openai.com/api-keys
   - Sign up or log in
   - Create a new API key
   - Copy the key (starts with `sk-`)

2. **Add to `.env` file in `backend/` directory:**
   ```env
   OPENAI_API_KEY=sk-your-key-here
   ```

3. **Restart your backend server**

## Option 3: Lovable AI (If you have access)

1. **Get your Lovable API Key** from your Lovable account

2. **Add to `.env` file:**
   ```env
   LOVABLE_API_KEY=your-key-here
   AI_API_URL=https://ai.gateway.lovable.dev/v1/chat/completions
   AI_MODEL=google/gemini-2.5-flash
   ```

## Option 4: Any OpenAI-Compatible API

You can use any OpenAI-compatible API service:

```env
AI_API_URL=https://your-api-url.com/v1/chat/completions
AI_API_KEY=your-api-key-here
AI_MODEL=your-model-name
```

## Complete .env Example

Create a file named `.env` in the `backend/` directory with:

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/hirebot
JWT_SECRET=your-secret-key-here

# AI Configuration (choose one option above - priority: Gemini > OpenAI > Lovable)
# Recommended: Gemini (free tier available!)
GEMINI_API_KEY=your-gemini-key-here
# OR
# OPENAI_API_KEY=sk-your-openai-key-here
# OR
# LOVABLE_API_KEY=your-lovable-key-here
# AI_API_URL=https://ai.gateway.lovable.dev/v1/chat/completions
# AI_MODEL=google/gemini-2.5-flash
```

## Testing Your Setup

1. Make sure your `.env` file is in the `backend/` directory
2. Restart your backend server:
   ```bash
   cd backend
   npm start
   ```
3. Try using the Interview Prep Bot feature
4. Check the backend console for any API errors

## Troubleshooting

**Error: "AI service not configured"**
- Make sure you have an API key in your `.env` file
- Make sure the variable name matches (OPENAI_API_KEY or LOVABLE_API_KEY)
- Restart the backend server after adding the key

**Error: "Invalid API key" or "Unauthorized"**
- Verify your API key is correct
- For OpenAI, check your account has credits/balance
- Make sure there are no extra spaces in the `.env` file

**Rate Limit Errors**
- You've hit API rate limits
- Wait a moment and try again
- Consider upgrading your API plan if testing frequently

## Free Options

- **OpenAI:** Provides $5 free credit for new accounts
- **Hugging Face:** Has free inference API (requires custom setup)
- **Local Models:** Can run models locally with Ollama (requires more setup)

