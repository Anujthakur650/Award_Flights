/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Noir Luxe Theme Colors - Updated to match image
        'noir-black': '#000000',
        'noir-carbon': '#1A1A1A',
        'noir-card': 'rgba(26, 26, 26, 0.95)',
        'noir-charcoal': '#2C2C2E',
        'noir-gray': '#48484A',
        'noir-light-gray': '#636366',
        'luxe-gold': '#F4C430',
        'luxe-gold-light': '#FFD700',
        'luxe-gold-bright': '#FFEB3B',
        'luxe-gold-dark': '#D4AF37',
        'luxe-champagne': '#F7E7CE',
        'white': '#FFFFFF',
        'off-white': '#F5F5F7',
      },
      fontFamily: {
        'serif': ['DM Serif Display', 'serif'],
        'sans': ['DM Sans', 'Inter', 'system-ui', 'sans-serif'],
        'display': ['Playfair Display', 'serif'],
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulseGlow 2s ease-in-out infinite',
      },
      keyframes: {
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(255, 215, 0, 0.5)' },
          '50%': { boxShadow: '0 0 30px rgba(255, 215, 0, 0.8)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: '0.5' },
          '50%': { opacity: '1' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-noir': 'linear-gradient(180deg, #0A0A0A 0%, #1C1C1E 100%)',
        'glass-ultra': 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0.05) 50%, rgba(212,175,55,0.05) 100%)',
        'glass-dark': 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 50%, rgba(212,175,55,0.1) 100%)',
        'gold-gradient': 'linear-gradient(135deg, #D4AF37 0%, #F7DC6F 100%)',
      },
      backdropBlur: {
        'ultra': '25px',
        'medium': '15px',
        'soft': '8px',
      },
      boxShadow: {
        'ultra': '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(212,175,55,0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        'glass-sm': '0 4px 16px 0 rgba(31, 38, 135, 0.2)',
        'gold-glow': '0 0 20px rgba(212, 175, 55, 0.4)',
        'gold-glow-lg': '0 0 40px rgba(212, 175, 55, 0.6)',
      },
    },
  },
  plugins: [],
}
