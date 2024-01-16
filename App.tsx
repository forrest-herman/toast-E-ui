/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useState, useEffect} from 'react';
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
} from 'react-native';
import BleManager from 'react-native-ble-manager';

import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';

import {
  Colors,
  DebugInstructions,
  Header,
  LearnMoreLinks,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

import {CrispinessSelector} from './src/pages/crispinessSelector.tsx';
import {ToastEHeader} from './src/components/Header.tsx';

type SectionProps = PropsWithChildren<{
  title: string;
}>;

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
  // ble
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [connectedDevices, setConnectedDevices] = useState([]);
  const [discoveredDevices, setDiscoveredDevices] = useState([]);
  const handleGetConnectedDevices = () => {
    BleManager.getBondedPeripherals([])
      .then(results => {
        for (let i = 0; i < results.length; i++) {
          let peripheral = results[i];
          peripheral.connected = true;
          peripherals.set(peripheral.id, peripheral);
          setConnectedDevices(Array.from(peripherals.values()));
        }
      })
      .catch();
  };
  useEffect(() => {
    BleManager.enableBluetooth()
      .then(() => {
        console.log('Bluetooth is turned on!');
      })
      .catch(() => {
        // Alert.alert(
        //   'Bluetooth must be enabled for this App to work',
        //   'Enable BLE',
        //   [
        //     {
        //       text: 'Retry',
        //       onPress: () => console.log('this retry'),
        //       isPreferred: true,
        //     },
        //     {text: 'Cancel'},
        //   ],
        // );
        console.log('No BLE');
      });

    BleManager.checkState().then(state =>
      console.log(`current BLE state = '${state}'.`),
    );
    // TODO: why this promise is failing?
    BleManager.start({showAlert: false})
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
    };
  }, []);
  const startScan = () => {
    if (!isScanning) {
      BleManager.scan([], 5, true)
        .then(() => {
          console.log('Scanning...');
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };
  // pair with device first before connecting to it
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
    BleManager.removeBond(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        setConnectedDevices(Array.from(peripherals.values()));
        setDiscoveredDevices(Array.from(peripherals.values()));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        console.log('fail to remove the bond');
      });
  };

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Selection"
        screenOptions={{
          headerShown: false,
        }}>
        <Stack.Screen name="Selection" component={ToastSelectionScreen} />
        <Stack.Screen name="Toasting" component={TimeRemainingScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const Stack = createNativeStackNavigator();

const TimeRemainingScreen = ({navigation}) => {
  const [timeRemaining_sec, setTimeRemaining] = useState(134); // seconds

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

const ToastSelectionScreen = ({navigation}) => {
  const [toastTarget, setToastTarget] = useState(0);
  const isDarkMode = useColorScheme() === 'dark';

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
          <ToastEHeader />
          <CrispinessSelector
            target={toastTarget}
            setTarget={setToastTarget}
            navigation={navigation}
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


const styles = StyleSheet.create({
  header: {
    backgroundColor: 'brown',
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
});

export default App;
