import React from 'react';
import { useTheme as useCustomTheme } from '../../theme/ThemeContext';

/**
 * Reusable tooltip for Recharts - supports dark/light mode
 */
const ChartTooltip = React.memo(({ active, payload, label, formatter }) => {
  const { isDarkMode } = useCustomTheme();

  if (!active || !payload?.length) return null;

  const formatValue = (entry) => {
    if (formatter) return formatter(entry.value);
    return typeof entry.value === 'number' ? Math.round(entry.value).toLocaleString() : entry.value;
  };

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? 'rgba(30, 30, 30, 0.95)' : 'rgba(255, 255, 255, 0.95)',
        border: `1px solid ${isDarkMode ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'}`,
        borderRadius: '8px',
        padding: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        color: isDarkMode ? '#ffffff' : '#000000',
        fontSize: '14px',
        backdropFilter: 'blur(10px)',
      }}
    >
      {label && <p style={{ margin: '0 0 8px 0', fontWeight: 'bold' }}>{label}</p>}
      {payload.map((entry, index) => (
        <p
          key={index}
          style={{
            margin: '4px 0',
            color: entry.color || (isDarkMode ? '#ffffff' : '#000000'),
          }}
        >
          {`${entry.name}: ${formatValue(entry)}`}
        </p>
      ))}
    </div>
  );
});

ChartTooltip.displayName = 'ChartTooltip';

export default ChartTooltip;
