const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 5000;

// Enable CORS for all origins during testing
app.use(cors());
app.use(express.json());

// Simple test endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Test server is running' });
});

// Test airport search
app.get('/api/airports/search', (req, res) => {
  const { q } = req.query;
  
  // Return some test airports
  const testAirports = [
    { code: 'JFK', name: 'John F. Kennedy International', city: 'New York', country: 'USA' },
    { code: 'LAX', name: 'Los Angeles International', city: 'Los Angeles', country: 'USA' },
    { code: 'LHR', name: 'Heathrow', city: 'London', country: 'UK' },
  ].filter(airport => 
    airport.code.toLowerCase().includes(q.toLowerCase()) ||
    airport.city.toLowerCase().includes(q.toLowerCase())
  );
  
  res.json(testAirports);
});

app.listen(PORT, () => {
  console.log(`Test server running on port ${PORT}`);
});
