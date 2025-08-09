import { AwardFlight, FlightSearchParams } from '../types';
import { getAirportByCode } from '../data/airports';

// Generate mock award flights
export function generateMockFlights(params: FlightSearchParams): AwardFlight[] {
  const fromAirport = getAirportByCode(params.from);
  const toAirport = getAirportByCode(params.to);
  
  if (!fromAirport || !toAirport) {
    return [];
  }

  const airlines = [
    { name: 'United Airlines', code: 'UA', programs: ['United MileagePlus', 'Chase Ultimate Rewards'] },
    { name: 'American Airlines', code: 'AA', programs: ['American AAdvantage', 'Citi ThankYou Points'] },
    { name: 'Delta Air Lines', code: 'DL', programs: ['Delta SkyMiles', 'Amex Membership Rewards'] },
    { name: 'Singapore Airlines', code: 'SQ', programs: ['KrisFlyer', 'Chase Ultimate Rewards', 'Amex Membership Rewards'] },
    { name: 'Emirates', code: 'EK', programs: ['Emirates Skywards', 'Capital One Miles'] },
    { name: 'Lufthansa', code: 'LH', programs: ['Miles & More', 'United MileagePlus'] },
    { name: 'British Airways', code: 'BA', programs: ['Avios', 'Chase Ultimate Rewards', 'American AAdvantage'] },
    { name: 'Air France', code: 'AF', programs: ['Flying Blue', 'Chase Ultimate Rewards', 'Amex Membership Rewards'] },
  ];

  const aircraft = ['Boeing 777-300ER', 'Boeing 787-9', 'Airbus A350-900', 'Boeing 747-8', 'Airbus A380-800'];
  
  const flights: AwardFlight[] = [];
  const baseDate = new Date(params.date);
  
  // Generate 5-10 flights for the search
  const numFlights = Math.floor(Math.random() * 6) + 5;
  
  for (let i = 0; i < numFlights; i++) {
    const airline = airlines[Math.floor(Math.random() * airlines.length)];
    const departureHour = Math.floor(Math.random() * 24);
    const departureMinute = Math.floor(Math.random() * 60);
    const flightDuration = Math.floor(Math.random() * 10 + 2) * 60; // 2-12 hours in minutes
    
    const departureTime = new Date(baseDate);
    departureTime.setHours(departureHour, departureMinute, 0, 0);
    
    const arrivalTime = new Date(departureTime);
    arrivalTime.setMinutes(arrivalTime.getMinutes() + flightDuration);
    
    const stops = Math.random() > 0.6 ? 0 : Math.random() > 0.5 ? 1 : 2;
    
    const flight: AwardFlight = {
      id: `${airline.code}${Math.floor(Math.random() * 9000) + 1000}`,
      from: fromAirport,
      to: toAirport,
      airline: airline.name,
      flightNumber: `${airline.code} ${Math.floor(Math.random() * 9000) + 1000}`,
      departureTime: departureTime.toISOString(),
      arrivalTime: arrivalTime.toISOString(),
      duration: `${Math.floor(flightDuration / 60)}h ${flightDuration % 60}m`,
      aircraft: aircraft[Math.floor(Math.random() * aircraft.length)],
      cabinClass: 'Economy',
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
      stops: stops,
    };
    
    flights.push(flight);
  }
  
  // Sort by departure time
  flights.sort((a, b) => new Date(a.departureTime).getTime() - new Date(b.departureTime).getTime());
  
  return flights;
}

export async function searchFlights(params: FlightSearchParams): Promise<AwardFlight[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  // Filter by loyalty program if specified
  let flights = generateMockFlights(params);
  
  if (params.loyaltyProgram) {
    const programMap: { [key: string]: string } = {
      'united': 'United MileagePlus',
      'american': 'American AAdvantage',
      'delta': 'Delta SkyMiles',
      'chase': 'Chase Ultimate Rewards',
      'amex': 'Amex Membership Rewards',
      'capital': 'Capital One Miles',
      'citi': 'Citi ThankYou Points',
    };
    
    const programName = programMap[params.loyaltyProgram];
    if (programName) {
      flights = flights.filter(flight => 
        flight.loyaltyPrograms.includes(programName)
      );
    }
  }
  
  return flights;
}
