const express = require('express');
const cors = require('cors');
const SeatsAeroService = require('./services/seatsAeroService');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Initialize Seats.aero service
const seatsAeroService = new SeatsAeroService();

// Enable CORS for frontend
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://award-flights.vercel.app',
    'https://award-flights-anujthakur650-5380-anuj-singhs-projects-630eb593.vercel.app',
    'https://award-flights-anuj-singhs-projects-630eb593.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

// Load airport-codes library safely
let airportCodes;
let airportsCache = [];

try {
  airportCodes = require('airport-codes');
  console.log('✅ Airport-codes library loaded successfully');
  
  // Build cache of airports
  const allAirports = airportCodes.toJSON();
  
  for (const airport of allAirports) {
    if (airport.iata) {
      airportsCache.push({
        code: airport.iata,
        icao: airport.icao || '',
        name: airport.name || '',
        city: airport.city || '',
        state: airport.state || '',
        country: airport.country || '',
        lat: parseFloat(airport.latitude) || 0,
        lng: parseFloat(airport.longitude) || 0,
        timezone: airport.timezone || '',
        type: airport.type || 'airport'
      });
    }
  }
  
  console.log(`✅ Loaded ${airportsCache.length} airports into cache`);
} catch (error) {
  console.error('⚠️ Error loading airport-codes library:', error);
  console.log('Using fallback airport data...');
  
  // Fallback airports if library fails
  airportsCache = [
    { code: 'JFK', icao: 'KJFK', name: 'John F. Kennedy International', city: 'New York', state: 'NY', country: 'USA', lat: 40.6413, lng: -73.7781 },
    { code: 'LAX', icao: 'KLAX', name: 'Los Angeles International', city: 'Los Angeles', state: 'CA', country: 'USA', lat: 33.9425, lng: -118.4081 },
    { code: 'ORD', icao: 'KORD', name: "O'Hare International", city: 'Chicago', state: 'IL', country: 'USA', lat: 41.9742, lng: -87.9073 },
    { code: 'SFO', icao: 'KSFO', name: 'San Francisco International', city: 'San Francisco', state: 'CA', country: 'USA', lat: 37.6213, lng: -122.3790 },
    { code: 'MIA', icao: 'KMIA', name: 'Miami International', city: 'Miami', state: 'FL', country: 'USA', lat: 25.7959, lng: -80.2870 },
    { code: 'DFW', icao: 'KDFW', name: 'Dallas/Fort Worth International', city: 'Dallas', state: 'TX', country: 'USA', lat: 32.8998, lng: -97.0403 },
    { code: 'SEA', icao: 'KSEA', name: 'Seattle-Tacoma International', city: 'Seattle', state: 'WA', country: 'USA', lat: 47.4502, lng: -122.3088 },
    { code: 'BOS', icao: 'KBOS', name: 'Logan International', city: 'Boston', state: 'MA', country: 'USA', lat: 42.3656, lng: -71.0096 },
    { code: 'ATL', icao: 'KATL', name: 'Hartsfield-Jackson Atlanta International', city: 'Atlanta', state: 'GA', country: 'USA', lat: 33.6407, lng: -84.4277 },
    { code: 'LAS', icao: 'KLAS', name: 'Harry Reid International', city: 'Las Vegas', state: 'NV', country: 'USA', lat: 36.0840, lng: -115.1537 },
    { code: 'DEN', icao: 'KDEN', name: 'Denver International', city: 'Denver', state: 'CO', country: 'USA', lat: 39.8561, lng: -104.6737 },
    { code: 'PHX', icao: 'KPHX', name: 'Phoenix Sky Harbor International', city: 'Phoenix', state: 'AZ', country: 'USA', lat: 33.4343, lng: -112.0080 },
    { code: 'YYZ', icao: 'CYYZ', name: 'Toronto Pearson International', city: 'Toronto', state: 'ON', country: 'Canada', lat: 43.6777, lng: -79.6248 },
    { code: 'YVR', icao: 'CYVR', name: 'Vancouver International', city: 'Vancouver', state: 'BC', country: 'Canada', lat: 49.1967, lng: -123.1815 },
    { code: 'LHR', icao: 'EGLL', name: 'Heathrow', city: 'London', state: '', country: 'UK', lat: 51.4700, lng: -0.4543 },
    { code: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle', city: 'Paris', state: '', country: 'France', lat: 49.0097, lng: 2.5479 },
    { code: 'FRA', icao: 'EDDF', name: 'Frankfurt Airport', city: 'Frankfurt', state: '', country: 'Germany', lat: 50.0379, lng: 8.5622 },
    { code: 'AMS', icao: 'EHAM', name: 'Amsterdam Airport Schiphol', city: 'Amsterdam', state: '', country: 'Netherlands', lat: 52.3105, lng: 4.7683 },
    { code: 'MAD', icao: 'LEMD', name: 'Adolfo Suárez Madrid–Barajas', city: 'Madrid', state: '', country: 'Spain', lat: 40.4983, lng: -3.5676 },
    { code: 'BCN', icao: 'LEBL', name: 'Barcelona–El Prat', city: 'Barcelona', state: '', country: 'Spain', lat: 41.2974, lng: 2.0833 },
    { code: 'FCO', icao: 'LIRF', name: 'Leonardo da Vinci–Fiumicino', city: 'Rome', state: '', country: 'Italy', lat: 41.8003, lng: 12.2389 },
    { code: 'NRT', icao: 'RJAA', name: 'Narita International', city: 'Tokyo', state: '', country: 'Japan', lat: 35.7720, lng: 140.3929 },
    { code: 'HND', icao: 'RJTT', name: 'Haneda', city: 'Tokyo', state: '', country: 'Japan', lat: 35.5494, lng: 139.7798 },
    { code: 'ICN', icao: 'RKSI', name: 'Incheon International', city: 'Seoul', state: '', country: 'South Korea', lat: 37.4602, lng: 126.4407 },
    { code: 'HKG', icao: 'VHHH', name: 'Hong Kong International', city: 'Hong Kong', state: '', country: 'China', lat: 22.3080, lng: 113.9185 },
    { code: 'SIN', icao: 'WSSS', name: 'Singapore Changi', city: 'Singapore', state: '', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
    { code: 'BKK', icao: 'VTBS', name: 'Suvarnabhumi', city: 'Bangkok', state: '', country: 'Thailand', lat: 13.6900, lng: 100.7501 },
    { code: 'DXB', icao: 'OMDB', name: 'Dubai International', city: 'Dubai', state: '', country: 'UAE', lat: 25.2532, lng: 55.3657 },
    { code: 'SYD', icao: 'YSSY', name: 'Sydney Kingsford Smith', city: 'Sydney', state: 'NSW', country: 'Australia', lat: -33.9399, lng: 151.1753 },
    { code: 'MEL', icao: 'YMML', name: 'Melbourne Airport', city: 'Melbourne', state: 'VIC', country: 'Australia', lat: -37.6733, lng: 144.8430 },
  ];
}

// Routes
app.get('/api/health', async (req, res) => {
  const seatsAeroStatus = await seatsAeroService.testConnection();
  
  res.json({ 
    status: 'OK', 
    message: 'AeroPoints API is running',
    airportsLoaded: airportsCache.length,
    seatsAero: {
      configured: seatsAeroService.isConfigured(),
      status: seatsAeroStatus.success ? 'connected' : 'disconnected',
      message: seatsAeroStatus.message
    }
  });
});

// Search airports endpoint
app.get('/api/airports/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({ error: 'Query parameter "q" is required' });
    }
    
    const searchTerm = q.toLowerCase().trim();
    
    // Search with relevance scoring
    let results = airportsCache.filter(airport => {
      const code = (airport.code || '').toLowerCase();
      const name = (airport.name || '').toLowerCase();
      const city = (airport.city || '').toLowerCase();
      const country = (airport.country || '').toLowerCase();
      const icao = (airport.icao || '').toLowerCase();
      
      return code.includes(searchTerm) ||
             icao.includes(searchTerm) ||
             name.includes(searchTerm) ||
             city.includes(searchTerm) ||
             country.includes(searchTerm);
    });
    
    // Sort by relevance (exact matches first, then starts with, then contains)
    results.sort((a, b) => {
      const aCode = a.code.toLowerCase();
      const aCity = a.city.toLowerCase();
      const bCode = b.code.toLowerCase();
      const bCity = b.city.toLowerCase();
      
      // Exact code match
      if (aCode === searchTerm) return -1;
      if (bCode === searchTerm) return 1;
      
      // Code starts with
      if (aCode.startsWith(searchTerm) && !bCode.startsWith(searchTerm)) return -1;
      if (!aCode.startsWith(searchTerm) && bCode.startsWith(searchTerm)) return 1;
      
      // City starts with
      if (aCity.startsWith(searchTerm) && !bCity.startsWith(searchTerm)) return -1;
      if (!aCity.startsWith(searchTerm) && bCity.startsWith(searchTerm)) return 1;
      
      return 0;
    });
    
    // Limit to top 15 results
    results = results.slice(0, 15);
    
    res.json(results);
  } catch (error) {
    console.error('Error in airport search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all airports
app.get('/api/airports', (req, res) => {
  res.json(airportsCache);
});

// Get airport by code
app.get('/api/airports/:code', (req, res) => {
  const { code } = req.params;
  const airport = airportsCache.find(a => 
    a.code.toUpperCase() === code.toUpperCase() ||
    a.icao.toUpperCase() === code.toUpperCase()
  );
  
  if (!airport) {
    return res.status(404).json({ error: 'Airport not found' });
  }
  
  res.json(airport);
});

// Search flights endpoint - Now powered by Seats.aero API
app.post('/api/flights/search', async (req, res) => {
  try {
    const { from, to, date, cabinClass, passengers, loyaltyProgram } = req.body;
    
    if (!from || !to || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields: from, to, and date are required' 
      });
    }
    
    // Find airports
    const fromAirport = airportsCache.find(a => a.code === from.toUpperCase());
    const toAirport = airportsCache.find(a => a.code === to.toUpperCase());
    
    if (!fromAirport || !toAirport) {
      return res.status(404).json({ 
        error: 'Invalid airport codes provided' 
      });
    }
    
    console.log(`🔍 Flight search: ${from} → ${to}, ${date}, ${cabinClass || 'Economy'}`);
    
    // Search flights using Seats.aero API
    const flights = await seatsAeroService.searchFlights({
      from: from.toUpperCase(),
      to: to.toUpperCase(),
      date,
      cabinClass,
      passengers,
      loyaltyProgram
    });
    
    // Enhance flights with local airport data
    const enhancedFlights = flights.map(flight => ({
      ...flight,
      from: { ...flight.from, ...fromAirport },
      to: { ...flight.to, ...toAirport }
    }));
    
    console.log(`✅ Returning ${enhancedFlights.length} flights`);
    res.json(enhancedFlights);
    
  } catch (error) {
    console.error('❌ Error in flight search:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 AeroPoints Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`✈️ ${airportsCache.length} airports available`);
  console.log('\n📋 Test the API:');
  console.log(`  curl http://localhost:${PORT}/api/health`);
  console.log(`  curl "http://localhost:${PORT}/api/airports/search?q=new"`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });
});
