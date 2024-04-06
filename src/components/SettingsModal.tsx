import {
  Button,
  FlatList,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {DeviceList} from './DeviceList';

import {styles} from '../styles/styles';

// TODO: temp
const TOAST_E_SERVICE_UUID = '00000023-710e-4a5b-8d75-3e5b444bc3cf';

const SettingsModal = ({
  setSettingsModalVisible,
  setDeveloperMode,
  developerMode,
  startScan,
  stopScan,
  isScanning,
  discoveredDevices,
  connectedDevices,
  connectToPeripheral,
  disconnectFromPeripheral,
}) => {
  const toggleDevMode = () =>
    setDeveloperMode((previousState: boolean) => !previousState);

  return (
    <View style={{paddingHorizontal: 20, paddingVertical: 10, flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{flex: 0.2}}>
          <Switch
            onValueChange={toggleDevMode}
            value={developerMode}
            trackColor={{true: 'red'}}
          />
        </View>
        <View style={{flex: 0.6}}>
          <Text
            style={[
              styles.title,
              {color: Colors.black, justifyContent: 'center'},
            ]}>
            BLE Devices
          </Text>
        </View>
        <View style={{flex: 0.2, alignItems: 'flex-end'}}>
          <Button
            title="Close"
            onPress={() => setSettingsModalVisible(false)}
          />
        </View>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          gap: 10,
        }}>
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
          onPress={() => startScan([TOAST_E_SERVICE_UUID], 4)}>
          <Text style={styles.scanButtonText}>
            {isScanning ? 'Scanning...' : 'Scan Raspberry Pi Only'}
          </Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.subtitle, {color: Colors.black}]}>
        Discovered Devices ({discoveredDevices.length}):
      </Text>
      {discoveredDevices.length > 0 ? (
        <FlatList
          style={{marginTop: 5, flexGrow: 0, maxHeight: 300}}
          data={discoveredDevices.filter(item => item.name)}
          renderItem={({item}) => (
            <DeviceList
              peripheral={item}
              connect={connectToPeripheral}
              disconnect={disconnectFromPeripheral}
              stopScan={stopScan}
            />
          )}
          keyExtractor={item => item.id}
        />
      ) : (
        <Text style={styles.noDevicesText}>No Bluetooth devices found</Text>
      )}
      <Text style={[styles.subtitle, {color: Colors.black}]}>
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
              stopScan={stopScan}
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

export default SettingsModal;
