/**
 * Seats.aero API Integration Service
 * Handles real flight search requests to Seats.aero API
 */

const axios = require('axios');

// Helper: pick the first non-empty property value by trying several possible field names
function pick(obj, keys) {
  if (!obj) return null;
  for (const k of keys) {
    if (Object.prototype.hasOwnProperty.call(obj, k) && obj[k]) return obj[k];
  }
  return null;
}

class SeatsAeroService {
  constructor() {
    this.apiKey = process.env.SEATS_AERO_API_KEY;
    // Based on Seats.aero documentation, the API uses different base URLs for different endpoints
    this.baseURL = process.env.SEATS_AERO_BASE_URL || 'https://seats.aero';
    this.partnerAPIPath = '/partnerapi';
    this.headers = {
      'Partner-Authorization': this.apiKey,
      'Content-Type': 'application/json',
      'User-Agent': 'AeroPoints/1.0'
    };
  }

  /**
   * Call Seats.aero Live Search to get trips directly
   * @param {{origin_airport:string, destination_airport:string, start_date:string, end_date:string, cabin:string, source?:string}} params 
   */
  async fetchLiveTrips(params) {
    if (!this.isConfigured()) {
      throw new Error('API not configured');
    }
    try {
      const response = await axios.post(`${this.baseURL}${this.partnerAPIPath}/live/search`, params, {
        headers: this.headers,
        timeout: 45000
      });
      console.log(`✅ Live trips fetched: ${Array.isArray(response.data?.data) ? response.data.data.length : 0}`);
      return response.data;
    } catch (error) {
      console.error('❌ Live search failed:', error.message);
      return null;
    }
  }
  /**
   * Search for award flights using Seats.aero API
   * @param {Object} searchParams - Flight search parameters
   * @returns {Promise<Array>} - Array of flight results
   */
  async searchFlights(searchParams) {
    const { from, to, date, cabinClass, passengers, loyaltyProgram } = searchParams;
    
    if (!this.apiKey || this.apiKey === 'your-api-key-here') {
      console.warn('⚠️ Seats.aero API key not configured');
      return [];
    }

    try {
      // Map AeroPoints parameters to Seats.aero API format
      const apiParams = {
        origin: from,
        destination: to,
        departureDate: date,
        cabin: this.mapCabinClass(cabinClass),
        passengers: passengers || 1,
        program: loyaltyProgram || 'all'
      };

      console.log(`🔍 Searching Seats.aero: ${from} → ${to} on ${date}`);
      
      // Use the correct Seats.aero API parameter format based on documentation
      let response;
      try {
        // Cached Search (GET) - matches documentation exactly
        const cachedParams = {
          origin_airport: from,
          destination_airport: to,
          cabin: this.mapCabinClass(cabinClass),
          start_date: date,
          end_date: date // For single date search, start and end are the same
        };

        console.log('🔍 Trying cached search with params:', cachedParams);
        
        response = await axios.get(
          `${this.baseURL}${this.partnerAPIPath}/search`,
          { 
            headers: this.headers,
            params: cachedParams,
            timeout: 15000
          }
        );
        console.log('✅ Used cached search data');
      } catch (cachedError) {
        console.log('📋 Cached search failed:', cachedError.message);
        console.log('🚀 Trying live search (POST)...');
        
        // Live Search (POST) - for real-time queries
        const liveSearchBody = {
          origin_airport: from,
          destination_airport: to,
          cabin: this.mapCabinClass(cabinClass),
          start_date: date,
          end_date: date,
          passengers: passengers || 1,
          include_filtered: false // Based on Get Trips documentation
        };

        response = await axios.post(
          `${this.baseURL}${this.partnerAPIPath}/live/search`,
          liveSearchBody,
          { 
            headers: this.headers,
            timeout: 30000
          }
        );
        console.log('✅ Used live search data');
      }

      let flights = this.transformSeatsAeroResponse(response.data, searchParams);
      
      if (flights.length === 0) {
        console.log('📭 No award availability found in Seats.aero for this route/date');
        return [];
      }
      
      // Enhance flights with real trip details and consolidate booking options
      console.log(`📥 Enhancing ${flights.length} flights with real trip details...`);
      const enhanced = await this.enhanceFlightsWithTripDetails(flights, searchParams);

      // Return only real-data flights (no placeholders)
      const realFlights = enhanced.filter(f => f && f.realData && Array.isArray(f.offers) && f.offers.length > 0);
      console.log(`✅ Found ${realFlights.length} enhanced flights from Seats.aero`);
      return realFlights;

    } catch (error) {
      console.error('❌ Seats.aero API Error:', error.message);
      
      if (error.response) {
        console.error('API Response:', error.response.status, error.response.data);
      }
      
      // Return empty array when API fails - no more mock data
      console.log('❌ API failed, returning empty results');
      return [];
    }
  }

