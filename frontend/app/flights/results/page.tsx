'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import GlassContainer from '@/components/ui/GlassContainer';
import PremiumButton from '@/components/ui/PremiumButton';
import { sortFlights, type FlightSortOption, getBestMilesForFlight, getDurationMinutesForFlight } from '@/lib/sort';
import FloatingParticles from '@/components/ui/FloatingParticles';
import SearchModificationPanel from '@/components/forms/SearchModificationPanel';
import { type AwardFlight, api } from '@/lib/api';
import { useApiFetch } from '@/hooks/useAuthorizedFetch';
import { 
  Plane, 
  Clock, 
  Award,
  Users,
  ChevronRight,
  Filter,
  ArrowLeft,
  Settings,
  Calendar,
  MapPin
} from 'lucide-react';

export default function FlightResultsPage() {
  const router = useRouter();
  const [flights, setFlights] = useState<AwardFlight[]>([]);
  const [searchParams, setSearchParams] = useState<any>({});
  const [loading, setLoading] = useState(true);
  const [showModifySearch, setShowModifySearch] = useState(false);
  const [isModifying, setIsModifying] = useState(false);
  const apiFetch = useApiFetch();
  const [authOk, setAuthOk] = useState<null | boolean>(null);
  const [sortOption, setSortOption] = useState<FlightSortOption>("lowestMiles");

  const sortedFlights = useMemo(() => {
    if (sortOption === 'lowestMiles') {
      // Combined default: lowest points, then shortest duration
      const list = flights.slice();
      list.sort((a, b) => {
        const am = getBestMilesForFlight(a);
        const bm = getBestMilesForFlight(b);
        const aHas = am != null;
        const bHas = bm != null;
        if (aHas && bHas) {
          if ((am as number) !== (bm as number)) return (am as number) - (bm as number);
          const ad = getDurationMinutesForFlight(a);
          const bd = getDurationMinutesForFlight(b);
          const adHas = ad != null;
          const bdHas = bd != null;
          if (adHas && bdHas && (ad as number) !== (bd as number)) return (ad as number) - (bd as number);
          return 0;
        }
        if (aHas && !bHas) return -1;
        if (!aHas && bHas) return 1;
        return 0;
      });
      return list;
    }
    return sortFlights(flights, sortOption);
  }, [flights, sortOption]);

  useEffect(() => {
    // Retrieve search results from sessionStorage
    const storedFlights = sessionStorage.getItem('flightSearchResults');
    const storedParams = sessionStorage.getItem('flightSearchParams');
    
    if (storedFlights && storedParams) {
      setFlights(JSON.parse(storedFlights));
      setSearchParams(JSON.parse(storedParams));
    } else {
      // Redirect back to search if no results
      router.push('/');
    }
    setLoading(false);
  }, [router]);

  // Lightweight auth health check; logs Clerk claims if available
  useEffect(() => {
    (async () => {
      try {
        const res = await apiFetch('/clerk/me');
        if (!res.ok) {
          console.warn('Auth health check failed', res.status);
          setAuthOk(false);
          return;
        }
        const json = await res.json();
        console.log('Clerk /clerk/me claims:', json);
        setAuthOk(true);
      } catch (e) {
        console.warn('Auth health check error', e);
        setAuthOk(false);
      }
    })();
  }, [apiFetch]);

  const formatTime = (isoLike?: string) => {
    if (!isoLike) return '—';
    // Prefer string parsing to avoid SSR/CSR timezone differences.
    // Accept formats like: 2025-08-09T07:30:00 or 2025-08-09T07:30:00Z
    const m = /T(\d{2}):(\d{2})/.exec(isoLike);
    if (m) {
      let h = parseInt(m[1], 10);
      const mm = m[2];
      const ampm = h >= 12 ? 'PM' : 'AM';
      h = h % 12;
      if (h === 0) h = 12;
      const hh = h.toString().padStart(1, '0');
      return `${hh}:${mm} ${ampm}`;
    }
    // Fallback: fixed-locale, fixed-zone to keep deterministic SSR/CSR
    try {
      const d = new Date(isoLike);
      return new Intl.DateTimeFormat('en-US', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'UTC' }).format(d);
    } catch {
      return '—';
    }
  };

  // Helpers to compute layovers deterministically using UTC timestamps from API
  const parseIsoToUTCMinutes = (iso?: string) => {
    if (!iso) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?/.exec(iso);
    if (!m) return null;
    const y = parseInt(m[1], 10);
    const mo = parseInt(m[2], 10) - 1;
    const d = parseInt(m[3], 10);
    const h = parseInt(m[4], 10);
    const mi = parseInt(m[5], 10);
    const s = m[6] ? parseInt(m[6], 10) : 0;
    return Math.floor(Date.UTC(y, mo, d, h, mi, s) / 60000);
  };

  const minutesDiff = (a?: string, b?: string) => {
    const am = parseIsoToUTCMinutes(a);
    const bm = parseIsoToUTCMinutes(b);
    if (am == null || bm == null) return null;
    return Math.max(0, bm - am);
  };

  const formatDurationMins = (mins?: number | null) => {
    if (mins == null) return '—';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  const formatDate = (isoString: string) => {
    // Deterministic: parse YYYY-MM-DD from ISO-like string and render 'Mon D'
    if (!isoString) return '';
    const m = /(\d{4})-(\d{2})-(\d{2})/.exec(isoString);
    if (!m) return '';
    const monthIdx = Math.max(0, Math.min(11, parseInt(m[2], 10) - 1));
    const day = String(parseInt(m[3], 10));
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[monthIdx]} ${day}`;
  };

  const formatTaxes = (value?: number, currency?: string) => {
    if (value == null) return '—';
    let num = Number(value);
    // Heuristic: Seats.aero often returns taxes in minor units (cents). If it's an integer >= 100, show as dollars.
    if ((currency === 'USD' || !currency) && Number.isFinite(num) && Number.isInteger(num) && Math.abs(num) >= 100) {
      num = num / 100;
    }
    if (!Number.isFinite(num)) return '—';
    const fixed = num.toFixed(2);
    // Add thousands separators deterministically
    const [intPart, fracPart] = fixed.split('.');
    const withCommas = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    const formatted = `${withCommas}.${fracPart}`;
    const prefix = currency === 'USD' || !currency ? '$' : '';
    const suffix = currency && currency !== 'USD' ? ` ${currency}` : '';
    return `${prefix}${formatted}${suffix}`;
  };

  const handleModifySearch = async (newSearchParams: any) => {
    setIsModifying(true);
    setShowModifySearch(false);
    
    try {
      const flights = await api.searchFlights(newSearchParams);
      
      // Update stored data
      sessionStorage.setItem('flightSearchResults', JSON.stringify(flights));
      sessionStorage.setItem('flightSearchParams', JSON.stringify(newSearchParams));
      
      // Update state
      setFlights(flights);
      setSearchParams(newSearchParams);
    } catch (error) {
      console.error('Modified search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsModifying(false);
    }
  };

  if (loading || isModifying) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-luxe-gold"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black relative">
      <FloatingParticles />
      
      {/* Background */}
      <div className="fixed inset-0 bg-gradient-to-br from-black via-noir-carbon to-black" />
      <div className="fixed inset-0" style={{ 
        background: 'radial-gradient(ellipse at top center, rgba(212, 175, 55, 0.05), transparent)',
      }} />
      
      {/* Content */}
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-8 pb-6 px-4 border-b border-white/5"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link href="/">
                  <PremiumButton variant="ghost" size="sm">
                    <ArrowLeft size={18} className="mr-2" />
                    Back
                  </PremiumButton>
                </Link>
                <div>
                  <h1 className="text-2xl font-bold tracking-wider">
                    <span className="text-white">AERO</span>
                    <span className="bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright bg-clip-text text-transparent ml-2">POINTS</span>
                  </h1>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-white text-lg">
                    {searchParams.from} → {searchParams.to}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {searchParams.travelDate} • {searchParams.travelers} Passenger(s) • {searchParams.cabinClass}
                  </p>
                </div>
                
                <PremiumButton 
                  variant="ghost" 
                  size="sm"
                  onClick={() => setShowModifySearch(true)}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  Modify
                </PremiumButton>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Results */}
        <div className="container mx-auto max-w-7xl px-4 py-8">
          {/* Quick Modify Bar */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <GlassContainer variant="dark" blur="soft" className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-300">
                    <MapPin size={16} />
                    <span>{searchParams.from} → {searchParams.to}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Calendar size={16} />
                    <span>{searchParams.travelDate}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Users size={16} />
                    <span>{searchParams.travelers} traveler(s)</span>
                  </div>
                  <div className="px-2 py-1 bg-luxe-gold/10 text-luxe-gold text-xs rounded-full">
                    {searchParams.cabinClass}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <label htmlFor="sortBy" className="text-gray-400 uppercase tracking-wider text-xs">Sort by</label>
                    <select
                      id="sortBy"
                      value={sortOption}
                      onChange={(e) => setSortOption(e.target.value as FlightSortOption)}
                      className="bg-white/5 text-white border border-white/10 rounded-md px-3 py-2 text-sm focus:outline-none focus:border-luxe-gold/50 focus:ring-2 focus:ring-luxe-gold/20"
                    >
                      <option value="none">Default</option>
                      <option value="lowestMiles">Lowest Points</option>
                      <option value="shortestDuration">Shortest Duration</option>
                      <option value="nonStopFirst">Non-stop First</option>
                    </select>
                  </div>
                  <PremiumButton 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowModifySearch(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings size={16} />
                    Modify Search
                  </PremiumButton>
                </div>
              </div>
            </GlassContainer>
          </motion.div>

          {/* Results Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <h2 className="text-3xl font-display bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright bg-clip-text text-transparent mb-2">
              Available Award Flights
            </h2>
            <p className="text-white/60">
              Found {flights.length} flights matching your criteria
            </p>
          </motion.div>

          {/* Flight Cards */}
          <div className="space-y-4">
            {sortedFlights.map((flight, index) => (
              <motion.div
                key={flight.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassContainer variant="dark" blur="medium" className="p-6 hover:border-luxe-gold/30 transition-all">
                  <div className="flex items-center justify-between">
                    {/* Flight Info */}
                    <div className="flex-1">
                      <div className="flex items-center gap-6 mb-4">
                        <div>
                          <p className="text-2xl font-bold text-white">{formatTime(flight.departureTimeLocal || flight.departureTime)}</p>
                          <p className="text-sm text-gray-400">{flight.from.code}</p>
                        </div>
                        
                        <div className="flex-1 flex items-center">
                          <div className="flex-1 border-t border-gray-600 relative">
                            <Plane className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-luxe-gold" size={20} />
                          </div>
                          <div className="mx-4 text-center">
                            <p className="text-xs text-gray-400">{flight.duration}</p>
                            <p className="text-xs text-gray-500">
                              {flight.stops === 0 ? 'Nonstop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}`}
                            </p>
                          </div>
                          <div className="flex-1 border-t border-gray-600"></div>
                        </div>
                        
                        <div>
                          <p className="text-2xl font-bold text-white">{formatTime(flight.arrivalTimeLocal || flight.arrivalTime)}</p>
                          <p className="text-sm text-gray-400">{flight.to.code}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-white">{flight.operatingAirline || flight.airline}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{flight.flightNumber}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-400">{flight.aircraft}</span>
                      </div>

                      {/* Segments & Stopovers */}
                      {flight.segments && flight.segments.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs uppercase tracking-wider text-gray-400 mb-2">Itinerary</div>
                          <div className="space-y-3">
                            {(() => {
                              const segs = flight.segments ?? [];
                              return segs.map((seg, idx) => (
                              <div key={`${seg.flightNumber}-${idx}`} className="border border-white/10 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-3">
                                    <span className="font-semibold text-white">{seg.origin}</span>
                                    <span className="text-gray-400">{formatTime(seg.departureTimeLocal || seg.departureTime)}</span>
                                  </div>
                                  <div className="text-gray-400">→</div>
                                  <div className="flex items-center gap-3">
                                    <span className="text-gray-400">{formatTime(seg.arrivalTimeLocal || seg.arrivalTime)}</span>
                                    <span className="font-semibold text-white">{seg.destination}</span>
                                  </div>
                                </div>
                                <div className="mt-1 text-xs text-gray-400">
                                  {flight.operatingAirline || flight.airline} • {seg.flightNumber}{seg.aircraft ? ` • ${seg.aircraft}` : ''}
                                </div>
                                {/* Layover to next segment */}
                                {idx < segs.length - 1 && (() => {
                                  const nextSeg = segs[idx + 1];
                                  const mins = minutesDiff(seg.arrivalTime, nextSeg?.departureTime);
                                  const stop = seg.destination;
                                  return (
                                    <div className="mt-2 text-xs text-luxe-gold">
                                      {`Layover at ${stop}: ${formatDurationMins(mins)}`}
                                    </div>
                                  );
                                })()}
                              </div>
                              ));
                            })()}
                          </div>
                        </div>
                      )}

                      {/* Booking Programs (real offers) */}
                      {flight.offers && flight.offers.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {flight.offers.map((offer, idx) => (
                            <span
                              key={`${offer.program}-${idx}`}
                              className="px-2 py-1 bg-luxe-gold/10 text-luxe-gold text-xs rounded-full"
                              title={`${offer.cabin || 'Cabin'} • ${offer.remainingSeats ?? '—'} seats • ${formatTaxes(offer.taxes, offer.currency)}`}
                            >
                              {offer.program}: {offer.miles?.toLocaleString() ?? '—'} miles • {formatTaxes(offer.taxes, offer.currency)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Points & Availability */}
                    <div className="text-right ml-8 w-72">
                      {flight.offers && flight.offers.length > 0 ? (
                        <>
                          {(() => {
                            const sorted = [...flight.offers].sort((a, b) => (a.miles || Infinity) - (b.miles || Infinity));
                            const best = sorted[0];
                            return (
                              <div className="mb-4 text-left">
                                <p className="text-xs text-gray-400 mb-1">Best offer</p>
                                <p className="text-2xl font-bold text-white">{best.miles?.toLocaleString() ?? '—'} miles</p>
                                <p className="text-xs text-gray-400">via {best.program} • {best.cabin || 'Cabin'} • {best.remainingSeats ?? '—'} seats • {formatTaxes(best.taxes, best.currency)}</p>
                              </div>
                            );
                          })()}
                          <div className="max-h-28 overflow-auto pr-1">
                            {flight.offers.slice(1).map((o, i) => (
                              <div key={`${o.program}-row-${i}`} className="flex items-center justify-between py-1 border-t border-white/5">
                                <span className="text-xs text-gray-300 truncate">{o.program}</span>
                                <span className="text-xs text-white ml-2">{o.miles?.toLocaleString() ?? '—'} miles • {formatTaxes(o.taxes, o.currency)}</span>
                              </div>
                            ))}
                          </div>
                          <PremiumButton variant="gradient" size="sm" className="w-full mt-3">
                            Select Flight
                          </PremiumButton>
                        </>
                      ) : (
                        <div className="text-gray-400">No booking offers found</div>
                      )}
                    </div>
                  </div>
                </GlassContainer>
              </motion.div>
            ))}
          </div>

          {/* No Results */}
          {flights.length === 0 && (
            <GlassContainer variant="dark" blur="medium" className="p-12 text-center">
              <Plane className="mx-auto text-luxe-gold mb-4" size={48} />
              <h3 className="text-xl font-semibold text-white mb-2">No Award Flights Available</h3>
              <p className="text-gray-400 mb-4">
                We couldn't find any award availability for your selected route and date.
              </p>
              <p className="text-gray-500 text-sm mb-6">
                Try different dates, routes, or cabin classes. Award space is limited and varies by airline.
              </p>
              
              <div className="flex gap-4 justify-center">
                <PremiumButton 
                  variant="gradient" 
                  size="md"
                  onClick={() => setShowModifySearch(true)}
                  className="flex items-center gap-2"
                >
                  <Settings size={16} />
                  Modify Search
                </PremiumButton>
                
                <Link href="/">
                  <PremiumButton variant="outline" size="md">
                    New Search
                  </PremiumButton>
                </Link>
              </div>
            </GlassContainer>
          )}
        </div>
      </div>

      {/* Search Modification Panel */}
      <SearchModificationPanel
        initialParams={{
          from: searchParams.from || '',
          to: searchParams.to || '',
          travelDate: searchParams.travelDate || '',
          travelers: searchParams.travelers || '1',
          cabinClass: searchParams.cabinClass || 'Economy',
          loyaltyProgram: searchParams.loyaltyProgram || ''
        }}
        onSearch={handleModifySearch}
        onClose={() => setShowModifySearch(false)}
        isVisible={showModifySearch}
      />
    </main>
  );
}
