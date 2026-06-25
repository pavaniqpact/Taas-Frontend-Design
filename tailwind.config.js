/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary:   { DEFAULT:'#2563EB', 50:'#EFF4FF', 100:'#DBEAFE', 600:'#2563EB', 700:'#1D4ED8' },
        secondary: { DEFAULT:'#0F172A', 700:'#334155', 800:'#1E293B' },
        accent:    { DEFAULT:'#06B6D4', 50:'#ECFEFF' },
        success:   { DEFAULT:'#10B981', 50:'#ECFDF5' },
        warning:   { DEFAULT:'#F59E0B', 50:'#FFFBEB' },
        danger:    { DEFAULT:'#EF4444', 50:'#FEF2F2' },
        surface:   '#F8FAFC',
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'system-ui', 'sans-serif'],
        sans:    ['Inter', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'monospace'],
      },
      boxShadow: {
        card:   '0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.05)',
        'card-hover': '0 8px 32px rgba(0,0,0,0.1)',
        glow:   '0 0 0 3px rgba(37,99,235,0.15)',
      },
      borderRadius: { '2xl':'1rem', '3xl':'1.5rem' },
    },
  },
  plugins: [],
};
