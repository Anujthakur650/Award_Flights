const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:3001'],
  credentials: true
}));
app.use(express.json());

// Sample airports data
const airports = [
  { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA', lat: 40.6413, lng: -73.7781 },
  { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA', lat: 33.9425, lng: -118.4081 },
  { code: 'ORD', name: "O'Hare International", city: 'Chicago', country: 'USA', lat: 41.9742, lng: -87.9073 },
  { code: 'SFO', name: 'San Francisco International', city: 'San Francisco', country: 'USA', lat: 37.6213, lng: -122.3790 },
  { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK', lat: 51.4700, lng: -0.4543 },
  { code: 'CDG', name: 'Charles de Gaulle', city: 'Paris', country: 'France', lat: 49.0097, lng: 2.5479 },
  { code: 'NRT', name: 'Narita International', city: 'Tokyo', country: 'Japan', lat: 35.7720, lng: 140.3929 },
  { code: 'SIN', name: 'Singapore Changi', city: 'Singapore', country: 'Singapore', lat: 1.3644, lng: 103.9915 },
  { code: 'DXB', name: 'Dubai International', city: 'Dubai', country: 'UAE', lat: 25.2532, lng: 55.3657 },
  { code: 'SYD', name: 'Sydney Kingsford Smith', city: 'Sydney', country: 'Australia', lat: -33.9399, lng: 151.1753 },
];

// Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'AeroPoints API is running' });
});

// Search airports
app.get('/api/airports/search', (req, res) => {
  const { q } = req.query;
  
  if (!q) {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  const searchTerm = q.toLowerCase();
  const results = airports.filter(airport => 
    airport.code.toLowerCase().includes(searchTerm) ||
    airport.name.toLowerCase().includes(searchTerm) ||
    airport.city.toLowerCase().includes(searchTerm) ||
    airport.country.toLowerCase().includes(searchTerm)
  ).slice(0, 10);
  
  res.json(results);
});

// Get all airports
app.get('/api/airports', (req, res) => {
  res.json(airports);
});

// Search flights
app.post('/api/flights/search', async (req, res) => {
  const { from, to, date, cabinClass, passengers, loyaltyProgram } = req.body;
  
  if (!from || !to || !date) {
    return res.status(400).json({ 
      error: 'Missing required fields: from, to, and date are required' 
    });
  }
  
  // Find airports
  const fromAirport = airports.find(a => a.code === from);
  const toAirport = airports.find(a => a.code === to);
  
  if (!fromAirport || !toAirport) {
    return res.json([]); // Return empty array if airports not found
  }
  
  // Generate mock flights
  const airlines = [
    { name: 'United Airlines', code: 'UA', programs: ['United MileagePlus', 'Chase Ultimate Rewards'] },
    { name: 'American Airlines', code: 'AA', programs: ['American AAdvantage', 'Citi ThankYou Points'] },
    { name: 'Delta Air Lines', code: 'DL', programs: ['Delta SkyMiles', 'Amex Membership Rewards'] },
    { name: 'Singapore Airlines', code: 'SQ', programs: ['KrisFlyer', 'Chase Ultimate Rewards', 'Amex Membership Rewards'] },
    { name: 'Emirates', code: 'EK', programs: ['Emirates Skywards', 'Capital One Miles'] },
  ];
  
  const aircraft = ['Boeing 777-300ER', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 747-8', 'Airbus A380-800'];
  
  const flights = [];
  const baseDate = new Date(date);
  const numFlights = Math.floor(Math.random() * 5) + 3; // 3-7 flights
  
  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const departureHour = Math.floor(Math.random() * 24);
    const departureMinute = Math.floor(Math.random() * 60);
    const flightDuration = Math.floor(Math.random() * 10 + 2) * 60; // 2-12 hours
    
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
        economy: Math.floor(Math.random() * 10),
        premium: Math.floor(Math.random() * 6),
        business: Math.floor(Math.random() * 4),
        first: Math.floor(Math.random() * 2),
      },
      pointsCost: {
        economy: Math.floor(Math.random() * 30000) + 15000,
        premium: Math.floor(Math.random() * 50000) + 35000,
        business: Math.floor(Math.random() * 80000) + 60000,
        first: Math.floor(Math.random() * 150000) + 100000,
      },
      loyaltyPrograms: airline.programs,
      stops: Math.random() > 0.6 ? 0 : Math.random() > 0.5 ? 1 : 2,
    });
  }
  
  // Sort by departure time
  flights.sort((a, b) => new Date(a.departureTime) - new Date(b.departureTime));
  
  // Simulate delay
  setTimeout(() => {
    res.json(flights);
  }, 500);
});

app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API URL: http://localhost:${PORT}/api`);
});
