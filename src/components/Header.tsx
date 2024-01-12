import {View, Text} from 'react-native';

export const ToastEHeader = () => {
  return (
    <View style={{backgroundColor: 'brown', paddingVertical: 10}}>
      <Text
        style={{
          fontSize: 50,
          textAlign: 'center',
          color: 'white',
        }}>
        Toast-E
      </Text>
    </View>
  );
};
