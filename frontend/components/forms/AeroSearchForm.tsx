'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import PremiumButton from '../ui/PremiumButton';
import { cn } from '@/lib/utils';
import { api, type Airport } from '@/lib/api';
import { useRouter } from 'next/navigation';

const AeroSearchForm: React.FC = () => {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      const flights = await api.searchFlights({
        from: formData.from,
        to: formData.to,
        date: formData.travelDate,
        cabinClass: formData.cabinClass,
        passengers: parseInt(formData.travelers),
        loyaltyProgram: formData.loyaltyProgram || undefined,
      });
      
      // Store results in sessionStorage and navigate to results page
      sessionStorage.setItem('flightSearchResults', JSON.stringify(flights));
      sessionStorage.setItem('flightSearchParams', JSON.stringify(formData));
      router.push('/flights/results');
    } catch (error) {
      console.error('Search error:', error);
      alert('Failed to search flights. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Search airports when typing in from/to fields
    if ((name === 'from' || name === 'to') && value.length >= 2) {
      try {
        const suggestions = await api.searchAirports(value);
        setAirportSuggestions(prev => ({
          ...prev,
          [name]: suggestions
        }));
        setShowSuggestions(prev => ({
          ...prev,
          [name]: true
        }));
      } catch (error) {
        console.error('Airport search error:', error);
      }
    }
  };
  
  const selectAirport = (field: 'from' | 'to', airport: Airport) => {
    setFormData(prev => ({
      ...prev,
      [field]: airport.code
    }));
    setShowSuggestions(prev => ({
      ...prev,
      [field]: false
    }));
  };

  const inputClassName = cn(
    'w-full px-4 py-3',
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title Section */}
      <motion.div 
        className="text-center mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
      >
        <h3 className="bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright bg-clip-text text-transparent text-sm font-semibold uppercase tracking-widest">
          Award Flights
        </h3>
      </motion.div>

      {/* Form Grid */}
      <div className="space-y-4">
        {/* Row 1: From and To */}
        <div className="grid grid-cols-2 gap-4">
          <div className="relative">
            <label htmlFor="from" className={labelClassName}>
              From
            </label>
            <input
              type="text"
              id="from"
              name="from"
              value={formData.from}
              onChange={handleInputChange}
              onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, from: false })), 200)}
              placeholder="Airport code or city"
              className={inputClassName}
              autoComplete="off"
              required
            />
            {showSuggestions.from && airportSuggestions.from.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-noir-carbon border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {airportSuggestions.from.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectAirport('from', airport)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{airport.code}</span>
                        <span className="text-gray-400 ml-2">{airport.city}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{airport.country}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{airport.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
          
          <div className="relative">
            <label htmlFor="to" className={labelClassName}>
              To
            </label>
            <input
              type="text"
              id="to"
              name="to"
              value={formData.to}
              onChange={handleInputChange}
              onBlur={() => setTimeout(() => setShowSuggestions(prev => ({ ...prev, to: false })), 200)}
              placeholder="Airport code or city"
              className={inputClassName}
              autoComplete="off"
              required
            />
            {showSuggestions.to && airportSuggestions.to.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-noir-carbon border border-white/10 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {airportSuggestions.to.map((airport) => (
                  <button
                    key={airport.code}
                    type="button"
                    onClick={() => selectAirport('to', airport)}
                    className="w-full px-4 py-3 text-left hover:bg-white/10 transition-colors border-b border-white/5 last:border-0"
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="text-white font-medium">{airport.code}</span>
                        <span className="text-gray-400 ml-2">{airport.city}</span>
                      </div>
                      <span className="text-gray-500 text-xs">{airport.country}</span>
                    </div>
                    <div className="text-gray-500 text-xs mt-1">{airport.name}</div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Row 2: Travel Date and Loyalty Program */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="travelDate" className={labelClassName}>
              Travel Date
            </label>
            <input
              type="text"
              id="travelDate"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleInputChange}
              placeholder="Select Date"
              className={inputClassName}
              onFocus={(e) => e.target.type = 'date'}
              onBlur={(e) => !e.target.value && (e.target.type = 'text')}
              required
            />
          </div>
          
          <div>
            <label htmlFor="loyaltyProgram" className={labelClassName}>
              Loyalty Program
            </label>
            <select
              id="loyaltyProgram"
              name="loyaltyProgram"
              value={formData.loyaltyProgram}
              onChange={handleInputChange}
              className={inputClassName}
              required
            >
              <option value="">Select Program</option>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="travelers" className={labelClassName}>
              Travelers
            </label>
            <select
              id="travelers"
              name="travelers"
              value={formData.travelers}
              onChange={handleInputChange}
              className={inputClassName}
            >
              <option value="1">1 Passenger</option>
              <option value="2">2 Passengers</option>
              <option value="3">3 Passengers</option>
              <option value="4">4 Passengers</option>
              <option value="5">5 Passengers</option>
              <option value="6">6 Passengers</option>
              <option value="7">7 Passengers</option>
              <option value="8">8 Passengers</option>
              <option value="9">9 Passengers</option>
            </select>
          </div>
          
          <div>
            <label htmlFor="cabinClass" className={labelClassName}>
              Cabin Class
            </label>
            <select
              id="cabinClass"
              name="cabinClass"
              value={formData.cabinClass}
              onChange={handleInputChange}
              className={inputClassName}
            >
              <option value="Economy">Economy</option>
              <option value="Premium">Premium Economy</option>
              <option value="Business">Business</option>
              <option value="First">First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <PremiumButton
          type="submit"
          variant="gradient"
          size="lg"
          disabled={isSearching}
          className="w-full"
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
              Searching...
            </span>
          ) : (
            'Find Flights'
          )}
        </PremiumButton>
      </div>
    </form>
  );
};

export default AeroSearchForm;
