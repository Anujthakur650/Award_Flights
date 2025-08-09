import { Router } from 'express';
import { searchFlights } from '../services/flightService';
import { FlightSearchParams } from '../types';

const router = Router();

// Search for award flights
router.post('/search', async (req, res) => {
  try {
    const params: FlightSearchParams = req.body;
    
    // Validate required fields
    if (!params.from || !params.to || !params.date) {
      return res.status(400).json({ 
        error: 'Missing required fields: from, to, and date are required' 
      });
    }
    
    const flights = await searchFlights(params);
    res.json(flights);
  } catch (error) {
    console.error('Flight search error:', error);
    res.status(500).json({ 
      error: 'Failed to search flights',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Get flight availability (mock endpoint)
router.get('/availability/:flightId', async (req, res) => {
  // Simulate checking real-time availability
  await new Promise(resolve => setTimeout(resolve, 500));
  
  res.json({
    flightId: req.params.flightId,
    available: Math.random() > 0.3,
    lastChecked: new Date().toISOString(),
    seatsRemaining: {
      economy: Math.floor(Math.random() * 10),
      premium: Math.floor(Math.random() * 5),
      business: Math.floor(Math.random() * 3),
      first: Math.floor(Math.random() * 2),
    }
  });
});

export default router;
