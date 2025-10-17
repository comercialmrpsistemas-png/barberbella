/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        light: { // Light Theme Palette
          50: '#ffffff',    // Main Background
          100: '#f1f5f9',   // Card, Modal, Sidebar Background
          200: '#e2e8f0',   // Hover Background
          300: '#cbd5e1',   // Borders
          400: '#94a3b8',   // Muted/Placeholder Text
          500: '#64748b',   // Secondary Text
          600: '#475569',
          700: '#334155',
          800: '#1e293b',   // Primary Text / Headings
          900: '#0f172a',   // Stronger Text
          950: '#020617',
        },
        dark: { // Dark Theme Palette - Updated
          50: '#f8fafc',
          100: '#f1f5f9',
          200: '#e2e8f0',   // Primary Text
          300: '#cbd5e1',   // Muted/Placeholder Text
          400: '#94a3b8',   // Secondary Text
          500: '#64748b',   // Borders
          600: '#475569',   // Hover BG
          700: '#475569',   // Input Background
          800: '#334155',   // Card, Modal, Sidebar Background
          900: '#0f172a',
          950: '#1e293b',   // Main Background
        }
      }
    }
  },
  plugins: [],
};
