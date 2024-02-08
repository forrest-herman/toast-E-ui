/* src/DeviceList.jsx */

import {View, Text, TouchableOpacity} from 'react-native';
import React from 'react';
import {styles} from '../styles/styles';

export const DeviceList = ({peripheral, connect, disconnect, stopScan}) => {
  const {name, advertising, rssi, connected} = peripheral;
  return (
    <>
      <View style={styles.deviceContainer}>
        <View style={styles.deviceItem}>
          <Text style={styles.deviceName}>
            {advertising?.localName ?? name}
          </Text>
          <Text style={styles.deviceInfo}>RSSI: {rssi}</Text>
        </View>
        <TouchableOpacity
          onPress={() => {
            if (connected) {
              disconnect(peripheral);
            } else {
              stopScan();
              connect(peripheral);
            }
          }}
          style={styles.deviceButton}>
          <Text
            style={[styles.scanButtonText, {fontWeight: 'bold', fontSize: 16}]}>
            {connected ? 'Disconnect' : 'Connect'}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  );
};