  /**
   * Map cabin class names to Seats.aero format
   */
  mapCabinClass(cabinClass) {
    const mapping = {
      'Economy': 'economy',
      'Premium Economy': 'premium',
      'Business': 'business',
      'First': 'first'
    };
    return mapping[cabinClass] || 'economy';
  }

  /**
   * Transform Seats.aero API response to AeroPoints format
   * Based on documentation: Seats.aero provides availability objects with trip data
   */
  transformSeatsAeroResponse(seatsAeroData, searchParams) {
    const { from, to } = searchParams;
    
    console.log('🔄 Transforming Seats.aero response:', Object.keys(seatsAeroData));
    
    // Handle actual Seats.aero response structure
    // API returns: {"data": [], "count": 0, "hasMore": false, "cursor": timestamp}
    let availabilityData = [];
    
    if (seatsAeroData.data && Array.isArray(seatsAeroData.data)) {
      // Standard Seats.aero response format
      availabilityData = seatsAeroData.data;
      console.log(`📊 Seats.aero returned ${seatsAeroData.count} records, hasMore: ${seatsAeroData.hasMore}`);
    } else if (seatsAeroData.availability && Array.isArray(seatsAeroData.availability)) {
      // Alternative availability response
      availabilityData = seatsAeroData.availability;
    } else if (Array.isArray(seatsAeroData)) {
      // Direct array response
      availabilityData = seatsAeroData;
    } else {
      console.warn('⚠️ Unexpected Seats.aero response format:', Object.keys(seatsAeroData));
      console.log('📋 Full response:', JSON.stringify(seatsAeroData, null, 2));
      
      // Check if API returned empty but valid response
      if (seatsAeroData.count === 0 && seatsAeroData.data) {
        console.log('✅ Valid API response but no availability data for this route/date');
        return [];
      }
      return [];
    }
    
    console.log(`📊 Processing ${availabilityData.length} availability records`);
    
    // Initialize flights array
    const flights = [];
    
    // Transform availability objects to flight format
    for (let i = 0; i < availabilityData.length; i++) {
      const availability = availabilityData[i];
      
      // Log first few records to understand data structure
      if (i < 2) {
        console.log(`📋 Sample availability record ${i+1}:`, JSON.stringify(availability, null, 2));
      }
      
      // Process real Seats.aero availability data structure
      if (availability && availability.Route && availability.Source) {
        // Determine requested cabin
        const requestedCabin = this.mapCabinClass(searchParams.cabinClass) || 'business';

        // Evaluate availability more broadly: use Available flags or mileage cost presence
        let hasAvailability = false;
        let availableSeats = 0;
        let airline = '';
        if (requestedCabin === 'economy') {
          hasAvailability = Boolean(availability.YAvailable || availability.YAvailableRaw || (availability.YMileageCostRaw || 0) > 0);
          availableSeats = availability.YRemainingSeats || availability.YRemainingSeatsRaw || 0;
          airline = availability.YAirlines || availability.YAirlinesRaw || '';
        } else if (requestedCabin === 'business') {
          hasAvailability = Boolean(availability.JAvailable || availability.JAvailableRaw || (availability.JMileageCostRaw || 0) > 0);
          availableSeats = availability.JRemainingSeats || availability.JRemainingSeatsRaw || 0;
          airline = availability.JAirlines || availability.JAirlinesRaw || '';
        } else if (requestedCabin === 'first') {
          hasAvailability = Boolean(availability.FAvailable || availability.FAvailableRaw || (availability.FMileageCostRaw || 0) > 0);
          availableSeats = availability.FRemainingSeats || availability.FRemainingSeatsRaw || 0;
          airline = availability.FAirlines || availability.FAirlinesRaw || '';
        } else if (requestedCabin === 'premium') {
          hasAvailability = Boolean(availability.WAvailable || availability.WAvailableRaw || (availability.WMileageCostRaw || 0) > 0);
          availableSeats = availability.WRemainingSeats || availability.WRemainingSeatsRaw || 0;
          airline = availability.WAirlines || availability.WAirlinesRaw || '';
        }

        if (hasAvailability) {
          // Create flight object using availability
          const flight = {
            id: `${availability.Source}_${availability.RouteID || availability.Route?.ID || 'route'}_${availability.Date}`,
            route: availability.Route,
            source: availability.Source, // Mileage program
            cabin: requestedCabin,
            date: availability.Date,
            airline: airline,
            availableSeats: availableSeats,
            seatsAeroData: availability
          };

          flights.push(flight);
          console.log(`✅ Found availability: ${flight.source} - ${flight.airline || 'unknown'} - ${flight.cabin} (${availableSeats} seats)`);
        }
      }
    }
    
    // Do not fabricate flight-level fields here; enhancement step will fetch real trip data.
    return flights;
  }

