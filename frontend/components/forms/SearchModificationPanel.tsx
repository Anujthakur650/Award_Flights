'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PremiumButton from '../ui/PremiumButton';
import GlassContainer from '../ui/GlassContainer';
import { cn } from '@/lib/utils';
import { api, type Airport } from '@/lib/api';
import { 
  MapPin, 
  Calendar, 
  Users, 
  Briefcase, 
  Search, 
  X,
  ChevronDown,
  ArrowUpDown
} from 'lucide-react';

interface SearchModificationPanelProps {
  initialParams: {
    from: string;
    to: string;
    travelDate: string;
    travelers: string;
    cabinClass: string;
    loyaltyProgram?: string;
  };
  onSearch: (params: {
    from: string;
    to: string;
    date: string;
    cabinClass?: string;
    passengers?: number;
    loyaltyProgram?: string;
  }) => void;
  onClose: () => void;
  isVisible: boolean;
}

const SearchModificationPanel: React.FC<SearchModificationPanelProps> = ({
  initialParams,
  onSearch,
  onClose,
  isVisible
}) => {
  const [formData, setFormData] = useState({
    from: initialParams.from || '',
    to: initialParams.to || '',
    travelDate: initialParams.travelDate || '',
    loyaltyProgram: initialParams.loyaltyProgram || '',
    travelers: initialParams.travelers || '1',
    cabinClass: initialParams.cabinClass || 'Economy'
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

  // Initialize selected airports from initial params
  useEffect(() => {
    if (initialParams.from && initialParams.to) {
      setSelectedAirports({
        from: { code: initialParams.from, name: '', city: '', country: '', lat: 0, lng: 0 },
        to: { code: initialParams.to, name: '', city: '', country: '', lat: 0, lng: 0 }
      });
    }
  }, [initialParams]);

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
      const searchParams = {
        from: selectedAirports.from.code,
        to: selectedAirports.to.code,
        date: formData.travelDate,
        cabinClass: formData.cabinClass,
        passengers: parseInt(formData.travelers),
        loyaltyProgram: formData.loyaltyProgram || undefined,
      };

      await onSearch(searchParams);
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (field === 'from' || field === 'to') {
      setSelectedAirports(prev => ({ ...prev, [field]: null }));
    }
  };

  const selectAirport = (airport: Airport, field: 'from' | 'to') => {
    setSelectedAirports(prev => ({ ...prev, [field]: airport }));
    setFormData(prev => ({ ...prev, [field]: airport.code }));
    setShowSuggestions(prev => ({ ...prev, [field]: false }));
  };

  const swapAirports = () => {
    setFormData(prev => ({
      ...prev,
      from: prev.to,
      to: prev.from
    }));
    setSelectedAirports(prev => ({
      from: prev.to,
      to: prev.from
    }));
  };

  const loyaltyPrograms = [
    '', 'United MileagePlus', 'American AAdvantage', 'Delta SkyMiles', 
    'Chase Ultimate Rewards', 'Amex Membership Rewards', 'Citi ThankYou Points',
    'Alaska Mileage Plan', 'British Airways Executive Club', 'Air Canada Aeroplan'
  ];

  const cabinClasses = ['Economy', 'Premium Economy', 'Business', 'First'];
  const travelerOptions = ['1', '2', '3', '4', '5', '6', '7', '8'];

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="w-full max-w-4xl"
          >
            <GlassContainer variant="dark" blur="ultra" className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-display bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright bg-clip-text text-transparent">
                  Modify Your Search
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Route Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                  {/* From Airport */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline mr-2" size={16} />
                      From
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.from}
                        onChange={(e) => handleInputChange('from', e.target.value)}
                        placeholder="Airport code or city"
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-luxe-gold focus:outline-none"
                      />
                      {loadingAirports.from && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-luxe-gold"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Airport Suggestions */}
                    <AnimatePresence>
                      {showSuggestions.from && airportSuggestions.from.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-black/90 border border-white/10 rounded-lg overflow-hidden"
                        >
                          {airportSuggestions.from.map((airport) => (
                            <button
                              key={airport.code}
                              type="button"
                              onClick={() => selectAirport(airport, 'from')}
                              className="w-full px-4 py-3 text-left hover:bg-luxe-gold/10 border-b border-white/5 last:border-b-0"
                            >
                              <div className="text-white font-medium">{airport.code}</div>
                              <div className="text-gray-400 text-sm">{airport.name}, {airport.city}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Swap Button */}
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={swapAirports}
                      className="p-2 text-luxe-gold hover:bg-luxe-gold/10 rounded-full transition-colors"
                    >
                      <ArrowUpDown size={20} />
                    </button>
                  </div>

                  {/* To Airport */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <MapPin className="inline mr-2" size={16} />
                      To
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.to}
                        onChange={(e) => handleInputChange('to', e.target.value)}
                        placeholder="Airport code or city"
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:border-luxe-gold focus:outline-none"
                      />
                      {loadingAirports.to && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-luxe-gold"></div>
                        </div>
                      )}
                    </div>
                    
                    {/* Airport Suggestions */}
                    <AnimatePresence>
                      {showSuggestions.to && airportSuggestions.to.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          className="absolute z-10 w-full mt-1 bg-black/90 border border-white/10 rounded-lg overflow-hidden"
                        >
                          {airportSuggestions.to.map((airport) => (
                            <button
                              key={airport.code}
                              type="button"
                              onClick={() => selectAirport(airport, 'to')}
                              className="w-full px-4 py-3 text-left hover:bg-luxe-gold/10 border-b border-white/5 last:border-b-0"
                            >
                              <div className="text-white font-medium">{airport.code}</div>
                              <div className="text-gray-400 text-sm">{airport.name}, {airport.city}</div>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Date and Options */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {/* Travel Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Calendar className="inline mr-2" size={16} />
                      Travel Date
                    </label>
                    <input
                      type="date"
                      value={formData.travelDate}
                      onChange={(e) => handleInputChange('travelDate', e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-luxe-gold focus:outline-none"
                    />
                  </div>

                  {/* Travelers */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Users className="inline mr-2" size={16} />
                      Travelers
                    </label>
                    <div className="relative">
                      <select
                        value={formData.travelers}
                        onChange={(e) => handleInputChange('travelers', e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-luxe-gold focus:outline-none appearance-none"
                      >
                        {travelerOptions.map(count => (
                          <option key={count} value={count} className="bg-black text-white">
                            {count} {count === '1' ? 'Traveler' : 'Travelers'}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>

                  {/* Cabin Class */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Briefcase className="inline mr-2" size={16} />
                      Cabin Class
                    </label>
                    <div className="relative">
                      <select
                        value={formData.cabinClass}
                        onChange={(e) => handleInputChange('cabinClass', e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-luxe-gold focus:outline-none appearance-none"
                      >
                        {cabinClasses.map(cabin => (
                          <option key={cabin} value={cabin} className="bg-black text-white">
                            {cabin}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>

                  {/* Loyalty Program */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Loyalty Program
                    </label>
                    <div className="relative">
                      <select
                        value={formData.loyaltyProgram}
                        onChange={(e) => handleInputChange('loyaltyProgram', e.target.value)}
                        className="w-full px-4 py-3 bg-black/40 border border-white/10 rounded-lg text-white focus:border-luxe-gold focus:outline-none appearance-none"
                      >
                        <option value="" className="bg-black text-white">All Programs</option>
                        {loyaltyPrograms.slice(1).map(program => (
                          <option key={program} value={program} className="bg-black text-white">
                            {program}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <PremiumButton
                    type="submit"
                    variant="gradient"
                    size="md"
                    disabled={isSearching || !selectedAirports.from || !selectedAirports.to}
                    className="flex-1"
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-white mr-2"></div>
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2" size={18} />
                        Search Flights
                      </>
                    )}
                  </PremiumButton>
                  
                  <PremiumButton
                    type="button"
                    variant="ghost"
                    size="md"
                    onClick={onClose}
                    className="px-8"
                  >
                    Cancel
                  </PremiumButton>
                </div>
              </form>
            </GlassContainer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SearchModificationPanel;