export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}

export interface AwardFlight {
  id: string;
  from: Airport;
  to: Airport;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  aircraft: string;
  cabinClass: 'Economy' | 'Premium Economy' | 'Business' | 'First';
  availability: {
    economy: number;
    premium: number;
    business: number;
    first: number;
  };
  pointsCost: {
    economy: number;
    premium: number;
    business: number;
    first: number;
  };
  loyaltyPrograms: string[];
  stops: number;
  layovers?: Airport[];
}

export interface FlightSearchParams {
  from: string;
  to: string;
  date: string;
  cabinClass?: string;
  passengers?: number;
  loyaltyProgram?: string;
}
