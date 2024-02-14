import React, {useState, useContext} from 'react';
import {
  Button,
  FlatList,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {ToastEHeader} from '../components/Header.tsx';

import {styles} from '../styles/styles';

import {AppContext} from '../../App';

const WelcomeScreen = ({
  reconnectToPreviousDevice,
  devices = [],
  previousDeviceId,
}) => {
  const {setSettingsModalVisible} = useContext(AppContext);

  return (
    <>
      <SafeAreaView
        edges={['top']}
        style={{flex: 0, backgroundColor: styles.header.backgroundColor}}
      />
      <SafeAreaView
        style={{
          backgroundColor: Colors.lighter,
          flex: 1,
        }}>
        <View style={{flex: 1}}>
          <ToastEHeader setSettingsModalVisible={setSettingsModalVisible} />
          <View
            style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{fontSize: 15}}>
              {devices.length} device(s) connected
            </Text>
            <Text style={{fontSize: 30}}>No Toast-E Connected</Text>
            <ActionButton
              reconnectFn={reconnectToPreviousDevice}
              previousDevice={previousDeviceId}
              setSettingsModalVisible={setSettingsModalVisible}
            />
            <FlatList
              style={{marginTop: 5, flexGrow: 0, maxHeight: 500}}
              data={devices}
              renderItem={({item}) => <Text>{JSON.stringify(item)}</Text>}
              keyExtractor={item => item?.id}
            />
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

const ActionButton = ({
  previousDevice,
  reconnectFn,
  setSettingsModalVisible,
}) => {
  let title = 'Find Toast-E';
  let onPressFn = () => setSettingsModalVisible(true);
  if (previousDevice !== null) {
    title = 'Reconnect to Last Device';
    onPressFn = reconnectFn;
  }
  return (
    <>
      <View style={{alignItems: 'center'}}>
        <TouchableOpacity onPress={onPressFn}>
          <View
            style={{
              borderRadius: 15,
              backgroundColor: 'brown',
              justifyContent: 'center',
              alignItems: 'center',
              margin: 40,
              paddingHorizontal: 25,
              paddingVertical: 10,
            }}>
            <Text style={{color: '#F3F3F3', fontSize: 22, textAlign: 'center'}}>
              {title}
            </Text>
          </View>
        </TouchableOpacity>
      </View>
    </>
  );
};

export default WelcomeScreen;
