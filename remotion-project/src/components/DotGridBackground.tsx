import React from 'react';
import {AbsoluteFill} from 'remotion';

export const DotGridBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F2EFE8',
        backgroundImage:
          'radial-gradient(circle, rgba(196, 121, 74, 0.08) 1.5px, transparent 1.5px)',
        backgroundSize: '40px 40px',
      }}
    />
  );
};
