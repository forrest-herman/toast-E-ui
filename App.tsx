/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {
  useState,
  useEffect,
  useContext,
  createContext,
  useCallback,
} from 'react';
import type {PropsWithChildren} from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  useColorScheme,
  View,
  Button,
  Dimensions,
  Platform,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Alert,
  TouchableOpacity,
  FlatList,
  Modal,
} from 'react-native';
import BleManager, {BleEventType} from 'react-native-ble-manager';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {bytesToString, stringToBytes} from 'convert-string';
import {Buffer} from 'buffer';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {
  TIMER_SERVICE_UUID,
  GET_TIME_CHAR_UUID,
  CRISPINESS_SERVICE_UUID,
  TARGET_CRISP_CHAR_UUID,
  CURRENT_CRISP_CHAR_UUID,
  THERMOMETER_SERVICE_UUID,
  TEMP_CHAR_UUID,
} from './src/actions/bleActions';

import {CrispinessSelector} from './src/pages/crispinessSelector.tsx';
import {ToastEHeader} from './src/components/Header.tsx';
import {DeviceList} from './src/components/DeviceList';
import {styles} from './src/styles/styles';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

const AppContext = createContext(null);

function Section({children, title}: SectionProps): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';
  return (
    <View style={styles.sectionContainer}>
      <Text
        style={[
          styles.sectionTitle,
          {
            color: isDarkMode ? Colors.white : Colors.black,
          },
        ]}>
        {title}
      </Text>
      <Text
        style={[
          styles.sectionDescription,
          {
            color: isDarkMode ? Colors.light : Colors.dark,
          },
        ]}>
        {children}
      </Text>
    </View>
  );
}

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
    let stopDiscoverListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        console.log('Discovered', peripheral.name);
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
      stopDiscoverListener.remove();
      stopConnectListener.remove();
      stopScanListener.remove();
      disconnectListener.remove();
    };
  }, []);

  // useEffect(() => {
  //   console.log('connected devices: ', connectedDevices);
  //   console.log('peripherals: ', peripherals.toString());
  // });

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
        console.log('Connected to ' + peripheral.name);
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

  const startTempNotifications = (
    peripheral,
    serviceUUID = CRISPINESS_SERVICE_UUID, // THERMOMETER_SERVICE_UUID,
    charUUID = CURRENT_CRISP_CHAR_UUID, //  TEMP_CHAR_UUID,
  ) => {
    console.log(
      'start temp notifications: ',
      peripheral.id,
      serviceUUID,
      charUUID,
    );
    writeTargetCrispinessCharacteristic(
      peripheral,
      Buffer.from('testing here please').toJSON().data,
    );
    // BleManager.startNotification(peripheral.id, serviceUUID, charUUID)
    //   .then(() => {
    //     console.log('Started notifications on ' + peripheral.id);
    //     readCharacteristic(peripheral);
    //     readCurrentCrispinessCharacteristic(peripheral);
    //     BleManagerEmitter.addListener(
    //       BleEventType.BleManagerDidUpdateValueForCharacteristic,
    //       ({value, peripheral, characteristic, service}) => {
    //         const data = bytesToString(value);
    //         console.log(
    //           `Received ${data} for characteristic ${characteristic}`,
    //         );
    //         setCurrentCrispiness(data);
    //       },
    //     );
    //   })
    //   .catch(error => {
    //     console.log('Notification error', error);
    //   });
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
        console.log('current Crispiness: ' + bytesToString(data));
      })
      .catch(error => {
        console.log('Write error', error);
      });
  };

  // without response
  const writeTargetCrispinessCharacteristic_test = (
    peripheral, // Temp
    data,
    serviceUUID: string = CRISPINESS_SERVICE_UUID,
    charUUID: string = TARGET_CRISP_CHAR_UUID,
  ) => {
    // var f_arr = new Float32Array(1);
    // f_arr[0] = data[0];
    // const buffer = Buffer.from(data);
    console.log(
      'trying to write to: ',
      peripheral.id,
      ' with: ',
      Buffer.from('please').toJSON().data,
    );
    BleManager.writeWithoutResponse(
      peripheral.id,
      serviceUUID,
      charUUID,
      stringToBytes('pray'),
    )
      .then(() => {
        console.log(
          'write success',
          // 'current Crispiness: ' +
          //   bytesToString(Buffer.from('testing here please').toJSON().data),
        );
      })
      .catch(error => {
        console.log('Write error', error);
      });
  };

  const [settingsModalVisible, setSettingsModalVisible] = useState(false);

  return (
    <>
      <AppContext.Provider value={currentCrispiness}>
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
                initialParams={{
                  setSettingsModalVisible: setSettingsModalVisible,
                  writeTargetCrispinessCharacteristic:
                    writeTargetCrispinessCharacteristic,
                }}
              />
              <Stack.Screen name="Toasting" component={TimeRemainingScreen} />
            </Stack.Group>
            {/* <Stack.Group screenOptions={{presentation: 'modal'}}>
            <Stack.Screen name="SettingsModal" component={SettingsModal} />
          </Stack.Group> */}
          </Stack.Navigator>
        </NavigationContainer>
        <Modal visible={settingsModalVisible} presentationStyle="pageSheet">
          <SettingsModal
            setSettingsModalVisible={setSettingsModalVisible}
            startScan={startScan}
            isScanning={isScanning}
            discoveredDevices={discoveredDevices}
            connectedDevices={connectedDevices}
            connectToPeripheral={connectToDevice}
            getServices={getServices}
            disconnectFromPeripheral={disconnectFromPeripheral}
            startNotification={startTempNotifications}
          />
        </Modal>
      </AppContext.Provider>
    </>
  );
}

