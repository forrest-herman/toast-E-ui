import React, {useContext, useEffect, useRef, useState} from 'react';
import {
  Animated,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
  Alert,
  StyleSheet,
  Dimensions,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import AwesomeIcon from 'react-native-vector-icons/FontAwesome6';

import {AppContext} from '../../App';
import {ToastEHeader} from '../components/Header.tsx';
import {formatTime} from '../utils/helperFunctions';
import {styles} from '../styles/styles';
import GradientSlider from '../components/GradientSlider.tsx';

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
  const [timeRemaining_sec, setTimeRemaining] = useState(75); // seconds
  const [toastingStatus, setToastingStatus] = useState(STATUS.IDLE); // TODO: replace with toasterState
  const [percentageRemaining, setPercentageRemaining] = useState(99);

  const {
    toasterState2,
    writeCancelCharacteristic,
    writeCrispReset,
    stopToasterNotifications,
    setSettingsModalVisible,
    developerMode,
    isSimulator,
    orientationIsPortrait,
  } = useContext(AppContext);

  const cancelResetBtnFunc = () => {
    // navigation.navigate('Selection');
    // if (toasterState2.controller_state === STATUS.TOASTING) TODO: remove this temp
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
      console.log('Loaded sound with duration: ' + whoosh.getDuration() + 's');
    });

    return () => {
      whoosh.release(); // Release the audio player resource
    };
  }, []);

  // useEffect(() => {
  //   if (!isSimulator && false) {
  //     setPercentageRemaining(
  //       Math.round(
  //         Math.abs(
  //           100 -
  //             (toasterState2.current_crispiness /
  //               toasterState2.target_crispiness) *
  //               100,
  //         ),
  //       ),
  //     );
  //   }
  // }, [toasterState2.current_crispiness]);

  useEffect(() => {
    if (
      Math.abs(toasterState2?.time_remaining_estimate - timeRemaining_sec) > 3
    ) {
      setTimeRemaining(toasterState2.time_remaining_estimate);
    } else if (
      timeRemaining_sec > 0 &&
      toasterState2.controller_state === STATUS.TOASTING
    ) {
      setTimeout(() => {
        setTimeRemaining(timeRemaining_sec - 1);
      }, 1000);
    }
  }, [timeRemaining_sec]);

  useEffect(() => {
    if (toasterState2.controller_state === STATUS.DONE) {
      setToastingStatus(STATUS.DONE); // TODO: redundant
      // Play the sound with an onEnd callback
      whoosh.play(success => {
        if (success) {
          console.log('successfully finished playing');
        } else {
          console.log('playback failed due to audio decoding errors');
        }
      });

      setTimeout(() => {
        writeCrispReset();
      }, 5000);
    }
  }, [toasterState2.controller_state]);

  // TODO: move this elsewhere
  const circleButtonRadius = 65;
  const height = Dimensions.get('window').height;
  const diameter = Math.min(height / 4, 100);

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
            style={{
              flex: 1,
              flexDirection: orientationIsPortrait ? 'column' : 'row',
              justifyContent: 'space-between',
              marginVertical: orientationIsPortrait ? 30 : 0,
            }}>
            <View
              style={{
                flex: 0.2,
                justifyContent: 'center',
                alignItems: 'center',
                marginHorizontal: 20,
              }}>
              {/* <GradientSlider
                // inputValue={toasterState2.current_crispiness}
                inputValue={10}
                showIcons={false}
                showLabel={false}
                width={orientationIsPortrait ? 300 : 60}
                horizontal={orientationIsPortrait}
                readOnly={true}
              /> */}
            </View>
            <View
              style={{
                flex: 0.6,
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
              }}>
              {toastingStatus === STATUS.DONE ? (
                <Text
                  style={{
                    fontSize: 50,
                    paddingVertical: 40,
                    textAlign: 'center',
                  }}>
                  Toasting {'\n'} Complete!
                </Text>
              ) : (
                <>
                  <Text style={{fontSize: 25, textAlign: 'center'}}>
                    Estimated {'\n'}Time Remaining
                  </Text>
                  <Text style={{fontSize: 75}}>
                    {formatTime(timeRemaining_sec)}
                  </Text>
                </>
              )}
            </View>

            <View
              style={{
                flex: 0.2,
                alignItems: 'center',
                justifyContent: 'center',
                marginHorizontal: 20,
              }}>
              <TouchableOpacity onPress={cancelResetBtnFunc}>
                <View
                  style={{
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: 10,
                    paddingTop: 10,
                  }}>
                  {/* <PercentageCircle
                    percentage={percentageRemaining}
                    _radius={diameter / 2}
                    width={4}
                  /> */}
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
                    <AwesomeIcon
                      name={
                        toasterState2.controller_state === STATUS.TOASTING ||
                        toastingStatus === STATUS.IDLE
                          ? 'xmark'
                          : 'arrow-rotate-left'
                      }
                      size={50}
                      color={'white'}
                    />
                  </View>
                </View>
              </TouchableOpacity>
              <Text
                style={{
                  color: '#5e2d16',
                  fontSize: 15,
                  textAlign: 'center',
                  paddingBottom: 20,
                }}>
                {toasterState2.controller_state === STATUS.TOASTING ||
                toastingStatus === STATUS.IDLE
                  ? 'Cancel'
                  : 'Reset'}
              </Text>
              {/* <TouchableOpacity onPress={cancelResetBtnFunc}>
                <View style={{alignItems: 'center', justifyContent: 'center'}}>
                  <PercentageCircle
                    percentage={percentageRemaining}
                    radius={circleButtonRadius + 6}
                  />
                  <View
                    style={{
                      borderRadius: circleButtonRadius,
                      width: circleButtonRadius * 2,
                      height: circleButtonRadius * 2,
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
                      {toasterState2.controller_state === STATUS.TOASTING
                        ? 'Cancel'
                        : 'Reset'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity> */}
            </View>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default TimeRemainingScreen;

