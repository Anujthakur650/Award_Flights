'use client';

import React from 'react';
import { motion } from 'framer-motion';
import EnhancedSearchForm from '../forms/EnhancedSearchForm';
import GlassContainer from '../ui/GlassContainer';
import FloatingParticles from '../ui/FloatingParticles';

const AeroPointsHero: React.FC = () => {
  // Chosen default background: Gold Bokeh (Noir Luxe). We still keep
  // the previous default image in /public/images/hero-sunset-bg.jpg for later use.
  const backgroundUrl = 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?auto=format&fit=crop&w=2400&q=80';

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Floating Particles */}
      <FloatingParticles />
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("${backgroundUrl}")`,
          }}
        />
        
        {/* Warm gradient overlay to enhance sunset effect */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(139,69,19,0.2) 40%, rgba(255,140,0,0.1) 60%, rgba(0,0,0,0.6) 100%)',
          }}
        />
        
        {/* Dark overlay for better text contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />
        
        {/* Golden glow effect at horizon */}
        <div 
          className="absolute inset-x-0 top-1/4 h-2/4"
          style={{
            background: 'radial-gradient(ellipse at center bottom, rgba(255, 193, 7, 0.2) 0%, transparent 60%)',
          }}
        />
      </div>

      {/* Content Container */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="pt-8 pb-4 px-4"
        >
          <div className="container mx-auto max-w-7xl">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <motion.div 
                  className="text-2xl md:text-3xl font-bold tracking-wider"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <span className="text-white">Premium</span>
                  <span className="bg-gradient-to-r from-luxe-gold-dark to-luxe-gold-bright bg-clip-text text-transparent ml-2">Award Flights</span>
                </motion.div>
              </div>
              {/* Background selector removed per request; default image retained in /public/images/hero-sunset-bg.jpg for future reuse. */}
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="container mx-auto max-w-2xl">
            {/* Search Card */}
            <GlassContainer
              variant="dark"
              blur="ultra"
              glow={true}
              noPadding
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="max-w-2xl mx-auto"
            >
              {/* Card Header with Title */}
              <div className="relative px-6 sm:px-8 pt-6 sm:pt-8 pb-5 sm:pb-6 text-center">
                <motion.h1 
                  className="text-2xl sm:text-3xl md:text-4xl font-bold uppercase tracking-wide"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4, duration: 0.8 }}
                >
                  <span className="bg-gradient-to-r from-luxe-gold-dark via-luxe-gold to-luxe-gold-bright bg-clip-text text-transparent">FIND YOUR</span>
                  <br />
                  <span className="bg-gradient-to-r from-luxe-gold-dark via-luxe-gold to-luxe-gold-bright bg-clip-text text-transparent">PERFECT</span>
                  <br />
                  <span className="bg-gradient-to-r from-luxe-gold-dark via-luxe-gold to-luxe-gold-bright bg-clip-text text-transparent">FLIGHT</span>
                </motion.h1>
                
                <motion.p
                  className="text-gray-300/90 text-sm sm:text-base mt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6, duration: 0.8 }}
                >
                  Experience luxury travel with<br />
                  our premium award flight search.
                </motion.p>
              </div>

              {/* Search Form */}
              <div className="px-6 sm:px-8 pb-6 sm:pb-8">
                <EnhancedSearchForm />
              </div>
            </GlassContainer>
          </div>
        </div>

        {/* Optional: Bottom gradient fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
      </div>
    </section>
  );
};

export default AeroPointsHero;