  /**
   * Fetch trip details with real flight schedules from Seats.aero
   * @param {string} tripId - Trip ID from availability data  
   * @returns {Promise<Object|null>} - Trip details with real flight data
   */
  async fetchTripDetails(tripId) {
    if (!this.isConfigured()) {
      throw new Error('API not configured');
    }

    try {
      const response = await axios.get(`${this.baseURL}${this.partnerAPIPath}/trips/${tripId}`, {
        headers: this.headers,
        params: { include_filtered: true },
        timeout: 30000
      });

      console.log(`✅ Trip details fetched for ID: ${tripId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ Failed to fetch trip ${tripId}:`, error.message);
      if (error.response?.status === 404) {
        console.log(`📭 Trip ${tripId} not found or expired`);
      }
      return null;
    }
  }

  /**
   * Enhance flights with real trip details and consolidate booking options
   * @param {Array} flights - Array of basic flight objects from availability data
   * @param {Object} searchParams - Original search parameters
   * @returns {Promise<Array>} - Enhanced flights with real data
   */
  async enhanceFlightsWithTripDetails(flights, searchParams) {
    // Fetch all trip details per availability and consolidate per physical flight
    const grouped = new Map();

    for (const flight of flights) {
      // Per Seats.aero docs, Get Trips expects the Availability object's ID
      const availabilityId = flight.seatsAeroData?.ID;
      if (!availabilityId) {
        continue; // skip: cannot fetch trips without availability ID
      }

      const tripResults = [];
      try {
        // 1) Primary: Get Trips by Availability ID
        const tripsResponse = await this.fetchTripDetails(availabilityId);
        if (tripsResponse && Array.isArray(tripsResponse.data) && tripsResponse.data.length > 0) {
          if (!this._loggedTripSchema) {
            const t0 = tripsResponse.data[0];
            const seg0 = (t0 && Array.isArray(t0.AvailabilitySegments) && t0.AvailabilitySegments[0]) || null;
            console.log('🧪 Seats.aero trip keys:', t0 ? Object.keys(t0) : []);
            if (seg0) console.log('🧪 Seats.aero segment keys:', Object.keys(seg0));
            try {
              console.log('🧪 Seats.aero first trip sample:', JSON.stringify(t0).slice(0, 3000));
            } catch {}
            this._loggedTripSchema = true;
          }
          for (const trip of tripsResponse.data) {
            const normalized = this.extractRealFlightFromTrip(trip, searchParams);
            if (normalized) tripResults.push(normalized);
          }
        }

        // 2) Fallback: Live Search (some availabilities don't include trips in cache)
        if (tripResults.length === 0 && flight.seatsAeroData?.Route?.OriginAirport && flight.seatsAeroData?.Route?.DestinationAirport) {
          const liveParams = {
            origin_airport: flight.seatsAeroData.Route.OriginAirport,
            destination_airport: flight.seatsAeroData.Route.DestinationAirport,
            start_date: flight.seatsAeroData.Date,
            end_date: flight.seatsAeroData.Date,
            cabin: this.mapCabinClass(searchParams.cabinClass) || 'business',
            source: flight.seatsAeroData.Source
          };
          const live = await this.fetchLiveTrips(liveParams);
          if (live && Array.isArray(live.data) && live.data.length > 0) {
            console.log(`🟡 Live Search returned ${live.data.length} trips for ${liveParams.origin_airport}-${liveParams.destination_airport} ${liveParams.start_date}`);
            for (const trip of live.data) {
              const normalized = this.extractRealFlightFromTrip(trip, searchParams);
              if (normalized) tripResults.push(normalized);
            }
          }
        }
      } catch (e) {
        console.error(`❌ Trips fetch failed for availability ${availabilityId}:`, e.message);
      }

      // Group by physical flight identity: carrier+flightNumber+departTime
      for (const r of tripResults) {
        const key = `${r.operatingAirlineCode}|${r.primaryFlightNumber}|${r.departureTime}`;
        if (!grouped.has(key)) {
          grouped.set(key, {
            id: key,
            from: {
              code: searchParams.from,
              name: this.getAirportName(searchParams.from),
              city: this.getAirportCity(searchParams.from),
              country: ''
            },
            to: {
              code: searchParams.to,
              name: this.getAirportName(searchParams.to),
              city: this.getAirportCity(searchParams.to),
              country: ''
            },
            operatingAirline: this.getAirlineName(r.operatingAirlineCode),
            operatingAirlineCode: r.operatingAirlineCode,
            airline: this.getAirlineName(r.operatingAirlineCode),
            flightNumber: r.primaryFlightNumber,
            departureTime: r.departureTime,
            arrivalTime: r.arrivalTime,
            duration: r.duration,
            aircraft: r.aircraft,
            cabinClass: r.cabinClass,
            stops: r.stops,
            segments: r.segments,
            offers: [],
            realData: true
          });
        }
        const entry = grouped.get(key);
        entry.offers.push({
          program: r.bookingProgram,
          programCode: r.bookingProgramCode,
          miles: r.pointsCost,
          taxes: r.taxes,
          currency: r.taxesCurrency,
          cabin: r.cabinClass,
          remainingSeats: r.availableSeats
        });
      }
    }

    // Deduplicate offers per program and sort
    const results = Array.from(grouped.values()).map(f => {
      const seen = new Map();
      f.offers.forEach(o => {
        const key = o.program;
        if (!seen.has(key) || (seen.get(key).miles || Infinity) > (o.miles || Infinity)) {
          seen.set(key, o);
        }
      });
      f.offers = Array.from(seen.values()).sort((a, b) => (a.miles || 0) - (b.miles || 0));
      return f;
    });

    return results;
  }

