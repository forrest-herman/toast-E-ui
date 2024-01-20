import * as React from 'react';
import {Dimensions, Text, View, Image} from 'react-native';

import Carousel from 'react-native-reanimated-carousel';

import {styles} from '../styles';

export const ToastPreviewCarousel = ({target, setTarget}) => {
  const width = Dimensions.get('window').width;

  const images = [
    require('../assets/img/toast0.png'),
    require('../assets/img/toast1.png'),
    require('../assets/img/toast2.png'),
    require('../assets/img/toast3.png'),
    require('../assets/img/toast4.png'),
    require('../assets/img/toast5.png'),
  ];

  return (
    <View>
      <Carousel
        mode="parallax"
        modeConfig={{
          parallaxScrollingScale: 0.9,
          parallaxScrollingOffset: 50,
        }}
        loop={false}
        defaultIndex={0}
        width={width}
        height={width + 20}
        autoPlay={false}
        data={images}
        scrollAnimationDuration={1000}
        onProgressChange={(_a, absoluteProgress) => {
          let input = absoluteProgress / (images.length - 1);
          const newTarget = Math.round(input * 100);
          // console.log('input:', newTarget);
          if (newTarget !== target) setTarget(newTarget);
        }}
        pagingEnabled={false}
        snapEnabled={false}
        renderItem={({index}) => (
          <View
            style={{
              flex: 1,
              justifyContent: 'center',
            }}>
            <Image
              style={{width: '100%', height: '100%'}}
              source={images.at(index)}
            />
          </View>
        )}
      />
    </View>
  );
};

// import Svg, { Path } from "react-native-svg"
// const SvgComponent = (props) => (
//   <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
//     <Path d="M512 176.1c0 26.9-21.6 47.9-56.9 47.9H448v224c0 17.67-14.33 32-32 32H96c-17.67 0-32-14.33-32-32V224h-7.11C21.56 224 0 203 0 176.1 0 112 96 32 256 32s256 80 256 144.1z" />
//   </Svg>
// )
// export default SvgComponent
