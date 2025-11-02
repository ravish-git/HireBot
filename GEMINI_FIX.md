# Fixing Gemini API 404 Error

## Changes Made

1. **Fixed API URL format:**
   - Changed from: `https://generativelanguage.googleapis.com/v1beta/models`
   - To: `https://generativelanguage.googleapis.com/v1beta`
   - Full endpoint: `https://generativelanguage.googleapis.com/v1beta/models/{MODEL}:generateContent?key={KEY}`

2. **Updated default model:**
   - Changed from: `gemini-pro`
   - To: `gemini-1.5-flash` (more reliable)

3. **Improved error handling:**
   - Better 404 error messages
   - Improved response parsing with validation

## If You Still Get 404:

### Option 1: Check Your Model Name
In your `backend/.env`, try different models:
```env
GEMINI_API_KEY=your-key
GEMINI_MODEL=gemini-1.5-flash
# OR
GEMINI_MODEL=gemini-pro
# OR
GEMINI_MODEL=gemini-1.5-pro
```

### Option 2: Verify Your API Key
1. Go to https://aistudio.google.com/app/apikey
2. Make sure your API key is active
3. Check if there are any restrictions on the key

### Option 3: Check API Status
- Visit: https://status.cloud.google.com/
- Make sure Gemini API is operational

### Option 4: Use OpenAI Instead
If Gemini continues to have issues, switch to OpenAI:
```env
OPENAI_API_KEY=sk-your-key-here
```

## Testing

After updating, restart your backend:
```bash
cd backend
npm start
```

Then try generating questions again. The error message will now be more helpful if there's still an issue.

