'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Search, MapPin, Calendar, Users, Award, Plane } from 'lucide-react';
import { motion } from 'framer-motion';

const searchSchema = z.object({
  from: z.string().min(1, 'Please enter a valid departure airport'),
  to: z.string().min(1, 'Please enter a valid arrival airport'),
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

const SearchFormNew: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<SearchFormData>({
    resolver: zodResolver(searchSchema),
    mode: 'onSubmit',
    defaultValues: {
      passengers: 1,
      cabinClass: 'business',
      from: '',
      to: '',
      date: '',
      program: '',
    },
  });

  const onSubmit = async (data: SearchFormData) => {
    setIsSearching(true);
    setTimeout(() => {
      console.log('Search data:', data);
      setIsSearching(false);
    }, 2000);
  };

  // Consolidated styles
  const inputContainerStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: '500',
    color: '#9CA3AF',
    marginBottom: '8px',
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '12px 12px 12px 44px',
    backgroundColor: '#1C1C1E',
    border: '1px solid #48484A',
    borderRadius: '8px',
    color: '#FFFFFF',
    fontSize: '16px',
    transition: 'all 0.3s',
    outline: 'none',
  };

  const iconStyle: React.CSSProperties = {
    position: 'absolute',
    left: '12px',
    top: '38px', // Position below the label
    color: '#FFD700',
    pointerEvents: 'none',
    zIndex: 1,
  };

  const buttonStyle: React.CSSProperties = {
    padding: '14px 32px',
    backgroundColor: '#FFD700',
    color: '#0A0A0A',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    transition: 'all 0.3s',
    minWidth: '200px',
  };

  const cabinButtonStyle = (isSelected: boolean): React.CSSProperties => ({
    padding: '12px',
    backgroundColor: isSelected ? 'rgba(255, 215, 0, 0.15)' : '#1C1C1E',
    border: `1px solid ${isSelected ? '#FFD700' : '#48484A'}`,
    borderRadius: '8px',
    color: isSelected ? '#FFD700' : '#9CA3AF',
    cursor: 'pointer',
    transition: 'all 0.3s',
    fontSize: '14px',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    width: '100%',
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ width: '100%', maxWidth: '100%' }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* First Row: From/To */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%', marginBottom: errors.from || errors.to ? '20px' : '0' }}>
          <div>
            <label style={labelStyle}>From</label>
            <div style={inputContainerStyle}>
              <MapPin size={20} style={iconStyle} />
              <input
                {...register('from')}
                type="text"
                placeholder="Departure Airport"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#48484A';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.from && (
                <p style={{ color: '#FFD700', fontSize: '11px', marginTop: '2px', position: 'absolute', bottom: '-18px' }}>
                  {errors.from.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>To</label>
            <div style={inputContainerStyle}>
              <Plane size={20} style={iconStyle} />
              <input
                {...register('to')}
                type="text"
                placeholder="Arrival Airport"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#48484A';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.to && (
                <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.to.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Second Row: Date and Program */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
          <div>
            <label style={labelStyle}>Travel Date</label>
            <div style={inputContainerStyle}>
              <Calendar size={20} style={iconStyle} />
              <input
                {...register('date')}
                type="date"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#48484A';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.date && (
                <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.date.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Loyalty Program</label>
            <div style={inputContainerStyle}>
              <Award size={20} style={iconStyle} />
              <select
                {...register('program')}
                style={{
                  ...inputStyle,
                  appearance: 'none',
                  backgroundImage: `url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFD700' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e")`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: 'right 12px center',
                  backgroundSize: '20px',
                  paddingRight: '40px',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#48484A';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="" style={{ backgroundColor: '#1C1C1E', color: '#9CA3AF' }}>
                  Select Program
                </option>
                {loyaltyPrograms.map((program) => (
                  <option 
                    key={program.value} 
                    value={program.value}
                    style={{ backgroundColor: '#1C1C1E', color: '#FFFFFF' }}
                  >
                    {program.label}
                  </option>
                ))}
              </select>
              {errors.program && (
                <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.program.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Third Row: Passengers and Cabin Class */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', width: '100%' }}>
          <div>
            <label style={labelStyle}>Passengers</label>
            <div style={inputContainerStyle}>
              <Users size={20} style={iconStyle} />
              <input
                {...register('passengers', { valueAsNumber: true })}
                type="number"
                min="1"
                max="9"
                style={inputStyle}
                onFocus={(e) => {
                  e.target.style.borderColor = '#FFD700';
                  e.target.style.boxShadow = '0 0 0 3px rgba(255, 215, 0, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#48484A';
                  e.target.style.boxShadow = 'none';
                }}
              />
              {errors.passengers && (
                <p style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px' }}>
                  {errors.passengers.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label style={labelStyle}>Cabin Class</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {cabinClasses.map((cabin) => (
                <label
                  key={cabin.value}
                  style={cabinButtonStyle(watch('cabinClass') === cabin.value)}
                >
                  <input
                    {...register('cabinClass')}
                    type="radio"
                    value={cabin.value}
                    style={{ display: 'none' }}
                  />
                  <span>{cabin.icon}</span>
                  <span>{cabin.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Search Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
          <motion.button
            type="submit"
            style={buttonStyle}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onMouseEnter={(e) => {
              e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.boxShadow = 'none';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
            disabled={isSearching}
          >
            {isSearching ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid #0A0A0A',
                  borderTopColor: 'transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Searching...</span>
              </>
            ) : (
              <>
                <Search size={20} />
                <span>Find Flights</span>
              </>
            )}
          </motion.button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </form>
  );
};

export default SearchFormNew;
