/* src/DeviceList.jsx */

import {View, Text, TouchableOpacity, Button} from 'react-native';
import React from 'react';
import {styles} from '../styles/styles';

export const DeviceList = ({
  peripheral,
  connect,
  disconnect,
  getServices = null,
  startNotification = null,
}) => {
  const {name, rssi, connected} = peripheral;
  return (
    <>
      {name && (
        <>
          <View style={styles.deviceContainer}>
            <View style={styles.deviceItem}>
              <Text style={styles.deviceName}>{name}</Text>
              <Text style={styles.deviceInfo}>RSSI: {rssi}</Text>
              {/* <Text style={styles.deviceInfo}>{peripheral.name}</Text> */}
            </View>
            <TouchableOpacity
              onPress={() =>
                connected ? disconnect(peripheral) : connect(peripheral)
              }
              style={styles.deviceButton}>
              <Text
                style={[
                  styles.scanButtonText,
                  {fontWeight: 'bold', fontSize: 16},
                ]}>
                {connected ? 'Disconnect' : 'Connect'}
              </Text>
            </TouchableOpacity>
          </View>
          {connected && (
            <View>
              <Button
                title={'Retrieve Services'}
                onPress={() => getServices(peripheral)}
              />
              <Button
                title={'Start Notifications'}
                onPress={() => startNotification(peripheral)}
              />
            </View>
          )}
        </>
      )}
    </>
  );
};
