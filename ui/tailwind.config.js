import { transform } from 'typescript'

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    colors: {
      black: '#1f1f1f',
      white: '#f0f0f0',
      'blue-100': '#e6f7ff',
      'blue-200': '#bae7ff',
      'blue-300': '#91d5ff',
      'blue-400': '#69c0ff',
      'blue-500': '#40a9ff',
      'blue-600': '#1890ff',
      'blue-700': '#096dd9',
      'blue-800': '#0050b3',
      'blue-900': '#003a8c',
      'blue-1000': '#002766',
      'gray-100': '#f5f5f5',
      'gray-200': '#f0f0f0',
      'gray-300': '#d9d9d9',
      'gray-400': '#bfbfbf',
      'gray-500': '#8c8c8c',
      'gray-600': '#595959',
      'gray-700': '#434343',
      'gray-800': '#262626',
      'gray-900': '#1f1f1f',
      'gray-1000': '#141414',
      'green-100': '#f6ffed',
      'green-200': '#d9f7be',
      'green-300': '#b7eb8f',
      'green-400': '#95de64',
      'green-500': '#73d13d',
      'green-600': '#52c41a',
      'green-700': '#389e0d',
      'green-800': '#237804',
      'green-900': '#135200',
      'green-1000': '#092b00',
      'red-100': '#fff1f0',
      'red-200': '#ffccc7',
      'red-300': '#ffa39e',
      'red-400': '#ff7875',
      'red-500': '#ff4d4f',
      'red-600': '#f5222d',
      'red-700': '#cf1322',
      'red-800': '#a8071a',
      'red-900': '#82071e',
      'red-1000': '#5c0011',
      'yellow-100': '#fffbe6',
      'yellow-200': '#fff1b8',
      'yellow-300': '#ffe58f',
      'yellow-400': '#ffd666',
      'yellow-500': '#ffc53d',
      'yellow-600': '#faad14',
      'yellow-700': '#d88213',
      'yellow-800': '#bf5700',
      'yellow-900': '#9c4400',
      'yellow-1000': '#713700'
    },
    boxShadow: {
      round: '4px 4px 8px var(--tw-shadow-color), -4px -4px 8px var(--tw-shadow-color)',
      1: '2px 2px 4px var(--tw-shadow-color)',
      2: '4px 4px 8px var(--tw-shadow-color)'
    },
    screens: {
      phone: '0px',
      // => @media (min-width: 0px) { ... }

      desktop: '768px'
      // => @media (min-width: 768px) { ... }
    },
    fontFamily: {
      own: ['Gap', 'YeZiGongChangXiaoShiTou']
    },
    extend: {
      animation: {
        breath: 'breath 2s ease-in-out infinite',
        'little-ping': 'little-ping 1s cubic-bezier(0, 0, 0.2, 1) infinite'
      },
      keyframes: {
        explode: {
          '0%': { transform: 'scale(0)', opacity: '1' },
          '50%': { opacity: '1' },
          '100%': { transform: 'scale(5)', opacity: '0' }
        },
        breath: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(0.87)' }
        },
        'little-ping': {
          '40%': {
            transform: 'scale(1.2)',
            opacity: 0
          }
        }
      }
    }
  },
  plugins: []
}
