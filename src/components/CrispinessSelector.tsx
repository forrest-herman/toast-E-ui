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
import BigSlider from './BigSlider';
import LinearGradient from 'react-native-linear-gradient';

const height = Dimensions.get('window').height;

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

  const diameter = Math.min(height / 4, 135);

  const toastingBegins = () => {
    navigation.navigate('Toasting');
  };

  const confirmCrispiness = () => {
    if (isSimulator) {
      navigation.navigate('Toasting');
    }

    console.log('Send:', target);
    AsyncStorage.setItem('lastUsedCrispiness', target.toString());

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
      {orientationIsPortrait && (
        <View style={styles.sectionContainer}>
          <Text
            style={[
              styles.highlight,
              {color: 'brown', fontSize: 20, textAlign: 'center'},
            ]}>
            Select your preference!
          </Text>

          {/* <Image style={{width: '100%'}} source={require('../img/toast0.png')} /> */}
          {/* <SvgComponent/> */}
          {/* <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M512 176.1C512 203 490.4 224 455.1 224H448v224c0 17.67-14.33 32-32 32H96c-17.67 0-32-14.33-32-32V224H56.89C21.56 224 0 203 0 176.1C0 112 96 32 256 32S512 112 512 176.1z"/></svg> */}
        </View>
      )}
      {orientationIsPortrait ? (
        <ToastPreviewCarousel target={target} setTarget={setTarget} />
      ) : (
        <View style={{flex: 0.7, height: '100%'}}>
          <CrossfadeImage
            duration={50}
            style={{width: '100%', height: '100%', resizeMode: 'contain'}}
            source={images.at(Math.round((target / 100) * (images.length - 1)))}
          />
        </View>
      )}
      <View style={{width: 140, height: '90%'}}>
        <LinearGradient
          colors={['#240d02', '#5e2d16', '#edb985']}
          style={{
            flex: 1,
            paddingLeft: 15,
            paddingRight: 15,
            borderRadius: 25,
          }}>
          <AwesomeIcon
            name={'fire-flame-curved'}
            size={40}
            color={`rgba(255, 255, 255, ${target / 100 + 0.1})`}
            style={{
              position: 'absolute',
              alignSelf: 'center',
              top: 15,
            }}
          />
          <Octicon
            name={'flame'}
            size={20}
            color={`rgba(255, 255, 255, ${1 - target / 100 + 0.1})`}
            style={{
              position: 'absolute',
              alignSelf: 'center',
              bottom: 15,
            }}
          />
          <BigSlider
            style={{width: '100%'}}
            onValueChange={value => {
              setTarget(Math.round(value));
            }}
            showLabel={true}
            // trackStyle={{backgroundColor: 'rgba(143, 255, 160, .1)'}}
            maximumValue={100}
            minimumValue={0}
            value={target}
          />
        </LinearGradient>
      </View>
      <View style={{alignItems: 'center'}}>
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
              margin: 10,
            }}>
            <AwesomeIcon name={'power-off'} size={50} color={'white'} />
          </View>
        </TouchableOpacity>
        {/* <Text
          style={{
            color: '5e2d16',
            fontSize: 15,
            textAlign: 'center',
            paddingBottom: 20,
          }}>
          Toast
        </Text> */}
        {/* <Text style={{color: '#000', fontSize: 70, textAlign: 'center'}}>
          {Math.round((target / 100) * images.length)}
        </Text> */}
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