  /**
   * Extract real flight data from Seats.aero trip details response
   * @param {Object} tripData - Trip details response from Seats.aero
   * @param {Object} searchParams - Original search parameters
   * @returns {Object} - Formatted flight object with real data
   */
  extractRealFlightFromTrip(trip, searchParams) {
    if (!trip) return null;

    const segments = trip.AvailabilitySegments || [];
    if (segments.length === 0) {
      return null;
    }

    // Get primary segment (usually the first or longest segment)
    const primarySegment = segments[0];

    // Calculate total duration in readable format
    const durationMinutes = trip.TotalDuration || 0;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    const durationString = `${hours}h ${minutes}m`;

    // Extract airline from carriers
    const carriers = trip.Carriers ? trip.Carriers.split(', ') : [];
    const primaryAirline = carriers[0] || '';

    // Prefer first segment flight number as primary identifier
    const primaryFlightNumber = primarySegment.FlightNumber || (trip.FlightNumbers || '').split(',')[0] || '';

    // Choose local times if provided by API
    // Prefer Seats.aero-provided local times. Try multiple possible field names.
    // Trip-level local fields
    let depTimeLocal = pick(trip, ['DepartsAtLocal', 'DepartureTimeLocal', 'DepartsLocal', 'LocalDepartsAt', 'DepartureLocal', 'LocalDeparture']);
    let arrTimeLocal = pick(trip, ['ArrivesAtLocal', 'ArrivalTimeLocal', 'ArrivesLocal', 'LocalArrivesAt', 'ArrivalLocal', 'LocalArrival']);
    if (!depTimeLocal && segments.length > 0) {
      depTimeLocal = pick(segments[0], ['DepartsAtLocal', 'DepartureTimeLocal', 'DepartsLocal', 'LocalDepartsAt', 'DepartureLocal', 'LocalDeparture']);
    }
    if (!arrTimeLocal && segments.length > 0) {
      arrTimeLocal = pick(segments[segments.length - 1], ['ArrivesAtLocal', 'ArrivalTimeLocal', 'ArrivesLocal', 'LocalArrivesAt', 'ArrivalLocal', 'LocalArrival']);
    }
    // Fallback: if local times still missing, reuse API absolute fields but treat them as local by stripping trailing 'Z'
    const stripZ = (s) => (typeof s === 'string' ? s.replace(/Z$/i, '') : s);
    if (!depTimeLocal && trip.DepartsAt) depTimeLocal = stripZ(trip.DepartsAt);
    if (!arrTimeLocal && trip.ArrivesAt) arrTimeLocal = stripZ(trip.ArrivesAt);

    const depTime = trip.DepartsAt || depTimeLocal;
    const arrTime = trip.ArrivesAt || arrTimeLocal;

    // Taxes are returned in minor units (e.g., cents) per API examples
    const taxesMinor = Number(trip.TotalTaxes || 0);
    const taxesCurrency = trip.TaxesCurrency || trip.Currency || 'USD';
    const taxes = taxesMinor > 0 ? taxesMinor / 100 : 0;

    // Enforce cabin class match against request and normalize label
    const requestedCabinKey = this.mapCabinClass(searchParams.cabinClass) || 'economy';
    let tripCabinKey = typeof trip.Cabin === 'string' ? trip.Cabin.toLowerCase() : null;
    if (!['economy','premium','business','first'].includes(tripCabinKey || '')) {
      const segCab = typeof segments[0]?.Cabin === 'string' ? segments[0].Cabin.toLowerCase() : null;
      if (['economy','premium','business','first'].includes(segCab || '')) tripCabinKey = segCab;
    }
    const cabinKey = tripCabinKey || requestedCabinKey;
    if (cabinKey !== requestedCabinKey) return null;
    const cabinDisplay = this.formatCabinClass(cabinKey);

    // Normalize result: identity + one offer (program)
    return {
      operatingAirline: this.getAirlineName(primaryAirline),
      operatingAirlineCode: primaryAirline,
      airline: this.getAirlineName(primaryAirline),
      flightNumber: primaryFlightNumber,
      primaryFlightNumber,
      departureTime: depTime,
      arrivalTime: arrTime,
      aircraft: primarySegment.AircraftName || primarySegment.AircraftCode || primarySegment.Equipment || this.getAircraftByAirline(primaryAirline),
      duration: durationString,
      stops: typeof trip.Stops === 'number' ? trip.Stops : Math.max(segments.length - 1, 0),
      segments: segments.map(segment => ({
        flightNumber: segment.FlightNumber,
        aircraft: segment.AircraftName || segment.AircraftCode || segment.Equipment || null,
        origin: segment.DepartureAirport || segment.OriginAirport || segment.Origin,
        destination: segment.ArrivalAirport || segment.DestinationAirport || segment.Destination,
        departureTime: pick(segment, ['DepartsAt', 'DepartureTime', 'DepartsAtUtc', 'DepartureUtc']) || null,
        arrivalTime: pick(segment, ['ArrivesAt', 'ArrivalTime', 'ArrivesAtUtc', 'ArrivalUtc']) || null,
        departureTimeLocal: (() => { const v = pick(segment, ['DepartsAtLocal', 'DepartureTimeLocal', 'DepartsLocal', 'LocalDepartsAt', 'DepartureLocal', 'LocalDeparture']) || null; return v ? stripZ(v) : v; })(),
        arrivalTimeLocal: (() => { const v = pick(segment, ['ArrivesAtLocal', 'ArrivalTimeLocal', 'ArrivesLocal', 'LocalArrivesAt', 'ArrivalLocal', 'LocalArrival']) || null; return v ? stripZ(v) : v; })(),
        distance: segment.Distance,
        fareClass: segment.FareClass
      })),
      availableSeats: trip.RemainingSeats || 0,
      pointsCost: trip.MileageCost || 0,
      taxes,
      taxesCurrency,
      departureTimeLocal: depTimeLocal ? stripZ(depTimeLocal) : null,
      arrivalTimeLocal: arrTimeLocal ? stripZ(arrTimeLocal) : null,
      bookingProgram: this.mapLoyaltyProgram(trip.Source),
      bookingProgramCode: trip.Source,
      cabinClass: cabinDisplay,
      realData: true
    };
  }

