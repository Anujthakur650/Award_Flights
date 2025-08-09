'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface GlassContainerProps extends MotionProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'ultra' | 'dark' | 'light';
  blur?: 'ultra' | 'medium' | 'soft';
  glow?: boolean;
  noPadding?: boolean;
}

const GlassContainer: React.FC<GlassContainerProps> = ({
  children,
  className,
  variant = 'ultra',
  blur = 'ultra',
  glow = false,
  noPadding = false,
  ...motionProps
}) => {
  const variants = {
    ultra: 'bg-glass-ultra',
    dark: 'bg-glass-dark',
    light: 'bg-white/10',
  };

  const blurClasses = {
    ultra: 'backdrop-blur-ultra',
    medium: 'backdrop-blur-medium',
    soft: 'backdrop-blur-soft',
  };

  return (
    <motion.div
      className={cn(
        variants[variant],
        blurClasses[blur],
        'shadow-ultra rounded-2xl border border-white/10',
        !noPadding && 'p-6',
        glow && 'hover:shadow-gold-glow-lg transition-shadow duration-300',
        className
      )}
      {...motionProps}
    >
      {children}
    </motion.div>
  );
};

export default GlassContainer;
