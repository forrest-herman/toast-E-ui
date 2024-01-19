import {Button, FlatList, Text, TouchableOpacity, View} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {DeviceList} from './DeviceList';

import {styles} from '../styles/styles';

const SettingsModal = ({
  setSettingsModalVisible,
  startScan,
  isScanning,
  discoveredDevices,
  connectedDevices,
  connectToPeripheral,
  disconnectFromPeripheral,
}) => {
  return (
    <View style={{paddingHorizontal: 20, paddingVertical: 10, flex: 1}}>
      <View style={{flexDirection: 'row', justifyContent: 'center'}}>
        <View style={{flex: 0.2}}></View>
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
          style={{marginTop: 5, flexGrow: 0, maxHeight: 300}}
          data={discoveredDevices.filter(item => item.name)}
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
