import React, {useEffect, useState} from 'react';
import {Text, TouchableWithoutFeedback, View} from 'react-native';

import useDebounce from '../hooks/useDebounce';

import {ToastPreviewCarousel} from './toastPreview';
import {styles} from '../styles';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const CrispinessSelector = ({
  target,
  setTarget,
  navigation,
  toasterState,
  writeTargetCrispinessCharacteristic,
  startNotifications,
  stopNotifications,
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

  const toastingBegins = () => {
    navigation.navigate('Toasting');
  };

  const confirmCrispiness = () => {
    console.log('Send:', target);
    AsyncStorage.setItem('lastUsedCrispiness', target.toString());

    writeTargetCrispinessCharacteristic((data = target));
    // TODO: add await.then() to this?
    startNotifications({id: '3261042b-e99d-98d6-84ae-2786329fa5a6'});
  };

  const handleSendTarget = useDebounce(confirmCrispiness, 1000);

  useEffect(() => {
    // new target value
    handleSendTarget();
  }, [target]);

  useEffect(() => {
    if (toasterState.controller_state === 'TOASTING') toastingBegins();
  }, [toasterState.controller_state]);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        alignItems: 'center',
      }}>
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
      <ToastPreviewCarousel target={target} setTarget={setTarget} />
      <View style={{alignItems: 'center'}}>
        <TouchableWithoutFeedback onPress={toastingBegins}>
          {/* onLongPress={confirmCrispiness}> */}
          <View
            style={{
              borderRadius: 65,
              width: 130,
              height: 130,
              backgroundColor: `rgba(${r}, ${g}, ${b}, ${a})`,
              justifyContent: 'center',
              alignItems: 'center',
              margin: 10,
            }}>
            <Text style={{color: '#F3F3F3', fontSize: 70, textAlign: 'center'}}>
              {target}
            </Text>
          </View>
        </TouchableWithoutFeedback>
        <Text style={{color: 'brown', fontSize: 20, textAlign: 'center'}}>
          Desired Crispiness
        </Text>
      </View>
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
