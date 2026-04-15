import {Composition} from 'remotion';
import {DonorSparkPromo} from './DonorSparkPromo';
import {LogoSting} from './LogoSting';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="DonorSparkPromo"
        component={DonorSparkPromo}
        durationInFrames={1290}
        fps={30}
        width={1920}
        height={1080}
      />
      <Composition
        id="DonorSparkLogoSting"
        component={LogoSting}
        durationInFrames={75}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
};
