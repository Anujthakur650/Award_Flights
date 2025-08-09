const express = require('express');
const cors = require('cors');
const airportCodes = require('airport-codes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Cache for performance
let airportsCache = null;

// Initialize airports cache
function initializeAirportsCache() {
  if (!airportsCache) {
    // Get all airports from the library
    airportsCache = [];
    
    // The airport-codes library provides access to thousands of airports
    // We'll iterate through and build our cache
    const allAirports = airportCodes.toJSON();
    
    for (const airport of allAirports) {
      if (airport.iata) {  // Only include airports with IATA codes
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
          type: airport.type || 'airport',
          size: airport.size || 'medium'
        });
      }
    }
    
    console.log(`✅ Loaded ${airportsCache.length} airports into cache`);
  }
  return airportsCache;
}

// Initialize cache on startup
initializeAirportsCache();

// Routes
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'AeroPoints API is running',
    airportsLoaded: airportsCache ? airportsCache.length : 0
  });
});

// Search airports with enhanced functionality
app.get('/api/airports/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  const searchTerm = q.toLowerCase().trim();
  const airports = initializeAirportsCache();
  
  // Search with relevance scoring
  let results = airports.filter(airport => {
    const code = (airport.code || '').toLowerCase();
    const name = (airport.name || '').toLowerCase();
    const city = (airport.city || '').toLowerCase();
    const country = (airport.country || '').toLowerCase();
    const icao = (airport.icao || '').toLowerCase();
    
    // Exact code match (highest priority)
    if (code === searchTerm || icao === searchTerm) {
      airport.relevance = 10;
      return true;
    }
    
    // Code starts with search term
    if (code.startsWith(searchTerm)) {
      airport.relevance = 8;
      return true;
    }
    
    // City starts with search term
    if (city.startsWith(searchTerm)) {
      airport.relevance = 7;
      return true;
    }
    
    // Name starts with search term
    if (name.startsWith(searchTerm)) {
      airport.relevance = 6;
      return true;
    }
    
    // Contains in city
    if (city.includes(searchTerm)) {
      airport.relevance = 5;
      return true;
    }
    
    // Contains in name
    if (name.includes(searchTerm)) {
      airport.relevance = 4;
      return true;
    }
    
    // Contains in country
    if (country.includes(searchTerm)) {
      airport.relevance = 3;
      return true;
    }
    
    return false;
  });
  
  // Sort by relevance and limit to top 15 results
  results = results
    .sort((a, b) => (b.relevance || 0) - (a.relevance || 0))
    .slice(0, 15)
    .map(({ relevance, ...airport }) => airport); // Remove relevance score from output
  
  res.json(results);
});

