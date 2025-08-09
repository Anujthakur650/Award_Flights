'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, MapPin, Calendar, Users, Award, Plane } from 'lucide-react';
import Button from '../ui/Button';
import { motion } from 'framer-motion';

// Style constants
const inputStyle = {
  backgroundColor: '#1C1C1E',
  borderColor: '#48484A',
  color: '#FFFFFF'
};

const iconStyle = {
  color: '#FFD700'
};

const searchSchema = z.object({
  from: z.string().min(3, 'Please enter a valid departure airport'),
  to: z.string().min(3, 'Please enter a valid arrival airport'),
  date: z.string().min(1, 'Please select a travel date'),
  program: z.string().min(1, 'Please select a loyalty program'),
  passengers: z.number().min(1).max(9),
  cabinClass: z.enum(['economy', 'premium', 'business', 'first']),
});

type SearchFormData = z.infer<typeof searchSchema>;

const loyaltyPrograms = [
  { value: 'united', label: 'United MileagePlus' },
  { value: 'american', label: 'American AAdvantage' },
  { value: 'delta', label: 'Delta SkyMiles' },
  { value: 'chase', label: 'Chase Ultimate Rewards' },
  { value: 'amex', label: 'Amex Membership Rewards' },
  { value: 'capital', label: 'Capital One Miles' },
  { value: 'citi', label: 'Citi ThankYou Points' },
];

const cabinClasses = [
  { value: 'economy', label: 'Economy', icon: '✈️' },
  { value: 'premium', label: 'Premium', icon: '🌟' },
  { value: 'business', label: 'Business', icon: '💼' },
  { value: 'first', label: 'First', icon: '👑' },
];

const SearchForm: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    defaultValues: {
      passengers: 1,
      cabinClass: 'business',
    },
  });

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true);
    // Simulate API call
    setTimeout(() => {
      console.log('Search data:', data);
      setIsSearching(false);
    }, 2000);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* First Row: From/To */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            From
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#FFD700' }} size={20} />
            <input
              {...register('from')}
              type="text"
              placeholder="Departure Airport"
              style={inputStyle}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>
          {errors.from && (
            <p className="mt-1 text-sm text-red-400">{errors.from.message}</p>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            To
          </label>
          <div className="relative">
            <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: '#FFD700' }} size={20} />
            <input
              {...register('to')}
              type="text"
              placeholder="Arrival Airport"
              style={{ backgroundColor: '#1C1C1E', borderColor: '#48484A' }}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all focus:border-2"
            />
          </div>
          {errors.to && (
            <p className="mt-1 text-sm text-red-400">{errors.to.message}</p>
          )}
        </div>
      </div>

      {/* Second Row: Date and Program */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Travel Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2" style={iconStyle} size={20} />
            <input
              {...register('date')}
              type="date"
              style={inputStyle}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>
          {errors.date && (
            <p className="mt-1 text-sm text-red-400">{errors.date.message}</p>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Loyalty Program
          </label>
          <div className="relative">
            <Award className="absolute left-3 top-1/2 transform -translate-y-1/2" style={iconStyle} size={20} />
            <select
              {...register('program')}
              style={inputStyle}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all appearance-none"
            >
              <option value="">Select Program</option>
              {loyaltyPrograms.map((program) => (
                <option key={program.value} value={program.value}>
                  {program.label}
                </option>
              ))}
            </select>
          </div>
          {errors.program && (
            <p className="mt-1 text-sm text-red-400">{errors.program.message}</p>
          )}
        </div>
      </div>

      {/* Third Row: Passengers and Cabin Class */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Passengers
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-1/2 transform -translate-y-1/2" style={iconStyle} size={20} />
            <input
              {...register('passengers', { valueAsNumber: true })}
              type="number"
              min="1"
              max="9"
              style={inputStyle}
              className="w-full pl-10 pr-4 py-3 border rounded-lg text-white placeholder-gray-500 focus:outline-none transition-all"
            />
          </div>
          {errors.passengers && (
            <p className="mt-1 text-sm text-red-400">{errors.passengers.message}</p>
          )}
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Cabin Class
          </label>
          <div className="grid grid-cols-2 gap-2">
            {cabinClasses.map((cabin) => (
              <label
                key={cabin.value}
                style={{
                  backgroundColor: watch('cabinClass') === cabin.value ? 'rgba(255, 215, 0, 0.2)' : '#1C1C1E',
                  borderColor: watch('cabinClass') === cabin.value ? '#FFD700' : '#48484A',
                  color: watch('cabinClass') === cabin.value ? '#FFD700' : '#9CA3AF'
                }}
                className="flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all"
              >
                <input
                  {...register('cabinClass')}
                  type="radio"
                  value={cabin.value}
                  className="sr-only"
                />
                <span className="text-sm font-medium">
                  {cabin.icon} {cabin.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* Search Button */}
      <div className="flex justify-center pt-4">
        <Button
          type="submit"
          variant="primary"
          size="lg"
          icon={Search}
          isLoading={isSearching}
          className="min-w-[200px]"
        >
          {isSearching ? 'Searching...' : 'Find Flights'}
        </Button>
      </div>
    </form>
  );
};

export default SearchForm;
