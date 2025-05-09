
import React from 'react';

interface Chart3DProps {
  type: 'pie' | 'bar';
  value1: number;
  value2: number;
  category: 'environmental' | 'governance' | 'social';
}

// Simplified 2D chart implementation using SVG
const Chart3D: React.FC<Chart3DProps> = ({ type, value1, value2, category }) => {
  // Get category colors
  const getCategoryColors = () => {
    switch (category) {
      case 'environmental':
        return { color1: '#00c853', color2: '#2e7d32' };
      case 'governance':
        return { color1: '#aa00ff', color2: '#6a1b9a' };
      case 'social':
        return { color1: '#2196f3', color2: '#0d47a1' };
      default:
        return { color1: '#00c853', color2: '#2e7d32' };
    }
  };

  const { color1, color2 } = getCategoryColors();
  const total = value1 + value2;
  
  // Normalize values for visualization
  const normalizedValue1 = value1 / Math.max(value1, value2);
  const normalizedValue2 = value2 / Math.max(value1, value2);
  
  // Calculate percentages for pie chart
  const percentage1 = ((value1 / total) * 100).toFixed(1);
  const percentage2 = ((value2 / total) * 100).toFixed(1);
  
  // Render pie chart
  if (type === 'pie') {
    // Calculate pie chart segments
    const startAngle1 = 0;
    const endAngle1 = (value1 / total) * 2 * Math.PI;
    const startAngle2 = endAngle1;
    const endAngle2 = 2 * Math.PI;

    const createPieSlice = (startAngle: number, endAngle: number, color: string) => {
      const radius = 40;
      const centerX = 50;
      const centerY = 50;
      
      // Calculate path for arc
      const x1 = centerX + radius * Math.cos(startAngle);
      const y1 = centerY + radius * Math.sin(startAngle);
      const x2 = centerX + radius * Math.cos(endAngle);
      const y2 = centerY + radius * Math.sin(endAngle);
      
      const largeArcFlag = endAngle - startAngle > Math.PI ? 1 : 0;
      
      return `M${centerX},${centerY} L${x1},${y1} A${radius},${radius} 0 ${largeArcFlag},1 ${x2},${y2} Z`;
    };
    
    return (
      <div className="w-full h-full flex items-center justify-center">
        <svg width="100%" height="100%" viewBox="0 0 100 100">
          {/* Pie slices */}
          <path d={createPieSlice(startAngle1, endAngle1, color1)} fill={color1} />
          <path d={createPieSlice(startAngle2, endAngle2, color2)} fill={color2} />
          
          {/* Legend */}
          <text x="50" y="110" textAnchor="middle" fontSize="10" fill="black">
            P1: {percentage1}% - P2: {percentage2}%
          </text>
        </svg>
      </div>
    );
  }
  
  // Render bar chart
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg width="100%" height="100%" viewBox="0 0 100 100">
        {/* Background */}
        <rect x="0" y="0" width="100" height="100" fill="transparent" />
        
        {/* Bars */}
        <rect x="20" y={80 - normalizedValue1 * 60} width="20" height={normalizedValue1 * 60} fill={color1} />
        <rect x="60" y={80 - normalizedValue2 * 60} width="20" height={normalizedValue2 * 60} fill={color2} />
        
        {/* Labels */}
        <text x="30" y="90" textAnchor="middle" fontSize="8" fill="black">P1: {value1.toFixed(2)}</text>
        <text x="70" y="90" textAnchor="middle" fontSize="8" fill="black">P2: {value2.toFixed(2)}</text>
      </svg>
    </div>
  );
};

export default Chart3D;
