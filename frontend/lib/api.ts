const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

interface Airport {
  code: string;
  icao?: string;
  name: string;
  city: string;
  state?: string;
  country: string;
  lat: number;
  lng: number;
  timezone?: string;
  type?: string;
  size?: string;
}

interface AwardFlight {
  id: string;
  from: Airport;
  to: Airport;
  airline?: string;
  operatingAirline?: string;
  operatingAirlineCode?: string;
  bookingProgram?: string; // deprecated: use offers[].program
  flightNumber?: string;
  departureTime?: string;
  arrivalTime?: string;
  departureTimeLocal?: string | null;
  arrivalTimeLocal?: string | null;
  duration?: string;
  aircraft?: string;
  cabinClass?: string;
  // Real booking options from Seats.aero (multiple programs per flight)
  offers?: Array<{
    program: string;
    programCode?: string;
    miles?: number;
    taxes?: number;
    currency?: string;
    cabin?: string;
    remainingSeats?: number;
  }>;
  // Optional legacy fields for compatibility with older data shapes
  availability?: {
    economy: number;
    premium: number;
    business: number;
    first: number;
  };
  pointsCost?: {
    economy: number;
    premium: number;
    business: number;
    first: number;
  };
  loyaltyPrograms?: string[];
  stops: number;
  segments?: Array<{
    flightNumber: string;
    aircraft?: string;
    origin: string;
    destination: string;
    departureTime: string;
    arrivalTime: string;
    departureTimeLocal?: string | null;
    arrivalTimeLocal?: string | null;
    distance?: number;
    fareClass?: string;
  }>;
}

interface FlightSearchParams {
  from: string;
  to: string;
  date: string;
  cabinClass?: string;
  passengers?: number;
  loyaltyProgram?: string;
}

class AeroPointsAPI {
  private async fetcher(endpoint: string, options?: RequestInit) {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Airport endpoints
  async searchAirports(query: string): Promise<Airport[]> {
    return this.fetcher(`/airports/search?q=${encodeURIComponent(query)}`);
  }

  async getAirport(code: string): Promise<Airport> {
    return this.fetcher(`/airports/${code}`);
  }

  async getAllAirports(): Promise<Airport[]> {
    return this.fetcher('/airports');
  }

  // Flight endpoints
  async searchFlights(params: FlightSearchParams): Promise<AwardFlight[]> {
    return this.fetcher('/flights/search', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }

  async checkAvailability(flightId: string) {
    return this.fetcher(`/flights/availability/${flightId}`);
  }
}

export const api = new AeroPointsAPI();
export type { Airport, AwardFlight, FlightSearchParams };
