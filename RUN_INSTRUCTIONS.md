# 🚀 How to Run AeroPoints Application

## Quick Start (2 Terminal Windows Needed)

### Terminal 1 - Backend Server
```bash
cd /Users/anujsingh/Desktop/My_Projects/AeroPoints/backend
node server-fixed.js
```

You should see:
```
✅ Airport-codes library loaded successfully
✅ Loaded 5880 airports into cache
🚀 AeroPoints Server is running on port 5000
📍 API URL: http://localhost:5000/api
✈️ 5880 airports available
```

### Terminal 2 - Frontend Server
```bash
cd /Users/anujsingh/Desktop/My_Projects/AeroPoints/frontend
npm run dev
```

The frontend will start on http://localhost:3001

## 🔍 Testing the Application

1. **Open your browser** and go to http://localhost:3001
2. **Test Airport Search**:
   - Type "new" to see New York, New Orleans, etc.
   - Type "jfk" to find JFK airport
   - Type "london" to see all London airports
3. **Search for Flights**:
   - Select airports from the dropdown
   - Choose a date
   - Click "Search Award Flights"

## 🐛 Troubleshooting

### If you see "Load Failed" error:

1. **Check if backend is running**:
   ```bash
   curl http://localhost:5000/api/health
   ```
   Should return: `{"status":"OK","message":"AeroPoints API is running","airportsLoaded":5880}`

2. **If backend crashes**, restart it:
   ```bash
   cd backend
   node server-fixed.js
   ```

3. **If frontend shows errors**, check console:
   - Press F12 in browser
   - Check Console tab for errors
   - Check Network tab to see if API calls are failing

### Alternative: Use the fixed server
The `server-fixed.js` file has better error handling and fallback airports if the library fails to load.

## 📋 Available Backend Servers

1. **server-fixed.js** (RECOMMENDED)
   - Has error handling
   - Includes fallback airports if library fails
   - More stable

2. **server-enhanced.js**
   - Full feature set
   - Requires airport-codes library to work

3. **server.js**
   - Simple version
   - Limited airports

## 🎯 API Endpoints to Test

Test these in your browser or with curl:

```bash
# Check if server is running
curl http://localhost:5000/api/health

# Search for airports
curl "http://localhost:5000/api/airports/search?q=new"
curl "http://localhost:5000/api/airports/search?q=paris"
curl "http://localhost:5000/api/airports/search?q=tok"

# Get specific airport
curl http://localhost:5000/api/airports/JFK
```

## 📱 Features Working

✅ **5,880 airports** searchable by:
- Airport code (IATA/ICAO)
- City name
- Country
- Airport name

✅ **Smart Search**:
- Debounced search (300ms delay)
- Relevance ranking
- Shows top 15 results

✅ **Rich Display**:
- Airport code, name, city, state, country
- Loading indicators
- Must select from suggestions for validation

## 🛑 Important Notes

1. **Keep both terminals open** - closing them will stop the servers
2. **Backend must run on port 5000** - frontend expects this
3. **Frontend runs on port 3001** - or 3000 if available
4. **CORS is configured** for localhost:3000 and localhost:3001

## 💡 Tips

- The backend loads all airports on startup (takes 1-2 seconds)
- Search is case-insensitive
- Partial matches work (e.g., "new" finds "New York", "Newcastle", etc.)
- The more specific your search, the better the results

---

If you continue to have issues, use the simplified test server for debugging:
```bash
cd backend
node test-server.js
```
