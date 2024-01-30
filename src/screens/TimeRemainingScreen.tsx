import React, {useContext, useEffect, useState} from 'react';
import {SafeAreaView, Text, TouchableOpacity, View, Alert} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {AppContext} from '../../App';
import {ToastEHeader} from '../components/Header.tsx';
import {formatTime} from '../utils/helperFunctions';
import {styles} from '../styles/styles';

const STATUS = {
  TOASTING: 0,
  CANCELLED: 1,
  READY: 2,
};

// Import the react-native-sound module
var Sound = require('react-native-sound');
var whoosh;

// Enable playback in silence mode
Sound.setCategory('Playback');

const TimeRemainingScreen = ({navigation}) => {
  const [timeRemaining_sec, setTimeRemaining] = useState(134); // seconds
  const [toastingStatus, setToastingStatus] = useState(STATUS.TOASTING);

  const {currentCrispiness, writeCancelCharacteristic, stopCrispNotifications} =
    useContext(AppContext);

  const cancelToasting = () => {
    navigation.navigate('Selection');
    writeCancelCharacteristic();
    stopCrispNotifications({id: '3261042b-e99d-98d6-84ae-2786329fa5a6'});
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
    if (timeRemaining_sec > 0) {
      setTimeout(() => {
        setTimeRemaining(timeRemaining_sec - 1);
      }, 1000);
    } else {
      setToastingStatus(STATUS.READY);
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
            {/* <Text style={{fontSize: 20, paddingVertical: 40}}>
              Current Cripiness: {currentCrispiness}
            </Text> */}
            {toastingStatus === STATUS.TOASTING ? (
              <>
                <Text style={{fontSize: 25, textAlign: 'center'}}>
                  Estimated {'\n'}Time Remaining
                </Text>
                <Text style={{fontSize: 70}}>
                  {formatTime(timeRemaining_sec)}
                </Text>
              </>
            ) : (
              <Text
                style={{
                  fontSize: 50,
                  paddingVertical: 40,
                  textAlign: 'center',
                }}>
                Toasting Complete!
              </Text>
            )}
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
                  {toastingStatus === STATUS.TOASTING ? 'Cancel' : 'Reset'}
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
