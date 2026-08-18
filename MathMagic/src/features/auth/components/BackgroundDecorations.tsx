import React from 'react';
import { View, Dimensions } from 'react-native';
import Svg, { Path, Defs, RadialGradient, Stop, LinearGradient as SvgLinearGradient } from 'react-native-svg';

const { height: SCREEN_HEIGHT, width: SCREEN_WIDTH } = Dimensions.get('window');

interface BackgroundDecorationsProps {
  accent: 'purple' | 'green';
}

export const BackgroundDecorations = ({ accent }: BackgroundDecorationsProps) => {
  const accentColor = accent === 'purple' ? '#8B5CF6' : '#10B981';
  const waveGradColorStart = accent === 'purple' ? '#FAF8FF' : '#F4FDF9';
  const waveGradColorEnd = accent === 'purple' ? '#F5F2FF' : '#EAFDF4';

  return (
    <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 0 }} pointerEvents="none">
      <Svg height="100%" width="100%">
        <Defs>
          <RadialGradient id="glowTopLeft" cx="10%" cy="10%" rx="45%" ry="45%">
            <Stop offset="0%" stopColor={accentColor} stopOpacity="0.2" />
            <Stop offset="100%" stopColor={accentColor} stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="glowMiddleRight" cx="90%" cy="40%" rx="40%" ry="40%">
            <Stop offset="0%" stopColor="#818CF8" stopOpacity="0.15" />
            <Stop offset="100%" stopColor="#818CF8" stopOpacity="0" />
          </RadialGradient>
          <SvgLinearGradient id="waveGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0%" stopColor={waveGradColorStart} stopOpacity="0.95" />
            <Stop offset="100%" stopColor={waveGradColorEnd} stopOpacity="1" />
          </SvgLinearGradient>
        </Defs>
        <Path d={`M0,0 L${SCREEN_WIDTH},0 L${SCREEN_WIDTH},${SCREEN_HEIGHT} L0,${SCREEN_HEIGHT} Z`} fill="url(#glowTopLeft)" />
        <Path d={`M0,0 L${SCREEN_WIDTH},0 L${SCREEN_WIDTH},${SCREEN_HEIGHT} L0,${SCREEN_HEIGHT} Z`} fill="url(#glowMiddleRight)" />
        <Path
          fill="url(#waveGrad)"
          d={`M0,${SCREEN_HEIGHT * 0.65} C${SCREEN_WIDTH * 0.35},${SCREEN_HEIGHT * 0.75} ${SCREEN_WIDTH * 0.65},${SCREEN_HEIGHT * 0.58} ${SCREEN_WIDTH},${SCREEN_HEIGHT * 0.68} L${SCREEN_WIDTH},${SCREEN_HEIGHT} L0,${SCREEN_HEIGHT} Z`}
        />
      </Svg>
    </View>
  );
};

export default BackgroundDecorations;
