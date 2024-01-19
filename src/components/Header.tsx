import {View, Text, Button} from 'react-native';

export const ToastEHeader = ({setSettingsModalVisible}) => {
  return (
    <View style={{backgroundColor: 'brown', paddingVertical: 10}}>
      {/* <View style={{flex: 1, justifyContent: 'center'}}> */}
      <Text
        style={{
          fontSize: 50,
          textAlign: 'center',
          color: 'white',
        }}>
        Toast-E
      </Text>
      <Button
        title={'Settings'}
        onPress={() => {
          setSettingsModalVisible(true);
          // navigation.navigate('SettingsModal');
        }}
        color={'white'}
      />
      {/* </View> */}
    </View>
  );
};
