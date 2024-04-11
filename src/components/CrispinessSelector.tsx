import React, {useEffect, useState} from 'react';
import {
  Animated,
  Dimensions,
  Image,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

import {CrossfadeImage} from 'react-native-crossfade-image';

import Octicon from 'react-native-vector-icons/Octicons';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome6';
import Ionicon from 'react-native-vector-icons/Ionicons';

import useDebounce from '../hooks/useDebounce';

import {ToastPreviewCarousel} from './toastPreview';
import {styles} from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GradientSlider from './GradientSlider';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

export const CrispinessSelector = ({
  target,
  setTarget,
  navigation,
  toasterState,
  writeTargetCrispinessCharacteristic,
  orientationIsPortrait,
  startNotifications,
  stopNotifications,
  isSimulator,
}) => {
  const darkenFactor = 1 + target / 100;
  const [red, green, blue] = [156, 81, 37];
  // const [red, green, blue] = [255, 233, 219];
  const [r, g, b] = [
    red / darkenFactor,
    green / darkenFactor,
    blue / darkenFactor,
  ].map(Math.round);
  const a = 0.4 + target / 5;

  const diameter = Math.min(height / 4, 100);

  const toastingBegins = () => {
    navigation.navigate('Toasting');
  };

  const confirmCrispiness = () => {
    console.log('Send:', target);
    AsyncStorage.setItem('lastUsedCrispiness', target.toString());

    if (isSimulator || true) {
      navigation.navigate('Toasting');
      return;
    }

    writeTargetCrispinessCharacteristic((data = target));
    // TODO: add await.then() to this?
    // startNotifications({id: '3261042b-e99d-98d6-84ae-2786329fa5a6'});
  };

  const handleSendTarget = useDebounce(confirmCrispiness, 1000);

  useEffect(() => {
    // new target value
    // handleSendTarget();
  }, [target]);

  useEffect(() => {
    if (
      toasterState.controller_state === 'TOASTING' ||
      toasterState.controller_state === 'DONE'
    ) {
      toastingBegins();
      console.log('Toasting begins');
    }
  }, [toasterState.controller_state]);

  const images = [
    require('../assets/img/toast0.png'),
    require('../assets/img/toast1.png'),
    require('../assets/img/toast2.png'),
    require('../assets/img/toast3.png'),
    require('../assets/img/toast4.png'),
    require('../assets/img/toast5.png'),
    require('../assets/img/toast6.png'),
    require('../assets/img/toast7.png'),
    require('../assets/img/toast8.png'),
    require('../assets/img/toast9.png'),
    require('../assets/img/toast10.png'),
    require('../assets/img/toast11.png'),
    require('../assets/img/toast12.png'),
    require('../assets/img/toast13.png'),
    require('../assets/img/toast14.png'),
  ];

  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // AsyncStorage.getItem('lastUsedCrispiness').then(response => {
    //   console.log('response:', response);
    //   console.log('responsetype:', typeof response);
    //   if (response) {
    //     const initTartget = parseInt(response);
    //     setTarget(initTartget);
    //   }
    // });

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
    return () => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };
  }, []);

  return (
    <Animated.View
      style={{
        flex: 1,
        opacity: fadeAnim,
        flexDirection: orientationIsPortrait ? 'column' : 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        backgroundColor: '#e8e7e6',
      }}>
      <View style={{flex: 0.6, height: '100%'}}>
        <CrossfadeImage
          duration={50}
          style={{
            width: orientationIsPortrait ? 300 : '100%',
            height: '100%',
            resizeMode: 'contain',
          }}
          source={images.at(Math.round((target / 100) * (images.length - 1)))}
        />
      </View>
      {orientationIsPortrait && (
        <View style={{margin: 10}}>
          <Text
            style={[
              styles.highlight,
              {color: 'brown', fontSize: 20, textAlign: 'center'},
            ]}>
            Select your preference!
          </Text>
        </View>
      )}

      <View
        style={{
          flex: 0.6,
          flexDirection: orientationIsPortrait ? 'column' : 'row',
          justifyContent: orientationIsPortrait
            ? 'space-between'
            : 'space-evenly',
          alignItems: 'center',
          width: '100%',
        }}>
        <GradientSlider
          width={orientationIsPortrait ? '90%' : 140}
          height={orientationIsPortrait ? 80 : '90%'}
          inputValue={target}
          showIcons={true}
          showLabel={true}
          onValueChangeFn={value => {
            setTarget(Math.round(value));
          }}
          horizontal={orientationIsPortrait}
        />
        <View
          style={{
            justifyContent: 'center',
            alignItems: 'center',
            marginVertical: 15,
          }}>
          <TouchableOpacity onPress={confirmCrispiness}>
            <View
              style={{
                borderRadius: diameter / 2,
                width: diameter,
                height: diameter,
                backgroundColor: '#5e2d16',
                // backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
                justifyContent: 'center',
                alignItems: 'center',
                // margin: 10,
              }}>
              <AwesomeIcon name={'power-off'} size={50} color={'white'} />
            </View>
          </TouchableOpacity>
          {orientationIsPortrait && (
            <Text
              style={{
                color: '#5e2d16',
                fontSize: 15,
                textAlign: 'center',
                paddingVertical: 10,
              }}>
              Toast
            </Text>
          )}
          {/* <Text style={{color: '#000', fontSize: 70, textAlign: 'center'}}>
          {Math.round((target / 100) * images.length)}
        </Text> */}
        </View>
      </View>
    </Animated.View>
  );
};

// import Svg, { Path } from "react-native-svg"
// const SvgComponent = (props) => (
//   <Svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" {...props}>
//     <Path d="M512 176.1c0 26.9-21.6 47.9-56.9 47.9H448v224c0 17.67-14.33 32-32 32H96c-17.67 0-32-14.33-32-32V224h-7.11C21.56 224 0 203 0 176.1 0 112 96 32 256 32s256 80 256 144.1z" />
//   </Svg>
// )
// export default SvgComponent
