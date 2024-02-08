import React, {useState, useContext} from 'react';
import {SafeAreaView, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {ToastEHeader} from '../components/Header.tsx';
import {CrispinessSelector} from '../components/CrispinessSelector.tsx';

import {styles} from '../styles/styles';

import {AppContext} from '../../App';

const ToastSelectionScreen = ({navigation}) => {
  const [toastTarget, setToastTarget] = useState(0);
  const {
    setSettingsModalVisible,
    startToasterNotifications,
    stopToasterNotifications,
    writeTargetCrispinessCharacteristic,
  } = useContext(AppContext);

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
          <ToastEHeader setSettingsModalVisible={setSettingsModalVisible} />
          <CrispinessSelector
            target={toastTarget}
            setTarget={setToastTarget}
            navigation={navigation}
            writeTargetCrispinessCharacteristic={
              writeTargetCrispinessCharacteristic
            }
            startNotifications={startToasterNotifications}
            stopNotifications={stopToasterNotifications}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

export default ToastSelectionScreen;
