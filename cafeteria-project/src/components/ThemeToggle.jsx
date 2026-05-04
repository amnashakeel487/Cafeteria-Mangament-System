import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className="relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none flex-shrink-0"
      style={{ background: isDark ? '#594139' : '#d0d0e0' }}
    >
      {/* Track */}
      <span
        className="absolute inset-0 rounded-full transition-all duration-300"
        style={{ background: isDark ? 'rgba(255,107,53,0.3)' : 'rgba(100,100,200,0.2)' }}
      />
      {/* Thumb */}
      <span
        className="absolute top-0.5 w-5 h-5 rounded-full shadow-md flex items-center justify-center transition-all duration-300"
        style={{
          left: isDark ? 'calc(100% - 1.375rem)' : '0.125rem',
          background: isDark ? '#FF6B35' : '#6060c0',
        }}
      >
        <span className="material-symbols-outlined text-white" style={{ fontSize: '12px', fontVariationSettings: "'FILL' 1" }}>
          {isDark ? 'dark_mode' : 'light_mode'}
        </span>
      </span>
    </button>
  );
}