  /**
   * Get airline name from code
   */
  getAirlineName(code) {
    const airlines = {
      'UA': 'United Airlines',
      'AA': 'American Airlines', 
      'DL': 'Delta Air Lines',
      'SQ': 'Singapore Airlines',
      'EK': 'Emirates',
      'LH': 'Lufthansa',
      'BA': 'British Airways',
      'AF': 'Air France',
      'AC': 'Air Canada',
      'NH': 'ANA'
    };
    return airlines[code] || code || 'Unknown Airline';
  }

  /**
   * Get available loyalty programs for a flight
   */
  getAvailablePrograms(flight) {
    // Default programs based on airline
    const airlineCode = flight.airline || flight.airline_code || 'XX';
    const programMap = {
      'UA': ['United MileagePlus', 'Chase Ultimate Rewards'],
      'AA': ['American AAdvantage', 'Citi ThankYou Points'],
      'DL': ['Delta SkyMiles', 'Amex Membership Rewards'],
      'SQ': ['KrisFlyer', 'Chase Ultimate Rewards'],
      'EK': ['Emirates Skywards']
    };
    
    return flight.programs || programMap[airlineCode] || ['Multiple Programs'];
  }

  /**
   * Map Seats.aero loyalty program codes to readable names
   */
  mapLoyaltyProgram(sourceCode) {
    const programMap = {
      'smiles': 'GOL Smiles', // Brazilian airline program
      'united': 'United MileagePlus',
      'american': 'American AAdvantage',
      'delta': 'Delta SkyMiles',
      'alaska': 'Alaska Mileage Plan',
      'southwest': 'Southwest Rapid Rewards',
      'jetblue': 'JetBlue TrueBlue',
      'british': 'British Airways Executive Club',
      'lufthansa': 'Lufthansa Miles & More',
      'singapore': 'Singapore Airlines KrisFlyer',
      'emirates': 'Emirates Skywards',
      'cathay': 'Cathay Pacific Asia Miles',
      'virgin': 'Virgin Atlantic Flying Club',
      'air_canada': 'Air Canada Aeroplan',
      'ana': 'ANA Mileage Club',
      'jal': 'JAL Mileage Bank'
    };
    
    return programMap[sourceCode] || sourceCode || 'Unknown Program';
  }

