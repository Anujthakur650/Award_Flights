'use client';

import React from 'react';
import { motion, MotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PremiumButtonProps extends Omit<MotionProps, 'children'> {
  children: React.ReactNode;
  className?: string;
  variant?: 'solid' | 'gradient' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const PremiumButton: React.FC<PremiumButtonProps> = ({
  children,
  className,
  variant = 'gradient',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  ...motionProps
}) => {
  const variants = {
    solid: 'bg-luxe-gold-bright text-black hover:bg-luxe-gold-light',
    gradient: 'bg-gold-gradient text-black hover:shadow-gold-glow-lg',
    outline: 'bg-transparent border-2 border-luxe-gold text-luxe-gold hover:bg-luxe-gold hover:text-black',
    ghost: 'bg-white/5 text-luxe-gold hover:bg-white/10',
  };

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'font-semibold uppercase tracking-wider rounded-lg transition-all duration-300',
        'backdrop-blur-soft shadow-lg',
        variants[variant],
        sizes[size],
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      {...motionProps}
    >
      {children}
    </motion.button>
  );
};

export default PremiumButton;
