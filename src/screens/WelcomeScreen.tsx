import React, {useState, useContext} from 'react';
import {
  Animated,
  Button,
  Dimensions,
  FlatList,
  Image,
  SafeAreaView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {Colors} from 'react-native/Libraries/NewAppScreen';

import {ToastEHeader} from '../components/Header.tsx';

import {styles} from '../styles/styles';

import {AppContext} from '../../App';

const height = Dimensions.get('window').height;
const width = Dimensions.get('window').width;

const WelcomeScreen = ({
  visible = true,
  reconnectToPreviousDevice,
  devices = [],
  previousDeviceId,
}) => {
  const {setSettingsModalVisible, isSimulator, orientationIsPortrait} =
    useContext(AppContext);

  const [fadeAnim] = useState(new Animated.Value(0));
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    if (visible) {
      setShow(true);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else if (!visible) {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }).start(() => {
        setShow(false);
        console.log('show false ');
      });
    }
  }, [visible]);

  return (
    <Animated.View style={{flex: 1, opacity: fadeAnim}}>
      <SafeAreaView
        edges={['top']}
        style={{flex: 0, backgroundColor: styles.header.backgroundColor}}
      />
      <SafeAreaView
        style={{
          backgroundColor: 'white',
          flex: 1,
        }}>
        <View style={{flex: 1}}>
          <ToastEHeader />
          {devices.length > 0 || isSimulator ? (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
                backgroundColor: 'white',
                paddingBottom: orientationIsPortrait ? 100 : 15,
              }}>
              <Image
                style={{
                  flex: 1,
                  justifyContent: 'flex-end',
                  alignItems: 'flex-end',
                  width: 250,
                  marginBottom: orientationIsPortrait ? 50 : 0,
                }}
                resizeMode="cover"
                source={require('../assets/toaster.gif')}
              />
              <Text style={{fontSize: 30}}>Insert a toastable to begin.</Text>
            </View>
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <Text style={{fontSize: 15}}>
                {devices.length} device(s) connected
              </Text>
              <Text style={{fontSize: 30}}>No Toast-E Connected</Text>
              <View style={{marginVertical: 20}}>
                {previousDeviceId !== null && (
                  <ActionButton
                    reconnectFn={reconnectToPreviousDevice}
                    previousDevice={previousDeviceId}
                    setSettingsModalVisible={setSettingsModalVisible}
                  />
                )}
                <ActionButton
                  reconnectFn={reconnectToPreviousDevice}
                  setSettingsModalVisible={setSettingsModalVisible}
                />
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
};

const ActionButton = ({
  previousDevice = null,
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
              margin: 10,
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
