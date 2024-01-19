import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, Text, TouchableOpacity, View, Alert} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {AppContext} from '../../App';
import {ToastEHeader} from '../components/Header.tsx';
import {formatTime} from '../utils/helperFunctions';
import {styles} from '../styles/styles';

const TimeRemainingScreen = ({navigation}) => {
  const [timeRemaining_sec, setTimeRemaining] = useState(134); // seconds

  const {currentCrispiness, writeCancelCharacteristic} = useContext(AppContext);

  const cancelToasting = () => {
    navigation.navigate('Selection');
    writeCancelCharacteristic();
  };

  useEffect(() => {
    // const interval = setInterval(() => {
    //   setTimeRemaining(timeRemaining_sec - 1);
    // }, 1000);

    if (timeRemaining_sec > 0) {
      setTimeout(() => {
        setTimeRemaining(timeRemaining_sec - 1);
      }, 1000);
    } else {
      Alert.alert('Toast Ready!', '', [
        {text: 'Restart Timer', onPress: () => setTimeRemaining(999)},
      ]);
    }
    // return () => clearInterval(interval);
  }, [timeRemaining_sec]);

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={{flex: 0, backgroundColor: styles.header.backgroundColor}}
      />
      <SafeAreaView
        style={{
          backgroundColor: Colors.lighter,
          flex: 1,
        }}>
        <View style={{flex: 1}}>
          <ToastEHeader />
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 20}}>
              Current Cripiness: {currentCrispiness}
            </Text>
            <Text style={{fontSize: 25}}>Time Remaining</Text>
            <Text style={{fontSize: 70}}>{formatTime(timeRemaining_sec)}</Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <TouchableOpacity onPress={cancelToasting}>
              <View
                style={{
                  borderRadius: 65,
                  width: 130,
                  height: 130,
                  backgroundColor: 'brown',
                  justifyContent: 'center',
                  alignItems: 'center',
                  margin: 10,
                }}>
                <Text
                  style={{color: '#F3F3F3', fontSize: 35, textAlign: 'center'}}>
                  Cancel
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default TimeRemainingScreen;
