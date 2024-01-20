import React, {useState, useEffect, createContext} from 'react';
import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Alert,
  Modal,
} from 'react-native';
import BleManager, {BleEventType} from 'react-native-ble-manager';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {bytesToString, stringToBytes} from 'convert-string';

import {
  TIMER_SERVICE_UUID,
  GET_TIME_CHAR_UUID,
  CRISPINESS_SERVICE_UUID,
  TARGET_CRISP_CHAR_UUID,
  CURRENT_CRISP_CHAR_UUID,
  STATE_SERVICE_UUID,
  STATE_CHAR_UUID,
  THERMOMETER_SERVICE_UUID,
  TEMP_CHAR_UUID,
  CANCEL_CHAR_UUID,
} from './src/actions/bleActions';

import {toByteArray} from './src/utils/helperFunctions';

// screens
import ToastSelectionScreen from './src/screens/ToastSelectionScreen.tsx';
import TimeRemainingScreen from './src/screens/TimeRemainingScreen.tsx';

// components
import SettingsModal from './src/components/SettingsModal.tsx';

export const AppContext = createContext(null);

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function App(): React.JSX.Element {
  // ble
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);

  const handleGetConnectedDevices = () => {
    if (Platform.OS === 'android') {
      BleManager.getBondedPeripherals([]).then(results => {
        for (let i = 0; i < results.length; i++) {
          let peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setConnectedDevices(Array.from(peripherals.values()));
        }
      });
    } else setConnectedDevices([]);
  };

  useEffect(() => {
    if (Platform.OS === 'android') {
      BleManager.enableBluetooth().then(() => {
        console.log('Bluetooth is turned on!');
      });
    }

    BleManager.checkState().then(state =>
      console.log(`current BLE state = '${state}'.`),
    );
    BleManager.start({showAlert: true})
      .then(() => {
        console.log('BleManager initialized');
        handleGetConnectedDevices();
      })
      .catch(error => console.log('BleManager failed to init', error));

    let discoverBleListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        peripherals.set(peripheral.id, peripheral);
        console.log('Discovered', peripheral.id);
        setDiscoveredDevices(Array.from(peripherals.values()));
      },
    );
    let disconnectBleListener = BleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      ({peripheral}) => {
        console.log('Disconnected from ' + peripheral);
        let peripheral_object = peripherals.get(peripheral);
        peripheral_object.connected = false;
        peripherals.set(peripheral_object.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
      },
    );
    let connectBleListener = BleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      peripheral => {
        console.log('BleManagerConnectPeripheral:', peripheral);
      },
    );
    let stopBleScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('discovered peripherals: ', peripherals);
        console.log('scan stopped');
      },
    );

    if (Platform.OS === 'android' && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then(result => {
        if (result) {
          console.log('Permission is OK');
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then(result => {
            if (result) {
              console.log('User accepted');
            } else {
              console.log('User refused');
            }
          });
        }
      });
    }
    return () => {
      console.log("App's cleanup function called.");
      discoverBleListener.remove();
      connectBleListener.remove();
      stopBleScanListener.remove();
      disconnectBleListener.remove();
    };
  }, []);

  const startScan = (serviceUUIDs = [], seconds: number = 3) => {
    if (!isScanning) {
      BleManager.scan(serviceUUIDs.toString(), seconds, true)
        .then(() => {
          console.log('Scanning...', serviceUUIDs.toString());
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const connectToDevice = peripheral => {
    console.log('peripheral found: ', peripheral);
    BleManager.connect(peripheral.id)
      .then(() => {
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        console.log(
          'connected peripherals: ',
          Array.from(peripherals.values()),
        );
        setConnectedDevices(Array.from(peripherals.values()));
        // setDiscoveredDevices(Array.from(peripherals.values()));
        console.log(
          'Connected to ' + peripheral.name + '. Now getting services',
        );
        getServices(peripheral);
      })
      .catch(error => {
        console.log('Connection error', error);
      });
  };

  const getServices = (peripheral, serviceUUID = null) => {
    BleManager.retrieveServices(peripheral.id)
      .then(peripheralInfo => {
        console.log('Peripheral info:', peripheralInfo);
        peripheral.info = peripheralInfo;
        peripherals.set(peripheral.id, peripheral);
      })
      .catch(error => console.log('error retrieving services', error));
  };

  // disconnect from device
  const disconnectFromPeripheral = peripheral => {
    BleManager.disconnect(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
        // setDiscoveredDevices(Array.from(peripherals.values()));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        console.log('fail to disconnect');
      });
  };

  const startCrispNotifications = (
    peripheral,
    serviceUUID = CRISPINESS_SERVICE_UUID,
    charUUID = CURRENT_CRISP_CHAR_UUID,
  ) => {
    BleManager.startNotification(peripheral.id, serviceUUID, charUUID)
      .then(() => {
        console.log('Started notifications on ' + peripheral.id);
        // readCharacteristic(peripheral);
        // readCurrentCrispinessCharacteristic(peripheral);
        BleManagerEmitter.addListener(
          BleEventType.BleManagerDidUpdateValueForCharacteristic,
          ({value, peripheral, characteristic, service}) => {
            const data = bytesToString(value);
            console.log(
              `Received ${data} for characteristic ${characteristic}`,
            );
            setCurrentCrispiness(data);

            // TODO: get state notifications here too!
            // on sate = toasting,
          },
        );
      })
      .catch(error => {
        console.log('Notification error', error);
      });
  };

  const stopCrispNotifications = (
    peripheral,
    serviceUUID = CRISPINESS_SERVICE_UUID,
    charUUID = CURRENT_CRISP_CHAR_UUID,
  ) => {
    BleManager.stopNotification(peripheral.id, serviceUUID, charUUID).then(
      () => {
        console.log('Stopped notifications on ' + peripheral.id);
      },
    );
  };

  // ble commands
  const readCharacteristic = (
    peripheral,
    serviceUUID = THERMOMETER_SERVICE_UUID,
    charUUID = TEMP_CHAR_UUID,
  ) => {
    BleManager.read(peripheral.id, serviceUUID, charUUID)
      .then(readData => {
        console.log('value: ' + bytesToString(readData));
        // const buffer = Buffer.from(readData);
        // const sensorData = buffer.readUInt8(1);
        // console.log('Read: ' + sensorData);
      })
      .catch(error => {
        console.log('Read error', error);
      });
  };

  const readCurrentCrispinessCharacteristic = (
    peripheral,
    serviceUUID = CRISPINESS_SERVICE_UUID,
    charUUID = CURRENT_CRISP_CHAR_UUID,
  ) => {
    BleManager.read(peripheral.id, serviceUUID, charUUID)
      .then(readData => {
        console.log('current Crispiness: ' + bytesToString(readData));
      })
      .catch(error => {
        console.log('Read error', error);
      });
  };

  const writeTargetCrispinessCharacteristic = (
    peripheral, // Temp
    data: number[],
    serviceUUID: String = CRISPINESS_SERVICE_UUID,
    charUUID: String = TARGET_CRISP_CHAR_UUID,
  ) => {
    console.log(
      'trying to write to: ',
      peripheral.id,
      ' with: ',
      data,
      ' as:  ',
      toByteArray(data),
    );

    BleManager.write(peripheral.id, serviceUUID, charUUID, toByteArray(data))
      .then(() => {
        console.log('Sent Target Crispiness');
      })
      .catch(error => {
        console.log('Write error', error);
      });
  };

  const writeCancelCharacteristic = (
    peripheral = {id: '3261042b-e99d-98d6-84ae-2786329fa5a6'}, // Temp
    data = 'cancel',
    serviceUUID: String = TIMER_SERVICE_UUID,
    charUUID: String = CANCEL_CHAR_UUID,
  ) => {
    BleManager.write(
      peripheral.id,
      serviceUUID,
      charUUID,
      stringToBytes('cancel'),
    )
      .then(() => {
        console.log('Sent Stop Command');
      })
      .catch(error => {
        console.log('Write error', error);
      });
  };

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  // Ble Context
  const appContexInitialState = {
    currentCrispiness: 0,
    connectedDevices: [],
    discoveredDevices: [],
  };
  const [bleData, setBleData] = useState(appContexInitialState);
  const setCurrentCrispiness = currentCrispiness => {
    const newState = {...bleData, currentCrispiness};
    setBleData(newState);
  };
  const setConnectedDevices = connectedDevices => {
    console.log('set connected devices', connectedDevices);
    const newState = {...bleData, connectedDevices};
    setBleData(newState);
  };
  const setDiscoveredDevices = discoveredDevices => {
    console.log('set discovered devices', discoveredDevices);
    const newState = {...bleData, discoveredDevices};
    setBleData(newState);
  };
  const contextSetters = {
    setCurrentCrispiness,
    setConnectedDevices,
    setDiscoveredDevices,
  };

  const bleFunctions = {
    writeTargetCrispinessCharacteristic,
    startCrispNotifications,
    stopCrispNotifications,
    writeCancelCharacteristic,
    startScan,
    connectToDevice,
    disconnectFromPeripheral,
  };

  // Temp
  useEffect(() => {
    console.log('discoveredDevices (useEffect): ', bleData.discoveredDevices);
    console.log('connected Devices (useEffect): ', bleData.connectedDevices);
  }, [bleData.connectedDevices, bleData.discoveredDevices]);

  return (
    <>
      <AppContext.Provider
        value={{
          ...bleData,
          ...contextSetters,
          ...bleFunctions,
          setSettingsModalVisible,
        }}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Selection"
            screenOptions={{
              headerShown: false,
            }}>
            <Stack.Group>
              <Stack.Screen name="Selection" component={ToastSelectionScreen} />
              <Stack.Screen name="Toasting" component={TimeRemainingScreen} />
            </Stack.Group>
          </Stack.Navigator>
        </NavigationContainer>
        <Modal
          visible={settingsModalVisible}
          presentationStyle="pageSheet"
          animationType="slide">
          <SettingsModal
            setSettingsModalVisible={setSettingsModalVisible}
            startScan={startScan}
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