  /**
   * Infer airline code from loyalty program name
   */
  inferAirlineFromProgram(programName) {
    const programMap = {
      'United MileagePlus': 'UA',
      'American AAdvantage': 'AA',
      'Delta SkyMiles': 'DL',
      'Alaska Mileage Plan': 'AS',
      'Southwest Rapid Rewards': 'WN',
      'JetBlue TrueBlue': 'B6',
      'British Airways Executive Club': 'BA',
      'Air France-KLM Flying Blue': 'AF',
      'Lufthansa Miles & More': 'LH',
      'Singapore Airlines KrisFlyer': 'SQ',
      'Emirates Skywards': 'EK',
      'Cathay Pacific Asia Miles': 'CX',
      'Virgin Atlantic Flying Club': 'VS',
      'Air Canada Aeroplan': 'AC'
    };
    
    for (const [program, code] of Object.entries(programMap)) {
      if (programName.toLowerCase().includes(program.toLowerCase().split(' ')[0])) {
        return code;
      }
    }
    
    return 'UA'; // Default to United
  }

  /**
   * Calculate points cost based on loyalty program and cabin
   */
  calculatePointsCostByProgram(program, cabin) {
    const baseCosts = {
      economy: { min: 25000, max: 65000 },
      premium: { min: 50000, max: 110000 },
      business: { min: 75000, max: 175000 },
      first: { min: 150000, max: 300000 }
    };

    const cabinType = cabin || 'economy';
    const base = baseCosts[cabinType] || baseCosts.economy;
    
    // Different programs have different award charts
    const programMultiplier = {
      'United MileagePlus': 1.0,
      'American AAdvantage': 1.1,
      'Delta SkyMiles': 1.3, // Dynamic pricing, higher
      'British Airways Executive Club': 0.9,
      'Singapore Airlines KrisFlyer': 1.2,
      'Emirates Skywards': 1.1
    };

    const multiplier = programMultiplier[program] || 1.0;
    const cost = Math.floor((Math.random() * (base.max - base.min) + base.min) * multiplier);

    return {
      economy: cabinType === 'economy' ? cost : Math.floor(cost * 0.4),
      premium: cabinType === 'premium' ? cost : Math.floor(cost * 0.7),
      business: cabinType === 'business' ? cost : Math.floor(cost * 1.0),
      first: cabinType === 'first' ? cost : Math.floor(cost * 1.8)
    };
  }

