import { Router } from 'express';
import { searchAirports, getAirportByCode, airports } from '../data/airports';

const router = Router();

// Get all airports
router.get('/', (req, res) => {
  res.json(airports);
});

// Search airports
router.get('/search', (req, res) => {
  const { q } = req.query;
  
  if (!q || typeof q !== 'string') {
    return res.status(400).json({ error: 'Query parameter "q" is required' });
  }
  
  const results = searchAirports(q);
  res.json(results);
});

// Get airport by code
router.get('/:code', (req, res) => {
  const { code } = req.params;
  const airport = getAirportByCode(code);
  
  if (!airport) {
    return res.status(404).json({ error: 'Airport not found' });
  }
  
  res.json(airport);
});

export default router;
