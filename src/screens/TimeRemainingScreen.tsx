import React, {useContext, useEffect, useState} from 'react';
import {
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
} from 'react-native';
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
  const [percentageRemaining, setPercentageRemaining] = useState(90); // seconds

  const {toasterState, writeCancelCharacteristic, stopToasterNotifications} =
    useContext(AppContext);

  const cancelResetBtnFunc = () => {
    navigation.navigate('Selection');
    stopToasterNotifications();
    // if (toasterState.controller_state === STATUS.TOASTING) TODO: remove this temp
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
    setPercentageRemaining(
      Math.round(
        Math.abs(
          100 -
            (toasterState.current_crispiness / toasterState.target_crispiness) *
              100,
        ),
      ),
    );
  }, [toasterState.current_crispiness]);

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
              Time remaining estimate: {toasterState.time_remaining_estimate}{' '}
              {'\n'}
              Percentage remaining: {percentageRemaining}%
            </Text>
          </View>
          <View style={{alignItems: 'center'}}>
            <TouchableOpacity onPress={cancelResetBtnFunc}>
              <View style={{alignItems: 'center', justifyContent: 'center'}}>
                <PercentageCircle percentage={percentageRemaining} />
                <View
                  style={{
                    borderRadius: 65,
                    width: 130,
                    height: 130,
                    backgroundColor: 'brown',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <Text
                    style={{
                      color: '#F3F3F3',
                      fontSize: 35,
                      textAlign: 'center',
                    }}>
                    {toasterState.controller_state === STATUS.TOASTING
                      ? 'Cancel'
                      : 'Reset'}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default TimeRemainingScreen;

const PercentageCircle = ({percentage}) => {
  const percent1 = 50;
  const percent2 = percentage > 50 ? percentage : 50 - percentage;

  function percentToDegrees(percent) {
    console.log('percent', percent * 3.6);
    return percent * 3.6;
  }

  const HalfCircle = ({rotation, mask = false}) => {
    const rotate = `${rotation}deg`;
    console.log('rotate', rotate, mask);
    return (
      <View
        style={[
          styles2.outerCircle,
          {
            borderRadius: 75,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            width: 75,
            height: 150,
            backgroundColor: mask ? Colors.lighter : 'orange',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: -10,
            transform: [
              {translateX: 75 / 2},
              {rotate: rotate},
              {translateX: -75 / 2},
            ],
          },
        ]}
      />
    );
  };

  return (
    <>
      <HalfCircle rotation={percentToDegrees(percent1)} />
      <HalfCircle rotation={percentToDegrees(percent2)} mask={percent2 < 50} />
    </>
  );
};

const styles2 = StyleSheet.create({
  outerCircle: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerCircle: {
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  leftWrap: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
  halfCircle: {
    position: 'absolute',
    top: 0,
    left: 0,
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
    backgroundColor: '#f00',
  },
});