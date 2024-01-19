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

// screens
import ToastSelectionScreen from './src/screens/ToastSelectionScreen.tsx';
import TimeRemainingScreen from './src/screens/TimeRemainingScreen.tsx';

// components
import SettingsModal from './src/components/SettingsModal.tsx';

export const AppContext = createContext(null);

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

function App(): React.JSX.Element {
  const [currentCrispiness, setCurrentCrispiness] = useState(0);

  // ble
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);

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
    } //else setConnectedDevices([]);
    console.log('connected devices: ', connectedDevices); // TODO: test this, can persist over reload?
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

    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        peripherals.set(peripheral.id, peripheral);
        setDiscoveredDevices(Array.from(peripherals.values()));
      },
    );
    let disconnectListener = BleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      ({peripheral}) => {
        console.log('Disconnected from ' + peripheral);
        let peripheral_object = peripherals.get(peripheral);
        peripheral_object.connected = false;
        peripherals.set(peripheral_object.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
      },
    );
    let stopConnectListener = BleManagerEmitter.addListener(
      'BleManagerConnectPeripheral',
      peripheral => {
        console.log('BleManagerConnectPeripheral:', peripheral);
      },
    );
    let stopScanListener = BleManagerEmitter.addListener(
      'BleManagerStopScan',
      () => {
        setIsScanning(false);
        console.log('scan stopped');
        console.log('discovered devices: ', discoveredDevices);
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
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
      disconnectListener.remove();
    };
  }, []);

  const startScan = (serviceUUIDs = [], seconds: number = 5) => {
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
        setConnectedDevices(Array.from(peripherals.values()));
        setDiscoveredDevices(Array.from(peripherals.values()));
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

  // pair with device first before connecting to it ANDROID ONLY
  const connectToPeripheral = peripheral => {
    BleManager.createBond(peripheral.id)
      .then(() => {
        peripheral.connected = true;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
        setDiscoveredDevices(Array.from(peripherals.values()));
        console.log('BLE device paired successfully');
      })
      .catch(() => {
        console.log('failed to bond');
      });
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
    BleManager.startNotification(peripheral.id, serviceUUID, charUUID).then(
      () => {
        console.log('Started notifications on ' + peripheral.id);
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
    console.log('Connected Devices: ', connectedDevices);

    // TODO: format this data properly
    const data2 = stringToBytes('pray');
    // var f_arr = new Float32Array(1);
    // f_arr[0] = data[0];
    // const buffer = Buffer.from(data);
    console.log('trying to write to: ', peripheral.id, ' with: ', data2);

    BleManager.write(
      peripheral.id,
      serviceUUID,
      charUUID,
      stringToBytes('pray'),
    )
      .then(() => {
        console.log('Sent Target Crispiness: ' + bytesToString(data2));
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
  const updateCurrentCrispiness = currentCrispiness => {
    const newState = {...bleData, currentCrispiness};
    setBleData(newState);
  };
  const updateConnectedDevices = connectedDevices => {
    const newState = {...bleData, connectedDevices};
    setBleData(newState);
  };
  const updateDiscoveredDevices = discoveredDevices => {
    const newState = {...bleData, discoveredDevices};
    setBleData(newState);
  };
  const contextSetters = {
    updateCurrentCrispiness,
    updateConnectedDevices,
    updateDiscoveredDevices,
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
            discoveredDevices={discoveredDevices}
            connectedDevices={connectedDevices}
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
