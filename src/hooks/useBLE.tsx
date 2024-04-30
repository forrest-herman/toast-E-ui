import {useState, useEffect, useCallback} from 'react';
import {
  Platform,
  NativeModules,
  NativeEventEmitter,
  PermissionsAndroid,
  Alert,
} from 'react-native';

import BleManager, {BleEventType} from 'react-native-ble-manager';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {bytesToString} from 'convert-string';

import {toByteArray} from '../utils/helperFunctions';
import {
  MessageTypes,
  sendCancel,
  generateBleMessage,
} from '../utils/bleFunctions';

const TOAST_E_SERVICE_UUID = '00000023-710e-4a5b-8d75-3e5b444bc3cf';
const TOAST_E_CHAR_UUID = '00000021-710e-4a5b-8d75-3e5b444bc3cf';

const BleManagerModule = NativeModules.BleManager;
const BleManagerEmitter = new NativeEventEmitter(BleManagerModule);

const useBLE = (previousDeviceId, isSimulator) => {
  const peripherals = new Map();
  const [isScanning, setIsScanning] = useState(false);
  const [toasterState, setToasterState] = useState({});

  // Ble Context
  const appContexInitialState = {
    connectedDevices: [],
    discoveredDevices: [],
  };
  const [bleData, setBleData] = useState(appContexInitialState);
  const setConnectedDevices = connectedDevices => {
    console.log('set connected devices', connectedDevices);
    const newState = {...bleData, connectedDevices};
    setBleData(newState);
  };
  const setDiscoveredDevices = discoveredDevices => {
    // console.log('set discovered devices', discoveredDevices);
    const newState = {...bleData, discoveredDevices};
    setBleData(newState);
  };

  const reconnectToPreviousDevice = async () => {
    try {
      console.log('storage device id', previousDeviceId); // TODO: how to get state to work in here?
      if (previousDeviceId !== null) {
        console.log('Previous device', previousDeviceId);
        let reconnectScanListener = BleManagerEmitter.addListener(
          'BleManagerStopScan',
          () => {
            setIsScanning(false);
            console.log('previousDeviceId', previousDeviceId);
            connectToDevice({id: previousDeviceId})
              .then(() => {
                console.log('reconnected to previous device');
              })
              .catch(error => {
                console.log('error reconnecting to previous device', error);
              });
            reconnectScanListener.remove();
          },
        );

        await BleManager.scan([], 1, true);
        setIsScanning(true);
      }
    } catch (error) {
      console.log('error reconnecting to previous device', error);
    }
  };

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
    if (isSimulator) {
      // bypass BLE setup
      return () => {
        console.log('App cleanup function called.');
      };
    }

    // BLE setup
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
        // reconnectToPreviousDevice(); // Auto reconnect
      })
      .catch(error => console.log('BleManager failed to init', error));

    let discoverBleListener = BleManagerEmitter.addListener(
      'BleManagerDiscoverPeripheral',
      peripheral => {
        peripherals.set(peripheral.id, peripheral);
        // console.log('Discovered', peripheral.id);
        setDiscoveredDevices(Array.from(peripherals.values()));
      },
    );
    let disconnectBleListener = BleManagerEmitter.addListener(
      'BleManagerDisconnectPeripheral',
      ({peripheral, domain, code}) => {
        console.log('Disconnected from ' + peripheral, 'error code:', code);
        console.log('peripherals:', peripherals);
        let peripheral_object = peripherals.get(peripheral);
        // peripheral_object.connected = false; // TODO: why this error?

        // peripherals.set(peripheral_object.id, peripheral);
        // const newList = Array.from(peripherals.values()).filter(
        //   p => p.connected,
        // );
        setConnectedDevices([]);
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
        // console.log('discovered peripherals: ', peripherals);
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
      // disconnectBleListener.remove();
      // BleManager.disconnect(bleData.connectedDevices?.[0]?.['id']); // TODO: check this
    };
  }, []);

  // Helper functions

  const startScan = (
    serviceUUIDs: string[] = [TOAST_E_SERVICE_UUID],
    seconds: number = 2,
  ) => {
    if (!isScanning) {
      // BleManager.scan(serviceUUIDs.toString(), seconds, true)
      BleManager.scan([], seconds, true)
        .then(() => {
          console.log('Scanning...', serviceUUIDs.toString());
          setIsScanning(true);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const stopScan = () => {
    if (isScanning) {
      BleManager.stopScan()
        .then(() => {
          console.log('Scan stopped manually');
          setIsScanning(false);
        })
        .catch(error => {
          console.error(error);
        });
    }
  };

  const connectToDevice = async (peripheral, timeout = null) => {
    try {
      console.log('trying to connect to: ', peripheral);
      await new Promise(async (resolve, reject) => {
        if (timeout !== null) this.connectTimeout = setTimeout(reject, timeout);

        BleManager.connect(peripheral.id) // TODO: why doesn't this peripheral need to actually exist?
          .then(() => {
            peripheral.connected = true;
            peripherals.set(peripheral.id, peripheral);
            const newList = Array.from(peripherals.values()).filter(
              p => p.connected,
            );
            console.log('connected peripherals: ', newList);
            setConnectedDevices(newList);
            // setDiscoveredDevices(Array.from(peripherals.values()));

            AsyncStorage.setItem('deviceId', peripheral.id);
            console.log(
              'Connected to ' + peripheral.name + '. Now getting services',
            );
            getServices(peripheral); // await

            resolve('connected');
          })
          .catch(error => {
            console.log('Connection error', error);
          });

        if (this.connectTimeout) {
          clearTimeout(this.connectTimeout);
          this.connectTimeout = null;
          reject();
          // resolve();
        }
      });
    } catch (err) {
      if (this.connectTimeout) {
        clearTimeout(this.connectTimeout);
        this.connectTimeout = null;
      }
      console.error('Could not connect to device.');
    }
  };

  const getServices = (peripheral, serviceUUID = null) => {
    BleManager.retrieveServices(peripheral.id)
      .then(peripheralInfo => {
        console.log('Peripheral info:', peripheralInfo);
        peripheral.info = peripheralInfo;
        peripherals.set(peripheral.id, peripheral);

        // readCharacteristic(peripheral, TOAST_E_SERVICE_UUID, TOAST_E_CHAR_UUID);
        startToasterNotifications(peripheral);
      })
      .catch(error => console.log('error retrieving services', error));
  };

  // disconnect from device
  const disconnectFromPeripheral = peripheral => {
    BleManager.disconnect(peripheral.id)
      .then(() => {
        peripheral.connected = false;
        peripherals.set(peripheral.id, peripheral);
        const newList = Array.from(peripherals.values()).filter(
          p => p.connected,
        );
        setConnectedDevices(newList);
        // setDiscoveredDevices(Array.from(peripherals.values()));
        Alert.alert(`Disconnected from ${peripheral.name}`);
      })
      .catch(() => {
        console.log('fail to disconnect');
      });
  };

  // TODO: should this be a useCallback?
  const startToasterNotifications = useCallback(
    async (
      peripheral = bleData.connectedDevices?.[0],
      serviceUUID = TOAST_E_SERVICE_UUID,
      charUUID = TOAST_E_CHAR_UUID,
    ) => {
      if (isSimulator) {
        console.log('simulator, not sending subscribe request');
        return;
      }
      console.log('default option: ', bleData.connectedDevices);
      BleManager.startNotification(peripheral?.id, serviceUUID, charUUID)
        .then(() => {
          console.log('Started notifications on ' + peripheral.id);
          // readCharacteristic(peripheral);
          // readCurrentCrispinessCharacteristic(peripheral);
          BleManagerEmitter.addListener(
            BleEventType.BleManagerDidUpdateValueForCharacteristic,
            ({value, peripheral, characteristic, service}) => {
              const data = JSON.parse(bytesToString(value));
              console.log(
                `Received ${data} with values ${Object.values(data)}`,
              );
              setToasterState(data);
            },
          );
        })
        .catch(error => {
          console.log('Notification error', error);
        });
    },
    [bleData, isSimulator],
  );

  const stopToasterNotifications = (
    peripheral = bleData.connectedDevices?.[0],
    serviceUUID = TOAST_E_SERVICE_UUID,
    charUUID = TOAST_E_CHAR_UUID,
  ) => {
    if (isSimulator) {
      console.log('simulator, not sending stop notifications');
      return;
    }
    console.log('trying to stop notifications on: ', peripheral.id);
    BleManager.stopNotification(peripheral.id, serviceUUID, charUUID)
      .then(() => {
        console.log('Stopped notifications on ' + peripheral.id);
      })
      .catch(error => {
        console.log('Error stopping notifications', error);
      });
  };

  // ble commands
  const readCharacteristic = (peripheral, serviceUUID, charUUID) => {
    BleManager.read(peripheral.id, serviceUUID, charUUID)
      .then(readData => {
        const data = JSON.parse(bytesToString(readData));
        console.log(`Received ${data} with values ${Object.values(data)}`);
        // setToasterState(data);
      })
      .catch(error => {
        console.log('Read error', error);
      });
  };

  const writeTargetCrispinessCharacteristic = (
    data: number,
    peripheral = bleData.connectedDevices?.[0],
    serviceUUID: String = TOAST_E_SERVICE_UUID,
    charUUID: String = TOAST_E_CHAR_UUID,
  ) => {
    if (isSimulator) {
      console.log('simulator, not sending target crispiness command');
      return;
    }
    // TODO: rework this function
    console.log(
      'trying to write to: ',
      peripheral.id,
      ' with: ',
      data,
      ' as:  ',
      toByteArray([data]),
    );
    console.log('connectedDevices: ', bleData.connectedDevices);
    console.log('should be: 3261042b-e99d-98d6-84ae-2786329fa5a6');

    const message = generateBleMessage(MessageTypes.TARGET_CRISPINESS, data);
    BleManager.write(peripheral.id, serviceUUID, charUUID, message)
      .then(() => {
        console.log('Sent Target Crispiness');
      })
      .catch(error => {
        console.log('Write error', error);
        setToasterState({controller_state: 'IDLE'});
      });
  };

  const writeCancelCharacteristic = (
    peripheral = bleData.connectedDevices?.[0],
    serviceUUID: String = TOAST_E_SERVICE_UUID,
    charUUID: String = TOAST_E_CHAR_UUID,
  ) => {
    if (isSimulator) {
      console.log('simulator, not sending cancel command');
      return;
    }
    const message = generateBleMessage(MessageTypes.CANCEL, sendCancel);
    console.log('trying to write to: ', peripheral.id, ' with: ', message);
    BleManager.write(peripheral.id, serviceUUID, charUUID, message)
      .then(() => {
        console.log('Sent Cancel Command');
        // stopToasterNotifications(peripheral.id);
      })
      .catch(error => {
        console.log('Write error', error);
      });
  };

  const writeCrispReset = (
    peripheral = bleData.connectedDevices?.[0],
    serviceUUID: String = TOAST_E_SERVICE_UUID,
    charUUID: String = TOAST_E_CHAR_UUID,
  ) => {
    if (isSimulator) {
      console.log('simulator, not sending cancel command');
      return;
    }
    const message = generateBleMessage(MessageTypes.RESET, sendCancel);
    console.log('trying to write to: ', peripheral.id, ' with: ', message);
    BleManager.write(peripheral.id, serviceUUID, charUUID, message)
      .then(() => {
        console.log('Sent Reset Crisp Command');
      })
      .catch(error => {
        console.log('Write error', error);
      });
  };

  return [
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
  ];
};

export default useBLE;
