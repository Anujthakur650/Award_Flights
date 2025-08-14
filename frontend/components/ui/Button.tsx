'use client';

import React from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import { LucideIcon } from 'lucide-react';

type ButtonBaseProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  iconPosition?: 'left' | 'right';
  isLoading?: boolean;
  children: React.ReactNode;
};

type ButtonProps = ButtonBaseProps & HTMLMotionProps<'button'>;

const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  iconPosition = 'left',
  isLoading = false,
  children,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles = 'font-sans font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2';
  
  const getVariantStyles = (variant: string): React.CSSProperties => {
    const styles: { [key: string]: React.CSSProperties } = {
      primary: {
        backgroundColor: '#FFD700',
        color: '#0A0A0A',
        border: 'none',
      },
      secondary: {
        backgroundColor: '#1C1C1E',
        color: '#FFFFFF',
        border: '1px solid #48484A',
      },
      outline: {
        backgroundColor: 'transparent',
        color: '#FFD700',
        border: '2px solid #FFD700',
      },
      ghost: {
        backgroundColor: 'transparent',
        color: '#FFFFFF',
        border: '1px solid transparent',
      },
    };
    return styles[variant] || styles.primary;
  };

  const getSizeStyles = (size: string): React.CSSProperties => {
    const styles: { [key: string]: React.CSSProperties } = {
      sm: { padding: '8px 16px', fontSize: '14px' },
      md: { padding: '12px 24px', fontSize: '16px' },
      lg: { padding: '16px 32px', fontSize: '18px' },
    };
    return styles[size] || styles.md;
  };

  const isDisabled = disabled || isLoading;

  const buttonStyle: React.CSSProperties = {
    ...getVariantStyles(variant),
    ...getSizeStyles(size),
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'all 0.3s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
  };

  return (
    <motion.button
      whileHover={!isDisabled ? { scale: 1.02 } : {}}
      whileTap={!isDisabled ? { scale: 0.98 } : {}}
      style={buttonStyle}
      className={className}
      disabled={isDisabled}
      onMouseEnter={(e) => {
        if (!isDisabled && variant === 'primary') {
          e.currentTarget.style.boxShadow = '0 0 30px rgba(255, 215, 0, 0.5)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
      }}
      {...props}
    >
      {isLoading ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current" />
      ) : (
        <>
          {Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
          {children}
          {Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} />}
        </>
      )}
    </motion.button>
  );
};

export default Button;
