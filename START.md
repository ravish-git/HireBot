# Quick Start Guide

## Running Both Frontend and Backend Together

### Option 1: Using the Root Script (Recommended)

From the root directory (`HireBot`), simply run:

```bash
npm run dev
```

This will start both:
- **Backend** on `http://localhost:5000`
- **Frontend** on `http://localhost:8080`

### Option 2: Run in Separate Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Option 3: Using PowerShell (Windows)

```powershell
# Terminal 1
cd backend; npm start

# Terminal 2  
cd frontend; npm run dev
```

## First Time Setup

1. **Install root dependencies:**
   ```bash
   npm install
   ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd frontend
   npm install
   ```

   Or install all at once:
   ```bash
   npm run install-all
   ```

4. **Create backend `.env` file:**
   ```bash
   cd backend
   # Create .env file with:
   ```
   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/hirebot
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   LOVABLE_API_KEY=your-lovable-api-key-here
   # Optional: Override AI API URL and model
   # AI_API_URL=https://ai.gateway.lovable.dev/v1/chat/completions
   # AI_MODEL=google/gemini-2.5-flash
   ```
   
   **Note:** For AI features (Interview Prep Bot, Resume Builder), you'll need a `LOVABLE_API_KEY`. You can get one from Lovable.dev or use any OpenAI-compatible API key.

5. **Make sure MongoDB is running** (local or Atlas)

6. **Run both servers:**
   ```bash
   npm run dev
   ```

## Access the Application

- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## Troubleshooting

- If you see "Failed to fetch" errors, ensure the backend is running on port 5000
- Check MongoDB connection in backend console
- Verify `.env` file exists in `backend/` directory
- Make sure ports 5000 and 8080 are not in use by other applications

