import BigSlider from './BigSlider';
import LinearGradient from 'react-native-linear-gradient';

import Octicon from 'react-native-vector-icons/Octicons';
import AwesomeIcon from 'react-native-vector-icons/FontAwesome6';
import {View} from 'react-native';

const GradientSlider = ({
  inputValue,
  width = 140,
  onValueChangeFn = () => {
    return;
  },
  showIcons = true,
  showLabel = true,
}) => {
  return (
    <View style={{width: width, height: '90%'}}>
      <LinearGradient
        colors={['#240d02', '#5e2d16', '#edb985']}
        style={{
          flex: 1,
          paddingLeft: 15,
          paddingRight: 15,
          borderRadius: 25,
        }}>
        {showIcons && (
          <>
            <AwesomeIcon
              name={'fire-flame-curved'}
              size={40}
              color={`rgba(255, 255, 255, ${inputValue / 100 + 0.1})`}
              style={{
                position: 'absolute',
                alignSelf: 'center',
                top: 15,
              }}
            />
            <Octicon
              name={'flame'}
              size={20}
              color={`rgba(255, 255, 255, ${1 - inputValue / 100 + 0.1})`}
              style={{
                position: 'absolute',
                alignSelf: 'center',
                bottom: 15,
              }}
            />
          </>
        )}
        <BigSlider
          style={{width: '100%'}}
          onValueChange={onValueChangeFn}
          showLabel={showLabel}
          // trackStyle={{backgroundColor: 'rgba(143, 255, 160, .1)'}}
          maximumValue={100}
          minimumValue={0}
          value={inputValue}
        />
      </LinearGradient>
    </View>
  );
};

export default GradientSlider;