  /**
   * Format cabin class from API to display format
   */
  formatCabinClass(cabin) {
    const mapping = {
      'economy': 'Economy',
      'premium': 'Premium Economy', 
      'business': 'Business',
      'first': 'First'
    };
    return mapping[cabin] || 'Economy';
  }

  /**
   * Get airport name from code (simplified)
   */
  getAirportName(code) {
    const airports = {
      'JFK': 'John F. Kennedy International',
      'LAX': 'Los Angeles International',
      'LHR': 'London Heathrow',
      'NRT': 'Tokyo Narita',
      'SIN': 'Singapore Changi',
      'DXB': 'Dubai International'
    };
    return airports[code] || `${code} Airport`;
  }

  /**
   * Get airport city from code (simplified)
   */
  getAirportCity(code) {
    const cities = {
      'JFK': 'New York',
      'LAX': 'Los Angeles',
      'LHR': 'London',
      'NRT': 'Tokyo',
      'SIN': 'Singapore',
      'DXB': 'Dubai'
    };
    return cities[code] || code;
  }

  /**
   * Get aircraft type by airline
   */
  getAircraftByAirline(airlineCode) {
    const aircraftMap = {
      'UA': 'Boeing 777-300ER',
      'AA': 'Boeing 787-9',
      'DL': 'Airbus A350-900',
      'SQ': 'Airbus A380-800',
      'EK': 'Airbus A380-800',
      'BA': 'Boeing 787-9'
    };
    return aircraftMap[airlineCode] || 'Boeing 777';
  }

  /**
   * Check if Seats.aero API is configured and available
   */
  isConfigured() {
    return this.apiKey && this.apiKey !== 'your-api-key-here';
  }

  /**
   * Test API connection
   */
  async testConnection() {
    if (!this.isConfigured()) {
      return { success: false, message: 'API key not configured' };
    }

    try {
      // Test with a simple routes request (most lightweight endpoint)
      // Based on documentation: GET https://seats.aero/partnerapi/routes
      const response = await axios.get(`${this.baseURL}${this.partnerAPIPath}/routes`, {
        headers: this.headers,
        params: { source: 'all' }, // Get available routes
        timeout: 10000
      });
      
      return { 
        success: true, 
        message: 'Seats.aero Partner API connection successful',
        status: response.status,
        apiWorking: true,
        dataAvailable: response.data && Array.isArray(response.data) ? response.data.length > 0 : false
      };
    } catch (error) {
      // Check for specific error types
      if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return { 
          success: false, 
          message: 'Seats.aero API endpoint unreachable (DNS/connection issue)',
          error: error.code
        };
      } else if (error.response?.status === 401) {
        return { 
          success: false, 
          message: 'Invalid Seats.aero API key',
          error: 'Authentication failed'
        };
      } else if (error.response?.status === 429) {
        return { 
          success: false, 
          message: 'Seats.aero API rate limit exceeded',
          error: 'Too many requests'
        };
      } else {
        return { 
          success: false, 
          message: `API connection failed: ${error.message}`,
          error: error.response?.data || error.code
        };
      }
    }
  }
}

module.exports = SeatsAeroService;