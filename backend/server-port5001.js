const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5001; // Changed from 5000 to avoid macOS Control Center conflict

// Enable CORS for frontend
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
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
    { code: 'EWR', icao: 'KEWR', name: 'Newark Liberty International', city: 'Newark', state: 'NJ', country: 'USA', lat: 40.6925, lng: -74.1687 },
    { code: 'LGA', icao: 'KLGA', name: 'LaGuardia', city: 'New York', state: 'NY', country: 'USA', lat: 40.7772, lng: -73.8726 },
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
    { code: 'LGW', icao: 'EGKK', name: 'Gatwick', city: 'London', state: '', country: 'UK', lat: 51.1537, lng: -0.1821 },
    { code: 'CDG', icao: 'LFPG', name: 'Charles de Gaulle', city: 'Paris', state: '', country: 'France', lat: 49.0097, lng: 2.5479 },
    { code: 'ORY', icao: 'LFPO', name: 'Orly', city: 'Paris', state: '', country: 'France', lat: 48.7233, lng: 2.3795 },
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
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AeroPoints API is running on port 5001',
    airportsLoaded: airportsCache.length,
    port: PORT
  });
});

// Search airports endpoint
app.get('/api/airports/search', (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q || q === '') {
      return res.json([]); // Return empty array for empty query
    }
    
    const searchTerm = q.toString().toLowerCase().trim();
    
    // Search airports
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
    
    // Sort by relevance
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
    res.status(500).json({ error: 'Internal server error', message: error.message });
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

// Search flights endpoint
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
    
    // Generate mock flights
    const airlines = [
      { name: 'United Airlines', code: 'UA', programs: ['United MileagePlus', 'Chase Ultimate Rewards'] },
      { name: 'American Airlines', code: 'AA', programs: ['American AAdvantage', 'Citi ThankYou Points'] },
      { name: 'Delta Air Lines', code: 'DL', programs: ['Delta SkyMiles', 'Amex Membership Rewards'] },
      { name: 'Singapore Airlines', code: 'SQ', programs: ['KrisFlyer', 'Chase Ultimate Rewards', 'Amex Membership Rewards'] },
      { name: 'Emirates', code: 'EK', programs: ['Emirates Skywards', 'Capital One Miles'] },
    ];
    
    const aircraft = ['Boeing 777-300ER', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 737 MAX', 'Airbus A320neo'];
    
    const flights = [];
    const baseDate = new Date(date);
    const numFlights = Math.floor(Math.random() * 4) + 4; // 4-7 flights
    
    for (let i = 0; i < numFlights; i++) {
      const airline = airlines[Math.floor(Math.random() * airlines.length)];
      const departureHour = 6 + Math.floor(Math.random() * 14); // 6 AM to 8 PM
      const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
      const flightDuration = Math.floor(Math.random() * 10 + 2) * 60; // 2-12 hours in minutes
      
      const departureTime = new Date(baseDate);
      departureTime.setHours(departureHour, departureMinute, 0, 0);
      
      const arrivalTime = new Date(departureTime);
      arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDuration);
      
      flights.push({
        id: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
        from: fromAirport,
        to: toAirport,
        airline: airline.name,
        flightNumber: `${airline.code} ${Math.floor(Math.random() * 9000) + 1000}`,
        departureTime: departureTime.toISOString(),
        arrivalTime: arrivalTime.toISOString(),
        duration: `${Math.floor(flightDuration / 60)}h ${flightDuration % 60}m`,
        aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
        cabinClass: cabinClass || 'Economy',
        availability: {
          economy: Math.floor(Math.random() * 9) + 1,
          premium: Math.floor(Math.random() * 5) + 1,
          business: Math.floor(Math.random() * 3) + 1,
          first: Math.floor(Math.random() * 2) + 1,
        },
        pointsCost: {
          economy: Math.floor(Math.random() * 30000) + 15000,
          premium: Math.floor(Math.random() * 50000) + 35000,
          business: Math.floor(Math.random() * 80000) + 60000,
          first: Math.floor(Math.random() * 150000) + 100000,
        },
        loyaltyPrograms: airline.programs,
        stops: Math.random() > 0.6 ? 0 : 1,
      });
    }
    
    // Sort by departure time
    flights.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
    
    res.json(flights);
  } catch (error) {
    console.error('Error in flight search:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════╗
║                                                        ║
║   🚀 AeroPoints Backend Server                        ║
║   ✅ Running on port ${PORT}                              ║
║   📍 API URL: http://localhost:${PORT}/api                ║
║   ✈️  ${airportsCache.length} airports available                      ║
║                                                        ║
║   Test endpoints:                                      ║
║   • http://localhost:${PORT}/api/health                   ║
║   • http://localhost:${PORT}/api/airports/search?q=new    ║
║                                                        ║
╚════════════════════════════════════════════════════════╝
  `);
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
