import React, {useState, useEffect, createContext} from 'react';
import {Modal, Dimensions} from 'react-native';

import useBLE from './src/hooks/useBLE.tsx';

import AsyncStorage from '@react-native-async-storage/async-storage';
import DeviceInfo from 'react-native-device-info';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

// screens
import ToastSelectionScreen from './src/screens/ToastSelectionScreen.tsx';
import TimeRemainingScreen from './src/screens/TimeRemainingScreen.tsx';
import WelcomeScreen from './src/screens/WelcomeScreen.tsx';

// components
import SettingsModal from './src/components/SettingsModal.tsx';

export const AppContext = createContext(null);

function App(): React.JSX.Element {
  const [previousDeviceId, setPreviousDeviceId] = useState(null);

  const getOrientation = () => {
    console.log('checking orientation');
    if (Dimensions.get('window').width <= Dimensions.get('window').height) {
      setOrientationPortrait(true);
    } else {
      setOrientationPortrait(false);
    }
  };

  useEffect(() => {
    // app startup
    AsyncStorage.getItem('deviceId').then(deviceId => {
      console.log('Storage: ', deviceId);
      setPreviousDeviceId(deviceId);
    });

    getOrientation(); // TODO: REMOVE THIS?

    DeviceInfo.isEmulator().then(isEmulator => {
      setIsSimulator(isEmulator);
    });

    return () => {
      console.log("App's cleanup function called.");
    };
  }, []);

  useEffect(() => {
    const orientationListener = Dimensions.addEventListener(
      'change',
      getOrientation,
    );
    return () => {
      orientationListener.remove();
    };
  });

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [isSimulator, setIsSimulator] = useState(false); // Simulator or real device
  const [orientationIsPortrait, setOrientationPortrait] = useState(true);

  const [
    bleData,
    toasterState,
    isScanning,
    writeTargetCrispinessCharacteristic,
    startToasterNotifications,
    stopToasterNotifications,
    writeCancelCharacteristic,
    writeCrispReset,
    startScan,
    stopScan,
    connectToDevice,
    reconnectToPreviousDevice,
    disconnectFromPeripheral,
  ] = useBLE(previousDeviceId, isSimulator);

  const bleFunctions = {
    writeTargetCrispinessCharacteristic,
    startToasterNotifications,
    stopToasterNotifications,
    writeCancelCharacteristic,
    writeCrispReset,
    startScan,
    stopScan,
    connectToDevice,
    disconnectFromPeripheral,
  };

  return (
    <>
      <AppContext.Provider
        value={{
          ...bleData,
          ...bleFunctions,
          setSettingsModalVisible,
          isSimulator,
          orientationIsPortrait,
          toasterState,
        }}>
        {(toasterState.controller_state === 'IDLE' ||
          Object.keys(toasterState).length === 0) &&
        !isSimulator ? (
          <WelcomeScreen
            reconnectToPreviousDevice={reconnectToPreviousDevice}
            devices={bleData.connectedDevices}
            previousDeviceId={previousDeviceId}
          />
        ) : (
          <NavigationContainer>
            <Stack.Navigator
              initialRouteName="Selection"
              screenOptions={{
                headerShown: false,
              }}>
              <Stack.Group>
                <Stack.Screen
                  name="Selection"
                  component={ToastSelectionScreen}
                />
                <Stack.Screen name="Toasting" component={TimeRemainingScreen} />
              </Stack.Group>
            </Stack.Navigator>
          </NavigationContainer>
        )}
        <Modal
          visible={settingsModalVisible}
          presentationStyle="pageSheet"
          animationType="slide">
          <SettingsModal
            setSettingsModalVisible={setSettingsModalVisible}
            startScan={startScan}
            stopScan={stopScan}
            isScanning={isScanning}
            discoveredDevices={bleData.discoveredDevices}
            connectedDevices={bleData.connectedDevices}
            connectToPeripheral={connectToDevice}
            disconnectFromPeripheral={disconnectFromPeripheral}
          />
        </Modal>
      </AppContext.Provider>
    </>
  );
}

const Stack = createNativeStackNavigator();

export default App;
