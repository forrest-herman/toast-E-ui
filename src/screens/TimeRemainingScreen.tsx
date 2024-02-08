import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, Text, TouchableOpacity, View, Alert} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {AppContext} from '../../App';
import {ToastEHeader} from '../components/Header.tsx';
import {formatTime} from '../utils/helperFunctions';
import {styles} from '../styles/styles';

const STATUS = {
  IDLE: 'IDLE',
  CONFIGURED: 'CONFIGURED',
  TOASTING: 'TOASTING',
  DONE: 'DONE',
  CANCELLED: 'CANCELLED',
};

// Import the react-native-sound module
var Sound = require('react-native-sound');
var whoosh;

// Enable playback in silence mode
Sound.setCategory('Playback');

const TimeRemainingScreen = ({navigation}) => {
  const [timeRemaining_sec, setTimeRemaining] = useState(134); // seconds
  const [toastingStatus, setToastingStatus] = useState(STATUS.IDLE); // TODO: replace with toasterState

  const {toasterState, writeCancelCharacteristic, stopToasterNotifications} =
    useContext(AppContext);

  const cancelResetBtnFunc = () => {
    navigation.navigate('Selection');
    stopToasterNotifications();
    if (toasterState.controller_state === STATUS.TOASTING)
      writeCancelCharacteristic();
  };

  useEffect(() => {
    // Load the sound file 'whoosh.mp3' from the app bundle
    // See notes below about preloading sounds within initialization code below.
    whoosh = new Sound('toast_ready_alert.wav', Sound.MAIN_BUNDLE, error => {
      if (error) {
        console.log('failed to load the sound', error);
        return;
      }
      // loaded successfully
      console.log(
        'duration in seconds: ' +
          whoosh.getDuration() +
          'number of channels: ' +
          whoosh.getNumberOfChannels(),
      );
    });
    return () => {
      whoosh.release(); // Release the audio player resource
    };
  }, []);

  useEffect(() => {
    if (
      Math.abs(toasterState.time_remaining_estimate - timeRemaining_sec) > 3
    ) {
      setTimeRemaining(toasterState.time_remaining_estimate);
    } else if (
      timeRemaining_sec > 0 &&
      toasterState.controller_state === STATUS.TOASTING
    ) {
      setTimeout(() => {
        setTimeRemaining(timeRemaining_sec - 1);
      }, 1000);
    }
  }, [timeRemaining_sec]);

  useEffect(() => {
    if (toasterState.controller_state === STATUS.DONE) {
      setToastingStatus(STATUS.DONE); // TODO: redundant
      // Play the sound with an onEnd callback
      whoosh.play(success => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });
      //   Alert.alert('Toast Ready!', '', [
      //     {text: 'Restart Timer', onPress: () => setTimeRemaining(999)},
      //   ]);
    }
  }, [toasterState.controller_state]);

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
            <Text style={{fontSize: 30, paddingVertical: 10}}>
              {toasterState.controller_state}
            </Text>
            <Text style={{fontSize: 20, paddingVertical: 40}}>
              Current Cripiness: {toasterState.current_crispiness}
            </Text>

            {toastingStatus === STATUS.DONE ? (
              <Text
                style={{
                  fontSize: 50,
                  paddingVertical: 40,
                  textAlign: 'center',
                }}>
                Toasting Complete!
              </Text>
            ) : (
              <>
                <Text style={{fontSize: 25, textAlign: 'center'}}>
                  Estimated {'\n'}Time Remaining
                </Text>
                <Text style={{fontSize: 70}}>
                  {formatTime(timeRemaining_sec)}
                </Text>
              </>
            )}
            <Text style={{fontSize: 20, paddingVertical: 40}}>
              Time remaining estimate: {toasterState.time_remaining_estimate}
            </Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <TouchableOpacity onPress={cancelResetBtnFunc}>
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
                  {toasterState.controller_state === STATUS.TOASTING
                    ? 'Cancel'
                    : 'Reset'}
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