// Get airport by code (IATA or ICAO)
app.get('/api/airports/:code', (req, res) => {
  const { code } = req.params;
  const searchCode = code.toUpperCase();
  
  // Try to find by IATA code first
  let airport = airportCodes.findWhere({ iata: searchCode });
  
  // If not found, try ICAO code
  if (!airport) {
    airport = airportCodes.findWhere({ icao: searchCode });
  }
  
  if (!airport) {
    return res.status(404).json({ error: 'Airport not found' });
  }
  
  res.json({
    code: airport.iata || '',
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
});

// Get all major airports (for dropdown or initial data)
app.get('/api/airports/major', (req, res) => {
  const airports = initializeAirportsCache();
  
  // Filter for major airports (large size or major cities)
  const majorAirports = airports
    .filter(airport => {
      // Include major international airports
      const majorCodes = ['JFK', 'LAX', 'ORD', 'ATL', 'DFW', 'SFO', 'MIA', 'BOS', 'SEA', 'LAS',
                         'LHR', 'CDG', 'FRA', 'AMS', 'MAD', 'BCN', 'FCO', 'MUC', 'ZRH',
                         'DXB', 'SIN', 'HKG', 'NRT', 'ICN', 'BKK', 'KUL', 'DEL', 'BOM',
                         'SYD', 'MEL', 'AKL', 'BNE', 'PER',
                         'GRU', 'EZE', 'MEX', 'YYZ', 'YVR'];
      return majorCodes.includes(airport.code);
    })
    .sort((a, b) => a.city.localeCompare(b.city));
  
  res.json(majorAirports);
});

// Get airports by country
app.get('/api/airports/country/:country', (req, res) => {
  const { country } = req.params;
  const airports = initializeAirportsCache();
  
  const results = airports
    .filter(airport => 
      airport.country.toLowerCase() === country.toLowerCase()
    )
    .sort((a, b) => a.city.localeCompare(b.city));
  
  res.json(results);
});

// Get nearby airports (by coordinates)
app.get('/api/airports/nearby', (req, res) => {
  const { lat, lng, radius = 100 } = req.query; // radius in km
  
  if (!lat || !lng) {
    return res.status(400).json({ 
      error: 'Latitude (lat) and longitude (lng) are required' 
    });
  }
  
  const airports = initializeAirportsCache();
  const userLat = parseFloat(lat);
  const userLng = parseFloat(lng);
  const maxDistance = parseFloat(radius);
  
  // Calculate distance using Haversine formula
  function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of Earth in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
  
  const nearbyAirports = airports
    .map(airport => ({
      ...airport,
      distance: getDistance(userLat, userLng, airport.lat, airport.lng)
    }))
    .filter(airport => airport.distance <= maxDistance)
    .sort((a, b) => a.distance - b.distance)
    .slice(0, 10);
  
  res.json(nearbyAirports);
});

// Search flights (enhanced with real airport data)
app.post('/api/flights/search', async (req, res) => {
  const { from, to, date, cabinClass, passengers, loyaltyProgram } = req.body;
  
  if (!from || !to || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields: from, to, and date are required' 
    });
  }
  
  // Get real airport data
  const fromAirport = airportCodes.findWhere({ iata: from.toUpperCase() });
  const toAirport = airportCodes.findWhere({ iata: to.toUpperCase() });
  
  if (!fromAirport || !toAirport) {
    return res.status(404).json({ 
      error: 'Invalid airport codes provided' 
    });
  }
  
  // Calculate approximate flight duration based on distance
  function calculateFlightDuration(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c;
    
    // Rough estimate: 800km/h average speed + 30 min for takeoff/landing
    const hours = (distance / 800) + 0.5;
    return Math.round(hours * 60); // Return in minutes
  }
  
  const flightDuration = calculateFlightDuration(
    parseFloat(fromAirport.latitude),
    parseFloat(fromAirport.longitude),
    parseFloat(toAirport.latitude),
    parseFloat(toAirport.longitude)
  );
  
  // Generate mock flights with realistic data
  const airlines = [
    { name: 'United Airlines', code: 'UA', programs: ['United MileagePlus', 'Chase Ultimate Rewards'] },
    { name: 'American Airlines', code: 'AA', programs: ['American AAdvantage', 'Citi ThankYou Points'] },
    { name: 'Delta Air Lines', code: 'DL', programs: ['Delta SkyMiles', 'Amex Membership Rewards'] },
    { name: 'Singapore Airlines', code: 'SQ', programs: ['KrisFlyer', 'Chase Ultimate Rewards', 'Amex Membership Rewards'] },
    { name: 'Emirates', code: 'EK', programs: ['Emirates Skywards', 'Capital One Miles'] },
    { name: 'British Airways', code: 'BA', programs: ['Avios', 'Chase Ultimate Rewards'] },
    { name: 'Air France', code: 'AF', programs: ['Flying Blue', 'Chase Ultimate Rewards'] },
    { name: 'Lufthansa', code: 'LH', programs: ['Miles & More', 'United MileagePlus'] },
  ];
  
  const aircraft = ['Boeing 777-300ER', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 737 MAX', 'Airbus A320neo'];
  
  const flights = [];
  const baseDate = new Date(date);
  const numFlights = Math.floor(Math.random() * 4) + 4; // 4-7 flights
  
  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const departureHour = 6 + Math.floor(Math.random() * 14); // 6 AM to 8 PM
    const departureMinute = Math.floor(Math.random() * 4) * 15; // 0, 15, 30, or 45
    
    const departureTime = new Date(baseDate);
    departureTime.setHours(departureHour, departureMinute, 0, 0);
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDuration);
    
    // Determine stops based on distance
    const distance = flightDuration * 800 / 60; // Rough distance in km
    const stops = distance < 2000 ? 0 : distance < 5000 ? (Math.random() > 0.5 ? 0 : 1) : (Math.random() > 0.3 ? 1 : 2);
    
    flights.push({
      id: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
      from: {
        code: fromAirport.iata,
        name: fromAirport.name,
        city: fromAirport.city,
        country: fromAirport.country,
        lat: parseFloat(fromAirport.latitude),
        lng: parseFloat(fromAirport.longitude)
      },
      to: {
        code: toAirport.iata,
        name: toAirport.name,
        city: toAirport.city,
        country: toAirport.country,
        lat: parseFloat(toAirport.latitude),
        lng: parseFloat(toAirport.longitude)
      },
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
        economy: Math.floor(distance * 8 + Math.random() * 10000),
        premium: Math.floor(distance * 12 + Math.random() * 15000),
        business: Math.floor(distance * 20 + Math.random() * 25000),
        first: Math.floor(distance * 35 + Math.random() * 40000),
      },
      loyaltyPrograms: airline.programs,
      stops: stops,
    });
  }
  
  // Sort by departure time
  flights.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
  
  // Filter by loyalty program if specified
  if (loyaltyProgram) {
    const programMap = {
      'united': 'United MileagePlus',
      'american': 'American AAdvantage',
      'delta': 'Delta SkyMiles',
      'chase': 'Chase Ultimate Rewards',
      'amex': 'Amex Membership Rewards',
      'capital': 'Capital One Miles',
      'citi': 'Citi ThankYou Points',
    };
    
    const programName = programMap[loyaltyProgram];
    if (programName) {
      const filteredFlights = flights.filter(flight => 
        flight.loyaltyPrograms.includes(programName)
      );
      return res.json(filteredFlights);
    }
  }
  
  res.json(flights);
});

// Statistics endpoint
app.get('/api/stats', (req, res) => {
  const airports = initializeAirportsCache();
  
  // Group airports by country
  const byCountry = {};
  airports.forEach(airport => {
    if (!byCountry[airport.country]) {
      byCountry[airport.country] = 0;
    }
    byCountry[airport.country]++;
  });
  
  res.json({
    totalAirports: airports.length,
    countries: Object.keys(byCountry).length,
    topCountries: Object.entries(byCountry)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([country, count]) => ({ country, count }))
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Enhanced AeroPoints Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
  console.log(`✈️ Loaded ${airportsCache ? airportsCache.length : 0} airports from database`);
  console.log('\n📋 Available endpoints:');
  console.log('  GET  /api/airports/search?q={query} - Search airports');
  console.log('  GET  /api/airports/major - Get major international airports');
  console.log('  GET  /api/airports/:code - Get airport by IATA/ICAO code');
  console.log('  GET  /api/airports/country/:country - Get airports by country');
  console.log('  GET  /api/airports/nearby?lat={lat}&lng={lng}&radius={km} - Get nearby airports');
  console.log('  POST /api/flights/search - Search for flights');
  console.log('  GET  /api/stats - Get statistics');
});