const PercentageCircle = ({percentage, _radius = 75, width = 6}) => {
  const progressAnim = useRef(new Animated.Value(percentage)).current;
  const radius = _radius + width;

  const moveProgress = value => {
    console.log('progressAnim: ', progressAnim, ' -> ', value);
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(progressAnim, {
      toValue: value,
      duration: 300, // TODO: this needs to be variable as well
      useNativeDriver: true,
    }).start();
  };

  const fixedRotation = percentToDegrees(50);
  const movingRotation = percentToDegrees(
    percentage >= 50 ? percentage : percentage + 50,
  );

  useEffect(() => {
    moveProgress(percentage >= 50 ? percentage : percentage + 50);
  }, [percentage]);

  function percentToDegrees(percent) {
    return percent * 3.6;
  }

  const HalfCircle = ({rotation, mask = false, animated = true}) => {
    // moveProgress(rotation);
    let rotate;
    if (false && animated) {
      rotate = progressAnim.interpolate({
        inputRange: [0, 100],
        // inputRange: [0, 50, 50, 100],
        // outputRange: ['0deg', '0deg', '180deg', '360deg'],
        outputRange: ['0deg', '360deg'],
      });
      // console.log('rotate: ', progressAnim);
    } else {
      rotate = `${rotation}deg`;
    }

    return (
      <View
        style={[
          styles2.outerCircle,
          {
            borderRadius: radius,
            borderTopRightRadius: 0,
            borderBottomRightRadius: 0,
            width: radius,
            height: radius * 2,
            backgroundColor: mask ? Colors.lighter : 'brown',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'absolute',
            left: -width,
            transform: [
              {translateX: radius / 2},
              {rotate: rotate},
              {translateX: -radius / 2},
            ],
          },
        ]}
      />
    );
  };

  return (
    <>
      <HalfCircle rotation={fixedRotation} animated={false} />
      <HalfCircle rotation={movingRotation} mask={percentage < 50} />
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