const Stack = createNativeStackNavigator();

const TimeRemainingScreen = ({navigation}) => {
  const [timeRemaining_sec, setTimeRemaining] = useState(134); // seconds
  const currentCrispiness = useContext(AppContext);

  function formatTime(duration_sec: Number) {
    // Hours, minutes and seconds
    const hrs = Math.floor(duration_sec / 3600);
    const mins = Math.floor((duration_sec % 3600) / 60);
    const secs = Math.floor(duration_sec % 60);

    // Output like "1:01" or "4:03:59" or "123:03:59"
    let ret = '';

    if (hrs > 0) {
      ret += '' + hrs + ':' + (mins < 10 ? '0' : '');
    }
    ret += '' + mins + ':' + (secs < 10 ? '0' : '');
    ret += '' + secs;
    return ret;
  }

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
          backgroundColor: false ? Colors.darker : Colors.lighter,
          flex: 1,
        }}>
        <View style={{flex: 1}}>
          <ToastEHeader />
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 20}}>
              Current Cripiness: {currentCrispiness}
            </Text>
            <Text style={{fontSize: 20}}>Time Remaining</Text>
            <Text style={{fontSize: 60}}>{formatTime(timeRemaining_sec)}</Text>
          </View>
          <Button
            title="Selection"
            onPress={() => navigation.navigate('Selection')}
          />
        </View>
      </SafeAreaView>
    </>
  );
};

const ToastSelectionScreen = ({route, navigation}) => {
  const [toastTarget, setToastTarget] = useState(0);
  const isDarkMode = useColorScheme() === 'dark';

  const {setSettingsModalVisible, writeTargetCrispinessCharacteristic} =
    route.params;

  // useEffect(() => {
  //   console.log('toastTarget: ', toastTarget);
  //   writeTargetCrispinessCharacteristic([toastTarget]);
  // }, [toastTarget]);

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={{flex: 0, backgroundColor: styles.header.backgroundColor}}
      />
      <SafeAreaView
        style={{
          backgroundColor: false ? Colors.darker : Colors.lighter,
          flex: 1,
        }}>
        {/* <StatusBar
          barStyle={true ? 'light-content' : 'dark-content'}
          backgroundColor={styles.header.backgroundColor}
        /> */}
        <View style={{flex: 1}}>
          <ToastEHeader
            navigation={navigation}
            setSettingsModalVisible={setSettingsModalVisible}
          />
          <CrispinessSelector
            target={toastTarget}
            setTarget={setToastTarget}
            navigation={navigation}
            writeTargetCrispinessCharacteristic={
              writeTargetCrispinessCharacteristic
            }
          />
          {/* <Button
            title="Confirm"
            onPress={() => navigation.navigate('Toasting')}
          /> */}
        </View>
      </SafeAreaView>
    </>
  );
};

const SettingsModal = ({
  setSettingsModalVisible,
  startScan,
  isScanning,
  discoveredDevices,
  connectedDevices,
  connectToPeripheral,
  getServices,
  disconnectFromPeripheral,
  startNotification,
}) => {
  const isDarkMode = useColorScheme() === 'dark';
  // const {
  //   startScan,
  //   isScanning,
  //   discoveredDevices,
  //   connectedDevices,
  //   connectToPeripheral,
  //   disconnectFromPeripheral,
  // } = route.params;

  return (
    <View style={{paddingHorizontal: 20}}>
      <Button title="X" onPress={() => setSettingsModalVisible(false)} />
      <Text style={[styles.title, {color: Colors.black}]}>
        React Native BLE
      </Text>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.scanButton}
        onPress={startScan}>
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : 'Scan Bluetooth Devices'}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity
        activeOpacity={0.5}
        style={styles.scanButton}
        onPress={() =>
          startScan(['00000001-710e-4a5b-8d75-3e5b444bc3cf', '180a'], 4)
        }>
        <Text style={styles.scanButtonText}>
          {isScanning ? 'Scanning...' : 'Scan Raspberry Pi Only'}
        </Text>
      </TouchableOpacity>
      <Text style={[styles.subtitle, {color: Colors.black}]}>
        Discovered Devices ({discoveredDevices.length}):
      </Text>
      {discoveredDevices.length > 0 ? (
        <FlatList
          data={discoveredDevices}
          renderItem={({item}) => (
            <DeviceList
              peripheral={item}
              connect={connectToPeripheral}
              disconnect={disconnectFromPeripheral}
            />
          )}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noDevicesText}>No Bluetooth devices found</Text>
      )}
      <Text
        style={[
          styles.subtitle,
          {color: isDarkMode ? Colors.white : Colors.black},
        ]}>
        Connected Devices:
      </Text>
      {connectedDevices.length > 0 ? (
        <FlatList
          data={connectedDevices}
          renderItem={({item}) => (
            <DeviceList
              peripheral={item}
              connect={connectToPeripheral}
              disconnect={disconnectFromPeripheral}
              getServices={getServices}
              startNotification={startNotification}
            />
          )}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noDevicesText}>No connected devices</Text>
      )}
    </View>
  );
};

export default App;
