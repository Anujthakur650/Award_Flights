'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumButton from '../ui/PremiumButton';
import { cn } from '@/lib/utils';
import { api, type Airport } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { Plane, MapPin, Calendar, Users, Briefcase, Search, Globe, Clock, ArrowLeftRight } from 'lucide-react';

const EnhancedSearchForm: React.FC = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    travelDate: '',
    loyaltyProgram: '',
    travelers: '1',
    cabinClass: 'Economy'
  });

  const [isSearching, setIsSearching] = useState(false);
  const [airportSuggestions, setAirportSuggestions] = useState<{
    from: Airport[];
    to: Airport[];
  }>({ from: [], to: [] });
  const [showSuggestions, setShowSuggestions] = useState<{
    from: boolean;
    to: boolean;
  }>({ from: false, to: false });
  
  const [selectedAirports, setSelectedAirports] = useState<{
    from: Airport | null;
    to: Airport | null;
  }>({ from: null, to: null });

  const [loadingAirports, setLoadingAirports] = useState<{
    from: boolean;
    to: boolean;
  }>({ from: false, to: false });

  // Prefill the form from a previous session search (if available)
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem('flightSearchParams');
      if (!raw) return;
      const parsed = JSON.parse(raw) as {
        from?: string;
        to?: string;
        fromCity?: string;
        toCity?: string;
        travelDate?: string;
      } | null;
      if (!parsed) return;

      const fromCode = parsed.from?.trim();
      const toCode = parsed.to?.trim();
      const fromCity = parsed.fromCity?.trim();
      const toCity = parsed.toCity?.trim();

      // Set text values immediately for fast UX
      setFormData(prev => ({
        ...prev,
        from: fromCode && fromCity ? `${fromCode} - ${fromCity}` : (fromCode ?? prev.from),
        to: toCode && toCity ? `${toCode} - ${toCity}` : (toCode ?? prev.to),
        travelDate: parsed.travelDate ?? prev.travelDate,
      }));

      // Resolve full airport objects in the background for accurate submit
      (async () => {
        try {
          const [fromObj, toObj] = await Promise.all([
            fromCode ? api.getAirport(fromCode) : Promise.resolve(undefined),
            toCode ? api.getAirport(toCode) : Promise.resolve(undefined),
          ]);
          setSelectedAirports({
            from: (fromObj as Airport) ?? null,
            to: (toObj as Airport) ?? null,
          });
        } catch {
          // Silent fallback: leave selectedAirports as-is if fetch fails
        }
      })();
    } catch {
      // ignore malformed storage
    }
  }, [api]);

  // Debounced airport search
  const searchAirports = useCallback(async (query: string, field: 'from' | 'to') => {
    if (query.length < 2) {
      setAirportSuggestions(prev => ({ ...prev, [field]: [] }));
      setShowSuggestions(prev => ({ ...prev, [field]: false }));
      return;
    }

    setLoadingAirports(prev => ({ ...prev, [field]: true }));
    
    try {
      const suggestions = await api.searchAirports(query);
      setAirportSuggestions(prev => ({
        ...prev,
        [field]: suggestions
      }));
      setShowSuggestions(prev => ({
        ...prev,
        [field]: true
      }));
    } catch (error) {
      console.error('Airport search error:', error);
    } finally {
      setLoadingAirports(prev => ({ ...prev, [field]: false }));
    }
  }, []);

  // Debounce timer
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.from && !selectedAirports.from) {
        searchAirports(formData.from, 'from');
      }
      if (formData.to && !selectedAirports.to) {
        searchAirports(formData.to, 'to');
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [formData.from, formData.to, searchAirports, selectedAirports]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedAirports.from || !selectedAirports.to) {
      alert('Please select valid airports from the suggestions');
      return;
    }
    
    setIsSearching(true);
    
    try {
      const flights = await api.searchFlights({
        from: selectedAirports.from.code,
        to: selectedAirports.to.code,
        date: formData.travelDate,
        cabinClass: formData.cabinClass,
        passengers: parseInt(formData.travelers),
        loyaltyProgram: formData.loyaltyProgram || undefined,
      });
      
      sessionStorage.setItem('flightSearchResults', JSON.stringify(flights));
      sessionStorage.setItem('flightSearchParams', JSON.stringify({
        ...formData,
        from: selectedAirports.from.code,
        to: selectedAirports.to.code,
        fromCity: selectedAirports.from.city,
        toCity: selectedAirports.to.city,
      }));
      router.push('/flights/results');
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search flights. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear selected airport if user types again
    if (name === 'from' || name === 'to') {
      setSelectedAirports(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };
  
  const selectAirport = (field: 'from' | 'to', airport: Airport) => {
    setFormData(prev => ({
      ...prev,
      [field]: `${airport.code} - ${airport.city}`
    }));
    setSelectedAirports(prev => ({
      ...prev,
      [field]: airport
    }));
    setShowSuggestions(prev => ({
      ...prev,
      [field]: false
    }));
  };

  // Swap departure and arrival values (text and selected airport objects)
  const handleSwapAirports = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from,
    }));
    setSelectedAirports(prev => ({
      from: prev.to,
      to: prev.from,
    }));
    setShowSuggestions({ from: false, to: false });
  };

  const inputClassName = cn(
    'w-full px-4 pl-10 min-h-[44px] md:min-h-[40px] py-3',
    'bg-white/5 backdrop-blur-medium',
    'border border-white/10',
    'rounded-lg',
    'text-white text-sm',
    'placeholder-gray-400/60',
    'focus:outline-none',
    'focus:border-luxe-gold/50',
    'focus:bg-white/10',
    'focus:ring-2 focus:ring-luxe-gold/20',
    'transition-all duration-300',
    'hover:bg-white/10'
  );

  const labelClassName = "block text-xs font-medium text-white/60 uppercase tracking-wider mb-2";

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Title Section */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright bg-clip-text text-transparent text-sm font-semibold uppercase tracking-widest">
          Search 5,880+ Airports Worldwide
        </h3>
      </motion.div>

      {/* Form Grid */}
      <div className="space-y-4 md:space-y-6">
        {/* Row 1: From and To with Swap */}
        <div className="relative grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="relative">
            <label htmlFor="from" className={labelClassName}>
              <MapPin className="inline w-3 h-3 mr-1" />
              Departure Airport
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-3.5 text-luxe-gold/60 w-4 h-4 z-10" />
              <input
                type="text"
                id="from"
                name="from"
                value={formData.from}
                onChange={handleInputChange}
                placeholder="City, airport name or code"
                className={inputClassName}
                autoComplete="off"
                required
              />
              {loadingAirports.from && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-luxe-gold"></div>
                </div>
              )}
            </div>
            <AnimatePresence>
              {showSuggestions.from && airportSuggestions.from.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-1 bg-noir-carbon/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-72 overflow-y-auto"
                >
                  {airportSuggestions.from.map((airport) => (
                    <button
                      key={`${airport.code}-${airport.city}`}
                      type="button"
                      onClick={() => selectAirport('from', airport)}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all border-b border-white/5 last:border-0 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-luxe-gold font-bold text-lg">{airport.code}</span>
                            <span className="text-white font-medium">{airport.city}</span>
                            {airport.state && (
                              <span className="text-gray-400 text-sm">{airport.state}</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">{airport.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {airport.country}
                          </div>
                          {airport.timezone && (
                            <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {airport.timezone}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Mobile swap button (renders between stacked inputs) */}
          <div className="md:hidden flex items-center justify-center">
            <button
              type="button"
              onClick={handleSwapAirports}
              aria-label="Swap departure and arrival"
              title="Swap departure and arrival"
              className="h-10 w-10 flex items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-white shadow-lg transition active:scale-95 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-luxe-gold/30"
            >
              <ArrowLeftRight className="w-5 h-5 text-luxe-gold" />
            </button>
          </div>
          
          <div className="relative">
            <label htmlFor="to" className={labelClassName}>
              <MapPin className="inline w-3 h-3 mr-1" />
              Arrival Airport
            </label>
            <div className="relative">
              <Plane className="absolute left-3 top-3.5 text-luxe-gold/60 w-4 h-4 z-10 rotate-90" />
              <input
                type="text"
                id="to"
                name="to"
                value={formData.to}
                onChange={handleInputChange}
                placeholder="City, airport name or code"
                className={inputClassName}
                autoComplete="off"
                required
              />
              {loadingAirports.to && (
                <div className="absolute right-3 top-3.5">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-luxe-gold"></div>
                </div>
              )}
            </div>
            <AnimatePresence>
              {showSuggestions.to && airportSuggestions.to.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-20 w-full mt-1 bg-noir-carbon/95 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-72 overflow-y-auto"
                >
                  {airportSuggestions.to.map((airport) => (
                    <button
                      key={`${airport.code}-${airport.city}`}
                      type="button"
                      onClick={() => selectAirport('to', airport)}
                      className="w-full px-4 py-3 text-left hover:bg-white/10 transition-all border-b border-white/5 last:border-0 group"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-luxe-gold font-bold text-lg">{airport.code}</span>
                            <span className="text-white font-medium">{airport.city}</span>
                            {airport.state && (
                              <span className="text-gray-400 text-sm">{airport.state}</span>
                            )}
                          </div>
                          <div className="text-gray-400 text-xs mt-1">{airport.name}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-gray-400 text-xs flex items-center gap-1">
                            <Globe className="w-3 h-3" />
                            {airport.country}
                          </div>
                          {airport.timezone && (
                            <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" />
                              {airport.timezone}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Desktop swap button (overlaid between columns) */}
          <button
            type="button"
            onClick={handleSwapAirports}
            aria-label="Swap departure and arrival"
            title="Swap departure and arrival"
            className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/10 backdrop-blur-md text-white shadow-xl transition active:scale-95 hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-luxe-gold/30"
          >
            <ArrowLeftRight className="w-5 h-5 text-luxe-gold" />
          </button>
        </div>

        {/* Row 2: Travel Date and Loyalty Program */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="relative">
            <label htmlFor="travelDate" className={labelClassName}>
              <Calendar className="inline w-3 h-3 mr-1" />
              Travel Date
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3.5 text-luxe-gold/60 w-4 h-4 z-10" />
              <input
                type="date"
                id="travelDate"
                name="travelDate"
                value={formData.travelDate}
                onChange={handleInputChange}
                className={inputClassName}
                min={new Date().toISOString().split('T')[0]}
                required
              />
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="loyaltyProgram" className={labelClassName}>
              Loyalty Program
            </label>
            <select
              id="loyaltyProgram"
              name="loyaltyProgram"
              value={formData.loyaltyProgram}
              onChange={handleInputChange}
              className={cn(inputClassName, 'appearance-none cursor-pointer')}
            >
              <option value="">All Programs</option>
              <option value="united">United MileagePlus</option>
              <option value="american">American AAdvantage</option>
              <option value="delta">Delta SkyMiles</option>
              <option value="chase">Chase Ultimate Rewards</option>
              <option value="amex">Amex Membership Rewards</option>
              <option value="capital">Capital One Miles</option>
              <option value="citi">Citi ThankYou Points</option>
            </select>
          </div>
        </div>

        {/* Row 3: Travelers and Cabin Class */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
          <div className="relative">
            <label htmlFor="travelers" className={labelClassName}>
              <Users className="inline w-3 h-3 mr-1" />
              Travelers
            </label>
            <div className="relative">
              <Users className="absolute left-3 top-3.5 text-luxe-gold/60 w-4 h-4 z-10" />
              <select
                id="travelers"
                name="travelers"
                value={formData.travelers}
                onChange={handleInputChange}
                className={cn(inputClassName, 'appearance-none cursor-pointer')}
              >
                {[1,2,3,4,5,6,7,8,9].map(num => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Passenger' : 'Passengers'}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="cabinClass" className={labelClassName}>
              <Briefcase className="inline w-3 h-3 mr-1" />
              Cabin Class
            </label>
            <div className="relative">
              <Briefcase className="absolute left-3 top-3.5 text-luxe-gold/60 w-4 h-4 z-10" />
              <select
                id="cabinClass"
                name="cabinClass"
                value={formData.cabinClass}
                onChange={handleInputChange}
                className={cn(inputClassName, 'appearance-none cursor-pointer')}
              >
                <option value="Economy">Economy</option>
                <option value="Premium">Premium Economy</option>
                <option value="Business">Business</option>
                <option value="First">First</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <PremiumButton
          type="submit"
          variant="gradient"
          size="lg"
          disabled={isSearching || !selectedAirports.from || !selectedAirports.to}
          className="w-full group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          {isSearching ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Searching Flights...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
              Search Award Flights
            </span>
          )}
        </PremiumButton>
      </div>

      {/* Selected Airports Display */}
      {(selectedAirports.from || selectedAirports.to) && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-3 bg-white/5 rounded-lg border border-white/10"
        >
          <div className="text-xs text-gray-400 space-y-1">
            {selectedAirports.from && (
              <div>From: <span className="text-luxe-gold">{selectedAirports.from.name}</span></div>
            )}
            {selectedAirports.to && (
              <div>To: <span className="text-luxe-gold">{selectedAirports.to.name}</span></div>
            )}
          </div>
        </motion.div>
      )}
    </form>
  );
};

export default EnhancedSearchForm;
