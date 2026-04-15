import React from 'react';
import {AbsoluteFill} from 'remotion';

export const DotGridBackground: React.FC = () => {
  return (
    <AbsoluteFill
      style={{
        backgroundColor: '#F2EFE8',
        backgroundImage: `
          linear-gradient(rgba(196, 121, 74, 0.06) 1px, transparent 1px),
          linear-gradient(90deg, rgba(196, 121, 74, 0.06) 1px, transparent 1px)
        `,
        backgroundSize: '40px 40px',
      }}
    />
  );
};
