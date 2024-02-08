import {View, Text, Button} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const ToastEHeader = ({setSettingsModalVisible = null}) => {
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
      {/* {setSettingsModalVisible ?? ( */}
      <Icon
        name={'cog'}
        size={30}
        color={'white'}
        style={{position: 'absolute', right: 15, top: 25}}
        onPress={() => {
          setSettingsModalVisible(true);
        }}
      />
      {/* )} */}
    </View>
  );
};
