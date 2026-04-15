import React from 'react';
import {AbsoluteFill} from 'remotion';
import {DotGridBackground} from './components/DotGridBackground';
import {PromptBox} from './components/PromptBox';
import {BrowserWireframe} from './components/BrowserWireframe';
import {DeckCarousel} from './components/DeckCarousel';

// Beat timing (absolute frames)
const PROMPT_ENTER = 0;
const BROWSER_ENTER = 60;
const CAROUSEL_ENTER = 150;

// Layout
const LEFT_MARGIN = 80;
const PROMPT_Y = 80;
const BROWSER_Y = 280;
const BROWSER_WIDTH = 700;
const BROWSER_HEIGHT = 560;
const CAROUSEL_X = 1050;
const CAROUSEL_WIDTH = 480;
const CAROUSEL_HEIGHT = 854;

export const ProductDemo: React.FC = () => {
  return (
    <AbsoluteFill>
      <DotGridBackground />

      {/* Beat 1: URL Prompt Box — upper left */}
      <div style={{position: 'absolute', left: LEFT_MARGIN, top: PROMPT_Y}}>
        <PromptBox enterFrame={PROMPT_ENTER} />
      </div>

      {/* Beat 2: Website Wireframe — bottom left */}
      <div style={{position: 'absolute', left: LEFT_MARGIN, top: BROWSER_Y}}>
        <BrowserWireframe
          enterFrame={BROWSER_ENTER}
          width={BROWSER_WIDTH}
          height={BROWSER_HEIGHT}
        />
      </div>

      {/* Beat 3: Deck Carousel — right half, vertically centered */}
      <div
        style={{
          position: 'absolute',
          left: CAROUSEL_X,
          top: (1080 - CAROUSEL_HEIGHT) / 2,
        }}
      >
        <DeckCarousel
          enterFrame={CAROUSEL_ENTER}
          frameWidth={CAROUSEL_WIDTH}
          frameHeight={CAROUSEL_HEIGHT}
        />
      </div>
    </AbsoluteFill>
  );
};
