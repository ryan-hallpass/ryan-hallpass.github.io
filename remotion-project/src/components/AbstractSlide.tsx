import React from 'react';

export interface SlideConfig {
  headerHeight: number;
  headlineWidth: string;
  imageHeight: number;
  imagePosition: 'top' | 'middle' | 'bottom';
  textLines: string[]; // array of width percentages, e.g. ['70%', '55%', '80%', '60%']
}

export const SLIDE_CONFIGS: SlideConfig[] = [
  {
    headerHeight: 60,
    headlineWidth: '70%',
    imageHeight: 180,
    imagePosition: 'top',
    textLines: ['75%', '60%', '80%', '55%'],
  },
  {
    headerHeight: 60,
    headlineWidth: '60%',
    imageHeight: 160,
    imagePosition: 'middle',
    textLines: ['80%', '65%', '70%', '50%', '75%'],
  },
  {
    headerHeight: 60,
    headlineWidth: '75%',
    imageHeight: 200,
    imagePosition: 'bottom',
    textLines: ['65%', '80%', '55%', '70%'],
  },
  {
    headerHeight: 60,
    headlineWidth: '55%',
    imageHeight: 170,
    imagePosition: 'top',
    textLines: ['70%', '85%', '60%', '75%', '50%'],
  },
];

export const AbstractSlide: React.FC<{
  config: SlideConfig;
  width: number;
  height: number;
}> = ({config, width, height}) => {
  const padding = 16;
  const lineHeight = 8;
  const lineGap = 12;

  const renderTextLines = () =>
    config.textLines.map((w, i) => (
      <div
        key={i}
        style={{
          width: w,
          height: lineHeight,
          backgroundColor: '#D0D0D0',
          borderRadius: 2,
          marginBottom: lineGap,
        }}
      />
    ));

  const renderImage = () => (
    <div
      style={{
        width: '85%',
        height: config.imageHeight,
        backgroundColor: '#E8E8E8',
        borderRadius: 6,
        marginBottom: lineGap,
      }}
    />
  );

  const renderHeadline = () => (
    <div
      style={{
        width: config.headlineWidth,
        height: 14,
        backgroundColor: '#555',
        borderRadius: 2,
        marginBottom: lineGap + 4,
      }}
    />
  );

  return (
    <div
      style={{
        width,
        height,
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      {/* Header bar */}
      <div
        style={{
          width: '100%',
          height: config.headerHeight,
          backgroundColor: '#C4794A',
        }}
      />

      {/* Content */}
      <div style={{padding}}>
        {config.imagePosition === 'top' && renderImage()}
        {renderHeadline()}
        {config.imagePosition === 'middle' && renderImage()}
        {renderTextLines()}
        {config.imagePosition === 'bottom' && renderImage()}
      </div>
    </div>
  );
};
