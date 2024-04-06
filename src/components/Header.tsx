import {View, Text, Button} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

export const ToastEHeader = ({
  title = 'Toast-E',
  fontSize = 50,
  setSettingsModalVisible = undefined,
}) => {
  return (
    <View style={{backgroundColor: 'brown', paddingVertical: 10}}>
      {/* <View style={{flex: 1, justifyContent: 'center'}}> */}
      <Text
        style={{
          fontSize: fontSize,
          textAlign: 'center',
          color: 'white',
          fontFamily: 'Rockwell',
          paddingTop: 5,
        }}>
        {title}
      </Text>
      {setSettingsModalVisible !== undefined && (
        <Icon
          name={'cog'}
          size={30}
          color={'white'}
          style={{position: 'absolute', right: 15, top: 25}}
          onPress={() => {
            setSettingsModalVisible(true);
          }}
        />
      )}
    </View>
  );
};
