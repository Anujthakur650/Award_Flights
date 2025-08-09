'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Search, Plane } from 'lucide-react';
import Button from '../ui/Button';
import SearchFormNew from '../forms/SearchFormNew';

const NoirHeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen w-full overflow-hidden">
      {/* Background Gradient with Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-noir-black via-noir-carbon to-noir-black" />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at top right, rgba(255, 215, 0, 0.1), transparent)' }} />
        <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at bottom left, rgba(255, 215, 0, 0.05), transparent)' }} />
      </div>

      {/* Content Container */}
      <div className="relative z-10 container mx-auto px-4 pt-32 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          {/* Main Headline */}
          <motion.h1 
            className="text-5xl md:text-7xl lg:text-8xl font-serif text-white uppercase tracking-wider mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            Find Your{' '}
            <span className="text-gradient-gold">Perfect Flight</span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            className="text-xl md:text-2xl text-gray-300 font-sans font-light max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.8 }}
          >
            Experience luxury travel with our premium award flight search.
            <br />
            Access exclusive routes and maximize your points value.
          </motion.p>

          {/* Trust Indicators */}
          <motion.div
            className="flex flex-wrap justify-center gap-8 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="flex items-center gap-2">
              <Plane className="text-luxe-gold" size={20} />
              <span className="text-gray-400">28K+ Airports</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-luxe-gold text-2xl">★</span>
              <span className="text-gray-400">500K+ Members</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-luxe-gold">✓</span>
              <span className="text-gray-400">Real-time Availability</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Search Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="max-w-6xl mx-auto"
        >
          <div className="glass-effect rounded-2xl p-8 shadow-2xl">
            <SearchFormNew />
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          className="flex flex-wrap justify-center gap-4 mt-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          <Button variant="outline" size="md">
            Popular Routes
          </Button>
          <Button variant="ghost" size="md">
            How It Works
          </Button>
          <Button variant="ghost" size="md">
            Premium Membership
          </Button>
        </motion.div>
      </div>

      {/* Animated scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 border-2 border-luxe-gold rounded-full flex justify-center">
          <div className="w-1 h-3 bg-luxe-gold rounded-full mt-2" />
        </div>
      </motion.div>
    </section>
  );
};

export default NoirHeroSection;
