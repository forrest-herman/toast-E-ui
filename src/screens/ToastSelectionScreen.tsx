import React, {useState, useContext} from 'react';
import {SafeAreaView, View} from 'react-native';

import {ToastEHeader} from '../components/Header.tsx';
import {CrispinessSelector} from '../components/CrispinessSelector.tsx';

import {styles} from '../styles/styles';

import {AppContext} from '../../App';

const ToastSelectionScreen = ({navigation}) => {
  const [toastTarget, setToastTarget] = useState(0);
  const {
    toasterState,
    startToasterNotifications,
    stopToasterNotifications,
    writeTargetCrispinessCharacteristic,
    orientationIsPortrait,
    isSimulator,
  } = useContext(AppContext);

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={{flex: 0, backgroundColor: styles.header.backgroundColor}}
      />
      <SafeAreaView
        style={{
          backgroundColor: '#e8e7e6',
          flex: 1,
        }}>
        <View style={{flex: 1}}>
          {orientationIsPortrait ? (
            <ToastEHeader />
          ) : (
            <ToastEHeader title="Select your preference" fontSize={30} />
          )}
          <CrispinessSelector
            target={toastTarget}
            setTarget={setToastTarget}
            navigation={navigation}
            toasterState={toasterState}
            writeTargetCrispinessCharacteristic={
              writeTargetCrispinessCharacteristic
            }
            orientationIsPortrait={orientationIsPortrait}
            startNotifications={startToasterNotifications}
            stopNotifications={stopToasterNotifications}
            isSimulator={isSimulator}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default ToastSelectionScreen;
