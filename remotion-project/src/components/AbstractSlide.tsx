import React from 'react';

export interface SlideConfig {
  headline: string;
  stat?: string;
  bodyLines: string[]; // width percentages for abstract text lines
  hasHeroImage: boolean;
  keywords: string[];
}

export const SLIDE_CONFIGS: SlideConfig[] = [
  {
    headline: 'Helping Children Thrive',
    stat: '600+',
    bodyLines: ['75%', '60%', '80%'],
    hasHeroImage: true,
    keywords: ['youth served', 'mentoring'],
  },
  {
    headline: 'The Challenge',
    bodyLines: ['80%', '65%', '70%', '55%'],
    hasHeroImage: false,
    keywords: ['education', 'transform lives'],
  },
  {
    headline: 'Our Approach',
    bodyLines: ['65%', '80%', '55%'],
    hasHeroImage: true,
    keywords: ['since 2018', 'community'],
  },
  {
    headline: 'Make a Difference',
    stat: '94%',
    bodyLines: ['70%', '85%', '60%'],
    hasHeroImage: false,
    keywords: ['donate', 'volunteer'],
  },
];

export const AbstractSlide: React.FC<{
  config: SlideConfig;
  width: number;
  height: number;
}> = ({config, width, height}) => {
  const padding = 16;
  const lineHeight = 7;
  const lineGap = 10;

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        flexShrink: 0,
        position: 'relative',
        fontFamily: 'system-ui, -apple-system, sans-serif',
      }}
    >
      {/* Header bar with org name */}
      <div
        style={{
          width: '100%',
          height: 50,
          backgroundColor: '#C4794A',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: padding,
        }}
      >
        <span style={{color: '#FFFFFF', fontSize: 14, fontWeight: 600, letterSpacing: 0.5}}>
          My Nonprofit
        </span>
      </div>

      {/* Hero image area */}
      {config.hasHeroImage && (
        <div
          style={{
            margin: `${padding}px ${padding}px 0`,
            height: 200,
            backgroundColor: '#EDE8E0',
            borderRadius: 6,
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          {/* Abstract people silhouettes */}
          <div style={{display: 'flex', gap: 6, marginBottom: 8, alignItems: 'flex-end'}}>
            {[28, 36, 32, 38, 26].map((h, i) => (
              <div key={i} style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                <div style={{
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  backgroundColor: i % 2 === 0 ? '#C4A882' : '#B8967A',
                }} />
                <div style={{
                  width: 12,
                  height: h,
                  backgroundColor: i % 2 === 0 ? '#C4A882' : '#B8967A',
                  borderRadius: '3px 3px 0 0',
                  marginTop: 1,
                }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stat callout */}
      {config.stat && (
        <div style={{padding: `${padding}px ${padding}px 4px`}}>
          <span style={{fontSize: 28, fontWeight: 800, color: '#C4794A'}}>
            {config.stat}
          </span>
        </div>
      )}

      {/* Headline */}
      <div style={{padding: `${config.stat ? 4 : padding}px ${padding}px 8px`}}>
        <div style={{fontSize: 15, fontWeight: 700, color: '#333'}}>
          {config.headline}
        </div>
      </div>

      {/* Abstract body text lines */}
      <div style={{padding: `0 ${padding}px`}}>
        {config.bodyLines.map((w, i) => (
          <div
            key={i}
            style={{
              width: w,
              height: lineHeight,
              backgroundColor: '#DCDCDC',
              borderRadius: 2,
              marginBottom: lineGap,
            }}
          />
        ))}
      </div>

      {/* Keywords from the scan */}
      <div style={{padding: `4px ${padding}px`, display: 'flex', flexWrap: 'wrap', gap: 6}}>
        {config.keywords.map((kw, i) => (
          <span
            key={i}
            style={{
              fontSize: 10,
              color: '#C4794A',
              backgroundColor: 'rgba(196, 121, 74, 0.1)',
              padding: '2px 8px',
              borderRadius: 10,
              fontWeight: 500,
            }}
          >
            {kw}
          </span>
        ))}
      </div>
    </div>
  );
};
