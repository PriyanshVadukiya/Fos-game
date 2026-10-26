import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Cyberpunk / dark terminal palette
        terminal: {
          bg:       '#0a0e17',
          surface:  '#0f1623',
          panel:    '#141d2b',
          border:   '#1e2d40',
          muted:    '#243447',
        },
        neon: {
          green:    '#00ff9f',
          cyan:     '#00e5ff',
          blue:     '#4d9eff',
          purple:   '#a855f7',
          pink:     '#ff3cac',
          yellow:   '#ffe600',
          orange:   '#ff6b2b',
        },
        syscall: {
          open:     '#4d9eff',
          read:     '#00ff9f',
          write:    '#ffe600',
          close:    '#ff6b2b',
          fork:     '#a855f7',
          exec:     '#ff3cac',
          stat:     '#00e5ff',
          unlink:   '#ef4444',
          dup2:     '#f97316',
          pipe:     '#8b5cf6',
          wait:     '#ec4899',
          exit:     '#6b7280',
          mmap:     '#14b8a6',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Consolas', 'monospace'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pulse-neon':   'pulseNeon 2s ease-in-out infinite',
        'slide-in':     'slideIn 0.3s ease-out',
        'packet-flow':  'packetFlow 0.8s ease-in-out',
        'glow':         'glow 1.5s ease-in-out infinite alternate',
        'shimmer':      'shimmer 2s linear infinite',
        'bounce-in':    'bounceIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
      },
      keyframes: {
        pulseNeon: {
          '0%, 100%': { opacity: '1' },
          '50%':       { opacity: '0.5' },
        },
        slideIn: {
          from: { opacity: '0', transform: 'translateY(-8px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        packetFlow: {
          '0%':   { transform: 'translateX(-100%)', opacity: '0' },
          '20%':  { opacity: '1' },
          '80%':  { opacity: '1' },
          '100%': { transform: 'translateX(100%)', opacity: '0' },
        },
        glow: {
          from: { boxShadow: '0 0 5px currentColor' },
          to:   { boxShadow: '0 0 20px currentColor, 0 0 40px currentColor' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        bounceIn: {
          from: { opacity: '0', transform: 'scale(0.85)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'neon-green':  '0 0 12px #00ff9f, 0 0 24px #00ff9f40',
        'neon-blue':   '0 0 12px #4d9eff, 0 0 24px #4d9eff40',
        'neon-purple': '0 0 12px #a855f7, 0 0 24px #a855f740',
        'neon-pink':   '0 0 12px #ff3cac, 0 0 24px #ff3cac40',
        'neon-cyan':   '0 0 12px #00e5ff, 0 0 24px #00e5ff40',
        'panel':       '0 4px 24px rgba(0,0,0,0.5)',
      },
    },
  },
  plugins: [],
} satisfies Config;
