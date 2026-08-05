# Troubleshooting Guide: Failed to Fetch Errors

## Quick Start

### 1. Ensure Backend is Running
The most common cause of "failed to fetch" errors is that the backend server is not running.

```bash
# In the server directory, run:
cd server
python -m venv venv  # Create virtual environment if needed
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn src.main:app --reload
```

The backend should start on `http://localhost:8000` and you should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 2. Check Backend Health
Open your browser console (F12) and look for the health check message:
- ✓ **Success**: "Backend is running on http://localhost:8000"
- ✗ **Failure**: "Backend health check failed"

### 3. Verify Frontend Configuration
Make sure `client/.env` has the correct API URL:
```
VITE_API_URL=http://localhost:8000
```

### 4. Check Browser Console
Press F12 to open Developer Tools → Console tab

**Look for these messages:**
- Network errors: `Network error: POST http://localhost:8000/files`
- API errors: `API error: POST http://localhost:8000/files - Status 400`
- Missing backend: `Couldn't reach the backend. Is it running on http://localhost:8000?`

## Common Issues and Solutions

### Issue: "Couldn't reach the backend"
**Cause**: Backend server is not running or not accessible

**Solution**:
1. Verify backend is running: `uvicorn src.main:app --reload`
2. Check the URL in `.env`: `VITE_API_URL=http://localhost:8000`
3. Check firewall/antivirus isn't blocking port 8000
4. Try accessing `http://localhost:8000/health` in browser

### Issue: CORS Error (if seen in console)
**Cause**: CORS headers not properly configured

**Solution**:
1. Make sure `ALLOWED_ORIGINS` in `server/src/core.py` includes your frontend URL
2. For local dev, it should include `http://localhost:5173` (Vite default)
3. Set environment variable if needed:
   ```bash
   export ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

### Issue: File Upload Fails
**Cause**: FormData not properly handled or file too large

**Solution**:
1. Check browser console for specific error message
2. Ensure file is not corrupted
3. Check backend has write permissions to `server/storage/files/`
4. Verify backend storage configuration in `server/src/files/storage.py`

### Issue: Folder Creation Fails
**Cause**: Database connection issue or validation error

**Solution**:
1. Check backend database is initialized: `sqlite:///trustshare.db` (for dev)
2. Run migrations if needed: `alembic upgrade head`
3. Check folder name is valid (not empty, not too long)
4. Look at backend logs for error details

### Issue: Shared Links Show No Data
**Cause**: Analytics endpoints returning no data or error

**Solution**:
1. Check browser console for API errors
2. Verify user ID is properly set in localStorage: `trustshare_dev_user_id`
3. Ensure shared links have been created (they might exist but need to load)
4. Check backend logs for analytics service errors

## How to Debug

### Step 1: Check Backend Logs
The backend console should show:
- `POST /files` - File upload
- `POST /folders` - Folder creation
- `GET /analytics/stats` - Analytics data

### Step 2: Check Browser Console (F12)
Look for:
- ✓ "Backend is running on http://localhost:8000"
- Network tab → see requests going to `http://localhost:8000`
- Console messages about specific API errors

### Step 3: Verify Database
Check if the database has data:
```bash
# In server directory
python -c "from src.database.core import SessionLocal; db = SessionLocal(); print(db.execute('SELECT COUNT(*) FROM users').scalar())"
```

### Step 4: Test with curl
Test endpoints directly:
```bash
# Get backend status
curl http://localhost:8000/health

# List folders (replace USER_ID with actual UUID from localStorage)
curl -H "X-User-Id: YOUR_USER_ID" http://localhost:8000/folders
```

## Expected Workflow

1. **App Starts**
   - Console: "✓ Backend is running..."
   - Frontend creates user ID in localStorage
   
2. **Upload File**
   - Click "Upload" → Select file → Choose folder → "Proceed"
   - Backend: `POST /files` with multipart FormData
   - File appears in file list

3. **Create Folder**
   - Click "New Folder" → Enter name → "Create"
   - Backend: `POST /folders` with JSON body
   - Folder appears in folder list

4. **Create Shared Link**
   - My Files → Select file → Share → Fill form → "Create Link"
   - Backend: `POST /shared-links`
   - Link appears in Shared Links page

5. **View Analytics**
   - Shared Links page loads
   - Statistics cards show numbers
   - Chart shows activity
   - Table lists all shared links

## Still Having Issues?

1. **Clear browser cache**: Ctrl+Shift+Delete → Clear All
2. **Restart backend**: Stop and run `uvicorn src.main:app --reload` again
3. **Check database integrity**: Run `alembic upgrade head`
4. **Review backend logs**: Look for actual error messages
5. **Check firewall**: Ensure port 8000 is not blocked

## Environment Variables

Make sure both are set:

**Frontend** (`client/.env`):
```
VITE_API_URL=http://localhost:8000
```

**Backend** (`server/.env` or environment):
```
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
DATABASE_URL=sqlite:///trustshare.db
```
