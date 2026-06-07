/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        ink: '#111827',
        muted: '#5f6476',
        canvas: '#f7f6ff',
        surface: '#ffffff',
        line: '#e4e7f5',
        primary: '#0f5bd7',
        primarySoft: '#eaf1ff',
        ai: '#6d36e8',
        aiSoft: '#efe8ff',
        cyanSoft: '#e8fbff',
        success: '#16a34a',
        warning: '#f59e0b',
        danger: '#e23b3b',
      },
      boxShadow: {
        stitch: '0 18px 45px rgba(31, 38, 76, 0.08)',
        panel: '0 10px 30px rgba(43, 54, 116, 0.07)',
      },
      borderRadius: {
        stitch: '14px',
      },
    },
  },
  plugins: [],
};
